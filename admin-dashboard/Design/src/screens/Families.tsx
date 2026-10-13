import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  Table2,
  Phone,
  Pencil,
  ArrowRight,
  User,
} from "lucide-react";
import { Card, Pill, Button, Select, IconButton } from "../components/ui";
import { FamilyModal } from "../components/modals";
import { useApp } from "../lib/app-context";
import { FAMILIES, WARDS, type Family } from "../lib/data";

function AvatarStack({ family }: { family: Family }) {
  const shown = family.avatars.slice(0, 4);
  const extra = family.memberCount - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((a, i) => (
          <img
            key={i}
            src={a}
            alt=""
            className="h-7 w-7 rounded-full border-2 border-card object-cover"
          />
        ))}
      </div>
      {extra > 0 && (
        <span className="ml-1 text-[11px] font-medium text-muted-foreground">
          +{extra}
        </span>
      )}
    </div>
  );
}

export default function Families() {
  const { tt } = useApp();
  const [q, setQ] = useState("");
  const [ward, setWard] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [modal, setModal] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return FAMILIES.filter((f) => {
      if (query && !`${f.name} ${f.house} ${f.id}`.toLowerCase().includes(query))
        return false;
      if (ward && f.ward !== Number(ward)) return false;
      return true;
    });
  }, [q, ward]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-border bg-input px-3 py-2 focus-within:border-primary/50 lg:max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Family name, house name, family ID"
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
        </div>
        <Select value={ward} onChange={(e) => setWard(e.target.value)} className="w-auto">
          <option value="">{tt("filterWard")}</option>
          {WARDS.map((w) => (
            <option key={w.number} value={w.number}>
              Ward #{w.number} - {w.patron}
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-2 lg:ml-auto">
          <div className="flex items-center rounded-[8px] border border-border bg-secondary p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {tt("gridView")}
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                view === "table"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              {tt("tableView")}
            </button>
          </div>
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" />
            {tt("addFamily")}
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((f) => (
            <Card key={f.id} glow className="overflow-hidden">
              <div className="relative aspect-[16/9] w-full bg-secondary">
                <img
                  src={f.banner}
                  alt={f.house}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <Pill tone="gold">
                    #{f.ward} · {f.wardPatron}
                  </Pill>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-[15px] font-semibold text-foreground">
                    {f.house}
                  </h3>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {f.id}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">{f.head}</span>
                  <span className="font-mono">· {f.phone}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <AvatarStack family={f} />
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline">
                      {tt("viewRoster")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <IconButton title="Edit">
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5">Household</th>
                <th className="px-4 py-2.5">{tt("headOfFamily")}</th>
                <th className="px-4 py-2.5">{tt("colWard")}</th>
                <th className="px-4 py-2.5">Members</th>
                <th className="px-5 py-2.5 text-right">{tt("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((f) => (
                <tr key={f.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-foreground">{f.house}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{f.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{f.head}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{f.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone="gold">#{f.ward} · {f.wardPatron}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <AvatarStack family={f} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton title="Call"><Phone className="h-4 w-4" /></IconButton>
                      <IconButton title="Edit"><Pencil className="h-4 w-4" /></IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <FamilyModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
