import React, { useState, useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { AppProvider, useApp } from "./lib/app-context";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./screens/Dashboard";
import Wards from "./screens/Wards";
import Families from "./screens/Families";
import Members from "./screens/Members";
import Users from "./screens/Users";
import Announcements from "./screens/Announcements";
import CalendarScreen from "./screens/Calendar";
import Clergy from "./screens/Clergy";
import Houses from "./screens/Houses";
import Ministries from "./screens/Ministries";
import Council from "./screens/Council";
import Login from "./screens/Login";
import { getSession, setSession, clearSession, fetchApi, type UserSession } from "./utils/api-client";

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

function Shell({ session, onLogout }: { session: UserSession; onLogout: () => void }) {
  const { route, tt } = useApp();

  const screens: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    wards: <Wards />,
    families: <Families />,
    members: <Members />,
    users: <Users />,
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
    users: "nav_users",
    announcements: "nav_announcements",
    calendar: "nav_calendar",
    clergy: "nav_clergy",
    houses: "nav_houses",
    ministries: "nav_ministries",
    council: "nav_council",
  };

  const userName = session.firstName ? `${session.firstName} ${session.lastName || ""}` : "Fr. Administrator";

  return (
    <div className="flex h-full w-full overflow-hidden bg-background font-sans">
      <Sidebar onLogout={onLogout} userName={userName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-[1400px]">
            <h1 className="mb-5 font-display text-[22px] font-semibold tracking-tight text-foreground">
              {tt(titleKey[route] || "nav_dashboard")}
            </h1>
            {screens[route] || <Dashboard />}
          </div>
        </main>
      </div>
      <ToastHost />
    </div>
  );
}

export default function App() {
  const [session, setSessionState] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const currentSession = getSession();
    if (currentSession) {
      setSessionState(currentSession);
    }
    setVerifying(false);
  }, []);

  const handleLogin = async (key: string) => {
    if (!key.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ accessKey: key.trim() }),
      });

      if (data && data.token) {
        if (data.user.role !== "admin") {
          throw new Error("Access Denied: Administrator role is required to log in to this portal.");
        }

        const newSession: UserSession = {
          token: data.token,
          role: data.user.role,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
        };

        setSession(newSession);
        setSessionState(newSession);
      } else {
        throw new Error("Invalid authentication response.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please verify your access key.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setSessionState(null);
  };

  if (verifying) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="font-display text-[15px] font-semibold text-primary">Preparing Sanctum...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={handleLogin} loading={loading} error={error} />;
  }

  return (
    <AppProvider>
      <Shell session={session} onLogout={handleLogout} />
    </AppProvider>
  );
}
