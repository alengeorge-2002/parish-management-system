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
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const getInitialRoute = (): Route => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname.replace(/^\//, "").toLowerCase();
      if (p === "users") return "users";
      const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
      if (hash === "users") return "users";
    }
    return "dashboard";
  };
  const [route, setRoute] = useState<Route>(getInitialRoute);
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("light");
    else root.classList.remove("light");
  }, [theme]);

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
    setRoute,
    selectedWardFilter,
    setSelectedWardFilter,
    tt: (key: string) => tr(key, lang),
    toast,
    toasts,
    dismissToast: (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
