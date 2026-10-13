import React, { useState, useEffect } from "react";
import { Plus, Phone, UserPlus, Pencil, Crown, Check, Search, Trash2 } from "lucide-react";
import { Card, Pill, Button, IconButton, Modal, Field, Input, Select } from "../components/ui";
import { useApp } from "../lib/app-context";
import { COUNCIL_SEATS, MEMBERS } from "../lib/data";
import { parishCouncilApi, membersApi } from "../utils/api-client";
import getMemberAvatar from "../utils/getMemberAvatar";

export default function Council() {
  const { lang, toast } = useApp();
  const [councilSeats, setCouncilSeats] = useState<any[]>(COUNCIL_SEATS);
  const [isAddSeatModalOpen, setIsAddSeatModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Assign & Edit Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParishioner, setSelectedParishioner] = useState<any>(null);
  const [termInput, setTermInput] = useState("2024 – 2026");
  const [parishionersList, setParishionersList] = useState<any[]>([]);
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [seatFormData, setSeatFormData] = useState({
    category: "Ward Councillor",
    roleTitle: "",
    malayalamTitle: "",
    wardNumber: "1",
    term: "2024 – 2026",
  });

  const loadSeats = async () => {
    try {
      const data = await parishCouncilApi.list();
      if (Array.isArray(data) && data.length > 0) {
        const fetchedSeats = data.map((s: any) => ({
          id: s.id || s._id,
          seat: s.roleTitle || s.role_title || s.seat || "Council Seat",
          seatMl: s.malayalamTitle || s.seatMl || s.name_ml || "",
          holder: s.occupantName || (s.first_name ? `${s.first_name} ${s.last_name || ""}`.trim() : s.holder) || null,
          ward: s.wardNumber || s.ward || (s.ward_id ? s.ward_id.number : null) || null,
          phone: s.phone || s.phone_number || null,
          term: s.term || "2024 – 2026",
          status: s.status || ((s.holder || s.occupantName || s.first_name) ? "filled" : "vacant"),
        }));

        const existingTitles = new Set(COUNCIL_SEATS.map((cs) => cs.seat.toLowerCase()));
        const extraSeats = fetchedSeats.filter((fs) => !existingTitles.has(fs.seat.toLowerCase()));

        setCouncilSeats([...COUNCIL_SEATS, ...extraSeats]);
      } else {
        setCouncilSeats(COUNCIL_SEATS);
      }
    } catch (_) {
      setCouncilSeats(COUNCIL_SEATS);
    }
  };

  const loadParishioners = async () => {
    try {
      const data = await membersApi.list();
      if (Array.isArray(data) && data.length > 0) {
        setParishionersList(
          data.map((m: any) => ({
            id: m.id || m._id,
            name: m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Parishioner",
            nameMl: m.nameMl || m.malayalamName || "",
            phone: m.phone || m.phoneNumber || "+91 98765 43210",
            ward: m.wardNumber || m.ward || 1,
            unit: m.unit || m.unit_number || "Unit I",
            familyHouse: m.familyHouse || m.houseName || "Parish House",
            avatar: getMemberAvatar(m.raw || m),
            raw: m,
          }))
        );
      } else {
        setParishionersList(
          MEMBERS.map((m) => ({
            id: m.id,
            name: m.name,
            nameMl: m.nameMl,
            phone: m.phone,
            ward: m.ward,
            unit: "Unit I",
            familyHouse: m.familyHouse,
            avatar: getMemberAvatar(m),
            raw: m,
          }))
        );
      }
    } catch (_) {
      setParishionersList(
        MEMBERS.map((m) => ({
          id: m.id,
          name: m.name,
          nameMl: m.nameMl,
          phone: m.phone,
          ward: m.ward,
          unit: "Unit I",
          familyHouse: m.familyHouse,
          avatar: getMemberAvatar(m),
          raw: m,
        }))
      );
    }
  };

  useEffect(() => {
    loadSeats();
    loadParishioners();
  }, []);

  const filled = councilSeats.filter((s) => s.status === "filled").length;
  const vacant = councilSeats.length - filled;

  const filteredParishioners = parishionersList
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const hay = `${p.name} ${p.nameMl} ${p.phone} ${p.familyHouse} ${p.ward} ${p.unit}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => {
      if (selectedSeat?.ward) {
        if (a.ward === selectedSeat.ward && b.ward !== selectedSeat.ward) return -1;
        if (a.ward !== selectedSeat.ward && b.ward === selectedSeat.ward) return 1;
      }
      return 0;
    });

  const handleOpenAssignModal = (seat: any) => {
    setSelectedSeat(seat);
    setSearchQuery("");
    setSelectedParishioner(null);
    setTermInput(seat.term || "2024 – 2026");
    setIsAssignModalOpen(true);
  };

  const handleOpenEditModal = (seat: any) => {
    setSelectedSeat(seat);
    setSearchQuery("");
    const existing = parishionersList.find(
      (p) =>
        p.name.toLowerCase() === (seat.holder || "").toLowerCase() ||
        (p.phone && p.phone === seat.phone)
    );
    setSelectedParishioner(existing || null);
    setTermInput(seat.term || "2024 – 2026");
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedSeat || !selectedParishioner) return;
    setSavingAssignment(true);
    try {
      const sId = selectedSeat.id;
      const pId = selectedParishioner.id;

      await parishCouncilApi.assignSeat(sId, {
        memberId: pId,
        term: termInput,
        occupantName: selectedParishioner.name,
        phone: selectedParishioner.phone,
      });

      setCouncilSeats((prev) =>
        prev.map((s) => {
          if (s.id === sId) {
            return {
              ...s,
              holder: selectedParishioner.name,
              phone: selectedParishioner.phone,
              ward: selectedSeat.ward || selectedParishioner.ward,
              term: termInput,
              status: "filled",
            };
          }
          return s;
        })
      );

      toast(
        lang === "en"
          ? `Assigned ${selectedParishioner.name} to ${selectedSeat.seat}`
          : `${selectedParishioner.name}നെ ${selectedSeat.seat} ലേക്ക് നിയമിച്ചു`
      );
      setIsAssignModalOpen(false);
    } catch (_) {
      setCouncilSeats((prev) =>
        prev.map((s) => {
          if (s.id === selectedSeat.id) {
            return {
              ...s,
              holder: selectedParishioner.name,
              phone: selectedParishioner.phone,
              ward: selectedSeat.ward || selectedParishioner.ward,
              term: termInput,
              status: "filled",
            };
          }
          return s;
        })
      );
      toast(
        lang === "en"
          ? `Assigned ${selectedParishioner.name} to ${selectedSeat.seat}`
          : `${selectedParishioner.name}നെ നിയമിച്ചു`
      );
      setIsAssignModalOpen(false);
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleVacateSeat = async () => {
    if (!selectedSeat) return;
    setSavingAssignment(true);
    try {
      await parishCouncilApi.vacateSeat(selectedSeat.id);
      setCouncilSeats((prev) =>
        prev.map((s) => {
          if (s.id === selectedSeat.id) {
            return {
              ...s,
              holder: null,
              phone: null,
              status: "vacant",
            };
          }
          return s;
        })
      );
      toast(lang === "en" ? `Vacated seat ${selectedSeat.seat}` : `${selectedSeat.seat} ഒഴിവാക്കി`);
      setIsAssignModalOpen(false);
    } catch (_) {
      setCouncilSeats((prev) =>
        prev.map((s) => {
          if (s.id === selectedSeat.id) {
            return {
              ...s,
              holder: null,
              phone: null,
              status: "vacant",
            };
          }
          return s;
        })
      );
      toast(lang === "en" ? `Vacated seat ${selectedSeat.seat}` : `${selectedSeat.seat} ഒഴിവാക്കി`);
      setIsAssignModalOpen(false);
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleCreateSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatFormData.roleTitle.trim()) return;

    setSubmitting(true);
    try {
      const newSeatPayload = {
        roleTitle: seatFormData.roleTitle.trim(),
        englishTitle: seatFormData.roleTitle.trim(),
        malayalamTitle: seatFormData.malayalamTitle.trim(),
        category: seatFormData.category,
        wardNumber: seatFormData.category === "Ward Councillor" ? parseInt(seatFormData.wardNumber, 10) : undefined,
        term: seatFormData.term.trim() || "2024 – 2026",
      };

      const res = await parishCouncilApi.createSeat(newSeatPayload);

      const localNewSeat = {
        id: `PC-${Date.now()}`,
        seat: seatFormData.roleTitle.trim(),
        seatMl: seatFormData.malayalamTitle.trim() || seatFormData.roleTitle.trim(),
        holder: null,
        ward: seatFormData.category === "Ward Councillor" ? parseInt(seatFormData.wardNumber, 10) : null,
        phone: null,
        term: seatFormData.term.trim() || "2024 – 2026",
        status: "vacant",
      };

      if (Array.isArray(res) && res.length > 0) {
        setCouncilSeats(
          res.map((s: any) => ({
            id: s.id || s._id,
            seat: s.roleTitle || s.role_title || s.seat || "Council Seat",
            seatMl: s.malayalamTitle || s.seatMl || s.name_ml || "",
            holder: s.occupantName || (s.first_name ? `${s.first_name} ${s.last_name || ""}`.trim() : s.holder) || null,
            ward: s.wardNumber || s.ward || null,
            phone: s.phone || s.phone_number || null,
            term: s.term || "2024 – 2026",
            status: s.status || ((s.holder || s.occupantName || s.first_name) ? "filled" : "vacant"),
          }))
        );
      } else {
        setCouncilSeats((prev) => [...prev, localNewSeat]);
      }

      toast(lang === "en" ? `Created seat: ${seatFormData.roleTitle}` : `സീറ്റ് ചേർത്തു: ${seatFormData.roleTitle}`);
      setIsAddSeatModalOpen(false);
      setSeatFormData({
        category: "Ward Councillor",
        roleTitle: "",
        malayalamTitle: "",
        wardNumber: "1",
        term: "2024 – 2026",
      });
    } catch (_) {
      const localNewSeat = {
        id: `PC-${Date.now()}`,
        seat: seatFormData.roleTitle.trim(),
        seatMl: seatFormData.malayalamTitle.trim() || seatFormData.roleTitle.trim(),
        holder: null,
        ward: seatFormData.category === "Ward Councillor" ? parseInt(seatFormData.wardNumber, 10) : null,
        phone: null,
        term: seatFormData.term.trim() || "2024 – 2026",
        status: "vacant",
      };
      setCouncilSeats((prev) => [...prev, localNewSeat]);
      toast(lang === "en" ? `Created seat: ${seatFormData.roleTitle}` : `സീറ്റ് ചേർത്തു: ${seatFormData.roleTitle}`);
      setIsAddSeatModalOpen(false);
      setSeatFormData({
        category: "Ward Councillor",
        roleTitle: "",
        malayalamTitle: "",
        wardNumber: "1",
        term: "2024 – 2026",
      });
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
            {lang === "en" ? "Term 2024 – 2026" : "കാലാവധി 2024 – 2026"}
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
              <option value="Ward Councillor">വാർഡ് കൗൺസിലർ (Ward Councillor)</option>
              <option value="Representative">പ്രതിനിധി (Representative)</option>
              <option value="Executive">ഭാരവാഹി (Executive)</option>
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Designation / Title (English)">
              <Input
                placeholder="e.g. Ward #6 Councillor"
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

          {seatFormData.category === "Ward Councillor" && (
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
              placeholder="2024 – 2026"
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
        subtitle="Select a registered parishioner to occupy this seat."
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
              disabled={!selectedParishioner || savingAssignment}
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
                placeholder="Search parishioner by name, phone, or ward..."
                className="pl-9 bg-[#181b22] border-[#2d323e] text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </Field>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Select Registered Member ({filteredParishioners.length} found)</span>
              {selectedSeat?.ward && (
                <span className="text-[11px] text-amber-400 font-normal normal-case">
                  ★ Ward #{selectedSeat.ward} residents prioritized
                </span>
              )}
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 rounded-lg border border-[#2d323e] bg-[#181b22] p-2">
              {filteredParishioners.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  No parishioner found matching "{searchQuery}"
                </div>
              ) : (
                filteredParishioners.map((p) => {
                  const isSel = selectedParishioner?.id === p.id;
                  const isMatchWard = selectedSeat?.ward && p.ward === selectedSeat.ward;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedParishioner(p)}
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
                            {p.familyHouse} · {p.phone}
                          </div>
                        </div>
                      </div>
                      <Pill tone={isSel ? "gold" : "neutral"} className="text-[10px]">
                        Ward #{p.ward} · {p.unit}
                      </Pill>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Field label="കാലാവധി / Term">
            <Input
              value={termInput}
              onChange={(e) => setTermInput(e.target.value)}
              placeholder="2024 – 2026"
              className="bg-[#181b22] border-[#2d323e] text-slate-200 font-mono"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
