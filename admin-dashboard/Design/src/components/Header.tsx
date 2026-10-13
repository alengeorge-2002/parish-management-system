import { useEffect, useState } from "react";
import { Search, Bell, Moon, Sun, ChevronRight, Command } from "lucide-react";
import { useApp } from "../lib/app-context";
import type { Route } from "../lib/app-context";

const crumbs: Record<Route, string> = {
  dashboard: "nav_dashboard",
  wards: "nav_wards",
  families: "nav_families",
  members: "nav_members",
  announcements: "nav_announcements",
  calendar: "nav_calendar",
  clergy: "nav_clergy",
  houses: "nav_houses",
  ministries: "nav_ministries",
  council: "nav_council",
};

export default function Header() {
  const { route, tt, lang, setLang, theme, toggleTheme } = useApp();
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        (document.getElementById("global-search") as HTMLInputElement)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="glass sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border px-6">
      {/* Breadcrumb */}
      <div className="hidden items-center gap-1.5 text-[13px] lg:flex">
        <span className="font-medium text-muted-foreground">Parish Admin</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="font-semibold text-foreground">{tt(crumbs[route])}</span>
      </div>

      {/* Global search */}
      <div className="mx-auto w-full max-w-md">
        <div
          className={`flex items-center gap-2.5 rounded-[10px] border bg-input px-3 py-2 transition-colors ${
            focus ? "border-primary/50 ring-2 ring-ring/30" : "border-border"
          }`}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            id="global-search"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            placeholder={tt("searchPlaceholder")}
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          <kbd className="hidden items-center gap-0.5 rounded-[5px] border border-border-strong bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        {/* Liturgical season */}
        <div className="hidden items-center gap-2 rounded-full border border-lit-lent/30 bg-lit-lent/10 px-3 py-1.5 xl:flex">
          <span className="h-2 w-2 rounded-full bg-lit-lent" />
          <span className="text-[12px] font-semibold text-lit-lent">
            {tt("liturgicalSeason")}
          </span>
        </div>

        {/* Language switch */}
        <div className="flex items-center rounded-[8px] border border-border bg-secondary p-0.5">
          {(["en", "ml"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-[6px] px-2.5 py-1 text-[12px] font-semibold uppercase transition-colors ${
                lang === l
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-[8px] border border-border bg-secondary text-muted-foreground transition-colors hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-mono text-[9px] font-bold text-white">
            5
          </span>
        </button>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-border bg-secondary text-muted-foreground transition-colors hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
