import { MapPin, Phone, Users, ArrowRight, Pencil } from "lucide-react";
import { Card, Button, IconButton } from "../components/ui";
import { useApp } from "../lib/app-context";
import { WARDS } from "../lib/data";

export default function Wards() {
  const { tt, lang } = useApp();
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {WARDS.map((w) => (
        <Card key={w.number} glow className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-primary/12 font-display text-[16px] font-bold text-primary">
              {w.number}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <MapPin className="h-3 w-3" />
                Ward #{w.number}
              </div>
              <h3 className="font-display text-[15px] font-semibold text-foreground">
                {w.patron}
              </h3>
              <div className="font-malayalam text-[12px] text-muted-foreground">
                {w.patronMl}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 rounded-[10px] border border-border bg-secondary/30 p-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {tt("wardRep")}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-foreground">{w.rep}</span>
              <span className="flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-info" />
                {w.phone}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Users className="h-4 w-4" />
              </span>
              <span>
                <span className="font-display text-[16px] font-bold text-foreground">
                  {w.families}
                </span>{" "}
                <span className="text-[12px] text-muted-foreground">{tt("families")}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]">
                {tt("viewHouseholds")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <IconButton title={lang === "en" ? "Edit ward" : "വാർഡ് തിരുത്തുക"}>
                <Pencil className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
