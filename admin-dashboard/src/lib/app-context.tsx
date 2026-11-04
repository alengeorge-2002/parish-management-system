import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "./i18n";
import { tr } from "./i18n";

export type Route =
  | "dashboard"
  | "wards"
  | "families"
  | "members"
  | "users"
  | "announcements"
  | "calendar"
  | "clergy"
  | "houses"
  | "ministries"
  | "council";

export interface LocationState {
  pathname: string;
  state?: any;
}

interface Toast {
  id: number;
  message: string;
}

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  route: Route;
  setRoute: (r: Route) => void;
  selectedWardFilter: string;
  setSelectedWardFilter: (wardId: string) => void;
  tt: (key: string) => string;
  toast: (message: string) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  location: LocationState;
  navigate: (to: string, options?: { state?: any }) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const validRoutes: Route[] = [
    "dashboard",
    "wards",
    "families",
    "members",
    "users",
    "announcements",
    "calendar",
    "clergy",
    "houses",
    "ministries",
    "council",
  ];

  const getInitialRoute = (): Route => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname.replace(/^\//, "").split("/")[0].toLowerCase();
      if (validRoutes.includes(p as Route)) return p as Route;
      const hash = window.location.hash.replace(/^#\/?/, "").split("/")[0].toLowerCase();
      if (validRoutes.includes(hash as Route)) return hash as Route;
    }
    return "dashboard";
  };

  const [route, setRoute] = useState<Route>(getInitialRoute);
  const [location, setLocation] = useState<LocationState>(() => {
    if (typeof window !== "undefined") {
      return {
        pathname: window.location.pathname || `/${getInitialRoute()}`,
        state: window.history.state || null,
      };
    }
    return { pathname: "/dashboard", state: null };
  });

  const [selectedWardFilter, setSelectedWardFilter] = useState<string>("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("light");
    else root.classList.remove("light");
  }, [theme]);

  // Synchronize browser popstate (back/forward)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (e: PopStateEvent) => {
      const p = window.location.pathname.replace(/^\//, "").split("/")[0].toLowerCase();
      if (validRoutes.includes(p as Route)) {
        setRoute(p as Route);
      }
      setLocation({
        pathname: window.location.pathname,
        state: e.state || null,
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: string, options?: { state?: any }) => {
    const cleanPath = to.startsWith("/") ? to : `/${to}`;
    const target = cleanPath.replace(/^\//, "").split("/")[0].toLowerCase();

    if (typeof window !== "undefined") {
      try {
        window.history.pushState(options?.state ?? null, "", cleanPath);
      } catch (_) {}
    }

    setLocation({
      pathname: cleanPath,
      state: options?.state ?? null,
    });

    if (validRoutes.includes(target as Route)) {
      setRoute(target as Route);
    }
  };

  const handleSetRoute = (r: Route) => {
    const cleanPath = `/${r}`;
    if (typeof window !== "undefined" && window.location.pathname !== cleanPath) {
      try {
        window.history.pushState(null, "", cleanPath);
      } catch (_) {}
    }
    setLocation({
      pathname: cleanPath,
      state: null,
    });
    setRoute(r);
  };

  const toast = (message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  };

  const value: AppState = {
    lang,
    setLang,
    theme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    route,
    setRoute: handleSetRoute,
    selectedWardFilter,
    setSelectedWardFilter,
    tt: (key: string) => tr(key, lang),
    toast,
    toasts,
    dismissToast: (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    location,
    navigate,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useLocation(): LocationState {
  const ctx = useContext(Ctx);
  if (ctx) {
    return ctx.location;
  }
  return {
    pathname: typeof window !== "undefined" ? window.location.pathname : "/dashboard",
    state: typeof window !== "undefined" ? window.history.state : null,
  };
}

export function useNavigate() {
  const ctx = useContext(Ctx);
  if (ctx) {
    return ctx.navigate;
  }
  return (to: string, options?: { state?: any }) => {
    const cleanPath = to.startsWith("/") ? to : `/${to}`;
    if (typeof window !== "undefined") {
      window.history.pushState(options?.state ?? null, "", cleanPath);
    }
  };
}
