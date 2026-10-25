import { useEffect, useState } from "react";
import {
  Users,
  Home,
  Cross,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { Card, Pill, SectionHeader, Toggle } from "../components/ui";
import { useApp } from "../lib/app-context";
import { MASS_TIMINGS, type Bulletin } from "../lib/data";
import {
  membersApi,
  familiesApi,
  wardsApi,
  clergyApi,
  eventsApi,
  announcementsApi,
} from "../utils/api-client";
import getMemberAvatar from "../utils/getMemberAvatar";

const spark = (seed: number[]) => seed.map((v, i) => ({ i, v }));

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  data,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  sub: React.ReactNode;
  trend: string;
  data: number[];
}) {
  return (
    <Card glow className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <Pill tone="green">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </Pill>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-[28px] font-bold leading-none tracking-tight text-foreground">
            {value}
          </div>
          <div className="mt-1.5 text-[12px] font-medium text-muted-foreground">{label}</div>
        </div>
        <div className="opacity-80">
          <AreaChart width={80} height={40} data={spark(data)}>
            <defs>
              <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--primary)"
              strokeWidth={1.75}
              fill={`url(#g-${label})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </div>
      </div>
      <div className="mt-3 border-t border-border pt-3 text-[11px]">{sub}</div>
    </Card>
  );
}

function SplitBar({ male, female }: { male: number; female: number }) {
  const total = male + female;
  const malePercent = total > 0 ? (male / total) * 100 : 50;
  const femalePercent = total > 0 ? (female / total) * 100 : 50;
  return (
    <div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="bg-info" style={{ width: `${malePercent}%` }} />
        <div className="bg-lit-lent" style={{ width: `${femalePercent}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-muted-foreground">
        <span>♂ {male.toLocaleString()} male</span>
        <span>♀ {female.toLocaleString()} female</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { tt, setRoute } = useApp();
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [membersCount, setMembersCount] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [familiesCount, setFamiliesCount] = useState(0);
  const [wardsCount, setWardsCount] = useState(0);
  const [clergyCount, setClergyCount] = useState(0);
  const [feastsCount, setFeastsCount] = useState(0);
  const [nextFeastTitle, setNextFeastTitle] = useState("No upcoming feasts");
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [wardChart, setWardChart] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          membersData,
          familiesData,
          wardsData,
          clergyData,
          eventsData,
          announcementsData,
        ] = await Promise.all([
          membersApi.list().catch(() => []),
          familiesApi.list().catch(() => []),
          wardsApi.list().catch(() => []),
          clergyApi.list().catch(() => []),
          eventsApi.list().catch(() => []),
          announcementsApi.list().catch(() => []),
        ]);

        const members = Array.isArray(membersData) ? membersData : [];
        const families = Array.isArray(familiesData) ? familiesData : [];
        const wards = Array.isArray(wardsData) ? wardsData : [];
        const clergy = Array.isArray(clergyData) ? clergyData : [];
        const events = Array.isArray(eventsData) ? eventsData : [];
        const announcements = Array.isArray(announcementsData) ? announcementsData : [];

        setMembersCount(members.length);
        const males = members.filter((m: any) => {
          const g = (m.gender || m.sex || "").toUpperCase();
          return g === "MALE" || g === "M";
        }).length;
        const females = members.filter((m: any) => {
          const g = (m.gender || m.sex || "").toUpperCase();
          return g === "FEMALE" || g === "F";
        }).length;
        setMaleCount(males);
        setFemaleCount(females);

        setFamiliesCount(families.length);
        setWardsCount(wards.length);
        setClergyCount(clergy.length);
        setFeastsCount(events.length);
        if (events.length > 0) {
          setNextFeastTitle(events[0].title_en || events[0].title || "Feast");
        }

        // Map recent registrations from members
        const sortedMembers = [...members].sort((a: any, b: any) => {
          const tA = new Date(a.created_at || a.createdAt || 0).getTime();
          const tB = new Date(b.created_at || b.createdAt || 0).getTime();
          return tB - tA;
        });
        setRecentRegistrations(
          sortedMembers.slice(0, 5).map((m: any) => ({
            id: m.id || m._id,
            name: m.name || `${m.firstName || m.first_name || ""} ${m.lastName || m.last_name || ""}`.trim() || "Parishioner",
            nameMl: m.nameMl || m.malayalam_name || m.malayalamName || "",
            familyHouse: m.familyHouse || m.house_name || m.houseName || (typeof m.family_id === "object" ? m.family_id?.house_name : "") || "Parish Household",
            avatar: getMemberAvatar(m),
            when: m.created_at ? new Date(m.created_at).toLocaleDateString() : "Recently",
          }))
        );

        // Map bulletins
        setBulletins(
          announcements.map((b: any) => ({
            id: b.id || b._id,
            title: b.title || "Announcement",
            excerpt: b.content || b.description || "",
            date: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "",
            status: b.isActive === false || b.status === "draft" ? "draft" : "active",
          }))
        );

        // Map wards to chart
        if (wards.length > 0) {
          setWardChart(
            wards.map((w: any) => {
              const wardNum = w.ward_number || w.wardNumber || w.number || w.id;
              const famCount = families.filter(
                (f: any) => String(f.wardId || f.ward_id || f.wardNumber || f.ward) === String(w.id || wardNum)
              ).length || w.totalFamilies || w.families || 0;
              return {
                name: `${wardNum}`,
                families: famCount,
              };
            })
          );
        } else {
          setWardChart([]);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Users}
          label={tt("totalParishioners")}
          value={membersCount.toLocaleString()}
          trend="+0%"
          data={[1, membersCount]}
          sub={<SplitBar male={maleCount} female={femaleCount} />}
        />
        <KpiCard
          icon={Home}
          label={tt("registeredFamilies")}
          value={familiesCount.toLocaleString()}
          trend="+0%"
          data={[1, familiesCount]}
          sub={
            <span className="text-muted-foreground">
              Across {wardsCount} {wardsCount === 1 ? "Ward" : "Wards"}
            </span>
          }
        />
        <KpiCard
          icon={Cross}
          label={tt("activeClergy")}
          value={clergyCount.toLocaleString()}
          trend="+0"
          data={[1, clergyCount]}
          sub={
            <span className="text-muted-foreground">
              {clergyCount} active clergy records
            </span>
          }
        />
        <KpiCard
          icon={Sparkles}
          label={tt("upcomingFeasts")}
          value={feastsCount.toLocaleString()}
          trend={feastsCount > 0 ? "Active" : "None"}
          data={[1, feastsCount]}
          sub={
            <span className="text-muted-foreground truncate block">
              {nextFeastTitle}
            </span>
          }
        />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.85fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          <Card>
            <SectionHeader
              title={tt("recentRegistrations")}
              action={
                <button
                  onClick={() => setRoute("members")}
                  className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
                >
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              }
            />
            <div className="divide-y divide-border border-t border-border">
              {recentRegistrations.length === 0 ? (
                <div className="px-5 py-6 text-center text-[13px] text-muted-foreground">
                  No parishioner registrations recorded.
                </div>
              ) : (
                recentRegistrations.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/40"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-foreground">
                        {member.name}
                      </div>
                      {member.nameMl && (
                        <div className="truncate font-malayalam text-[11px] text-muted-foreground">
                          {member.nameMl}
                        </div>
                      )}
                    </div>
                    <Pill tone="gold">{member.familyHouse}</Pill>
                    <div className="flex w-24 items-center justify-end gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {member.when}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader title={tt("bulletins")} />
            <div className="space-y-3 px-5 pb-5">
              {bulletins.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-muted-foreground">
                  No parish announcements published yet.
                </div>
              ) : (
                bulletins.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-start gap-4 rounded-[10px] border border-border bg-secondary/30 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[13px] font-semibold text-foreground">
                          {b.title}
                        </h4>
                        <Pill tone={b.status === "active" ? "green" : "neutral"} className="uppercase">
                          {b.status === "active" ? tt("active") : tt("draft")}
                        </Pill>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground">
                        {b.excerpt}
                      </p>
                      {b.date && (
                        <span className="mt-1 block font-mono text-[11px] text-muted-foreground/70">
                          {b.date}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <SectionHeader title={tt("todaysMass")} />
            <div className="divide-y divide-border border-t border-border">
              {MASS_TIMINGS.map((m) => (
                <div key={m.time} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-[70px] font-mono text-[13px] font-semibold text-foreground">
                    {m.time}
                  </div>
                  <Pill tone={m.language === "English" ? "blue" : "gold"}>
                    {m.language}
                  </Pill>
                  <div className="ml-auto truncate text-[11px] text-muted-foreground">
                    {m.priest}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-display text-[15px] font-semibold text-foreground">
              {tt("wardDistribution")}
            </h3>
            <div className="h-[220px]">
              {wardChart.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">
                  No ward distribution data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wardChart} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--secondary)" }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border-strong)",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "var(--foreground)",
                      }}
                      labelFormatter={(l) => `Ward #${l}`}
                    />
                    <Bar dataKey="families" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                      {wardChart.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i % 3 === 0 ? "var(--primary)" : "var(--border-strong)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
