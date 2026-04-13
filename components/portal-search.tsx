"use client";

import { useMemo, useState } from "react";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface PortalSearchItem {
  href: string;
  label: string;
}

interface PortalSearchProps {
  placeholder: string;
  items: PortalSearchItem[];
  className?: string;
}

export function PortalSearch({ placeholder, items, className }: PortalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return items.slice(0, 5);
    }

    return items
      .filter((item) => item.label.toLowerCase().includes(normalized))
      .slice(0, 5);
  }, [items, query]);

  function goTo(href: string) {
    router.push(href);
    setQuery("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const firstMatch = results[0] ?? items[0];

    if (!firstMatch) {
      return;
    }

    goTo(firstMatch.href);
  }

  return (
    <div className={cn("relative", className)}>
      <form
        onSubmit={handleSubmit}
        className="surface-soft flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm text-[var(--ink-soft)]"
      >
        <Search className="h-4 w-4" />
        <input
          className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--ink-soft)]"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
        />
      </form>

      {query.trim() && results.length > 0 ? (
        <div className="absolute right-0 top-[calc(100%+0.35rem)] z-20 w-full min-w-[220px] overflow-hidden rounded-2xl border border-[color:var(--ghost)] bg-white shadow-[0_14px_34px_rgba(13,24,41,0.16)]">
          {results.map((item) => (
            <button
              key={`${item.href}-${item.label}`}
              type="button"
              onClick={() => goTo(item.href)}
              className="block w-full border-b border-[color:var(--ghost)] px-3 py-2 text-left text-sm font-semibold text-[var(--ink-strong)] last:border-0 hover:bg-[var(--soft-100)]"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
