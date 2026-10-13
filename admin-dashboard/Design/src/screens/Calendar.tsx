import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Card, Button, Pill } from "../components/ui";
import { Modal, Field, Input, Select } from "../components/ui";
import { useApp } from "../lib/app-context";
import { FEASTS_MARCH, MASS_TIMINGS, WARDS } from "../lib/data";

const seasonColor: Record<string, string> = {
  advent: "var(--lit-advent)",
  christmas: "var(--lit-christmas)",
  lent: "var(--lit-lent)",
  easter: "var(--lit-easter)",
  ordinary: "var(--lit-ordinary)",
};

const LEGEND = [
  { key: "advent", en: "Advent", ml: "ആഗമനകാലം" },
  { key: "christmas", en: "Christmas", ml: "ക്രിസ്മസ്" },
  { key: "lent", en: "Lent", ml: "നോമ്പ്" },
  { key: "easter", en: "Easter", ml: "ഈസ്റ്റർ" },
  { key: "ordinary", en: "Ordinary", ml: "സാധാരണ" },
];

// March 2026 starts on a Sunday
const DAYS_IN_MONTH = 31;
const FIRST_WEEKDAY = 0;

export default function CalendarScreen() {
  const { tt, lang } = useApp();
  const [selected, setSelected] = useState(19);
  const [modal, setModal] = useState(false);

  const feastFor = (d: number) => FEASTS_MARCH.find((f) => f.date === d);
  const selFeast = feastFor(selected);

  const cells: (number | null)[] = [
    ...Array(FIRST_WEEKDAY).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="h-9 w-9 px-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-[18px] font-bold text-foreground">
            {lang === "en" ? "March 2026" : "മാർച്ച് 2026"}
          </h2>
          <Button variant="secondary" className="h-9 w-9 px-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {LEGEND.map((l) => (
              <span key={l.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: seasonColor[l.key] }}
                />
                {lang === "en" ? l.en : l.ml}
              </span>
            ))}
          </div>
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" />
            {tt("scheduleFeast")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.9fr_1fr]">
        <Card className="p-4">
          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {(lang === "en"
              ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
              : ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"]
            ).map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const feast = feastFor(d);
              const isSel = d === selected;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(d)}
                  className={`relative flex aspect-square flex-col rounded-[8px] border p-1.5 text-left transition-colors ${
                    isSel
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/20 hover:border-border-strong hover:bg-secondary/50"
                  }`}
                >
                  {feast && (
                    <span
                      className="absolute inset-x-1.5 top-0 h-1 rounded-b-full"
                      style={{ background: seasonColor[feast.season] }}
                    />
                  )}
                  <span
                    className={`font-mono text-[12px] font-semibold ${
                      isSel ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {d}
                  </span>
                  {feast && (
                    <span className="mt-auto line-clamp-2 text-[9px] leading-tight text-muted-foreground">
                      {lang === "en" ? feast.saintEn : feast.saintMl}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="border-b border-border px-5 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === "en" ? `March ${selected}, 2026` : `2026 മാർച്ച് ${selected}`}
            </div>
            {selFeast ? (
              <>
                <h3 className="mt-1 font-display text-[16px] font-semibold text-foreground">
                  {selFeast.saintEn}
                </h3>
                <div className="font-malayalam text-[13px] text-muted-foreground">
                  {selFeast.saintMl}
                </div>
                <Pill
                  className="mt-2 uppercase"
                  tone={selFeast.season === "lent" ? "violet" : "gold"}
                >
                  {selFeast.season}
                </Pill>
              </>
            ) : (
              <p className="mt-1 text-[13px] text-muted-foreground">
                {lang === "en" ? "Ferial day — no major feast" : "പ്രത്യേക തിരുനാളില്ല"}
              </p>
            )}
          </div>
          <div className="px-5 py-4">
            <h4 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {tt("massTimings")}
            </h4>
            <div className="space-y-2">
              {MASS_TIMINGS.map((m) => (
                <div
                  key={m.time}
                  className="flex items-center gap-3 rounded-[8px] border border-border bg-secondary/30 px-3 py-2"
                >
                  <span className="font-mono text-[13px] font-semibold text-foreground">
                    {m.time}
                  </span>
                  <Pill tone={m.language === "English" ? "blue" : "gold"}>
                    {m.language}
                  </Pill>
                  <span className="ml-auto truncate text-[11px] text-muted-foreground">
                    {m.priest}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <ScheduleModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}

function ScheduleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tt, toast } = useApp();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tt("scheduleFeast")}
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
            {tt("save")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title" className="sm:col-span-2">
          <Input placeholder="e.g. Feast of St. Joseph" />
        </Field>
        <Field label="Date">
          <Input type="date" />
        </Field>
        <Field label="Time">
          <Input type="time" />
        </Field>
        <Field label="Language">
          <Select defaultValue="Malayalam">
            <option>Malayalam</option>
            <option>English</option>
          </Select>
        </Field>
        <Field label="Celebrant Priest">
          <Select defaultValue="">
            <option value="" disabled>Select</option>
            <option>Fr. Sebastian Vadakkumchery</option>
            <option>Fr. Jomon Palakkappilly</option>
          </Select>
        </Field>
        <Field label="Host Ward (optional)" className="sm:col-span-2">
          <Select defaultValue="">
            <option value="">All wards</option>
            {WARDS.map((w) => (
              <option key={w.number}>Ward #{w.number} - {w.patron}</option>
            ))}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
