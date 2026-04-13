import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import {
  Bell,
  Grid3X3,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
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

export function PortalLayout({
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
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/25"
          >
            Report Issue
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-[color:var(--ghost)] pt-4 text-sm text-[var(--ink-soft)]">
          <button type="button" className="inline-flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
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
              <nav className="hidden items-center gap-5 md:flex">
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
              <label className="surface-soft hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-[var(--ink-soft)] lg:flex">
                <Search className="h-4 w-4" />
                <input
                  className="w-60 bg-transparent text-sm outline-none placeholder:text-[var(--ink-soft)]"
                  type="text"
                  placeholder={searchPlaceholder}
                />
              </label>
              <button
                type="button"
                title="Notifications"
                aria-label="Notifications"
                className="rounded-full p-2 text-[var(--ink-soft)] hover:bg-white"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                type="button"
                title="Apps"
                aria-label="Apps"
                className="rounded-full p-2 text-[var(--ink-soft)] hover:bg-white"
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-100)] text-xs font-bold text-[var(--brand-700)]">
                {initials(profileName)}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1380px] flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
