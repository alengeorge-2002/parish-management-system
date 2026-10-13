import { useState } from "react";
import { Plus, Phone, Users, Pencil, ArrowRight } from "lucide-react";
import { Card, Pill, Button, IconButton } from "../components/ui";
import { useApp } from "../lib/app-context";
import { RELIGIOUS_HOUSES } from "../lib/data";

const typeTone: Record<string, "gold" | "blue" | "violet"> = {
  Convent: "gold",
  Monastery: "blue",
  "Formation House": "violet",
};

export default function Houses() {
  const { lang, toast } = useApp();
  const [q, setQ] = useState("");
  const filtered = RELIGIOUS_HOUSES.filter((h) =>
    `${h.name} ${h.congregation} ${h.superior}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={lang === "en" ? "Search houses, congregations…" : "ഭവനങ്ങൾ തിരയുക…"}
          className="w-full rounded-[10px] border border-border bg-input px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none sm:max-w-sm"
        />
        <Button className="sm:ml-auto" onClick={() => toast(lang === "en" ? "House form opened" : "ഫോം തുറന്നു")}>
          <Plus className="h-4 w-4" />
          {lang === "en" ? "Add Religious House" : "സന്യാസ ഭവനം"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((h) => (
          <Card key={h.id} glow className="overflow-hidden">
            <div className="relative aspect-[16/9] w-full bg-secondary">
              <img src={h.image} alt={h.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <Pill tone={typeTone[h.type]}>{h.type}</Pill>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-display text-[15px] font-semibold text-foreground">{h.name}</h3>
              <div className="font-malayalam text-[12px] text-muted-foreground">{h.nameMl}</div>
              <div className="mt-1 text-[12px] font-medium text-primary">{h.congregation}</div>

              <div className="mt-3 space-y-1.5 rounded-[10px] border border-border bg-secondary/30 p-3 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{lang === "en" ? "Superior" : "സുപ്പീരിയർ"}</span>
                  <span className="font-medium text-foreground">{h.superior}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{lang === "en" ? "Established" : "സ്ഥാപിതം"}</span>
                  <span className="font-mono text-foreground">{h.established}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    {h.members}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3.5 w-3.5 text-info" />
                    {h.phone}
                  </span>
                </div>
                <IconButton title={lang === "en" ? "Edit" : "തിരുത്തുക"}>
                  <Pencil className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
