import { useState } from "react";
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
import {
  WARDS,
  MASS_TIMINGS,
  BULLETINS,
  RECENT_REGISTRATIONS,
  type Bulletin,
} from "../lib/data";

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
  return (
    <div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="bg-info" style={{ width: `${(male / total) * 100}%` }} />
        <div className="bg-lit-lent" style={{ width: `${(female / total) * 100}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-muted-foreground">
        <span>♂ {male.toLocaleString()} male</span>
        <span>♀ {female.toLocaleString()} female</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { tt } = useApp();
  const [bulletins, setBulletins] = useState<Bulletin[]>(BULLETINS);
  const wardChart = WARDS.map((w) => ({ name: `${w.number}`, families: w.families }));

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Users}
          label={tt("totalParishioners")}
          value="3,420"
          trend="+2.4%"
          data={[20, 32, 28, 40, 38, 52, 60]}
          sub={<SplitBar male={1712} female={1708} />}
        />
        <KpiCard
          icon={Home}
          label={tt("registeredFamilies")}
          value="1,048"
          trend="+1.1%"
          data={[10, 14, 13, 18, 22, 21, 26]}
          sub={<span className="text-muted-foreground">{tt("across16Wards")}</span>}
        />
        <KpiCard
          icon={Cross}
          label={tt("activeClergy")}
          value="12"
          trend="+1"
          data={[5, 5, 6, 6, 7, 7, 7]}
          sub={
            <span className="text-muted-foreground">
              2 clergy · 6 council · 4 catechists
            </span>
          }
        />
        <KpiCard
          icon={Sparkles}
          label={tt("upcomingFeasts")}
          value="3"
          trend={tt("thisWeek")}
          data={[1, 0, 2, 1, 3, 2, 3]}
          sub={
            <span className="text-muted-foreground">
              Next: St. Joseph — Mar 19
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
                <button className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline">
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              }
            />
            <div className="divide-y divide-border border-t border-border">
              {RECENT_REGISTRATIONS.map(({ member, when }) => (
                <div
                  key={member.id + when}
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
                    <div className="truncate font-malayalam text-[11px] text-muted-foreground">
                      {member.nameMl}
                    </div>
                  </div>
                  <Pill tone="gold">{member.familyHouse}</Pill>
                  <div className="flex w-24 items-center justify-end gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {when}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title={tt("bulletins")} />
            <div className="space-y-3 px-5 pb-5">
              {bulletins.map((b) => (
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
                    <span className="mt-1 block font-mono text-[11px] text-muted-foreground/70">
                      {b.date}
                    </span>
                  </div>
                  <Toggle
                    checked={b.status === "active"}
                    onChange={() =>
                      setBulletins((prev) =>
                        prev.map((x) =>
                          x.id === b.id
                            ? { ...x, status: x.status === "active" ? "draft" : "active" }
                            : x,
                        ),
                      )
                    }
                  />
                </div>
              ))}
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
                    {m.priest.replace("Fr. ", "Fr. ")}
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
