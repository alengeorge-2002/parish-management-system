import { useMemo, useState } from "react";
import {
  Plus,
  Download,
  Search,
  Phone,
  MessageCircle,
  Eye,
  Pencil,
  Trash2,
  UsersRound,
  SlidersHorizontal,
} from "lucide-react";
import {
  Card,
  Pill,
  Button,
  Select,
  StatusPill,
  BloodTag,
  SacramentBadges,
  IconButton,
  EmptyState,
} from "../components/ui";
import { MemberModal } from "../components/modals";
import { useApp } from "../lib/app-context";
import { MEMBERS, WARDS, BLOOD_GROUPS, type Sacrament } from "../lib/data";

const SAC_FILTERS: { value: string; label: string }[] = [
  { value: "baptism", label: "Baptized" },
  { value: "communion", label: "First Communion" },
  { value: "confirmation", label: "Confirmed" },
  { value: "marriage", label: "Married" },
];

export default function Members() {
  const { tt } = useApp();
  const [q, setQ] = useState("");
  const [ward, setWard] = useState("");
  const [blood, setBlood] = useState("");
  const [sac, setSac] = useState("");
  const [modal, setModal] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MEMBERS.filter((m) => {
      if (query) {
        const hay = `${m.name} ${m.baptismName} ${m.phone} ${m.familyId} ${m.nameMl}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (ward && m.ward !== Number(ward)) return false;
      if (blood && m.blood !== blood) return false;
      if (sac && !m.sacraments.includes(sac as Sacrament)) return false;
      return true;
    });
  }, [q, ward, blood, sac]);

  const reset = () => {
    setQ("");
    setWard("");
    setBlood("");
    setSac("");
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-border bg-input px-3 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/30 lg:max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, baptism name, phone, family no."
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="hidden h-4 w-4 text-muted-foreground sm:block" />
          <Select value={ward} onChange={(e) => setWard(e.target.value)} className="w-auto">
            <option value="">{tt("filterWard")}</option>
            {WARDS.map((w) => (
              <option key={w.number} value={w.number}>
                Ward #{w.number} - {w.patron}
              </option>
            ))}
          </Select>
          <Select value={blood} onChange={(e) => setBlood(e.target.value)} className="w-auto">
            <option value="">{tt("filterBlood")}</option>
            {BLOOD_GROUPS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select value={sac} onChange={(e) => setSac(e.target.value)} className="w-auto">
            <option value="">{tt("filterSacrament")}</option>
            {SAC_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2 lg:ml-auto">
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            {tt("exportCsv")}
          </Button>
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" />
            {tt("addMember")}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3 text-[12px] text-muted-foreground">
          <span>
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            {MEMBERS.length} parishioners
          </span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<UsersRound className="h-6 w-6" />}
            title={tt("noResults")}
            action={
              <Button variant="secondary" onClick={reset}>
                {tt("resetSearch")}
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-2.5 font-semibold">{tt("colMember")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colFamily")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colWard")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colContact")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colBlood")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colSacraments")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colStatus")}</th>
                  <th className="px-5 py-2.5 text-right font-semibold">{tt("colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-foreground">
                            {m.name}
                          </div>
                          <div className="truncate font-malayalam text-[11px] text-muted-foreground">
                            {m.nameMl}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-left transition-colors hover:text-primary">
                        <div className="font-medium text-foreground">{m.familyHouse}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {m.familyId}
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone="gold">
                        #{m.ward} · {m.wardPatron}
                      </Pill>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] text-muted-foreground">
                          {m.phone}
                        </span>
                        <IconButton className="h-6 w-6 text-success" title="WhatsApp">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton className="h-6 w-6 text-info" title="Call">
                          <Phone className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <BloodTag group={m.blood} />
                    </td>
                    <td className="px-4 py-3">
                      <SacramentBadges received={m.sacraments} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={m.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton title="View">
                          <Eye className="h-4 w-4" />
                        </IconButton>
                        <IconButton title="Edit">
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          title="Delete"
                          className="hover:bg-danger/12 hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <MemberModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
