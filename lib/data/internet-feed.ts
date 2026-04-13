import "server-only";

interface OpenMeteoResponse {
  timezone?: string;
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    time?: string;
  };
}

interface HackerNewsResponse {
  hits?: Array<{
    objectID?: string;
    title?: string;
    url?: string | null;
    points?: number;
  }>;
}

export interface InternetWeather {
  temperatureC: number;
  windKph: number;
  condition: string;
  timezone: string;
  observedAt: string;
}

export interface InternetHeadline {
  id: string;
  title: string;
  url: string;
  points: number;
}

export interface CampusInternetFeed {
  weather: InternetWeather;
  headlines: InternetHeadline[];
  refreshedAt: string;
  source: "internet" | "fallback";
}

const DEFAULT_LATITUDE = 28.6139;
const DEFAULT_LONGITUDE = 77.209;
const FALLBACK_HEADLINES: InternetHeadline[] = [
  {
    id: "fallback-1",
    title: "Campus digitization remains a global priority for universities.",
    url: "https://news.ycombinator.com/",
    points: 0,
  },
  {
    id: "fallback-2",
    title: "Attendance automation and student portals continue to scale worldwide.",
    url: "https://news.ycombinator.com/",
    points: 0,
  },
  {
    id: "fallback-3",
    title: "Academic platforms are focusing on real-time collaboration tools.",
    url: "https://news.ycombinator.com/",
    points: 0,
  },
];

const LABEL_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTimestamp(value: string | Date = new Date()): string {
  return LABEL_FORMATTER.format(new Date(value));
}

function parseCoordinate(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(raw ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toWeatherCondition(code: number | undefined): string {
  if (typeof code !== "number") {
    return "Stable";
  }

  if (code === 0) {
    return "Clear";
  }

  if (code === 1 || code === 2) {
    return "Partly Cloudy";
  }

  if (code === 3) {
    return "Overcast";
  }

  if (code === 45 || code === 48) {
    return "Fog";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "Drizzle";
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "Rain";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "Snow";
  }

  if (code >= 95) {
    return "Thunderstorm";
  }

  return "Variable";
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4500),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getCampusInternetFeed(): Promise<CampusInternetFeed> {
  const latitude = parseCoordinate(process.env.CAMPUS_LATITUDE, DEFAULT_LATITUDE);
  const longitude = parseCoordinate(process.env.CAMPUS_LONGITUDE, DEFAULT_LONGITUDE);

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
  const headlinesUrl =
    "https://hn.algolia.com/api/v1/search?query=education%20technology&tags=story&hitsPerPage=4";

  const [weatherPayload, headlinesPayload] = await Promise.all([
    fetchJson<OpenMeteoResponse>(weatherUrl),
    fetchJson<HackerNewsResponse>(headlinesUrl),
  ]);

  const weather: InternetWeather = {
    temperatureC: Number(weatherPayload?.current?.temperature_2m ?? 24),
    windKph: Number(weatherPayload?.current?.wind_speed_10m ?? 8),
    condition: toWeatherCondition(weatherPayload?.current?.weather_code),
    timezone: weatherPayload?.timezone ?? "Local",
    observedAt: formatTimestamp(weatherPayload?.current?.time ?? new Date()),
  };

  const headlines = (headlinesPayload?.hits ?? [])
    .filter((hit) => (hit.title ?? "").trim().length > 0)
    .slice(0, 4)
    .map((hit, index) => {
      const id = hit.objectID ?? `internet-${index}`;
      const fallbackUrl = `https://news.ycombinator.com/item?id=${id}`;
      const hasAbsoluteUrl = typeof hit.url === "string" && /^https?:\/\//.test(hit.url);

      return {
        id,
        title: (hit.title ?? "Campus technology update").trim(),
        url: hasAbsoluteUrl ? (hit.url as string) : fallbackUrl,
        points: Number(hit.points ?? 0),
      };
    });

  const hasInternetData = Boolean(weatherPayload) || headlines.length > 0;

  return {
    weather,
    headlines: headlines.length > 0 ? headlines : FALLBACK_HEADLINES,
    refreshedAt: formatTimestamp(),
    source: hasInternetData ? "internet" : "fallback",
  };
}
