import React, { useState, useEffect } from "react";
import { Plus, Phone, UserPlus, Pencil, Crown, Check, Search, Trash2 } from "lucide-react";
import { Card, Pill, Button, IconButton, Modal, Field, Input, Select } from "../components/ui";
import { useApp } from "../lib/app-context";
import { fetchApi, parishCouncilApi, membersApi } from "../utils/api-client";
import getMemberAvatar from "../utils/getMemberAvatar";

export default function Council() {
  const { lang, toast } = useApp();
  const [councilSeats, setCouncilSeats] = useState<any[]>([]);
  const [isAddSeatModalOpen, setIsAddSeatModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Assign & Edit Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [wardOnlyFilter, setWardOnlyFilter] = useState(false);
  const [selectedParishioner, setSelectedParishioner] = useState<any>(null);
  const [repNameInput, setRepNameInput] = useState("");
  const [repPhoneInput, setRepPhoneInput] = useState("");
  const [termInput, setTermInput] = useState("2025 – 2027");
  const [parishionersList, setParishionersList] = useState<any[]>([]);
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [seatFormData, setSeatFormData] = useState({
    category: "ward_rep",
    roleTitle: "",
    malayalamTitle: "",
    wardNumber: "1",
    term: "2025 – 2027",
  });

  const mapSeatData = (s: any) => {
    const rawTitle = s.seat_title || s.roleTitle || s.role_title || s.seat || "Council Seat";
    const parts = rawTitle.includes(" / ") ? rawTitle.split(" / ") : [rawTitle, ""];
    const seatEn = parts[0].trim();
    const seatMl = s.malayalamTitle || s.seatMl || s.name_ml || parts[1]?.trim() || "";
    const resolvedHolder =
      s.occupant_name ||
      s.occupantName ||
      (s.first_name ? `${s.first_name} ${s.last_name || ""}`.trim() : s.holder) ||
      null;
    const isFilled =
      Boolean(resolvedHolder) &&
      (s.status === "filled" || Boolean(s.member_id));

    return {
      id: s.id || s._id,
      seat: seatEn,
      seatMl,
      category: s.category || (s.committee_type === "executive" ? "executive" : "ward_rep"),
      wardId: s.ward_id ? String(s.ward_id) : null,
      memberId: s.member_id ? String(s.member_id) : null,
      holder: isFilled ? resolvedHolder : null,
      houseName: isFilled ? s.house_name || s.houseName || "" : "",
      ward:
        s.ward_number ||
        s.wardNumber ||
        s.ward ||
        (s.ward_id && typeof s.ward_id === "object" ? s.ward_id.number : null) ||
        null,
      wardName: s.ward_name || s.wardName || "",
      phone: isFilled ? s.phone || s.phone_number || null : null,
      term: s.term || "2025 – 2027",
      status: isFilled ? "filled" : "vacant",
    };
  };

  const loadSeats = async () => {
    try {
      const data = await parishCouncilApi.list();
      if (Array.isArray(data)) {
        setCouncilSeats(data.map(mapSeatData));
      }
    } catch (e) {
      console.error("[Council] API fetch error:", e);
    }
  };

  const loadParishioners = async () => {
    try {
      const data = await fetchApi("/members").catch(() => membersApi.list());
      if (Array.isArray(data)) {
        setParishionersList(
          data.map((m: any) => ({
            id: String(m.id || m._id),
            name:
              m.fullName ||
              m.name ||
              `${m.firstName || m.first_name || ""} ${m.lastName || m.last_name || ""}`.trim() ||
              "Parishioner",
            nameMl: m.nameMl || m.malayalam_name || m.malayalamName || "",
            phone: m.phone || m.phoneNumber || m.phone_number || "",
            ward:
              m.wardNumber ||
              m.ward_number ||
              (typeof m.ward_id === "object" ? m.ward_id?.ward_number : m.ward_id) ||
              m.ward ||
              1,
            unit: m.unit || m.unit_number || "",
            familyHouse: m.familyHouse || m.house_name || m.houseName || "",
            avatar: getMemberAvatar(m.raw || m),
            raw: m,
          }))
        );
      }
    } catch (e) {
      console.error("[Council] API members fetch error:", e);
    }
  };

  useEffect(() => {
    loadSeats();
    loadParishioners();
  }, []);

  const filled = councilSeats.filter((s) => s.status === "filled").length;
  const vacant = councilSeats.length - filled;

  const isWardSeat = Boolean(selectedSeat?.wardId || selectedSeat?.category === "ward_rep");

  const filteredParishioners = parishionersList
    .filter((p) => {
      if (wardOnlyFilter && selectedSeat?.ward) {
        if (Number(p.ward) !== Number(selectedSeat.ward)) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const hay = `${p.name} ${p.nameMl} ${p.phone} ${p.familyHouse} ${p.ward} ${p.unit}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => {
      if (selectedSeat?.ward) {
        if (Number(a.ward) === Number(selectedSeat.ward) && Number(b.ward) !== Number(selectedSeat.ward)) return -1;
        if (Number(a.ward) !== Number(selectedSeat.ward) && Number(b.ward) === Number(selectedSeat.ward)) return 1;
      }
      return 0;
    });

  const handleOpenAssignModal = (seat: any) => {
    setSelectedSeat(seat);
    setSearchQuery("");
    setWardOnlyFilter(false);
    setSelectedParishioner(null);
    setRepNameInput(seat.holder || "");
    setRepPhoneInput(seat.phone || "");
    setTermInput(seat.term || "2025 – 2027");
    setIsAssignModalOpen(true);
  };

  const handleOpenEditModal = (seat: any) => {
    setSelectedSeat(seat);
    setSearchQuery("");
    setWardOnlyFilter(false);
    const existing = parishionersList.find(
      (p) =>
        (seat.memberId && String(p.id) === String(seat.memberId)) ||
        p.name.toLowerCase() === (seat.holder || "").toLowerCase() ||
        (p.phone && p.phone === seat.phone)
    );
    setSelectedParishioner(existing || null);
    setRepNameInput(seat.holder || existing?.name || "");
    setRepPhoneInput(seat.phone || existing?.phone || "");
    setTermInput(seat.term || "2025 – 2027");
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedSeat) return;
    if (!isWardSeat && !selectedParishioner) return;
    if (isWardSeat && !selectedParishioner && !repNameInput.trim()) return;

    setSavingAssignment(true);
    try {
      const sId = selectedSeat.id;
      const pId = selectedParishioner?.id || selectedSeat.memberId || undefined;
      const finalRepName = isWardSeat
        ? (repNameInput.trim() || selectedParishioner?.name || "")
        : selectedParishioner?.name;
      const finalRepPhone = isWardSeat
        ? (repPhoneInput.trim() || selectedParishioner?.phone || "")
        : selectedParishioner?.phone;

      await parishCouncilApi.assignSeat(sId, {
        member_id: pId,
        memberId: pId,
        occupantName: finalRepName,
        phone: finalRepPhone,
        term: termInput.trim() || "2025 – 2027",
      });

      await loadSeats();

      const displayName = finalRepName || selectedParishioner?.name || "Member";
      toast(
        lang === "en"
          ? `Assigned ${displayName} to ${selectedSeat.seat}`
          : `${displayName}നെ ${selectedSeat.seat} ലേക്ക് നിയമിച്ചു`
      );
      setIsAssignModalOpen(false);
    } catch (err: any) {
      toast(err.message || "Failed to assign seat");
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleVacateSeat = async () => {
    if (!selectedSeat) return;
    setSavingAssignment(true);
    try {
      await parishCouncilApi.vacateSeat(selectedSeat.id);
      await loadSeats();
      toast(lang === "en" ? `Vacated seat ${selectedSeat.seat}` : `${selectedSeat.seat} ഒഴിവാക്കി`);
      setIsAssignModalOpen(false);
    } catch (err: any) {
      toast(err.message || "Failed to vacate seat");
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleCreateSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatFormData.roleTitle.trim()) return;

    setSubmitting(true);
    try {
      const combinedTitle = seatFormData.malayalamTitle.trim()
        ? `${seatFormData.roleTitle.trim()} / ${seatFormData.malayalamTitle.trim()}`
        : seatFormData.roleTitle.trim();

      const newSeatPayload = {
        roleTitle: combinedTitle,
        englishTitle: seatFormData.roleTitle.trim(),
        malayalamTitle: seatFormData.malayalamTitle.trim(),
        category: seatFormData.category,
        wardNumber: seatFormData.category === "ward_rep" ? parseInt(seatFormData.wardNumber, 10) : undefined,
        term: seatFormData.term.trim() || "2025 – 2027",
      };

      await parishCouncilApi.createSeat(newSeatPayload);
      await loadSeats();

      toast(lang === "en" ? `Created seat: ${seatFormData.roleTitle}` : `സീറ്റ് ചേർത്തു: ${seatFormData.roleTitle}`);
      setIsAddSeatModalOpen(false);
      setSeatFormData({
        category: "ward_rep",
        roleTitle: "",
        malayalamTitle: "",
        wardNumber: "1",
        term: "2025 – 2027",
      });
    } catch (err: any) {
      toast(err.message || "Failed to create seat");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Pill tone="green">{filled} {lang === "en" ? "filled" : "നിറഞ്ഞു"}</Pill>
          <Pill tone="red">{vacant} {lang === "en" ? "vacant" : "ഒഴിവ്"}</Pill>
          <span className="text-[12px] text-muted-foreground">
            {lang === "en" ? "Term 2025 – 2027" : "കാലാവധി 2025 – 2027"}
          </span>
        </div>
        <Button className="sm:ml-auto" onClick={() => setIsAddSeatModalOpen(true)}>
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
            {councilSeats.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-secondary/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {s.seat.toLowerCase().includes("president") && (
                      <Crown className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-foreground">{s.seat}</div>
                      {s.seatMl && (
                        <div className="font-malayalam text-[11px] text-muted-foreground">
                          {s.seatMl}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {s.holder ? (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">{s.holder}</span>
                        {s.phone && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            · {s.phone}
                          </span>
                        )}
                      </div>
                      {s.houseName && (
                        <div className="text-[11px] text-muted-foreground">
                          {s.houseName}
                        </div>
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
                      <Button
                        variant="secondary"
                        className="px-2.5 py-1.5 text-[12px]"
                        onClick={() => handleOpenAssignModal(s)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        {lang === "en" ? "Assign" : "നിയമിക്കുക"}
                      </Button>
                    ) : (
                      <>
                        {s.phone && (
                          <a
                            href={`tel:${s.phone}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-info hover:bg-info/12"
                            title="Call"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                        <IconButton title="Edit" onClick={() => handleOpenEditModal(s)}>
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

      {/* Add Council Seat Modal */}
      <Modal
        open={isAddSeatModalOpen}
        onClose={() => setIsAddSeatModalOpen(false)}
        title="സീറ്റ് ചേർക്കുക / Add Council Seat"
        subtitle="Create a new official position or ward councillor seat for the Parish Council"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddSeatModalOpen(false)}>
              റദ്ദാക്കുക / Cancel
            </Button>
            <Button
              onClick={handleCreateSeat}
              disabled={!seatFormData.roleTitle.trim() || submitting}
            >
              <Check className="h-4 w-4" />
              {submitting ? "സൃഷ്ടിക്കുന്നു..." : "ചേർക്കുക / Create Seat"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSeat} className="space-y-4 font-sans">
          <Field label="സീറ്റ് വിഭാഗം / Seat Category">
            <Select
              value={seatFormData.category}
              onChange={(e) => setSeatFormData({ ...seatFormData, category: e.target.value })}
              className="bg-[#181b22] border-[#2d323e] text-slate-200"
            >
              <option value="ward_rep">വാർഡ് പ്രതിനിധി (Ward Representative)</option>
              <option value="executive">ഭാരവാഹി (Executive Committee)</option>
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Designation / Title (English)">
              <Input
                placeholder="e.g. Ward #6 Representative"
                value={seatFormData.roleTitle}
                onChange={(e) => setSeatFormData({ ...seatFormData, roleTitle: e.target.value })}
                className="bg-[#181b22] border-[#2d323e] text-slate-200"
                required
              />
            </Field>

            <Field label="Designation / Title (മലയാളം)">
              <Input
                placeholder="e.g. വാർഡ് #6 കൗൺസിലർ"
                value={seatFormData.malayalamTitle}
                onChange={(e) => setSeatFormData({ ...seatFormData, malayalamTitle: e.target.value })}
                className="bg-[#181b22] border-[#2d323e] text-slate-200 font-malayalam"
              />
            </Field>
          </div>

          {seatFormData.category === "ward_rep" && (
            <Field label="വാർഡ് നമ്പർ / Ward Number">
              <Select
                value={seatFormData.wardNumber}
                onChange={(e) => setSeatFormData({ ...seatFormData, wardNumber: e.target.value })}
                className="bg-[#181b22] border-[#2d323e] text-slate-200"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((wn) => (
                  <option key={wn} value={String(wn)}>
                    Ward #{wn}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="കാലാവധി / Term">
            <Input
              placeholder="2025 – 2027"
              value={seatFormData.term}
              onChange={(e) => setSeatFormData({ ...seatFormData, term: e.target.value })}
              className="bg-[#181b22] border-[#2d323e] text-slate-200 font-mono"
            />
          </Field>
        </form>
      </Modal>

      {/* Searchable Parishioner Selector / Edit Seat Modal */}
      <Modal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`${selectedSeat?.seat || "Council Seat"} - ${
          selectedSeat?.status === "vacant" ? "Assign Member" : "Edit Seat Assignment"
        }`}
        subtitle="Select a registered parishioner from the live directory to occupy this seat."
        wide
        footer={
          <>
            {selectedSeat?.status === "filled" && (
              <Button
                variant="danger"
                className="mr-auto text-xs"
                onClick={handleVacateSeat}
                disabled={savingAssignment}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Vacate Seat (ഒഴിവ് ആക്കുക)
              </Button>
            )}
            <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssignment}
              disabled={
                savingAssignment ||
                (isWardSeat ? !selectedParishioner && !repNameInput.trim() : !selectedParishioner)
              }
            >
              <Check className="h-4 w-4" />
              {savingAssignment ? "Saving..." : "Confirm Assignment"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 font-sans">
          {selectedSeat?.status === "filled" && selectedSeat.holder && (
            <div className="rounded-lg border border-[#2d323e] bg-[#1e222b] p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400">Current Holder:</span>{" "}
                <span className="font-semibold text-white">{selectedSeat.holder}</span>
                {selectedSeat.houseName && (
                  <span className="text-slate-400"> · {selectedSeat.houseName}</span>
                )}
                {selectedSeat.phone && (
                  <span className="font-mono text-slate-400"> · {selectedSeat.phone}</span>
                )}
              </div>
              {selectedSeat.ward && <Pill tone="gold">Ward #{selectedSeat.ward}</Pill>}
            </div>
          )}

          <Field label="Search Parishioner">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parishioner by name, phone, or house name..."
                className="pl-9 bg-[#181b22] border-[#2d323e] text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </Field>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Select Registered Member ({filteredParishioners.length} found)</span>
              {selectedSeat?.ward && (
                <button
                  type="button"
                  onClick={() => setWardOnlyFilter((prev) => !prev)}
                  className={`text-[11px] font-medium normal-case px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                    wardOnlyFilter
                      ? "border-[#F4C430] bg-[#F4C430]/15 text-[#F4C430]"
                      : "border-[#2d323e] bg-[#1e222b] text-amber-400 hover:border-amber-400/50"
                  }`}
                >
                  {wardOnlyFilter
                    ? `✓ Showing Ward #${selectedSeat.ward} Only (Click for All)`
                    : `★ Ward #${selectedSeat.ward} prioritized (Filter Ward Only)`}
                </button>
              )}
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 rounded-lg border border-[#2d323e] bg-[#181b22] p-2">
              {filteredParishioners.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  No registered parishioner found matching "{searchQuery}"
                </div>
              ) : (
                filteredParishioners.map((p) => {
                  const isSel = selectedParishioner?.id === p.id;
                  const isMatchWard = selectedSeat?.ward && Number(p.ward) === Number(selectedSeat.ward);
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedParishioner(p);
                        if (isWardSeat) {
                          setRepNameInput(p.name || "");
                          setRepPhoneInput(p.phone || "");
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSel
                          ? "border-[#F4C430] bg-[#F4C430]/10 text-white shadow-md"
                          : "border-[#2d323e] bg-[#1e222b] text-slate-300 hover:border-slate-600 hover:bg-[#252a36]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="h-8 w-8 rounded-full object-cover shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = getMemberAvatar({ gender: "Male" });
                          }}
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                            {p.name}
                            {p.nameMl && (
                              <span className="font-malayalam text-[11px] font-normal text-slate-400">
                                ({p.nameMl})
                              </span>
                            )}
                            {isMatchWard && (
                              <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[10px] font-bold text-amber-300">
                                Ward Match
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {p.familyHouse || "No house name"} · {p.phone || "No phone"}
                          </div>
                        </div>
                      </div>
                      <Pill tone={isSel ? "gold" : "neutral"} className="text-[10px]">
                        Ward #{p.ward}{p.unit ? ` · ${p.unit}` : ""}
                      </Pill>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {selectedParishioner && (
            <div className="rounded-lg border border-[#F4C430]/40 bg-[#F4C430]/5 p-3 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#F4C430] font-semibold">
                  Selected Parishioner (ID #{selectedParishioner.id})
                </div>
                <div className="mt-0.5 font-semibold text-white">
                  {selectedParishioner.name}
                  {selectedParishioner.familyHouse ? ` — ${selectedParishioner.familyHouse}` : ""}
                </div>
              </div>
              <div className="text-right font-mono text-slate-300">
                <div>{selectedParishioner.phone || "No Phone Registered"}</div>
                <div className="text-[11px] text-slate-400">Ward #{selectedParishioner.ward}</div>
              </div>
            </div>
          )}

          {isWardSeat && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-lg border border-[#2d323e] bg-[#141414]/60 p-3">
              <Field label="Representative Name (Syncs with Ward)">
                <Input
                  value={repNameInput}
                  onChange={(e) => setRepNameInput(e.target.value)}
                  placeholder="Selected member or representative name"
                  className="bg-[#181b22] border-[#2d323e] text-slate-200"
                />
              </Field>
              <Field label="Contact Phone">
                <Input
                  value={repPhoneInput}
                  onChange={(e) => setRepPhoneInput(e.target.value)}
                  placeholder="+91 94471 00000"
                  className="bg-[#181b22] border-[#2d323e] text-slate-200 font-mono"
                />
              </Field>
            </div>
          )}

          <Field label="കാലാവധി / Term">
            <Input
              value={termInput}
              onChange={(e) => setTermInput(e.target.value)}
              placeholder="2025 – 2027"
              className="bg-[#181b22] border-[#2d323e] text-slate-200 font-mono"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
