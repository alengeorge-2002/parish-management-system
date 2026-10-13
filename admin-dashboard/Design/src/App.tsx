import { CheckCircle2, X } from "lucide-react";
import { AppProvider, useApp } from "./lib/app-context";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./screens/Dashboard";
import Members from "./screens/Members";
import Families from "./screens/Families";
import Wards from "./screens/Wards";
import Clergy from "./screens/Clergy";
import CalendarScreen from "./screens/Calendar";
import Announcements from "./screens/Announcements";
import Houses from "./screens/Houses";
import Ministries from "./screens/Ministries";
import Council from "./screens/Council";

function ToastHost() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in glass pointer-events-auto flex items-center gap-3 rounded-full border border-success/30 py-2.5 pl-3 pr-2 shadow-xl"
        >
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-[13px] font-medium text-foreground">{t.message}</span>
          <button
            onClick={() => dismissToast(t.id)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function Shell() {
  const { route, tt } = useApp();
  const screens: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    wards: <Wards />,
    families: <Families />,
    members: <Members />,
    announcements: <Announcements />,
    calendar: <CalendarScreen />,
    clergy: <Clergy />,
    houses: <Houses />,
    ministries: <Ministries />,
    council: <Council />,
  };

  const titleKey: Record<string, string> = {
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

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-[1400px]">
            <h1 className="mb-5 font-display text-[22px] font-semibold tracking-tight text-foreground">
              {tt(titleKey[route])}
            </h1>
            {screens[route]}
          </div>
        </main>
      </div>
      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
