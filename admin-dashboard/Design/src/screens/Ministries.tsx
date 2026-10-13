import { useState } from "react";
import {
  Plus,
  Phone,
  Users,
  CalendarClock,
  Music,
  Sparkles,
  HandHeart,
  BookOpen,
  Church,
} from "lucide-react";
import { Card, Pill, Button, IconButton } from "../components/ui";
import { useApp } from "../lib/app-context";
import { MINISTRIES, type Ministry } from "../lib/data";

const catTone: Record<Ministry["category"], "gold" | "blue" | "green" | "violet" | "neutral"> = {
  Liturgical: "gold",
  Youth: "blue",
  Charity: "green",
  Catechetical: "violet",
  Devotional: "neutral",
};

const catIcon: Record<Ministry["category"], typeof Music> = {
  Liturgical: Music,
  Youth: Sparkles,
  Charity: HandHeart,
  Catechetical: BookOpen,
  Devotional: Church,
};

const CATS = ["All", "Liturgical", "Youth", "Charity", "Catechetical", "Devotional"] as const;

export default function Ministries() {
  const { lang, toast } = useApp();
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const filtered = MINISTRIES.filter((m) => cat === "All" || m.category === cat);
  const totalMembers = MINISTRIES.reduce((s, m) => s + m.members, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                cat === c
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 lg:ml-auto">
          <span className="text-[12px] text-muted-foreground">
            {lang === "en" ? "Total volunteers" : "മൊത്തം അംഗങ്ങൾ"}:{" "}
            <span className="font-display text-[14px] font-bold text-foreground">
              {totalMembers.toLocaleString()}
            </span>
          </span>
          <Button onClick={() => toast(lang === "en" ? "Ministry form opened" : "ഫോം തുറന്നു")}>
            <Plus className="h-4 w-4" />
            {lang === "en" ? "Add Ministry" : "സേവനം ചേർക്കുക"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => {
          const Icon = catIcon[m.category];
          return (
            <Card key={m.id} glow className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <Pill tone={catTone[m.category]}>{m.category}</Pill>
              </div>
              <h3 className="mt-3 font-display text-[15px] font-semibold text-foreground">
                {m.name}
              </h3>
              <div className="font-malayalam text-[12px] text-muted-foreground">{m.nameMl}</div>

              <div className="mt-3 space-y-1.5 text-[12px]">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-foreground">{m.members}</span>{" "}
                  {lang === "en" ? "members" : "അംഗങ്ങൾ"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {m.meets}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[12px]">
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    {lang === "en" ? "Coordinator" : "ഏകോപകൻ"}
                  </div>
                  <div className="font-medium text-foreground">{m.coordinator}</div>
                </div>
                <IconButton className="h-8 w-8 text-info" title="Call">
                  <Phone className="h-4 w-4" />
                </IconButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
