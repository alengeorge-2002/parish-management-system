import { useState } from "react";
import { Search, MapPin, Phone, Users, Home, User, ChevronRight } from "lucide-react";
import { Modal, Pill, Input, Button, BloodTag, SacramentBadges } from "./ui";
import { getMemberAvatar } from "../utils/getMemberAvatar";
import { getWardRepresentative } from "../utils/getWardRepresentative";

interface WardHouseholdsModalProps {
  open: boolean;
  onClose: () => void;
  ward: any;
  families: any[];
  members: any[];
}

export function WardHouseholdsModal({
  open,
  onClose,
  ward,
  families = [],
  members = [],
}: WardHouseholdsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<any | null>(null);

  if (!open || !ward) return null;

  const { repName, repPhone } = getWardRepresentative(ward);

  // Filter families belonging to this ward
  const wardFamilies = families.filter((f: any) => {
    const fWardNum = Number(f.wardId || f.wardNumber || f.ward || 0);
    const wNum = Number(ward.number || ward.wardNumber || 0);
    const wId = String(ward.id || ward._id || "");
    const fWardId = String(f.wardId || f.ward_id || "");

    return (fWardNum > 0 && fWardNum === wNum) || (wId && fWardId === wId);
  });

  const displayFamilies = searchTerm.trim()
    ? wardFamilies.filter((f: any) => {
        const q = searchTerm.toLowerCase();
        const name = (f.familyName || f.name || f.houseName || "").toLowerCase();
        const head = (f.headOfFamily || f.headName || f.head || "").toLowerCase();
        const house = (f.houseName || f.homeAddress || f.address || "").toLowerCase();
        return name.includes(q) || head.includes(q) || house.includes(q);
      })
    : wardFamilies;

  // Family Members for selected family inspection modal
  const familyMembers = selectedFamily
    ? members.filter((m: any) => {
        const famId = String(selectedFamily.id || selectedFamily._id || selectedFamily.familyId || "");
        const mFamId = String(m.familyId || m.family_id || m.family || "");
        return famId && mFamId === famId;
      })
    : [];

  return (
    <>
      <Modal
        open={open && !selectedFamily}
        onClose={onClose}
        title={`Ward #${ward.number} - Registered Households`}
        subtitle={`${ward.patron} Subdivision (${wardFamilies.length} total families)`}
        wide
      >
        <div className="space-y-4">
          {/* Header Metadata Banner */}
          <div className="rounded-[10px] border border-border bg-secondary/30 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-primary/12 font-display text-[14px] font-bold text-primary">
                  #{ward.number}
                </span>
                <div>
                  <h4 className="font-display text-[14px] font-semibold text-foreground">
                    {ward.patron} {ward.patronMl && <span className="font-malayalam text-[12px] text-muted-foreground">({ward.patronMl})</span>}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" /> Ward Subdivision #{ward.number}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Representative</div>
                  <div className="text-[12.5px] font-semibold text-foreground">{repName}</div>
                </div>
                <a
                  href={`tel:${repPhone}`}
                  className="flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-card px-2.5 font-mono text-[12px] font-medium text-info transition-colors hover:border-info/40"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {repPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Search Bar & Family Counter */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search households by family name, head, or house..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Pill tone="gold" className="shrink-0 px-3 py-1 text-[12px]">
              <Users className="h-3.5 w-3.5" />
              {wardFamilies.length} Households
            </Pill>
          </div>

          {/* Households List */}
          <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
            {displayFamilies.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-border p-8 text-center">
                <Home className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-[13px] font-medium text-muted-foreground">
                  {searchTerm ? "No households match your search filter." : `No registered families found in Ward #${ward.number}.`}
                </p>
              </div>
            ) : (
              displayFamilies.map((f: any, idx: number) => {
                const headName = f.headOfFamily || f.headName || f.head || "Head of Household Not Set";
                const houseName = f.houseName || f.homeAddress || f.address || `House #${idx + 1}`;
                const famPhone = f.contactNumber || f.phone || ward.phone || "+91 98765 43210";
                
                // Count family members matching this family ID
                const famId = String(f.id || f._id || f.familyId || "");
                const mCount = members.filter((m: any) => famId && String(m.familyId || m.family_id || m.family || "") === famId).length || f.membersCount || 4;

                return (
                  <div
                    key={f.id || f._id || idx}
                    onClick={() => setSelectedFamily(f)}
                    className="group flex cursor-pointer items-center justify-between gap-4 rounded-[10px] border border-border bg-card p-3.5 transition-all hover:border-primary/40 hover:bg-secondary/40"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary group-hover:bg-primary/20">
                        <Home className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-[14px] font-semibold text-foreground truncate">
                            {f.familyName || f.name || houseName}
                          </h4>
                          <Pill tone="neutral" className="text-[10px]">
                            {mCount} {mCount === 1 ? "Member" : "Members"}
                          </Pill>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-primary/80" /> Head: <span className="font-medium text-foreground">{headName}</span>
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="h-3 w-3 text-info" /> {famPhone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="secondary" className="px-2.5 py-1 text-[11.5px] group-hover:border-primary/50">
                        Inspect Members
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Nested Family Members Inspection Modal */}
      {selectedFamily && (
        <Modal
          open={Boolean(selectedFamily)}
          onClose={() => setSelectedFamily(null)}
          title={`${selectedFamily.familyName || selectedFamily.name || selectedFamily.houseName} - Family Members`}
          subtitle={`Ward #${ward.number} • Head: ${selectedFamily.headOfFamily || selectedFamily.headName || "Not Set"}`}
          wide
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-[8px] border border-border bg-secondary/30 px-3.5 py-2">
              <span className="text-[12px] font-medium text-muted-foreground">
                House: <span className="font-semibold text-foreground">{selectedFamily.houseName || selectedFamily.address || "Main House"}</span>
              </span>
              <Pill tone="gold">
                <Users className="h-3 w-3" /> {familyMembers.length || selectedFamily.membersCount || 0} Registered Members
              </Pill>
            </div>

            <div className="max-h-[50vh] space-y-2.5 overflow-y-auto pr-1">
              {familyMembers.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-border p-6 text-center">
                  <Users className="mx-auto h-7 w-7 text-muted-foreground/50" />
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    No individual member profiles linked to this household yet.
                  </p>
                </div>
              ) : (
                familyMembers.map((m: any, idx: number) => {
                  const avatar = getMemberAvatar(m);
                  const fullName = m.fullName || m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Parish Member";
                  const rel = m.relationshipToHead || m.relationshipRole || (m.isHeadOfHousehold ? "Head" : "Member");
                  const sacraments = m.sacraments || [];

                  return (
                    <div
                      key={m.id || m._id || idx}
                      className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-card p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={avatar}
                          alt={fullName}
                          className="h-10 w-10 rounded-full object-cover border border-border-strong bg-muted"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-[13.5px] font-semibold text-foreground truncate">
                              {fullName}
                            </span>
                            {m.nameMl && (
                              <span className="font-malayalam text-[11px] text-muted-foreground truncate">
                                ({m.nameMl})
                              </span>
                            )}
                            <Pill tone={rel === "Head" ? "gold" : "neutral"} className="text-[10px]">
                              {rel}
                            </Pill>
                          </div>
                          <div className="mt-0.5 flex items-center gap-3 text-[11.5px] text-muted-foreground">
                            <span>{m.gender || "N/A"}</span>
                            {m.dob && <span>DOB: {m.dob}</span>}
                            {m.bloodGroup && <BloodTag group={m.bloodGroup} />}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {sacraments.length > 0 && <SacramentBadges received={sacraments} />}
                        {(m.phone || m.phoneNumber) && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {m.phone || m.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedFamily(null)}>
                Back to Ward Households
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
