import { useEffect } from "react";
import { X, Droplet } from "lucide-react";
import type { Sacrament } from "../lib/data";

/* ---------- Card ---------- */
export function Card({
  className = "",
  children,
  glow = false,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[12px] border border-border bg-card ${glow ? "card-glow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Badge / Pill ---------- */
type Tone = "gold" | "green" | "red" | "blue" | "violet" | "neutral";
const toneMap: Record<Tone, string> = {
  gold: "bg-primary/12 text-primary border-primary/25",
  green: "bg-success/12 text-success border-success/25",
  red: "bg-danger/12 text-danger border-danger/25",
  blue: "bg-info/12 text-info border-info/25",
  violet: "bg-lit-lent/15 text-lit-lent border-lit-lent/30",
  neutral: "bg-secondary text-muted-foreground border-border",
};

export function Pill({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneMap[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { tone: Tone; label: string }> = {
    active: { tone: "green", label: "Active" },
    deceased: { tone: "neutral", label: "Deceased" },
    relocated: { tone: "blue", label: "Relocated" },
  };
  const s = map[status] ?? map.active;
  return (
    <Pill tone={s.tone} className="uppercase tracking-wide">
      {s.label}
    </Pill>
  );
}

/* ---------- Buttons ---------- */
export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[8px] px-3.5 py-2 text-[13px] font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50";
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary-hover shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]",
    secondary:
      "border border-border-strong bg-secondary text-secondary-foreground hover:border-primary/40",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
    danger: "bg-danger/12 text-danger border border-danger/25 hover:bg-danger/20",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function IconButton({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------- Inputs ---------- */
export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-border bg-input px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputCls} ${className}`} {...props} />;
}

export function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputCls} appearance-none pr-8 ${className}`} {...props}>
      {children}
    </select>
  );
}

/* ---------- Toggle switch ---------- */
export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-border-strong"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ---------- Blood tag ---------- */
export function BloodTag({ group }: { group: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] border border-danger/25 bg-danger/10 px-1.5 py-0.5 font-mono text-[11px] font-medium text-danger">
      <Droplet className="h-3 w-3" />
      {group}
    </span>
  );
}

/* ---------- Sacrament badges ---------- */
const sacLabels: Record<Sacrament, { letter: string; label: string }> = {
  baptism: { letter: "B", label: "Baptism" },
  communion: { letter: "C", label: "First Communion" },
  confirmation: { letter: "F", label: "Confirmation" },
  marriage: { letter: "M", label: "Marriage" },
};
const sacOrder: Sacrament[] = ["baptism", "communion", "confirmation", "marriage"];

export function SacramentBadges({ received }: { received: Sacrament[] }) {
  return (
    <div className="flex items-center gap-1">
      {sacOrder.map((s) => {
        const has = received.includes(s);
        return (
          <span
            key={s}
            title={sacLabels[s].label}
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
              has
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "bg-secondary text-muted-foreground/40"
            }`}
          >
            {sacLabels[s].letter}
          </span>
        );
      })}
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide = false,
  maxWidthClass,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
  maxWidthClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`modal-in relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[12px] border border-border-strong bg-popover shadow-2xl ${
          maxWidthClass || (wide ? "max-w-2xl" : "max-w-lg")
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-display text-[16px] font-semibold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <IconButton onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-card/50 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Section header ---------- */
export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <h3 className="font-display text-[15px] font-semibold text-foreground">{title}</h3>
      {action}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground/60">
        {icon}
      </div>
      <p className="text-[13px] text-muted-foreground">{title}</p>
      {action}
    </div>
  );
}
