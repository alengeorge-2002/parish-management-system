import { useState } from "react";
import { UploadCloud, Check, Image as ImageIcon, X } from "lucide-react";
import { Modal, Field, Input, Select, Button } from "./ui";
import { useApp } from "../lib/app-context";
import { WARDS, FAMILIES, BLOOD_GROUPS } from "../lib/data";

/* ---------- 4-Step Add/Edit Member Modal ---------- */
export function MemberModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { tt, toast } = useApp();
  const [step, setStep] = useState(0);
  const steps = [
    tt("personalInfo"),
    tt("familyAssignment"),
    tt("sacramentalDates"),
    tt("contactStep"),
  ];

  const finish = () => {
    toast(tt("savedToast"));
    onClose();
    setStep(0);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setStep(0);
      }}
      title={tt("addMember")}
      subtitle="PM-1054 · New parishioner record"
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
            <Button onClick={finish}>
              <Check className="h-4 w-4" />
              {tt("save")}
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
            <Input placeholder="e.g. Joseph Thekkedathu" />
          </Field>
          <Field label="Malayalam Name">
            <Input className="font-malayalam" placeholder="ജോസഫ് തെക്കേടത്ത്" />
          </Field>
          <Field label="Baptism Name">
            <Input placeholder="Joseph" />
          </Field>
          <Field label="Gender">
            <Select defaultValue="">
              <option value="" disabled>Select</option>
              <option>Male</option>
              <option>Female</option>
            </Select>
          </Field>
          <Field label="Date of Birth">
            <Input type="date" />
          </Field>
          <Field label="Blood Group">
            <Select defaultValue="">
              <option value="" disabled>Select</option>
              {BLOOD_GROUPS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <PhotoDropzone label="Photo Upload" aspect="square" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Family Unit">
            <Select defaultValue="">
              <option value="" disabled>Select family</option>
              {FAMILIES.map((f) => (
                <option key={f.id}>
                  {f.house} · {f.id}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Relationship to Head">
            <Select defaultValue="">
              <option value="" disabled>Select</option>
              <option>Head of Family</option>
              <option>Spouse</option>
              <option>Son</option>
              <option>Daughter</option>
              <option>Parent</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field label="Ward Subdivision" className="sm:col-span-2">
            <Select defaultValue="">
              <option value="" disabled>Select ward</option>
              {WARDS.map((w) => (
                <option key={w.number}>
                  Ward #{w.number} - {w.patron}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Baptism Date">
            <Input type="date" />
          </Field>
          <Field label="Holy Communion Date">
            <Input type="date" />
          </Field>
          <Field label="Confirmation Date">
            <Input type="date" />
          </Field>
          <Field label="Marriage Date">
            <Input type="date" />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Mobile Number">
            <Input placeholder="+91 " />
          </Field>
          <Field label="Email">
            <Input type="email" placeholder="name@example.com" />
          </Field>
          <Field label="Current Address" className="sm:col-span-2">
            <textarea
              rows={3}
              placeholder="House name, ward, post office, PIN"
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
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { tt, toast } = useApp();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tt("addFamily")}
      subtitle="F-260 · New household record"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tt("cancel")}
          </Button>
          <Button
            onClick={() => {
              toast(tt("savedToast"));
              onClose();
            }}
          >
            <Check className="h-4 w-4" />
            {tt("save")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Family Name">
          <Input placeholder="e.g. Thekkedathu" />
        </Field>
        <Field label="House Name">
          <Input placeholder="e.g. Thekkedathu House" />
        </Field>
        <Field label="Head of Family">
          <Select defaultValue="">
            <option value="" disabled>Select member</option>
            <option>Joseph Thekkedathu</option>
            <option>Antony Kochupurackal</option>
            <option>Rosamma Edathil</option>
          </Select>
        </Field>
        <Field label="Ward Subdivision">
          <Select defaultValue="">
            <option value="" disabled>Select ward</option>
            {WARDS.map((w) => (
              <option key={w.number}>
                Ward #{w.number} - {w.patron}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Full Address" className="sm:col-span-2">
          <textarea
            rows={2}
            placeholder="Full postal address"
            className="w-full rounded-[8px] border border-border bg-input px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </Field>
        <div className="sm:col-span-2">
          <PhotoDropzone label="Family Portrait" aspect="banner" />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Photo dropzone ---------- */
function PhotoDropzone({
  label,
  aspect,
}: {
  label: string;
  aspect: "square" | "banner";
}) {
  const [preview, setPreview] = useState<string | null>(null);
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
            onClick={() => setPreview(null)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-danger"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            setPreview(
              aspect === "square"
                ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format"
                : "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=480&h=270&fit=crop&auto=format",
            )
          }
          className={`flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-border-strong bg-input text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground ${
            aspect === "square" ? "h-32 w-full" : "aspect-[16/9] w-full"
          }`}
        >
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
        </button>
      )}
    </div>
  );
}
