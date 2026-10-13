import { Plus, Phone, UserPlus, Pencil, Crown } from "lucide-react";
import { Card, Pill, Button, IconButton } from "../components/ui";
import { useApp } from "../lib/app-context";
import { COUNCIL_SEATS } from "../lib/data";

export default function Council() {
  const { lang, toast } = useApp();
  const filled = COUNCIL_SEATS.filter((s) => s.status === "filled").length;
  const vacant = COUNCIL_SEATS.length - filled;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Pill tone="green">{filled} {lang === "en" ? "filled" : "നിറഞ്ഞു"}</Pill>
          <Pill tone="red">{vacant} {lang === "en" ? "vacant" : "ഒഴിവ്"}</Pill>
          <span className="text-[12px] text-muted-foreground">
            {lang === "en" ? "Term 2024 – 2026" : "കാലാവധി 2024 – 2026"}
          </span>
        </div>
        <Button className="sm:ml-auto" onClick={() => toast(lang === "en" ? "Seat form opened" : "ഫോം തുറന്നു")}>
          <Plus className="h-4 w-4" />
          {lang === "en" ? "Add Council Seat" : "സീറ്റ് ചേർക്കുക"}
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5">{lang === "en" ? "Seat / Office" : "സ്ഥാനം"}</th>
              <th className="px-4 py-2.5">{lang === "en" ? "Holder" : "വഹിക്കുന്നയാൾ"}</th>
              <th className="px-4 py-2.5">{lang === "en" ? "Ward" : "വാർഡ്"}</th>
              <th className="px-4 py-2.5">{lang === "en" ? "Term" : "കാലാവധി"}</th>
              <th className="px-4 py-2.5">{lang === "en" ? "Status" : "സ്ഥിതി"}</th>
              <th className="px-5 py-2.5 text-right">{lang === "en" ? "Actions" : "പ്രവർത്തനങ്ങൾ"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {COUNCIL_SEATS.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-secondary/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {s.seat.startsWith("President") && (
                      <Crown className="h-3.5 w-3.5 text-primary" />
                    )}
                    <div>
                      <div className="font-semibold text-foreground">{s.seat}</div>
                      <div className="font-malayalam text-[11px] text-muted-foreground">
                        {s.seatMl}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {s.holder ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">{s.holder}</span>
                      {s.phone && (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          · {s.phone}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="italic text-muted-foreground/60">
                      {lang === "en" ? "Unassigned" : "നിയമിക്കാത്തത്"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {s.ward ? (
                    <Pill tone="gold">#{s.ward}</Pill>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">
                  {s.term}
                </td>
                <td className="px-4 py-3">
                  <Pill tone={s.status === "filled" ? "green" : "red"} className="uppercase">
                    {s.status === "filled"
                      ? lang === "en"
                        ? "Filled"
                        : "നിറഞ്ഞു"
                      : lang === "en"
                        ? "Vacant"
                        : "ഒഴിവ്"}
                  </Pill>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {s.status === "vacant" ? (
                      <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]">
                        <UserPlus className="h-3.5 w-3.5" />
                        {lang === "en" ? "Assign" : "നിയമിക്കുക"}
                      </Button>
                    ) : (
                      <>
                        <IconButton title="Call" className="text-info">
                          <Phone className="h-4 w-4" />
                        </IconButton>
                        <IconButton title="Edit">
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
