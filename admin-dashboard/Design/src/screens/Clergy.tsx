import { Phone, Upload, Pencil, CalendarClock, Plus } from "lucide-react";
import { Card, Pill, Button } from "../components/ui";
import { useApp } from "../lib/app-context";
import { CLERGY } from "../lib/data";

export default function Clergy() {
  const { tt, lang, toast } = useApp();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">
          <span className="font-semibold text-foreground">{CLERGY.length}</span>{" "}
          {lang === "en" ? "clergy & council members" : "വൈദികരും കൗൺസിലംഗങ്ങളും"}
        </p>
        <Button onClick={() => toast(lang === "en" ? "Clergy form opened" : "ഫോം തുറന്നു")}>
          <Plus className="h-4 w-4" />
          {lang === "en" ? "Add New Clergy" : "പുതിയ വൈദികൻ"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {CLERGY.map((c) => (
        <Card
          key={c.id}
          glow
          className={`overflow-hidden ${c.primary ? "sm:col-span-2 xl:col-span-1" : ""}`}
        >
          <div className="flex items-center gap-4 p-5">
            <div
              className={`relative aspect-square w-24 shrink-0 overflow-hidden rounded-[14px] ${
                c.primary ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
              }`}
            >
              <img src={c.portrait} alt={c.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <Pill tone={c.primary ? "gold" : "neutral"} className="uppercase">
                {c.title}
              </Pill>
              <h3 className="mt-2 font-display text-[16px] font-semibold leading-tight text-foreground">
                {c.name}
              </h3>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{c.role}</p>
            </div>
          </div>

          <div className="space-y-2 px-5 pb-3 text-[12px]">
            <div className="flex items-center justify-between rounded-[8px] bg-secondary/40 px-3 py-2">
              <span className="flex items-center gap-2 font-mono text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-info" />
                {c.phone}
              </span>
              <button className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline">
                {tt("callNow")}
              </button>
            </div>
            <div className="flex items-center gap-2 px-1 text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{tt("tenure")}:</span>
              {c.tenure}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border px-5 py-3">
            <Button variant="secondary" className="flex-1 px-2.5 py-1.5 text-[12px]">
              <Upload className="h-3.5 w-3.5" />
              Portrait
            </Button>
            <Button variant="secondary" className="flex-1 px-2.5 py-1.5 text-[12px]">
              <Pencil className="h-3.5 w-3.5" />
              {tt("editContact")}
            </Button>
          </div>
        </Card>
      ))}
      </div>
    </div>
  );
}
