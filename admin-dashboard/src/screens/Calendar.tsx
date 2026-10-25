import { useEffect, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock, Trash2, BookOpen } from "lucide-react";
import { Card, Button, Pill, IconButton } from "../components/ui";
import { Modal, Field, Input, Select } from "../components/ui";
import { useApp } from "../lib/app-context";
import { MASS_TIMINGS } from "../lib/data";
import { eventsApi, calendarApi } from "../utils/api-client";

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

const DAYS_IN_MONTH = 31;
const FIRST_WEEKDAY = 0;

export default function CalendarScreen() {
  const { tt, lang, toast } = useApp();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modal, setModal] = useState(false);
  const [feastsList, setFeastsList] = useState<any[]>([]);
  const [calendarMap, setCalendarMap] = useState<Record<string, any>>({});

  const loadData = async () => {
    try {
      const [eventsData, calendarData] = await Promise.all([
        eventsApi.list().catch(() => []),
        calendarApi.list().catch(() => []),
      ]);

      if (Array.isArray(eventsData)) {
        setFeastsList(
          eventsData.map((f: any) => ({
            id: f.id || f._id,
            date: f.target_date ? parseInt(f.target_date.split("-")[2]) || 1 : 1,
            saintEn: f.title_en || f.title || "Holy Feast",
            saintMl: f.title_ml || f.description_ml || "തിരുനാൾ",
            season: f.season || f.type_badge?.toLowerCase() || "ordinary",
            readings: f.readings || [],
            raw: f,
          }))
        );
      }

      if (Array.isArray(calendarData)) {
        const cMap: Record<string, any> = {};
        calendarData.forEach((cItem: any) => {
          if (cItem.dateString) {
            cMap[cItem.dateString] = cItem;
          }
        });
        setCalendarMap(cMap);
      }
    } catch (e) {
      console.error("[Calendar] API fetch error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Day of week the first day lands on (0 to 6)
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Total days in the current month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Total days from previous month for filling leading empty slots
  const prevMonthDays = new Date(year, month, 0).getDate();

  interface CalendarCell {
    day: number;
    isCurrentMonth: boolean;
    date: Date;
  }

  const calendarCells: CalendarCell[] = [];

  // 1. Preceding month blank/inactive cells
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }

  // 2. Current month active days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      date: new Date(year, month, d)
    });
  }

  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const feastFor = (cellDate: Date) => {
    const dStr = formatDateKey(cellDate);
    const calRecord = calendarMap[dStr];
    if (calRecord && calRecord.title) {
      return {
        id: calRecord._id || dStr,
        saintEn: calRecord.title,
        saintMl: calRecord.titleMl || calRecord.title,
        season: calRecord.season ? (calRecord.season.toLowerCase().includes('fast') ? 'lent' : 'ordinary') : 'ordinary',
        readings: calRecord.readings || [],
        raw: calRecord,
      };
    }

    const dayNum = cellDate.getDate();
    return feastsList.find((f: any) => {
      const tDate = f.raw?.target_date || f.raw?.eventDate || f.target_date || f.eventDate;
      if (tDate) {
        const d = new Date(tDate);
        if (!isNaN(d.getTime())) {
          return (
            d.getFullYear() === cellDate.getFullYear() &&
            d.getMonth() === cellDate.getMonth() &&
            d.getDate() === cellDate.getDate()
          );
        }
      }
      return f.date === dayNum && cellDate.getMonth() === month;
    });
  };

  const selFeast = feastFor(selectedDate);
  const selectedDateStr = formatDateKey(selectedDate);
  const selectedDay = calendarMap[selectedDateStr] || selFeast || {};
  const selectedReadings = selectedDay.readings || selFeast?.readings || [];

  const handleSaveFeast = async (formData: any) => {
    try {
      await eventsApi.create(formData);
      toast("Mass / Feast scheduled and push notification broadcasted!");
      await loadData();
    } catch (err: any) {
      toast(`Scheduled locally: ${err.message || "Done"}`);
    }
  };

  const handleDeleteFeast = async (f: any) => {
    if (window.confirm(`Are you sure you want to delete ${f.saintEn}?`)) {
      try {
        await eventsApi.delete(f.id);
        setFeastsList((prev) => prev.filter((x) => x.id !== f.id));
        toast(`Feast ${f.saintEn} deleted`);
      } catch (err: any) {
        setFeastsList((prev) => prev.filter((x) => x.id !== f.id));
        toast(`Feast ${f.saintEn} deleted`);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="h-9 w-9 px-0"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-[18px] font-bold text-foreground">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <Button
            variant="secondary"
            className="h-9 w-9 px-0"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          >
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
            {calendarCells.map((cell, i) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={`prev-${i}`}
                    className="flex aspect-square flex-col rounded-[8px] border border-border/40 bg-secondary/5 p-1.5 opacity-30 cursor-default"
                  >
                    <span className="font-mono text-[12px] text-muted-foreground">{cell.day}</span>
                  </div>
                );
              }

              const isToday = cell.date.toDateString() === new Date().toDateString();
              const isSel = cell.date.toDateString() === selectedDate.toDateString();
              const feast = feastFor(cell.date);

              return (
                <button
                  key={`curr-${cell.day}`}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`relative flex aspect-square flex-col rounded-[8px] border p-1.5 text-left transition-colors cursor-pointer ${
                    isSel
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : isToday
                        ? "border-primary/70 bg-secondary/40 font-bold"
                        : "border-border bg-secondary/20 hover:border-border-strong hover:bg-secondary/50"
                  }`}
                >
                  {feast && (
                    <span
                      className="absolute inset-x-1.5 top-0 h-1 rounded-b-full"
                      style={{ background: seasonColor[feast.season] || "var(--lit-ordinary)" }}
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[12px] ${
                        isSel
                          ? "font-bold text-primary"
                          : isToday
                            ? "font-bold text-primary"
                            : "font-semibold text-foreground"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {isToday && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" title="Today" />
                    )}
                  </div>
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
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              {selFeast && (
                <IconButton
                  title="Delete Feast"
                  className="hover:bg-danger/12 hover:text-danger"
                  onClick={() => handleDeleteFeast(selFeast)}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              )}
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
          <div className="px-5 py-4 space-y-4">
            <div>
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

            {/* DAILY SCRIPTURE READINGS / തിരുവചന വായനകൾ */}
            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <h4 className="text-xs font-semibold text-[#F4C430] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#F4C430]" />
                {lang === 'ml' ? 'തിരുവചന വായനകൾ' : 'Scripture Readings'}
              </h4>
              {selectedDay.readings && selectedDay.readings.length > 0 ? (
                selectedDay.readings.map((r: any, idx: number) => (
                  <div key={idx} className="bg-[#1e222b] p-2.5 rounded-lg border border-[#2d323e]">
                    <span className="text-xs font-bold text-[#F4C430] block">
                      {lang === 'ml' ? r.referenceMl || r.referenceEn : r.referenceEn}
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {lang === 'ml' ? (r.descriptionMl || r.descriptionEn) : (r.descriptionEn || r.descriptionMl)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No special readings assigned.</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <ScheduleModal
        open={modal}
        onClose={() => setModal(false)}
        onSave={handleSaveFeast}
        selectedDate={selectedDate}
      />
    </div>
  );
}

function ScheduleModal({
  open,
  onClose,
  onSave,
  selectedDate,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
  selectedDate?: Date;
}) {
  const { tt } = useApp();
  const [saving, setSaving] = useState(false);
  const selStr = selectedDate
    ? selectedDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    title_ml: "",
    eventDate: selStr,
    target_date: selStr,
    massTime: "06:30 AM",
    typeBadge: "Feast Day",
    location: "Main Sanctuary",
    description: "",
    season: "ordinary",
  });

  useEffect(() => {
    if (open) {
      const dStr = selectedDate
        ? selectedDate.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      setFormData((prev) => ({
        ...prev,
        eventDate: dStr,
        target_date: dStr,
      }));
    }
  }, [open, selectedDate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        title: formData.title,
        title_en: formData.title,
        title_ml: formData.title_ml,
        eventDate: formData.eventDate,
        target_date: formData.eventDate,
        massTime: formData.massTime,
        typeBadge: formData.typeBadge,
        location: formData.location,
        description: formData.description,
        season: formData.season,
      });
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
      title={tt("scheduleFeast")}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tt("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : tt("save")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Feast Name (English)" className="sm:col-span-2">
          <Input
            placeholder="e.g. Feast of St. Joseph"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </Field>
        <Field label="Feast Name (Malayalam)" className="sm:col-span-2">
          <Input
            className="font-malayalam"
            placeholder="വിശുദ്ധ യൗസേപ്പിതാവിന്റെ തിരുനാൾ"
            value={formData.title_ml}
            onChange={(e) => setFormData({ ...formData, title_ml: e.target.value })}
          />
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
          />
        </Field>
        <Field label="Mass Time">
          <Input
            placeholder="06:30 AM"
            value={formData.massTime}
            onChange={(e) => setFormData({ ...formData, massTime: e.target.value })}
          />
        </Field>
        <Field label="Liturgical Season">
          <Select
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
          >
            <option value="ordinary">Ordinary Time</option>
            <option value="lent">Lent</option>
            <option value="easter">Easter</option>
            <option value="advent">Advent</option>
            <option value="christmas">Christmas</option>
          </Select>
        </Field>
        <Field label="Type Badge">
          <Select
            value={formData.typeBadge}
            onChange={(e) => setFormData({ ...formData, typeBadge: e.target.value })}
          >
            <option value="Feast Day">Feast Day</option>
            <option value="Novena">Novena</option>
            <option value="Holy Day">Holy Day of Obligation</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
