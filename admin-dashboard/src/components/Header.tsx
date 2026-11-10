import { useEffect, useRef, useState } from "react";
import { Search, Bell, Moon, Sun, ChevronRight, Command, Phone, Copy, Check, X, Loader2 } from "lucide-react";
import { useApp, useNavigate } from "../lib/app-context";
import type { Route } from "../lib/app-context";
import { searchApi, type GlobalSearchResult } from "../utils/api-client";

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
  users: "nav_users",
};

const getCategoryBadgeStyle = (category: string) => {
  switch (category) {
    case "Clergy & Priests":
      return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    case "Parish Council":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "Religious House":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "Family Head":
    case "Family":
      return "bg-[#F4C430]/15 text-[#F4C430] border-[#F4C430]/30";
    case "Parishioner":
    default:
      return "bg-sky-500/15 text-sky-300 border-sky-500/30";
  }
};

export default function Header() {
  const { route, tt, lang, setLang, theme, toggleTheme, toast } = useApp();
  const navigate = useNavigate();
  const [focus, setFocus] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setDropdownOpen(true);
      } else if (e.key === "Escape") {
        setDropdownOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchApi.query(trimmed);
        if (!cancelled) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[GlobalSearch] Error:", err);
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelectResult = (item: GlobalSearchResult) => {
    setDropdownOpen(false);
    navigate(item.route);
  };

  const handleCopyContact = (e: React.MouseEvent, item: GlobalSearchResult) => {
    e.stopPropagation();
    if (!item.contact) return;
    navigator.clipboard?.writeText(item.contact);
    setCopiedId(item.id);
    toast(`Copied ${item.contact}`);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border px-6">
      {/* Breadcrumb */}
      <div className="hidden items-center gap-1.5 text-[13px] lg:flex">
        <span className="font-medium text-muted-foreground">Parish Admin</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="font-semibold text-foreground">{tt(crumbs[route])}</span>
      </div>

      {/* Global search */}
      <div ref={searchWrapperRef} className="relative mx-auto w-full max-w-md">
        <div
          className={`flex items-center gap-2.5 rounded-[10px] border bg-input px-3 py-2 transition-colors ${
            focus ? "border-primary/50 ring-2 ring-ring/30" : "border-border"
          }`}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            id="global-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => {
              setFocus(true);
              if (query.trim().length > 0) setDropdownOpen(true);
            }}
            onBlur={() => setFocus(false)}
            placeholder={tt("searchPlaceholder")}
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden items-center gap-0.5 rounded-[5px] border border-border-strong bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>

        {/* Floating Search Dropdown */}
        {dropdownOpen && query.trim().length >= 1 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#181b22] border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
            {query.trim().length < 2 ? (
              <div className="px-3 py-4 text-center text-xs text-zinc-400">
                Type at least 2 characters to search across parishioners, clergy, houses, and council...
              </div>
            ) : searching ? (
              <div className="flex items-center justify-center gap-2 px-3 py-5 text-xs text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin text-[#F4C430]" />
                <span>Searching parish directory...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-5 text-center text-xs text-zinc-400">
                No results found for <span className="font-semibold text-zinc-200">"{query.trim()}"</span>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="group flex items-start justify-between gap-3 rounded-lg p-2.5 hover:bg-zinc-800/70 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-zinc-100 truncate">
                          {item.title}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getCategoryBadgeStyle(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-zinc-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>

                    {item.contact && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="hidden sm:inline font-mono text-[11px] text-zinc-300 mr-1">
                          {item.contact}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyContact(e, item)}
                          title={`Copy ${item.contact}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700/80 bg-[#141414] text-zinc-400 hover:border-[#F4C430]/50 hover:text-[#F4C430] transition-colors cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <a
                          href={`tel:${item.contact}`}
                          onClick={(e) => e.stopPropagation()}
                          title={`Call ${item.contact}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700/80 bg-[#141414] text-zinc-400 hover:border-sky-400/50 hover:text-sky-400 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
