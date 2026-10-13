import { useState, useEffect } from "react";
import { UploadCloud, Check, Image as ImageIcon, X } from "lucide-react";
import { Modal, Field, Input, Select, Button, Pill } from "./ui";
import { useApp } from "../lib/app-context";
import { BLOOD_GROUPS } from "../lib/data";
import { getMemberAvatar } from "../utils/getMemberAvatar";

/* ---------- 4-Step Add/Edit Member Modal ---------- */
export interface MemberFormData {
  fullName: string;
  malayalamName: string;
  baptismName: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  familyId: string;
  relationshipToHead: string;
  wardId: string;
  ward_id?: string;
  wardNumber: string | number;
  ward_number?: string | number;
  wardName?: string;
  ward_name?: string;
  unit: string;
  unit_number: string;
  baptismDate: string;
  firstCommunionDate: string;
  confirmationDate: string;
  marriageDate: string;
  phone: string;
  email: string;
  currentAddress: string;
  status: string;
  [key: string]: any;
}

export function MemberModal({
  open,
  onClose,
  onSave,
  initialData,
  wards = [],
  families = [],
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
  initialData?: any;
  wards?: any[];
  families?: any[];
}) {
  const { tt } = useApp();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<MemberFormData>({
    fullName: "",
    malayalamName: "",
    baptismName: "",
    gender: "Male",
    dob: "",
    bloodGroup: "O+",
    familyId: "",
    relationshipToHead: "Member",
    wardId: "",
    ward_id: "",
    wardNumber: "",
    ward_number: "",
    wardName: "",
    ward_name: "",
    unit: "",
    unit_number: "",
    baptismDate: "",
    firstCommunionDate: "",
    confirmationDate: "",
    marriageDate: "",
    phone: "",
    email: "",
    currentAddress: "",
    status: "active",
  });

  useEffect(() => {
    setPhotoFile(null);
    if (initialData) {
      const uVal = initialData.unit || initialData.unit_number || initialData.unitNumber || "";
      const fId = typeof initialData.familyId === 'object'
        ? (initialData.familyId?._id || initialData.familyId?.id || "")
        : (initialData.familyId || initialData.family_id || "");
      const wId = typeof initialData.wardId === 'object'
        ? (initialData.wardId?._id || initialData.wardId?.id || "")
        : (initialData.wardId || initialData.ward_id || "");

      setFormData({
        fullName: initialData.name || initialData.firstName || "",
        malayalamName: initialData.nameMl || initialData.malayalamName || "",
        baptismName: initialData.baptismName || "",
        gender: initialData.gender || "Male",
        dob: initialData.dob || initialData.date_of_birth || "",
        bloodGroup: initialData.bloodGroup || initialData.blood_group || "O+",
        familyId: String(fId),
        relationshipToHead: initialData.relationshipToHead || initialData.relationship_role || "Member",
        wardId: String(wId),
        ward_id: String(wId),
        wardNumber: initialData.wardNumber || initialData.ward_number || "",
        ward_number: initialData.ward_number || initialData.wardNumber || "",
        wardName: initialData.wardName || initialData.ward_name || initialData.wardPatron || "",
        ward_name: initialData.ward_name || initialData.wardName || initialData.wardPatron || "",
        unit: uVal,
        unit_number: uVal,
        baptismDate: initialData.baptismDate || initialData.baptism_date || "",
        firstCommunionDate: initialData.firstCommunionDate || initialData.first_communion_date || "",
        confirmationDate: initialData.confirmationDate || initialData.confirmation_date || "",
        marriageDate: initialData.marriageDate || initialData.marriage_date || "",
        phone: initialData.phone || initialData.phoneNumber || initialData.mobile || "",
        email: initialData.email || "",
        currentAddress: initialData.currentAddress || initialData.address || "",
        status: initialData.status || "active",
      });
    } else {
      setFormData({
        fullName: "",
        malayalamName: "",
        baptismName: "",
        gender: "Male",
        dob: "",
        bloodGroup: "O+",
        familyId: "",
        relationshipToHead: "Member",
        wardId: "",
        ward_id: "",
        wardNumber: "",
        ward_number: "",
        wardName: "",
        ward_name: "",
        unit: "",
        unit_number: "",
        baptismDate: "",
        firstCommunionDate: "",
        confirmationDate: "",
        marriageDate: "",
        phone: "",
        email: "",
        currentAddress: "",
        status: "active",
      });
    }
  }, [initialData, open]);

  // Selected family object
  const selectedFamily = families.find(
    (f: any) => String(f.id || f._id) === String(formData.familyId)
  );

  // Automatically sync the ward and unit states whenever familyId or selectedFamily changes
  useEffect(() => {
    if (selectedFamily) {
      const rawWardId = selectedFamily.wardId?._id || selectedFamily.wardId || selectedFamily.ward_id;
      const derivedWardId = typeof rawWardId === 'object' ? (rawWardId._id || rawWardId.id || '') : String(rawWardId || '');

      const matchedWard = wards.find((w: any) => {
        const wId = String(w.id || w._id || w.number || w.wardNumber || "").trim();
        const target = derivedWardId.trim();
        return wId && target && wId === target;
      });

      const derivedWardName = selectedFamily.wardId?.wardName || selectedFamily.wardId?.patron || selectedFamily.wardName || selectedFamily.ward_name || matchedWard?.patron || matchedWard?.wardName || matchedWard?.ward_name || '';
      const derivedWardNumber = selectedFamily.wardId?.wardNumber || selectedFamily.wardId?.number || selectedFamily.wardNumber || selectedFamily.ward_number || matchedWard?.number || matchedWard?.wardNumber || matchedWard?.ward_number || '';
      const derivedUnit = selectedFamily.unit || selectedFamily.unit_number || selectedFamily.unitNumber || 'Unit I';

      setFormData(prev => ({
        ...prev,
        wardId: derivedWardId,
        ward_id: derivedWardId,
        wardName: derivedWardName,
        ward_name: derivedWardName,
        wardNumber: derivedWardNumber,
        ward_number: derivedWardNumber,
        unit: derivedUnit,
        unit_number: derivedUnit
      }));
    }
  }, [formData.familyId, selectedFamily, wards]);

  // Handle auto-inheriting ward and unit when family selection changes
  const handleFamilyChange = (famId: string) => {
    const selFam = families.find((f: any) => String(f.id || f._id) === String(famId));
    let newWardId = formData.wardId;
    let newUnit = formData.unit;

    if (selFam) {
      const famWard = selFam.wardId || selFam.ward_id || selFam.ward;
      if (famWard) {
        newWardId = typeof famWard === 'object' ? (famWard._id || famWard.id || '') : String(famWard);
      }
      const famUnit = selFam.unit || selFam.unit_number || selFam.unitNumber;
      if (famUnit) {
        newUnit = String(famUnit);
      }
    }

    setFormData((prev) => ({
      ...prev,
      familyId: famId,
      wardId: newWardId,
      unit: newUnit,
      unit_number: newUnit,
    }));
  };

  const steps = [
    tt("personalInfo"),
    tt("familyAssignment"),
    tt("sacramentalDates"),
    tt("contactStep"),
  ];

  const handleFinish = async () => {
    setSaving(true);
    try {
      const finalUnit = formData.unit || selectedFamily?.unit || selectedFamily?.unit_number || "";
      const payload = {
        ...formData,
        unit: finalUnit,
        unit_number: finalUnit,
      };

      if (photoFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));
        fd.append("photo", photoFile);
        await onSave(fd);
      } else {
        await onSave(payload);
      }
      onClose();
      setStep(0);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Clean Header Subtitle function (removes raw 24-char Mongo Hex ObjectIDs)
  const getHeaderSubtitle = () => {
    if (!initialData) return "PM-1054 · Parishioner record";
    const code = initialData.memberCode || initialData.member_code || initialData.code || initialData.registrationNumber || initialData.reg_no;
    if (code) return `Member #${code}`;
    const idStr = String(initialData.id || initialData._id || "");
    if (!idStr || /^[0-9a-fA-F]{24}$/.test(idStr)) {
      return "Parishioner record";
    }
    return `ID: ${idStr}`;
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setStep(0);
      }}
      title={initialData ? "Edit Member Record" : tt("addMember")}
      subtitle={getHeaderSubtitle()}
      wide
      footer={
        <>
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              {tt("back")}
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>{tt("next")}</Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving}>
              <Check className="h-4 w-4" />
              {saving ? "Saving..." : tt("save")}
            </Button>
          )}
        </>
      }
    >
      {/* Stepper */}
      <div className="mb-6 flex items-center">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <button
              onClick={() => setStep(i)}
              className="flex items-center gap-2"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary/15 text-primary ring-1 ring-primary"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span
                className={`hidden text-[12px] font-medium sm:block ${
                  i === step ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span className="mx-2 h-px flex-1 bg-border" />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <Input
              placeholder="e.g. Joseph Thekkedathu"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </Field>
          <Field label="Malayalam Name">
            <Input
              className="font-malayalam"
              placeholder="ജോസഫ് തെക്കേടത്ത്"
              value={formData.malayalamName}
              onChange={(e) => setFormData({ ...formData, malayalamName: e.target.value })}
            />
          </Field>
          <Field label="Baptism Name">
            <Input
              placeholder="Joseph"
              value={formData.baptismName}
              onChange={(e) => setFormData({ ...formData, baptismName: e.target.value })}
            />
          </Field>
          <Field label="Gender">
            <Select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </Field>
          <Field label="Date of Birth">
            <Input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </Field>
          <Field label="Blood Group">
            <Select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
            >
              {BLOOD_GROUPS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Parishioner Status">
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="relocated">Relocated</option>
              <option value="deceased">Deceased</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <PhotoDropzone
              label="Photo Upload"
              aspect="square"
              onFileSelect={setPhotoFile}
              initialUrl={initialData?.avatar || initialData?.photo || getMemberAvatar(initialData || { gender: formData.gender })}
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Family Unit">
            <Select
              value={formData.familyId}
              onChange={(e) => handleFamilyChange(e.target.value)}
            >
              <option value="">Select family</option>
              {families.map((f: any) => {
                const famName = f.familyName || f.family_name || f.house || f.houseName || "Family";
                const houseName = f.houseName || f.house_name || "";
                const displayLabel = houseName && houseName !== famName
                  ? `${famName} (${houseName})`
                  : famName.toLowerCase().includes("house") || famName.toLowerCase().includes("family")
                    ? famName
                    : `${famName} House`;
                return (
                  <option key={f.id || f._id} value={f.id || f._id}>
                    {displayLabel}
                  </option>
                );
              })}
            </Select>
          </Field>
          <Field label="Relationship to Head">
            <Select
              value={formData.relationshipToHead}
              onChange={(e) => setFormData({ ...formData, relationshipToHead: e.target.value })}
            >
              <option value="Head of Family">Head of Family</option>
              <option value="Spouse">Spouse</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Parent">Parent</option>
              <option value="Other">Other</option>
            </Select>
          </Field>
          {/* Ward Subdivision (Auto-Inherited) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Ward Subdivision</label>
            <input
              type="text"
              readOnly
              disabled
              value={
                selectedFamily
                  ? (formData.wardNumber || selectedFamily.wardNumber || selectedFamily.ward_number || selectedFamily.wardId?.wardNumber || selectedFamily.wardId?.number)
                    ? `Ward #${formData.wardNumber || selectedFamily.wardNumber || selectedFamily.ward_number || selectedFamily.wardId?.wardNumber || selectedFamily.wardId?.number} - ${formData.wardName || selectedFamily.wardName || selectedFamily.ward_name || selectedFamily.wardId?.wardName || selectedFamily.wardId?.patron || 'Assigned Ward'}`
                    : (formData.wardName || selectedFamily.wardName || selectedFamily.ward_name || selectedFamily.wardId?.wardName || selectedFamily.wardId?.patron || 'Assigned Ward')
                  : 'Select family first'
              }
              className="w-full bg-[#181b22] border border-[#2d323e] rounded-lg px-3 py-2 text-sm text-slate-300 cursor-not-allowed opacity-80 outline-none"
            />
          </div>

          {/* Ward Unit (Auto-Inherited) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Ward Unit</label>
            <input
              type="text"
              readOnly
              disabled
              value={selectedFamily?.unit || selectedFamily?.unit_number || formData.unit || 'Not Assigned'}
              className="w-full bg-[#181b22] border border-[#2d323e] rounded-lg px-3 py-2 text-sm text-slate-300 cursor-not-allowed opacity-80 outline-none"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Baptism Date">
            <Input
              type="date"
              value={formData.baptismDate}
              onChange={(e) => setFormData({ ...formData, baptismDate: e.target.value })}
            />
          </Field>
          <Field label="Holy Communion Date">
            <Input
              type="date"
              value={formData.firstCommunionDate}
              onChange={(e) => setFormData({ ...formData, firstCommunionDate: e.target.value })}
            />
          </Field>
          <Field label="Confirmation Date">
            <Input
              type="date"
              value={formData.confirmationDate}
              onChange={(e) => setFormData({ ...formData, confirmationDate: e.target.value })}
            />
          </Field>
          <Field label="Marriage Date">
            <Input
              type="date"
              value={formData.marriageDate}
              onChange={(e) => setFormData({ ...formData, marriageDate: e.target.value })}
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Mobile Number">
            <Input
              placeholder="+91 "
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Field>
          <Field label="Current Address" className="sm:col-span-2">
            <textarea
              rows={3}
              placeholder="House name, ward, post office, PIN"
              value={formData.currentAddress}
              onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
              className="w-full rounded-[8px] border border-border bg-input px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </Field>
        </div>
      )}
    </Modal>
  );
}

/* ---------- Add/Edit Family Modal ---------- */
export function FamilyModal({
  open,
  onClose,
  onSave,
  initialData,
  wards = [],
  members = [],
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
  initialData?: any;
  wards?: any[];
  members?: any[];
}) {
  const { tt } = useApp();
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    familyName: "",
    houseName: "",
    headOfFamily: "",
    wardId: "",
    unit: "",
    unit_number: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    setPhotoFile(null);
    if (initialData) {
      const wId = initialData.wardId || initialData.ward_id || initialData.ward || "";
      const uVal = initialData.unit || initialData.unit_number || initialData.unitNumber || "";
      setFormData({
        familyName: initialData.familyName || initialData.family_name || initialData.house || "",
        houseName: initialData.houseName || initialData.house || "",
        headOfFamily: initialData.headOfFamily || initialData.head || "",
        wardId: typeof wId === 'object' ? (wId._id || wId.id || "") : String(wId),
        unit: uVal,
        unit_number: uVal,
        address: initialData.address || initialData.home_address || "",
        phone: initialData.phone || initialData.contact_number || "",
      });
    } else {
      setFormData({
        familyName: "",
        houseName: "",
        headOfFamily: "",
        wardId: "",
        unit: "",
        unit_number: "",
        address: "",
        phone: "",
      });
    }
  }, [initialData, open]);

  // Extract available units for the selected ward
  const selectedWard = wards.find((w: any) => {
    const wId = String(w.id || w._id || w.number || w.wardNumber || w.ward_number || "").trim();
    const targetWId = String(formData.wardId || "").trim();
    return wId === targetWId;
  });

  const availableUnits = Array.isArray(selectedWard?.units) ? selectedWard.units : [];

  const handleSave = async () => {
    setSaving(true);
    try {
      if (photoFile) {
        const fd = new FormData();
        fd.append("familyName", formData.familyName);
        fd.append("houseName", formData.houseName);
        fd.append("headOfFamily", formData.headOfFamily);
        fd.append("wardId", formData.wardId);
        fd.append("ward_id", formData.wardId);
        fd.append("unit", formData.unit);
        fd.append("unit_number", formData.unit_number || formData.unit);
        fd.append("address", formData.address);
        fd.append("phone", formData.phone);
        fd.append("familyPhoto", photoFile);
        await onSave(fd);
      } else {
        await onSave({
          ...formData,
          ward_id: formData.wardId,
          unit_number: formData.unit_number || formData.unit,
        });
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Family Unit" : tt("addFamily")}
      subtitle={initialData ? `ID: ${initialData.id || initialData._id}` : "Household record"}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tt("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4" />
            {saving ? "Saving..." : tt("save")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Family Name">
          <Input
            placeholder="e.g. Thekkedathu"
            value={formData.familyName}
            onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
          />
        </Field>
        <Field label="House Name">
          <Input
            placeholder="e.g. Thekkedathu House"
            value={formData.houseName}
            onChange={(e) => setFormData({ ...formData, houseName: e.target.value })}
          />
        </Field>
        <Field label="Head of Family">
          <Select
            value={formData.headOfFamily}
            onChange={(e) => setFormData({ ...formData, headOfFamily: e.target.value })}
          >
            <option value="">Select head of family</option>
            {members.map((m: any) => (
              <option key={m.id || m._id} value={m.id || m._id || m.name}>
                {m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim()}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ward Subdivision">
          <Select
            value={formData.wardId}
            onChange={(e) => setFormData({ ...formData, wardId: e.target.value, unit: "", unit_number: "" })}
          >
            <option value="">Select ward</option>
            {wards.map((w: any) => (
              <option key={w.id || w._id || w.number} value={w.id || w._id || w.number}>
                Ward #{w.number || w.ward_number || w.wardNumber} - {w.patron || w.ward_name || w.wardName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ward Unit">
          <Select
            value={formData.unit || ""}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value, unit_number: e.target.value })}
            disabled={!formData.wardId || availableUnits.length === 0}
          >
            <option value="">Select unit</option>
            {availableUnits.map((u: any, idx: number) => {
              const unitVal = typeof u === "string" ? u : u.unitNumber || u.unit_number || `Unit ${idx + 1}`;
              const unitNameStr = typeof u === "object" && u.unitName ? ` (${u.unitName})` : "";
              return (
                <option key={idx} value={unitVal}>
                  {unitVal}{unitNameStr}
                </option>
              );
            })}
          </Select>
        </Field>
        <Field label="Contact Phone">
          <Input
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </Field>
        <Field label="Full Address" className="sm:col-span-2">
          <textarea
            rows={2}
            placeholder="Full postal address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-[8px] border border-border bg-input px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </Field>
        <div className="sm:col-span-2">
          <PhotoDropzone
            label="Family Portrait"
            aspect="banner"
            onFileSelect={setPhotoFile}
            initialUrl={initialData?.banner || initialData?.familyPhotoUrl}
          />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Add/Edit Religious House Modal ---------- */
export function HouseModal({
  open,
  onClose,
  onSave,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
  initialData?: any;
}) {
  const { tt } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Convent",
    superiorInCharge: "",
    residentCount: 5,
    contactNumber: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "Convent",
        superiorInCharge: initialData.superiorInCharge || initialData.superior || "",
        residentCount: initialData.residentCount || initialData.residents || 5,
        contactNumber: initialData.contactNumber || initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
      });
    } else {
      setFormData({
        name: "",
        category: "Convent",
        superiorInCharge: "",
        residentCount: 5,
        contactNumber: "",
        email: "",
        address: "",
      });
    }
  }, [initialData, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Religious Institution" : "Add Religious Institution"}
      subtitle="Convent / Monastery / Seminary record"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tt("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4" />
            {saving ? "Saving..." : tt("save")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Institution Name">
          <Input
            placeholder="e.g. St. Joseph Convent"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <Select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Convent">Convent</option>
            <option value="Monastery">Monastery</option>
            <option value="Seminary">Seminary</option>
            <option value="Care Home">Care Home</option>
            <option value="Congregation">Congregation</option>
          </Select>
        </Field>
        <Field label="Superior In-Charge">
          <Input
            placeholder="Sr. Superior / Rev. Fr."
            value={formData.superiorInCharge}
            onChange={(e) => setFormData({ ...formData, superiorInCharge: e.target.value })}
          />
        </Field>
        <Field label="Resident Count">
          <Input
            type="number"
            value={formData.residentCount}
            onChange={(e) => setFormData({ ...formData, residentCount: parseInt(e.target.value) || 0 })}
          />
        </Field>
        <Field label="Contact Phone">
          <Input
            placeholder="+91 "
            value={formData.contactNumber}
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            placeholder="convent@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <textarea
            rows={2}
            placeholder="Full postal address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-[8px] border border-border bg-input px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ---------- Add/Edit Ward Modal ---------- */
export function WardModal({
  open,
  onClose,
  onSave,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
  initialData?: any;
}) {
  const { tt } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    wardNumber: 1,
    wardName: "",
    representativeName: "",
    contactPhone: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        wardNumber: initialData.number || initialData.wardNumber || 1,
        wardName: initialData.patron || initialData.wardName || "",
        representativeName: initialData.president || initialData.representativeName || "",
        contactPhone: initialData.contactPhone || initialData.phone || "",
      });
    } else {
      setFormData({
        wardNumber: 1,
        wardName: "",
        representativeName: "",
        contactPhone: "",
      });
    }
  }, [initialData, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Ward Subdivision" : "Add Ward Subdivision"}
      subtitle="Parish ward configuration"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tt("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4" />
            {saving ? "Saving..." : tt("save")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Ward Number">
          <Input
            type="number"
            value={formData.wardNumber}
            onChange={(e) => setFormData({ ...formData, wardNumber: parseInt(e.target.value) || 1 })}
          />
        </Field>
        <Field label="Ward Patron / Name">
          <Input
            placeholder="e.g. St. Jude"
            value={formData.wardName}
            onChange={(e) => setFormData({ ...formData, wardName: e.target.value })}
          />
        </Field>
        <Field label="Representative / President">
          <Input
            placeholder="Name of ward in-charge"
            value={formData.representativeName}
            onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
          />
        </Field>
        <Field label="Representative Phone">
          <Input
            placeholder="+91 "
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ---------- Add/Edit Clergy Modal ---------- */
export function ClergyModal({
  open,
  onClose,
  onSave,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
  initialData?: any;
}) {
  const { tt } = useApp();
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "Fr. Vicar",
    role: "Vicar",
    phone: "",
    email: "",
    bio: "",
    isCurrent: true,
  });

  useEffect(() => {
    setAvatarFile(null);
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        title: initialData.title || initialData.designation || "Fr. Vicar",
        role: initialData.role || initialData.role_type || "Vicar",
        phone: initialData.phone || initialData.phone_number || "",
        email: initialData.email || "",
        bio: initialData.bio || initialData.address || "",
        isCurrent: initialData.isCurrent !== undefined ? initialData.isCurrent : true,
      });
    } else {
      setFormData({
        name: "",
        title: "Fr. Vicar",
        role: "Vicar",
        phone: "",
        email: "",
        bio: "",
        isCurrent: true,
      });
    }
  }, [initialData, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (avatarFile) {
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("title", formData.title);
        fd.append("designation", formData.title);
        fd.append("role", formData.role);
        fd.append("role_type", formData.role);
        fd.append("phone", formData.phone);
        fd.append("phone_number", formData.phone);
        fd.append("email", formData.email);
        fd.append("bio", formData.bio);
        fd.append("address", formData.bio);
        fd.append("avatarPhoto", avatarFile);
        await onSave(fd);
      } else {
        await onSave(formData);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Clergy Profile" : "Add Clergy Member"}
      subtitle="Clergy directory record"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tt("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4" />
            {saving ? "Saving..." : tt("save")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name">
          <Input
            placeholder="e.g. Fr. Sebastian Vadakkumchery"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Field>
        <Field label="Title / Designation">
          <Input
            placeholder="e.g. Parish Priest / Vicar"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </Field>
        <Field label="Role Type">
          <Select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="Vicar">Vicar</option>
            <option value="Assistant Vicar">Assistant Vicar</option>
            <option value="Trustee">Trustee</option>
            <option value="Secretary">Secretary</option>
            <option value="Council">Council Member</option>
          </Select>
        </Field>
        <Field label="Phone">
          <Input
            placeholder="+91 "
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            placeholder="priest@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Field>
        <Field label="Bio / Notes" className="sm:col-span-2">
          <textarea
            rows={2}
            placeholder="Brief bio or appointment details"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full rounded-[8px] border border-border bg-input px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </Field>
        <div className="sm:col-span-2">
          <PhotoDropzone
            label="Portrait Upload"
            aspect="square"
            onFileSelect={setAvatarFile}
            initialUrl={initialData?.portrait || initialData?.avatar_url || initialData?.avatarUrl}
          />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Photo dropzone ---------- */
function PhotoDropzone({
  label,
  aspect,
  onFileSelect,
  initialUrl,
}: {
  label: string;
  aspect: "square" | "banner";
  onFileSelect?: (file: File | null) => void;
  initialUrl?: string;
}) {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);

  useEffect(() => {
    if (initialUrl) setPreview(initialUrl);
  }, [initialUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect?.(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    onFileSelect?.(null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      {preview ? (
        <div
          className={`relative overflow-hidden rounded-[10px] border border-border ${
            aspect === "square" ? "h-32 w-32" : "aspect-[16/9] w-full"
          }`}
        >
          <img src={preview} alt="preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-danger cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-border-strong bg-input text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground cursor-pointer ${
            aspect === "square" ? "h-32 w-full" : "aspect-[16/9] w-full"
          }`}
        >
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            {aspect === "square" ? (
              <ImageIcon className="h-5 w-5" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </div>
          <span className="text-[12px] font-medium">
            Drag &amp; drop or click to upload
          </span>
          <span className="text-[11px] text-muted-foreground/70">
            PNG or JPG · up to 5MB
          </span>
        </label>
      )}
    </div>
  );
}

/* ---------- Household / Family Roster & Details Modal ---------- */
export function FamilyDetailsModal({
  open,
  onClose,
  family,
  members = [],
  loading = false,
  onEditMember,
}: {
  open: boolean;
  onClose: () => void;
  family: any;
  members: any[];
  loading?: boolean;
  onEditMember?: (member: any) => void;
}) {
  const { tt } = useApp();
  if (!family || !open) return null;

  const houseName = typeof family.house === 'object'
    ? (family.house?.house_name || family.house?.familyName || family.house?.name || "Household")
    : (typeof family.houseName === 'object'
        ? (family.houseName?.house_name || family.houseName?.familyName || "Household")
        : (family.houseName || family.house || family.familyName || family.house_name || "Household"));

  const familyCode = typeof family.id === 'object'
    ? (family.id?._id || String(family.id))
    : String(family.id || family.familyCode || family.regNo || "F-100");

  const headName = typeof family.head === 'object'
    ? (family.head?.full_name || family.head?.name || (family.head?.first_name ? `${family.head.first_name} ${family.head.last_name || ''}` : "Family Head"))
    : (typeof family.headOfFamily === 'object'
        ? (family.headOfFamily?.first_name ? `${family.headOfFamily.first_name} ${family.headOfFamily.last_name || ''}` : family.headOfFamily?.full_name || family.headOfFamily?.name || "Family Head")
        : (typeof family.head_of_family === 'object'
            ? (family.head_of_family?.full_name || family.head_of_family?.name || "Family Head")
            : (family.headOfFamily || family.head_of_family || family.head || "N/A")));

  const phone = typeof family.phone === 'object'
    ? (family.phone?.phone_number || family.phone?.contact_number || "")
    : (typeof family.contactNumber === 'object'
        ? (family.contactNumber?.phone || "")
        : (family.phone || family.contactNumber || family.contact_number || "+91 98765 43210"));

  const email = typeof family.email === 'object' ? "" : (family.email || "household@parish.org");

  const address = typeof family.homeAddress === 'object'
    ? (family.homeAddress?.address || "Parish Ward Subdivision")
    : (typeof family.address === 'object'
        ? (family.address?.home_address || "Parish Ward Subdivision")
        : (family.homeAddress || family.address || "Parish Ward Subdivision"));

  const wardDisplay = typeof family.ward === 'object'
    ? (family.ward?.ward_name || family.ward?.wardName || `Ward #${family.ward?.ward_number || 1}`)
    : (typeof family.wardId === 'object'
        ? (family.wardId?.ward_name || family.wardId?.wardName || `Ward #${family.wardId?.ward_number || 1}`)
        : (family.wardPatron || family.ward_name || family.wardName || (typeof family.ward === 'string' || typeof family.ward === 'number' ? `Ward #${family.ward}` : "Ward Subdivision")));

  const photoUrl = typeof family.familyPhotoUrl === 'string'
    ? family.familyPhotoUrl
    : (typeof family.banner === 'string' ? family.banner : "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=350&fit=crop&auto=format");

  const safeMembersList = Array.isArray(members) ? members : [];

  const isRawMongoId = (str: any) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str.trim());
  const rawCode = familyCode && !isRawMongoId(familyCode) ? familyCode : null;
  const unitDisplay = family.unit || family.unit_number || family.unitNumber || family.raw?.unit || family.raw?.unit_number || "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${houseName} · Roster Details`}
      wide={true}
      maxWidthClass="max-w-5xl xl:max-w-6xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          {tt("close") || "Close"}
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Family Header Banner & Info */}
        <div className="relative overflow-hidden rounded-[12px] border border-border bg-card">
          <div className="h-32 w-full overflow-hidden bg-secondary">
            <img src={photoUrl} alt={String(houseName)} className="h-full w-full object-cover" />
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-[18px] font-bold text-foreground">{houseName}</h3>
                  <Pill tone="gold">{wardDisplay}</Pill>
                  {unitDisplay ? (
                    <span className="px-2.5 py-1 text-xs rounded-full bg-[#1e222b] text-[#F4C430] border border-[#2d323e] font-medium">
                      {unitDisplay}
                    </span>
                  ) : null}
                  {rawCode ? <Pill tone="neutral">{rawCode}</Pill> : null}
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">{address}</p>
              </div>
              <div className="flex flex-col text-[12px] text-muted-foreground sm:text-right">
                <span className="font-medium text-foreground">Head: {headName}</span>
                <span>Phone: {phone}</span>
                {email && <span>Email: {email}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Family Members Roster Table */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-[14px] font-bold text-foreground">
              Household Members ({safeMembersList.length})
            </h4>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-[13px] text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
              Loading family roster...
            </div>
          ) : safeMembersList.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-border p-6 text-center text-[13px] text-muted-foreground">
              No registered members found for this household.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[10px] border border-border pr-1">
              <table className="w-full min-w-[850px] border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 min-w-[200px]">Member</th>
                    <th className="px-3 py-2.5 min-w-[120px]">Relationship</th>
                    <th className="px-3 py-2.5">Gender</th>
                    <th className="px-3 py-2.5">Blood</th>
                    <th className="px-3 py-2.5">Contact</th>
                    <th className="px-3 py-2.5">Sacraments</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {safeMembersList.map((m: any, idx: number) => {
                    const avatarSrc = getMemberAvatar(m?.raw || m);
                    const name = typeof m?.name === 'object'
                      ? (m.name?.full_name || m.name?.name || "Member")
                      : (m?.name || `${m?.first_name || ""} ${m?.last_name || ""}`.trim() || m?.fullName || "Member");
                    
                    const role = typeof m?.relationshipToHead === 'object'
                      ? "Member"
                      : (m?.relationshipToHead || m?.relationship_role || m?.relation || m?.relation_to_head || "Member");
                    
                    const gender = typeof m?.gender === 'string' ? m.gender : (m?.sex || "Unspecified");
                    const blood = typeof m?.bloodGroup === 'string' ? m.bloodGroup : (m?.blood || m?.blood_group || "-");
                    const phoneNum = typeof m?.phone === 'string' ? m.phone : (m?.phone_number || "-");
                    const status = typeof m?.status === 'string' ? m.status : "active";
                    const malayalamNameStr = typeof m?.malayalamName === 'string' ? m.malayalamName : (m?.malayalam_name || "");

                    // Safe Sacrament parsing (handles array, object key-values, or strings)
                    let sacramentsList: string[] = [];
                    if (Array.isArray(m?.sacraments)) {
                      sacramentsList = m.sacraments.map((s: any) => typeof s === 'object' ? (s.name || s.title || String(s)) : String(s));
                    } else if (m?.sacraments && typeof m.sacraments === 'object' && m.sacraments !== null) {
                      sacramentsList = Object.keys(m.sacraments).filter((k) => m.sacraments[k]);
                    } else if (m?.sacrament_status && typeof m.sacrament_status === 'object' && m.sacrament_status !== null) {
                      sacramentsList = Object.keys(m.sacrament_status).filter((k) => m.sacrament_status[k]);
                    } else {
                      sacramentsList = ["Baptism"];
                    }

                    return (
                      <tr key={typeof m?.id === 'object' ? (m.id?._id || idx) : (m?.id || m?._id || idx)} className="transition-colors hover:bg-secondary/30">
                        <td className="px-4 py-2.5 min-w-[200px]">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={avatarSrc}
                              alt={String(name)}
                              className="h-8 w-8 rounded-full object-cover shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = getMemberAvatar({ gender });
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground whitespace-normal">{name}</div>
                              {malayalamNameStr ? (
                                <div className="font-malayalam text-[11px] text-muted-foreground whitespace-normal">
                                  {malayalamNameStr}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-foreground">{role}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{gender}</td>
                        <td className="px-3 py-2.5 font-mono text-[12px]">{blood}</td>
                        <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">{phoneNum}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {sacramentsList.map((s: string, sIdx: number) => (
                              <Pill key={sIdx} tone="gold">
                                {s.substring(0, 8)}
                              </Pill>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <Pill tone={status === "active" ? "gold" : "neutral"}>
                            {status}
                          </Pill>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <Button
                            variant="secondary"
                            className="px-2 py-1 text-[11px]"
                            onClick={() => onEditMember?.(m)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
