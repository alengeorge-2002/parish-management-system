import { useEffect, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock, Trash2, BookOpen, Pencil } from "lucide-react";
import { Card, Button, Pill, IconButton, Modal, Field, Input, Select } from "../components/ui";
import { useApp } from "../lib/app-context";
import {
  eventsApi,
  calendarApi,
  clergyApi,
  type MassTimingItem,
  type ScriptureReadingItem,
  type DayScheduleData,
} from "../utils/api-client";

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

const DEFAULT_FEAST_TITLE = "Ferial day — no major feast";

const DEFAULT_MASS_TIMINGS: MassTimingItem[] = [
  { id: "m1", time: "06:30 AM", language: "Malayalam", celebrant: "Parish Priest", notes: "" },
  { id: "m2", time: "06:00 PM", language: "Malayalam", celebrant: "Parish Priest", notes: "" },
];

const READING_TYPES = [
  "First Reading",
  "Responsorial Psalm",
  "Second Reading",
  "Gospel",
  "Epistle / Old Testament",
];

const formatDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const makeDefaultDaySchedule = (dateStr: string): DayScheduleData => ({
  schedule_date: dateStr,
  feast_title: DEFAULT_FEAST_TITLE,
  feast_title_ml: "",
  liturgical_season: "Ordinary",
  mass_timings: DEFAULT_MASS_TIMINGS,
  scripture_readings: [],
  is_default: true,
});

const seasonToKey = (season?: string): string => {
  const s = (season || "ordinary").toLowerCase();
  if (s.includes("advent")) return "advent";
  if (s.includes("christmas")) return "christmas";
  if (s.includes("lent") || s.includes("fast")) return "lent";
  if (s.includes("easter")) return "easter";
  return "ordinary";
};

const capitalizeSeason = (season?: string): string => {
  const key = seasonToKey(season);
  return key.charAt(0).toUpperCase() + key.slice(1);
};

const languageTone = (language: string): "gold" | "blue" | "violet" => {
  if (language === "English") return "blue";
  if (language === "Latin") return "violet";
  return "gold";
};

const seasonPillTone = (seasonKey: string): "gold" | "green" | "violet" => {
  if (seasonKey === "lent" || seasonKey === "advent") return "violet";
  if (seasonKey === "easter") return "green";
  return "gold";
};

export default function CalendarScreen() {
  const { tt, lang, toast } = useApp();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [modal, setModal] = useState(false);
  const [massModalOpen, setMassModalOpen] = useState(false);
  const [editingMass, setEditingMass] = useState<MassTimingItem | null>(null);
  const [readingsModalOpen, setReadingsModalOpen] = useState(false);

  const [feastsList, setFeastsList] = useState<any[]>([]);
  const [legacyCalendarMap, setLegacyCalendarMap] = useState<Record<string, any>>({});
  const [monthSchedules, setMonthSchedules] = useState<Record<string, DayScheduleData>>({});
  const [daySchedule, setDaySchedule] = useState<DayScheduleData>(() =>
    makeDefaultDaySchedule(formatDateKey(new Date()))
  );
  const [loadingDay, setLoadingDay] = useState(false);
  const [clergyNames, setClergyNames] = useState<string[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const selectedDateStr = formatDateKey(selectedDate);

  const loadBaseData = async () => {
    try {
      const [eventsData, legacyData, clergyData] = await Promise.all([
        eventsApi.list().catch(() => []),
        calendarApi.list().catch(() => []),
        clergyApi.list().catch(() => []),
      ]);

      if (Array.isArray(eventsData)) {
        setFeastsList(
          eventsData.map((f: any) => ({
            id: f.id || f._id,
            date: f.target_date ? parseInt(String(f.target_date).split("-")[2]) || 1 : 1,
            saintEn: f.title_en || f.title || "Holy Feast",
            saintMl: f.title_ml || f.description_ml || "",
            season: f.season || f.type_badge?.toLowerCase() || "ordinary",
            readings: f.readings || [],
            raw: f,
          }))
        );
      }

      if (Array.isArray(legacyData)) {
        const cMap: Record<string, any> = {};
        legacyData.forEach((cItem: any) => {
          if (cItem.dateString) {
            cMap[cItem.dateString] = cItem;
          }
        });
        setLegacyCalendarMap(cMap);
      }

      if (Array.isArray(clergyData)) {
        const names = clergyData
          .map((c: any) => c.name)
          .filter((n: unknown): n is string => typeof n === "string" && n.trim().length > 0);
        setClergyNames(Array.from(new Set(names)));
      }
    } catch (e) {
      console.error("[Calendar] Base API fetch error:", e);
    }
  };

  const loadMonthSchedules = async (targetYear: number, targetMonthZeroBased: number) => {
    try {
      const res = await calendarApi.getMonth(targetYear, targetMonthZeroBased + 1);
      const map: Record<string, DayScheduleData> = {};
      if (res && Array.isArray(res.schedules)) {
        res.schedules.forEach((s) => {
          if (s.schedule_date) {
            map[s.schedule_date] = s;
          }
        });
      }
      setMonthSchedules(map);
    } catch (e) {
      console.error("[Calendar] Month fetch error:", e);
    }
  };

  const loadDaySchedule = async (dateStr: string) => {
    setLoadingDay(true);
    try {
      const data = await calendarApi.getDay(dateStr);
      if (data && data.schedule_date) {
        setDaySchedule(data);
        if (!data.is_default) {
          setMonthSchedules((prev) => ({ ...prev, [data.schedule_date]: data }));
        }
      }
    } catch (e) {
      console.error("[Calendar] Day fetch error:", e);
      setDaySchedule(makeDefaultDaySchedule(dateStr));
    } finally {
      setLoadingDay(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadMonthSchedules(year, month);
  }, [year, month]);

  useEffect(() => {
    const cached = monthSchedules[selectedDateStr];
    setDaySchedule(cached || makeDefaultDaySchedule(selectedDateStr));
    loadDaySchedule(selectedDateStr);
  }, [selectedDateStr]);

  // Day of week the first day lands on (0 to 6)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  interface CalendarCell {
    day: number;
    isCurrentMonth: boolean;
    date: Date;
  }

  const calendarCells: CalendarCell[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i),
    });
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      date: new Date(year, month, d),
    });
  }

  const feastFor = (cellDate: Date) => {
    const dStr = formatDateKey(cellDate);
    const dbSched = monthSchedules[dStr];
    if (dbSched) {
      const hasNamedFeast =
        dbSched.feast_title && dbSched.feast_title.trim() !== DEFAULT_FEAST_TITLE;
      const hasReadings = Array.isArray(dbSched.scripture_readings) && dbSched.scripture_readings.length > 0;
      const hasCustomSeason = seasonToKey(dbSched.liturgical_season) !== "ordinary";
      const hasMassCountChange =
        Array.isArray(dbSched.mass_timings) && dbSched.mass_timings.length !== DEFAULT_MASS_TIMINGS.length;

      if (hasNamedFeast || hasReadings || hasCustomSeason || hasMassCountChange) {
        return {
          id: dbSched.id || dStr,
          source: "schedule" as const,
          saintEn: hasNamedFeast
            ? dbSched.feast_title
            : hasReadings
              ? `${dbSched.scripture_readings.length} Scripture Reading${dbSched.scripture_readings.length > 1 ? "s" : ""}`
              : "Custom Mass Schedule",
          saintMl: dbSched.feast_title_ml || (hasNamedFeast ? dbSched.feast_title : ""),
          season: seasonToKey(dbSched.liturgical_season),
          isFerialCustomOnly: !hasNamedFeast,
          raw: dbSched,
        };
      }
    }

    const legacyRecord = legacyCalendarMap[dStr];
    if (legacyRecord && legacyRecord.title) {
      return {
        id: legacyRecord._id || dStr,
        source: "legacy" as const,
        saintEn: legacyRecord.title,
        saintMl: legacyRecord.titleMl || legacyRecord.title,
        season: seasonToKey(legacyRecord.season),
        isFerialCustomOnly: false,
        raw: legacyRecord,
      };
    }

    const dayNum = cellDate.getDate();
    const matchedEvent = feastsList.find((f: any) => {
      const tDate = f.raw?.target_date || f.raw?.eventDate || f.target_date || f.eventDate;
      if (tDate) {
        const parsedStr = String(tDate).slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(parsedStr)) {
          return parsedStr === dStr;
        }
        const d = new Date(tDate);
        if (!isNaN(d.getTime())) {
          return formatDateKey(d) === dStr;
        }
      }
      return f.date === dayNum && cellDate.getMonth() === month;
    });

    if (matchedEvent) {
      return { ...matchedEvent, source: "event" as const, isFerialCustomOnly: false };
    }
    return undefined;
  };

  const selFeast = feastFor(selectedDate);
  const selectedDayLegacy = legacyCalendarMap[selectedDateStr] || {};

  const applySavedSchedule = (saved: DayScheduleData) => {
    setDaySchedule(saved);
    setMonthSchedules((prev) => ({ ...prev, [saved.schedule_date]: saved }));
  };

  const handleSaveFeast = async (formData: any) => {
    try {
      const targetDateStr = formData.eventDate || selectedDateStr;
      const baseDay =
        targetDateStr === selectedDateStr
          ? daySchedule
          : monthSchedules[targetDateStr] || makeDefaultDaySchedule(targetDateStr);

      let nextMasses = Array.isArray(baseDay.mass_timings)
        ? [...baseDay.mass_timings]
        : [...DEFAULT_MASS_TIMINGS];

      const incomingMassTime = String(formData.massTime || "").trim();
      if (
        incomingMassTime &&
        !nextMasses.some((m) => m.time.toLowerCase() === incomingMassTime.toLowerCase())
      ) {
        nextMasses.push({
          id: `m-${Date.now()}`,
          time: incomingMassTime,
          language: formData.massLanguage || "Malayalam",
          celebrant: formData.celebrant || "Parish Priest",
          notes: formData.typeBadge ? `${formData.typeBadge}` : "",
        });
      }

      const saved = await calendarApi.upsertDay({
        schedule_date: targetDateStr,
        feast_title: formData.title?.trim() || DEFAULT_FEAST_TITLE,
        feast_title_ml: formData.title_ml?.trim() || "",
        liturgical_season: capitalizeSeason(formData.season),
        mass_timings: nextMasses,
      });

      if (targetDateStr === selectedDateStr) {
        setDaySchedule(saved);
      }
      setMonthSchedules((prev) => ({ ...prev, [saved.schedule_date]: saved }));

      // Also announce named feast in events feed if not already present on that date
      const trimmedTitle = String(formData.title || "").trim();
      if (trimmedTitle && trimmedTitle !== DEFAULT_FEAST_TITLE) {
        const alreadyExists = feastsList.some(
          (f) =>
            String(f.raw?.target_date || f.raw?.eventDate || "").slice(0, 10) === targetDateStr &&
            String(f.saintEn || "").toLowerCase() === trimmedTitle.toLowerCase()
        );
        if (!alreadyExists) {
          await eventsApi.create(formData).catch(() => {});
        }
      }

      toast("Schedule updated successfully!");
      await loadBaseData();
    } catch (err: any) {
      toast(err.message || "Failed to save schedule");
      throw err;
    }
  };

  const handleDeleteFeast = async (f: any) => {
    if (!window.confirm(`Are you sure you want to clear feast "${f.saintEn}"?`)) return;
    try {
      if (f.source === "event" && f.id) {
        await eventsApi.delete(f.id).catch(() => {});
        setFeastsList((prev) => prev.filter((x) => x.id !== f.id));
      }
      if (!daySchedule.is_default || f.source === "schedule") {
        const saved = await calendarApi.upsertDay({
          schedule_date: selectedDateStr,
          feast_title: DEFAULT_FEAST_TITLE,
          feast_title_ml: "",
          liturgical_season: "Ordinary",
        });
        applySavedSchedule(saved);
      }
      toast(`Feast ${f.saintEn} cleared`);
    } catch (err: any) {
      toast(err.message || "Failed to clear feast");
    }
  };

  const handleSaveMassTiming = async (item: MassTimingItem) => {
    try {
      const currentMasses = Array.isArray(daySchedule.mass_timings)
        ? [...daySchedule.mass_timings]
        : [...DEFAULT_MASS_TIMINGS];
      const existingIdx = currentMasses.findIndex((m) => m.id === item.id);
      if (existingIdx >= 0) {
        currentMasses[existingIdx] = item;
      } else {
        currentMasses.push(item);
      }

      const saved = await calendarApi.upsertDay({
        schedule_date: selectedDateStr,
        feast_title: daySchedule.feast_title || DEFAULT_FEAST_TITLE,
        feast_title_ml: daySchedule.feast_title_ml || "",
        liturgical_season: daySchedule.liturgical_season || "Ordinary",
        mass_timings: currentMasses,
      });

      applySavedSchedule(saved);
      toast(existingIdx >= 0 ? "Mass timing updated" : "Mass timing added");
    } catch (err: any) {
      toast(err.message || "Failed to save Mass timing");
      throw err;
    }
  };

  const handleDeleteMassTiming = async (item: MassTimingItem) => {
    if (!window.confirm(`Delete ${item.time} (${item.language}) Mass?`)) return;
    try {
      const updatedMasses = (daySchedule.mass_timings || []).filter((m) => m.id !== item.id);
      const saved = await calendarApi.upsertDay({
        schedule_date: selectedDateStr,
        feast_title: daySchedule.feast_title || DEFAULT_FEAST_TITLE,
        feast_title_ml: daySchedule.feast_title_ml || "",
        liturgical_season: daySchedule.liturgical_season || "Ordinary",
        mass_timings: updatedMasses,
      });
      applySavedSchedule(saved);
      toast(`Removed ${item.time} Mass`);
    } catch (err: any) {
      toast(err.message || "Failed to delete Mass timing");
    }
  };

  const handleSaveReadings = async (readings: ScriptureReadingItem[]) => {
    try {
      const saved = await calendarApi.upsertDay({
        schedule_date: selectedDateStr,
        feast_title: daySchedule.feast_title || DEFAULT_FEAST_TITLE,
        feast_title_ml: daySchedule.feast_title_ml || "",
        liturgical_season: daySchedule.liturgical_season || "Ordinary",
        mass_timings: Array.isArray(daySchedule.mass_timings)
          ? daySchedule.mass_timings
          : DEFAULT_MASS_TIMINGS,
        scripture_readings: readings,
      });
      applySavedSchedule(saved);
      toast("Scripture readings updated");
    } catch (err: any) {
      toast(err.message || "Failed to update scripture readings");
      throw err;
    }
  };

  const hasCustomFeastTitle =
    daySchedule.feast_title && daySchedule.feast_title.trim() !== DEFAULT_FEAST_TITLE;
  const activeFeastTitleEn = hasCustomFeastTitle
    ? daySchedule.feast_title
    : selFeast && !selFeast.isFerialCustomOnly
      ? selFeast.saintEn
      : null;
  const activeFeastTitleMl = hasCustomFeastTitle
    ? daySchedule.feast_title_ml
    : selFeast && !selFeast.isFerialCustomOnly
      ? selFeast.saintMl
      : "";
  const activeSeasonKey = seasonToKey(
    !daySchedule.is_default ? daySchedule.liturgical_season : selFeast?.season || "ordinary"
  );

  const massesToRender: MassTimingItem[] = Array.isArray(daySchedule.mass_timings)
    ? daySchedule.mass_timings
    : DEFAULT_MASS_TIMINGS;

  const readingsToRender: ScriptureReadingItem[] =
    Array.isArray(daySchedule.scripture_readings) && daySchedule.scripture_readings.length > 0
      ? daySchedule.scripture_readings
      : Array.isArray(selectedDayLegacy.readings)
        ? selectedDayLegacy.readings.map((r: any) => ({
            reading: r.referenceEn || r.reading || "Reading",
            citation: r.descriptionEn || r.citation || r.descriptionMl || "",
          }))
        : [];

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
                      {lang === "en" ? feast.saintEn : feast.saintMl || feast.saintEn}
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
              <div className="flex items-center gap-1">
                <IconButton
                  title="Edit Feast & Season"
                  className="hover:text-primary"
                  onClick={() => setModal(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </IconButton>
                {activeFeastTitleEn && (
                  <IconButton
                    title="Clear Feast"
                    className="hover:bg-danger/12 hover:text-danger"
                    onClick={() =>
                      handleDeleteFeast(
                        selFeast || {
                          id: selectedDateStr,
                          source: "schedule",
                          saintEn: activeFeastTitleEn,
                        }
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                )}
              </div>
            </div>
            {activeFeastTitleEn ? (
              <>
                <h3 className="mt-1 font-display text-[16px] font-semibold text-foreground">
                  {activeFeastTitleEn}
                </h3>
                {activeFeastTitleMl && (
                  <div className="font-malayalam text-[13px] text-muted-foreground">
                    {activeFeastTitleMl}
                  </div>
                )}
                <Pill className="mt-2 uppercase" tone={seasonPillTone(activeSeasonKey)}>
                  {activeSeasonKey}
                </Pill>
              </>
            ) : (
              <>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {lang === "en" ? "Ferial day — no major feast" : "പ്രത്യേക തിരുനാളില്ല"}
                </p>
                {activeSeasonKey !== "ordinary" && (
                  <Pill className="mt-2 uppercase" tone={seasonPillTone(activeSeasonKey)}>
                    {activeSeasonKey}
                  </Pill>
                )}
              </>
            )}
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* MASS TIMINGS SECTION */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {tt("massTimings")}
                </h4>
                {loadingDay && (
                  <span className="text-[10px] text-muted-foreground">Syncing...</span>
                )}
              </div>

              <div className="space-y-2">
                {massesToRender.length > 0 ? (
                  massesToRender.map((m) => (
                    <div
                      key={m.id || `${m.time}-${m.language}`}
                      className="group flex items-center gap-2.5 rounded-[8px] border border-border bg-secondary/30 px-3 py-2"
                    >
                      <span className="font-mono text-[13px] font-semibold text-foreground shrink-0">
                        {m.time}
                      </span>
                      <Pill tone={languageTone(m.language)}>{m.language}</Pill>
                      <div className="min-w-0 flex-1 text-right">
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {m.celebrant}
                        </span>
                        {m.notes && (
                          <span className="block truncate text-[10px] text-muted-foreground/75">
                            {m.notes}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          title="Edit Mass"
                          onClick={() => {
                            setEditingMass(m);
                            setMassModalOpen(true);
                          }}
                          className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-[#F4C430] transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete Mass"
                          onClick={() => handleDeleteMassTiming(m)}
                          className="rounded p-1 text-muted-foreground hover:bg-danger/12 hover:text-danger transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No masses scheduled for this date.</p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingMass(null);
                    setMassModalOpen(true);
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-border-strong bg-secondary/20 px-3 py-2 text-[12px] font-semibold text-[#F4C430] hover:border-[#F4C430]/50 hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Mass Timing
                </button>
              </div>
            </div>

            {/* DAILY SCRIPTURE READINGS / തിരുവചന വായനകൾ */}
            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#F4C430] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#F4C430]" />
                  {lang === "ml" ? "തിരുവചന വായനകൾ" : "Scripture Readings"}
                </h4>
                <button
                  type="button"
                  onClick={() => setReadingsModalOpen(true)}
                  className="text-[11px] font-semibold text-[#F4C430] hover:underline cursor-pointer"
                >
                  + Add / Edit Readings
                </button>
              </div>

              {readingsToRender.length > 0 ? (
                readingsToRender.map((r, idx) => (
                  <div
                    key={`${r.reading}-${idx}`}
                    className="bg-[#1e222b] p-2.5 rounded-lg border border-[#2d323e]"
                  >
                    <span className="text-xs font-bold text-[#F4C430] block">{r.reading}</span>
                    <p className="text-xs text-slate-300 mt-0.5">{r.citation}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border/60 bg-secondary/15 px-3 py-2.5">
                  <p className="text-xs text-slate-500">No special readings assigned.</p>
                  <button
                    type="button"
                    onClick={() => setReadingsModalOpen(true)}
                    className="shrink-0 text-[11px] font-semibold text-[#F4C430] hover:underline cursor-pointer"
                  >
                    + Assign Readings
                  </button>
                </div>
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
        initialSchedule={daySchedule}
      />

      <MassTimingModal
        open={massModalOpen}
        onClose={() => {
          setMassModalOpen(false);
          setEditingMass(null);
        }}
        onSave={handleSaveMassTiming}
        initialItem={editingMass}
        clergyNames={clergyNames}
      />

      <ScriptureReadingsModal
        open={readingsModalOpen}
        onClose={() => setReadingsModalOpen(false)}
        onSave={handleSaveReadings}
        initialReadings={readingsToRender}
        dateLabel={selectedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      />
    </div>
  );
}

function ScheduleModal({
  open,
  onClose,
  onSave,
  selectedDate,
  initialSchedule,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
  selectedDate?: Date;
  initialSchedule?: DayScheduleData;
}) {
  const { tt } = useApp();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    title_ml: "",
    eventDate: formatDateKey(selectedDate || new Date()),
    massTime: "",
    massLanguage: "Malayalam",
    typeBadge: "Feast Day",
    location: "Main Sanctuary",
    description: "",
    season: "ordinary",
  });

  useEffect(() => {
    if (open) {
      const dStr = formatDateKey(selectedDate || new Date());
      const initTitle =
        initialSchedule?.feast_title && initialSchedule.feast_title !== DEFAULT_FEAST_TITLE
          ? initialSchedule.feast_title
          : "";
      setFormData({
        title: initTitle,
        title_ml: initialSchedule?.feast_title_ml || "",
        eventDate: dStr,
        massTime: "",
        massLanguage: "Malayalam",
        typeBadge: "Feast Day",
        location: "Main Sanctuary",
        description: "",
        season: seasonToKey(initialSchedule?.liturgical_season),
      });
    }
  }, [open, selectedDate, initialSchedule]);

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
        massLanguage: formData.massLanguage,
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
        <Field label="Feast / Day Title (English)" className="sm:col-span-2">
          <Input
            placeholder="e.g. Feast of St. Joseph (leave blank for Ferial day)"
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
        <Field label="Add Special Mass Time (Optional)">
          <Input
            placeholder="e.g. 08:30 AM"
            value={formData.massTime}
            onChange={(e) => setFormData({ ...formData, massTime: e.target.value })}
          />
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

function MassTimingModal({
  open,
  onClose,
  onSave,
  initialItem,
  clergyNames,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (item: MassTimingItem) => Promise<void>;
  initialItem: MassTimingItem | null;
  clergyNames: string[];
}) {
  const { tt } = useApp();
  const [saving, setSaving] = useState(false);
  const [time, setTime] = useState("");
  const [language, setLanguage] = useState("Malayalam");
  const [celebrantSelect, setCelebrantSelect] = useState("Parish Priest");
  const [customCelebrant, setCustomCelebrant] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const presetCelebrants = Array.from(
    new Set(["Parish Priest", "Associate Pastor", ...clergyNames])
  );

  useEffect(() => {
    if (!open) return;
    setError("");
    if (initialItem) {
      setTime(initialItem.time || "");
      setLanguage(initialItem.language || "Malayalam");
      const currentCel = initialItem.celebrant || "Parish Priest";
      if (presetCelebrants.includes(currentCel)) {
        setCelebrantSelect(currentCel);
        setCustomCelebrant("");
      } else {
        setCelebrantSelect("__custom__");
        setCustomCelebrant(currentCel);
      }
      setNotes(initialItem.notes || "");
    } else {
      setTime("07:30 AM");
      setLanguage("Malayalam");
      setCelebrantSelect("Parish Priest");
      setCustomCelebrant("");
      setNotes("");
    }
  }, [open, initialItem]);

  const handleSubmit = async () => {
    const trimmedTime = time.trim();
    if (!trimmedTime) {
      setError("Mass time is required (e.g. 07:30 AM)");
      return;
    }
    const finalCelebrant =
      celebrantSelect === "__custom__"
        ? customCelebrant.trim() || "Parish Priest"
        : celebrantSelect;

    setSaving(true);
    try {
      await onSave({
        id: initialItem?.id || `m-${Date.now()}`,
        time: trimmedTime,
        language,
        celebrant: finalCelebrant,
        notes: notes.trim(),
      });
      onClose();
    } catch {
      // toast handled upstream
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialItem ? "Edit Mass Timing" : "Add Mass Timing"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tt("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : tt("save")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Time">
            <Input
              placeholder="e.g. 07:30 AM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Field>
          <Field label="Language">
            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="Malayalam">Malayalam</option>
              <option value="English">English</option>
              <option value="Latin">Latin</option>
            </Select>
          </Field>
        </div>

        <Field label="Celebrant">
          <Select
            value={celebrantSelect}
            onChange={(e) => setCelebrantSelect(e.target.value)}
          >
            {presetCelebrants.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="__custom__">Custom Celebrant Name...</option>
          </Select>
        </Field>

        {celebrantSelect === "__custom__" && (
          <Field label="Custom Celebrant Name">
            <Input
              placeholder="e.g. Rev. Fr. Mathew"
              value={customCelebrant}
              onChange={(e) => setCustomCelebrant(e.target.value)}
            />
          </Field>
        )}

        <Field label="Notes (Optional)">
          <Input
            placeholder="e.g. First Friday Novena & Adoration"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

function ScriptureReadingsModal({
  open,
  onClose,
  onSave,
  initialReadings,
  dateLabel,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (readings: ScriptureReadingItem[]) => Promise<void>;
  initialReadings: ScriptureReadingItem[];
  dateLabel: string;
}) {
  const { tt } = useApp();
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<ScriptureReadingItem[]>([]);

  useEffect(() => {
    if (!open) return;
    if (initialReadings.length > 0) {
      setRows(initialReadings.map((r) => ({ ...r })));
    } else {
      setRows([
        { reading: "First Reading", citation: "" },
        { reading: "Gospel", citation: "" },
      ]);
    }
  }, [open, initialReadings]);

  const handleAddRow = () => {
    const nextType =
      READING_TYPES.find((t) => !rows.some((r) => r.reading === t)) || "First Reading";
    setRows((prev) => [...prev, { reading: nextType, citation: "" }]);
  };

  const handleUpdateRow = (idx: number, field: keyof ScriptureReadingItem, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const cleaned = rows
        .map((r) => ({ reading: r.reading.trim(), citation: r.citation.trim() }))
        .filter((r) => r.citation.length > 0);
      await onSave(cleaned);
      onClose();
    } catch {
      // toast handled upstream
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Scripture Readings — ${dateLabel}`}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tt("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : tt("save")}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No readings listed. Click "+ Add Reading" below to assign readings for this date, or Save to clear all readings.
          </p>
        ) : (
          rows.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-2.5 rounded-lg border border-border bg-secondary/20 p-3 sm:grid-cols-[190px_1fr_auto] sm:items-end"
            >
              <Field label="Reading Type">
                <Select
                  value={row.reading}
                  onChange={(e) => handleUpdateRow(idx, "reading", e.target.value)}
                >
                  {READING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Passage / Citation">
                <Input
                  placeholder="e.g. Isaiah 7:10-14 or Luke 1:26-38"
                  value={row.citation}
                  onChange={(e) => handleUpdateRow(idx, "citation", e.target.value)}
                />
              </Field>
              <button
                type="button"
                title="Remove reading"
                onClick={() => handleRemoveRow(idx)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-danger/40 hover:bg-danger/12 hover:text-danger transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}

        <Button type="button" variant="secondary" onClick={handleAddRow} className="w-full">
          <Plus className="h-4 w-4" />
          Add Reading
        </Button>
      </div>
    </Modal>
  );
}
