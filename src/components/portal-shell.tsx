"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import { logoutAction, markNotificationReadAction } from "@/lib/actions";
import { NavLink } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

type NotificationView = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
};

type PortalShellProps = {
  title: string;
  subtitle: string;
  links: NavLink[];
  user: {
    name: string;
    email: string;
  };
  notifications: NotificationView[];
  children: React.ReactNode;
};

export function PortalShell({ title, subtitle, links, user, notifications, children }: PortalShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="portal-root">
      <button className="menu-toggle" onClick={() => setOpen((value) => !value)} type="button">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      <aside className={cn("portal-sidebar", open ? "portal-sidebar-open" : "")}> 
        <div className="portal-brand">
          <h1>CampusSphere</h1>
          <p>{subtitle}</p>
        </div>
        <nav className="portal-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("portal-nav-link", pathname === link.href ? "portal-nav-link-active" : "")}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button className="button button-danger" type="submit">
            Sign Out
          </button>
        </form>
      </aside>

      <div className="portal-main">
        <header className="portal-topbar glass-panel">
          <div>
            <h2>{title}</h2>
            <p>
              {user.name} · {user.email}
            </p>
          </div>
          <div className="portal-topbar-actions">
            <form action="/search" className="inline-search" method="GET">
              <Search size={16} />
              <input name="query" placeholder="Search resources, events, students, notes" type="search" />
              <button className="button" type="submit">
                Search
              </button>
            </form>
            <details className="notification-panel">
              <summary>
                <Bell size={17} />
                <span>{notifications.filter((item) => !item.readAt).length}</span>
              </summary>
              <div className="notification-dropdown glass-panel">
                <div className="notification-head">
                  <strong>Notifications</strong>
                  <form action={markNotificationReadAction}>
                    <input name="notificationId" type="hidden" value="all" />
                    <button type="submit">Mark all read</button>
                  </form>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <p className="notification-empty">No notifications right now.</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        className={cn(
                          "notification-item",
                          notification.readAt ? "notification-item-read" : "notification-item-unread",
                        )}
                        key={notification.id}
                      >
                        <div>
                          <h4>{notification.title}</h4>
                          <p>{notification.message}</p>
                          <small>{formatDate(notification.createdAt)}</small>
                        </div>
                        <div className="notification-actions">
                          {notification.link ? <Link href={notification.link}>Open</Link> : null}
                          <form action={markNotificationReadAction}>
                            <input name="notificationId" type="hidden" value={notification.id} />
                            <button type="submit">Read</button>
                          </form>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </details>
          </div>
        </header>
        <main className="portal-content">{children}</main>
      </div>
    </div>
  );
}
