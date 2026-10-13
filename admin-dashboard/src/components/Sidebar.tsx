import {
  LayoutDashboard,
  Users,
  Home,
  MapPin,
  Cross,
  CalendarDays,
  Megaphone,
  Church,
  HandHeart,
  Crown,
  Database,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../lib/app-context";
import type { Route } from "../lib/app-context";

const NAV: { key: Route; icon: typeof Users; labelKey: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, labelKey: "nav_dashboard" },
  { key: "wards", icon: MapPin, labelKey: "nav_wards" },
  { key: "families", icon: Home, labelKey: "nav_families" },
  { key: "members", icon: Users, labelKey: "nav_members" },
  { key: "announcements", icon: Megaphone, labelKey: "nav_announcements" },
  { key: "calendar", icon: CalendarDays, labelKey: "nav_calendar" },
  { key: "clergy", icon: Cross, labelKey: "nav_clergy" },
  { key: "houses", icon: Church, labelKey: "nav_houses" },
  { key: "ministries", icon: HandHeart, labelKey: "nav_ministries" },
  { key: "council", icon: Crown, labelKey: "nav_council" },
];

export default function Sidebar({
  onLogout,
  userName,
}: {
  onLogout?: () => void;
  userName?: string;
} = {}) {
  const { route, setRoute, tt } = useApp();

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-[18px]">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-primary-hover shadow-[0_4px_16px_-4px_var(--primary)]">
          <Cross className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-[15px] font-bold leading-tight text-foreground">
            {tt("appTitle")}
          </div>
          <div className="truncate text-[11px] font-medium text-muted-foreground">
            {tt("appSubtitle")}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map(({ key, icon: Icon, labelKey }) => {
          const active = route === key;
          return (
            <button
              key={key}
              onClick={() => setRoute(key)}
              className={`group relative flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Icon
                className={`h-[18px] w-[18px] shrink-0 ${active ? "text-primary" : ""}`}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className="truncate text-left">{tt(labelKey)}</span>
              {active && <ChevronRight className="ml-auto h-4 w-4 opacity-60" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-3 border-t border-border px-3 py-4">
        <div className="flex items-center gap-2 rounded-[8px] bg-secondary/60 px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="pulse-dot absolute inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {tt("serverConnected")}
          </span>
          <Database className="ml-auto h-3.5 w-3.5 text-success/70" />
        </div>

        <div className="flex items-center gap-3 rounded-[10px] border border-border bg-secondary/40 px-3 py-2.5">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&auto=format&crop=faces"
            alt="Fr. Administrator"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/40"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-foreground">
              {userName || "Fr. Administrator"}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {tt("superAdmin")}
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              aria-label={tt("logout")}
              title={tt("logout")}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-muted-foreground transition-colors hover:bg-danger/12 hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
