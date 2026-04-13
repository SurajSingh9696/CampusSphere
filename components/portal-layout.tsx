import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import {
  Bell,
  ExternalLink,
  Grid3X3,
  Menu,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { PortalSearch } from "@/components/portal-search";
import { getCampusInternetFeed } from "@/lib/data/internet-feed";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface TopLink {
  href: string;
  label: string;
}

interface PortalLayoutProps {
  brand: string;
  portalTitle: string;
  portalType: string;
  navItems: NavItem[];
  topLinks: TopLink[];
  activePath: string;
  searchPlaceholder: string;
  profileName?: string;
  children: ReactNode;
}

function initials(name: string): string {
  const chunks = name.split(" ").filter(Boolean);

  if (chunks.length === 0) {
    return "AN";
  }

  return chunks
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

function activeLink(activePath: string, href: string): boolean {
  if (href === "/") {
    return activePath === href;
  }

  return activePath === href || activePath.startsWith(`${href}/`);
}

function resolveSettingsHref(activePath: string): string {
  if (activePath.startsWith("/admin")) {
    return "/admin/dashboard#security";
  }

  if (activePath.startsWith("/college")) {
    return "/college/dashboard#schedule";
  }

  if (activePath.startsWith("/student")) {
    return "/student/utilities";
  }

  return "/operations/attendance";
}

function resolveNoticeHref(activePath: string): string {
  if (activePath.startsWith("/admin")) {
    return "/admin/dashboard#incidents";
  }

  if (activePath.startsWith("/college")) {
    return "/college/dashboard#records";
  }

  if (activePath.startsWith("/student")) {
    return "/student/community";
  }

  return "/operations/attendance";
}

export async function PortalLayout({
  brand,
  portalTitle,
  portalType,
  navItems,
  topLinks,
  activePath,
  searchPlaceholder,
  profileName = "Campus User",
  children,
}: PortalLayoutProps) {
  const liveFeed = await getCampusInternetFeed();
  const settingsHref = resolveSettingsHref(activePath);
  const noticeHref = resolveNoticeHref(activePath);
  const searchItems = Array.from(
    new Map(
      [
        ...topLinks,
        ...navItems.map((item) => ({ href: item.href, label: item.label })),
      ].map((item) => [item.href, item]),
    ).values(),
  );

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <aside className="surface-soft fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-[color:var(--ghost)] p-6 lg:flex">
        <div className="mb-8">
          <h2 className="font-display text-xl font-extrabold text-[var(--ink-strong)]">
            {portalTitle}
          </h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            {portalType}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeLink(activePath, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-white text-[var(--brand-700)] shadow-sm"
                    : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink-strong)]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl bg-[var(--brand-700)] p-4 text-white shadow-lg shadow-[color:var(--brand-glow)]">
          <p className="text-sm font-semibold">Need help on campus?</p>
          <p className="mt-1 text-xs text-white/80">
            Report an issue directly to operations.
          </p>
          <Link
            href="/operations/attendance"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/25"
          >
            Report Issue
          </Link>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-[color:var(--ghost)] pt-4 text-sm text-[var(--ink-soft)]">
          <Link href={settingsHref} className="inline-flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
        <header className="surface-glass sticky top-0 z-30 border-b border-[color:var(--ghost)] px-5 py-4 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/logo.png"
                  alt="Academic Orbit logo"
                  width={132}
                  height={62}
                  className="h-8 w-auto rounded-md border border-[color:var(--ghost)] bg-white/90 p-1 object-contain"
                />
                <h1 className="font-display text-xl font-bold text-[var(--ink-strong)]">{brand}</h1>
              </div>
              <nav className="hidden items-center gap-5 lg:flex">
                {topLinks.map((link) => {
                  const isActive = activeLink(activePath, link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        isActive
                          ? "text-[var(--brand-700)]"
                          : "text-[var(--ink-soft)] hover:text-[var(--ink-strong)]",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <PortalSearch
                className="hidden w-[260px] lg:block"
                placeholder={searchPlaceholder}
                items={searchItems}
              />
              <Link
                href={noticeHref}
                title="Notifications"
                aria-label="Notifications"
                className="rounded-full p-2 text-[var(--ink-soft)] hover:bg-white"
              >
                <Bell className="h-5 w-5" />
              </Link>
              <Link
                href={settingsHref}
                title="Apps"
                aria-label="Apps"
                className="rounded-full p-2 text-[var(--ink-soft)] hover:bg-white"
              >
                <Grid3X3 className="h-5 w-5" />
              </Link>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-100)] text-xs font-bold text-[var(--brand-700)]">
                {initials(profileName)}
              </div>
            </div>
          </div>

          <nav className="mx-auto mt-3 flex w-full max-w-[1380px] items-center gap-2 overflow-x-auto pb-1 lg:hidden">
            {topLinks.map((link) => {
              const isActive = activeLink(activePath, link.href);

              return (
                <Link
                  key={`${link.href}-mobile`}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    isActive
                      ? "border-[var(--brand-600)] bg-[var(--brand-100)] text-[var(--brand-700)]"
                      : "border-[color:var(--ghost)] bg-white text-[var(--ink-soft)]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <details className="mx-auto mt-3 w-full max-w-[1380px] overflow-hidden rounded-2xl border border-[color:var(--ghost)] bg-white/85 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-semibold text-[var(--ink-strong)] [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <Menu className="h-4 w-4 text-[var(--brand-700)]" />
                Portal navigation
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">Menu</span>
            </summary>

            <div className="border-t border-[color:var(--ghost)] p-3">
              <PortalSearch placeholder={searchPlaceholder} items={searchItems} />

              <div className="mt-3 grid gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeLink(activePath, item.href);

                  return (
                    <Link
                      key={`${item.href}-drawer`}
                      href={item.href}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
                        isActive
                          ? "bg-[var(--brand-100)] text-[var(--brand-700)]"
                          : "bg-white text-[var(--ink-soft)]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Link
                  href="/operations/attendance"
                  className="rounded-xl border border-[color:var(--ghost)] bg-[var(--soft-100)] px-3 py-2 text-center text-sm font-semibold text-[var(--ink-strong)]"
                >
                  Report issue
                </Link>
                <Link
                  href={settingsHref}
                  className="rounded-xl border border-[color:var(--ghost)] bg-[var(--soft-100)] px-3 py-2 text-center text-sm font-semibold text-[var(--ink-strong)]"
                >
                  Open settings
                </Link>
              </div>
            </div>
          </details>

          <section className="mx-auto mt-3 grid w-full max-w-[1380px] gap-2 sm:grid-cols-[minmax(0,320px)_1fr]">
            <article className="rounded-2xl border border-[color:var(--ghost)] bg-white px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">Live weather</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink-strong)]">
                {Math.round(liveFeed.weather.temperatureC)}C / {liveFeed.weather.condition}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                Wind {Math.round(liveFeed.weather.windKph)} km/h / {liveFeed.weather.timezone}
              </p>
            </article>

            <article className="rounded-2xl border border-[color:var(--ghost)] bg-white px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                  Internet feed / {liveFeed.source === "internet" ? "live" : "fallback"}
                </p>
                <p className="text-xs text-[var(--ink-soft)]">Updated {liveFeed.refreshedAt}</p>
              </div>

              <div className="mt-2 grid gap-1.5">
                {liveFeed.headlines.slice(0, 2).map((headline) => (
                  <a
                    key={headline.id}
                    href={headline.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--soft-100)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-strong)] hover:bg-[var(--brand-100)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--brand-700)]" />
                    <span className="line-clamp-1">{headline.title}</span>
                  </a>
                ))}
              </div>
            </article>
          </section>
        </header>

        <main className="mx-auto w-full max-w-[1380px] flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
