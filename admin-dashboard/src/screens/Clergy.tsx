import { useEffect, useState } from "react";
import { Phone, Pencil, CalendarClock, Plus, Trash2, AlertTriangle, Crown } from "lucide-react";
import { Card, Pill, Button, IconButton } from "../components/ui";
import { ClergyModal, getPhotoSrc } from "../components/modals";
import { useApp } from "../lib/app-context";
import { clergyApi, type LeadershipStatusResponse } from "../utils/api-client";

const isAssistantVicarRole = (roleType?: string, designation?: string): boolean => {
  const combined = `${roleType || ""} ${designation || ""}`.toLowerCase();
  return (
    combined.includes("assistant") ||
    combined.includes("asst") ||
    combined.includes("associate") ||
    combined.includes("സഹവികാരി")
  );
};

const isVicarRole = (roleType?: string, designation?: string): boolean => {
  if (isAssistantVicarRole(roleType, designation)) return false;
  const role = (roleType || "").trim().toLowerCase();
  const desig = (designation || "").trim().toLowerCase();
  if (role.includes("sister") || desig.includes("sister") || desig.includes("principal") || desig.includes("social service")) {
    return false;
  }
  if (role.includes("visiting") || desig.includes("visiting")) return false;
  if (role === "resident priest" || role === "priest") {
    return desig.includes("vicar") || desig.includes("വികാരി");
  }
  return role === "vicar" || desig.includes("vicar") || desig.includes("വികാരി") || role === "parish-priest";
};

const getClergyRank = (roleType?: string, designation?: string): number => {
  if (isVicarRole(roleType, designation)) return 0;
  if (isAssistantVicarRole(roleType, designation)) return 1;
  const combined = `${roleType || ""} ${designation || ""}`.toLowerCase();
  if (combined.includes("visiting")) return 3;
  if (combined.includes("sister") || combined.includes("principal") || combined.includes("social service")) return 4;
  return 2;
};

function ClergyHeadshot({
  portrait,
  name,
  isPrimary,
}: {
  portrait?: string;
  name: string;
  isPrimary?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const src = portrait ? getPhotoSrc(portrait) : null;
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "C";

  return (
    <div
      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#F4C430]/30 bg-zinc-800 flex items-center justify-center ${
        isPrimary ? "ring-2 ring-[#F4C430] ring-offset-2 ring-offset-card" : ""
      }`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#181b22] text-[#F4C430]">
          <span className="font-display text-[15px] font-bold tracking-wider">{initials}</span>
        </div>
      )}
    </div>
  );
}

export default function Clergy() {
  const { tt, lang, toast } = useApp();
  const [modal, setModal] = useState(false);
  const [defaultModalRole, setDefaultModalRole] = useState("Resident Priest");
  const [editingClergy, setEditingClergy] = useState<any>(null);
  const [clergyList, setClergyList] = useState<any[]>([]);
  const [leadershipStatus, setLeadershipStatus] = useState<LeadershipStatusResponse | null>(null);

  const loadData = async () => {
    try {
      const [data, statusData] = await Promise.all([
        clergyApi.list(),
        clergyApi.leadershipStatus().catch(() => null),
      ]);

      if (statusData) {
        setLeadershipStatus(statusData);
      }

      if (Array.isArray(data)) {
        const mapped = data.map((c: any) => {
          const isVicar = isVicarRole(c.role_type || c.role, c.designation || c.title);
          const isAsstVicar = isAssistantVicarRole(c.role_type || c.role, c.designation || c.title);
          return {
            id: c.id || c._id,
            name: c.name || "Rev. Priest",
            title: c.designation || c.title || c.role_type || "Priest",
            role: c.role_type || c.role || c.designation || "Resident Priest",
            phone: c.phone_number || c.phone || "",
            tenure: c.tenure || "Active",
            primary: isVicar,
            isVicar,
            isAssistantVicar: isAsstVicar,
            rank: getClergyRank(c.role_type || c.role, c.designation || c.title),
            portrait: c.avatar_url || c.avatarUrl || c.portrait || "",
            raw: c,
          };
        });

        mapped.sort((a, b) => a.rank - b.rank);
        setClergyList(mapped);
      }
    } catch (e) {
      console.error("[Clergy] API fetch error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveClergy = async (formData: any) => {
    try {
      if (editingClergy) {
        await clergyApi.update(editingClergy.id, formData);
        toast("Clergy profile updated successfully");
      } else {
        await clergyApi.create(formData);
        toast("New clergy directory record saved");
      }
      await loadData();
    } catch (err: any) {
      toast(err.message || "Failed to save clergy record");
      throw err;
    }
  };

  const handleDeleteClergy = async (c: any) => {
    if (c.isVicar) {
      const otherVicars = clergyList.filter((item) => item.id !== c.id && item.isVicar);
      if (otherVicars.length === 0) {
        toast("Warning: A parish must have a designated Vicar as its head.");
        return;
      }
    }

    if (window.confirm(`Are you sure you want to delete ${c.name}?`)) {
      try {
        await clergyApi.delete(c.id);
        toast(`Clergy profile ${c.name} deleted`);
        await loadData();
      } catch (err: any) {
        toast(err.message || "Unable to delete clergy record");
      }
    }
  };

  const showNoVicarBanner =
    leadershipStatus !== null
      ? !leadershipStatus.hasHeadOfParish
      : clergyList.length > 0 && !clergyList.some((c) => c.isVicar);

  return (
    <div className="space-y-5">
      {showNoVicarBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#F4C430]" />
            <span>
              <strong className="font-semibold text-[#F4C430]">⚠️ No Vicar Assigned:</strong>{" "}
              The parish currently has no designated head. Please assign a Vicar.
            </span>
          </div>
          <Button
            variant="secondary"
            className="border-[#F4C430]/40 bg-[#F4C430]/15 text-[#F4C430] hover:bg-[#F4C430]/25 text-xs py-1.5"
            onClick={() => {
              setEditingClergy(null);
              setDefaultModalRole("Vicar");
              setModal(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Assign Vicar
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">
          <span className="font-semibold text-foreground">{clergyList.length}</span>{" "}
          {lang === "en" ? "clergy & religious personnel" : "വൈദികരും സന്യസ്തരും"}
        </p>
        <Button
          onClick={() => {
            setEditingClergy(null);
            setDefaultModalRole("Resident Priest");
            setModal(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {lang === "en" ? "Add New Clergy" : "പുതിയ വൈദികൻ"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {clergyList.map((c) => (
          <Card
            key={c.id}
            glow
            className={`overflow-hidden ${
              c.isVicar
                ? "sm:col-span-2 xl:col-span-1 border-[#F4C430]/45"
                : ""
            }`}
          >
            <div className="flex items-center gap-4 p-5">
              <ClergyHeadshot portrait={c.portrait} name={c.name} isPrimary={c.isVicar} />
              <div className="min-w-0 flex-1">
                {c.isVicar ? (
                  <Pill tone="gold" className="uppercase tracking-wide">
                    <Crown className="h-3 w-3" />
                    HEAD OF PARISH / വികാരി
                  </Pill>
                ) : c.isAssistantVicar ? (
                  <Pill tone="blue" className="uppercase tracking-wide">
                    VICE PRESIDENT / സഹവികാരി
                  </Pill>
                ) : (
                  <Pill tone="neutral" className="uppercase">
                    {c.title}
                  </Pill>
                )}
                <h3 className="mt-2 font-display text-[16px] font-semibold leading-tight text-foreground">
                  {c.name}
                </h3>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {c.isVicar
                    ? "Vicar / വികാരി"
                    : c.isAssistantVicar
                      ? "Assistant Vicar / സഹവികാരി"
                      : c.role}
                </p>
              </div>
            </div>

            <div className="space-y-2 px-5 pb-3 text-[12px]">
              <div className="flex items-center justify-between rounded-[8px] bg-secondary/40 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-info" />
                  {c.phone || "No phone"}
                </span>
                {c.phone && (
                  <button
                    className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline cursor-pointer"
                    onClick={() => (window.location.href = `tel:${c.phone}`)}
                  >
                    {tt("callNow")}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 px-1 text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{tt("tenure")}:</span>
                {c.tenure}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border px-5 py-3">
              <Button
                variant="secondary"
                className="flex-1 px-2.5 py-1.5 text-[12px]"
                onClick={() => {
                  setEditingClergy(c);
                  setDefaultModalRole(c.role || "Resident Priest");
                  setModal(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                {tt("editContact")}
              </Button>
              <IconButton
                title={c.isVicar ? "Active Vicar (Head of Parish)" : "Delete"}
                className="hover:bg-danger/12 hover:text-danger"
                onClick={() => handleDeleteClergy(c)}
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
          </Card>
        ))}
      </div>

      <ClergyModal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditingClergy(null);
        }}
        onSave={handleSaveClergy}
        initialData={editingClergy}
        defaultRole={defaultModalRole}
      />
    </div>
  );
}
