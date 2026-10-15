import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, apiFetch } from '../config';
import dailyReadingsData from '../data/daily-readings.json';

const dailyReadings = dailyReadingsData as Record<string, any>;

// 1. Static Bilingual Dictionaries
const publicHolidays: Record<string, { en: string; ml: string }> = {
  '01-01': { en: "New Year's Day", ml: "പുതുവത്സര ദിനം" },
  '01-26': { en: "Republic Day", ml: "റിപ്പബ്ലിക് ദിനം" },
  '05-01': { en: "May Day / Labor Day", ml: "മെയ് ദിനം / തൊഴിലാളി ദിനം" },
  '08-15': { en: "Independence Day", ml: "സ്വാതന്ത്ര്യദിനം" },
  '10-02': { en: "Gandhi Jayanti", ml: "ഗാന്ധി ജയന്തി" },
  '12-25': { en: "Christmas Day", ml: "ക്രിസ്തുമസ് ദിനം" }
};

const liturgicalFeasts: Record<string, { en: string; ml: string }> = {
  '01-01': { en: "Feast of the Naming of Our Lord", ml: "ഈശോയുടെ നാമകരണ തിരുനാൾ" },
  '01-03': { en: "Feast of St. Kuriakose Elias Chavara", ml: "വിശുദ്ധ ചാവറ കുര്യാക്കോസ് ഏലിയാസച്ചന്റെ തിരുനാൾ" },
  '01-06': { en: "Feast of Denha (Epiphany) *Holy Day of Obligation*", ml: "ദനഹാ തിരുനാൾ (പിണ്ടിപ്പെരുന്നാൾ) *കടമുള്ള ദിവസം*" },
  '07-03': { en: "Dukhrana (Martyrdom of St. Thomas the Apostle) *Holy Day of Obligation*", ml: "ദുക്റാന (മാർ തോമാശ്ലീഹായുടെ രക്തസാക്ഷിത്വ സ്മരണ) *കടമുള്ള ദിവസം*" },
  '08-15': { en: "Assumption of the Blessed Virgin Mary *Holy Day of Obligation*", ml: "പരിശുദ്ധ ദൈവമാതാവിന്റെ സ്വർഗ്ഗാരോഹണ തിരുനാൾ *കടമുള്ള ദിവസം*" },
  '09-08': { en: "Nativity of Our Lady (Concluding 8 Days Lent)", ml: "പരിശുദ്ധ ദൈവമാതാവിന്റെ ജനനപ്പെരുന്നാൾ (എട്ടുനോമ്പ് സമാപനം)" },
  '09-14': { en: "Exaltation of the Holy Cross", ml: "കുരിശിന്റെ പുകഴ്ചയുടെ തിരുനാൾ" },
  '12-08': { en: "Feast of the Immaculate Conception", ml: "അമലോത്ഭവ തിരുനാൾ" },
  '12-18': { en: "The Miraculous Cross of Mylapore", ml: "മൈലാപ്പൂരിലെ അത്ഭുത കുരിശിന്റെ തിരുനാൾ" },
  '12-25': { en: "Yeldho (Nativity of Our Lord) *Holy Day of Obligation*", ml: "യൽദോ (നമ്മുടെ കർത്താവിന്റെ പിറവി തിരുനാൾ) *കടമുള്ള ദിവസം*" }
};

const getLentInfo = (month: number, day: number): { en: string; ml: string } | null => {
  if (month === 12 && day >= 1 && day <= 24) {
    return { en: "25 Days Fast (Subara Preparation)", ml: "25 നോമ്പ് (മംഗളവാർത്തക്കാലം)" };
  }
  if (month === 8 && day >= 1 && day <= 14) {
    return { en: "15 Days Lent (Dormition Preparation)", ml: "15 നോമ്പ് (മാതാവിന്റെ സ്വർഗ്ഗാരോഹണ ഒരുക്കം)" };
  }
  if (month === 9 && day >= 1 && day <= 7) {
    return { en: "8 Days Lent (Nativity of Mary Fast)", ml: "8 നോമ്പ് (മാതാവിന്റെ ജനന ഒരുക്കം)" };
  }
  return null;
};

const monthsDict = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ml: ['ജനുവരി', 'ഫെബ്രുവരി', 'മാർച്ച്', 'ഏപ്രിൽ', 'മേയ്', 'ജൂൺ', 'ജൂലൈ', 'ആഗസ്റ്റ്', 'സെപ്റ്റംബർ', 'ഒക്ടോബർ', 'നവംബർ', 'ഡിസംബർ']
};

const weekdaysDict = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ml: ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വാ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി']
};

export interface NormalizedReading {
  citation_en: string;
  citation_ml: string;
  description_en: string;
  description_ml: string;
}

export const normalizeDateStr = (dateVal: any): string | null => {
  if (!dateVal) return null;
  if (typeof dateVal === 'string') {
    const clean = dateVal.trim().split('T')[0];
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(clean)) {
      const [y, m, d] = clean.split('-');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const dObj = new Date(dateVal);
    if (!isNaN(dObj.getTime())) {
      const y = dObj.getFullYear();
      const m = String(dObj.getMonth() + 1).padStart(2, '0');
      const d = String(dObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } else if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return null;
};

export const matchesDay = (dateVal: any, year: number, month: number, day: number): boolean => {
  const norm = normalizeDateStr(dateVal);
  if (!norm) return false;
  const targetStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return norm === targetStr;
};

export const normalizeReadings = (readingsRaw: any, readingsEnRaw?: any, readingsMlRaw?: any): NormalizedReading[] => {
  const result: NormalizedReading[] = [];

  if (Array.isArray(readingsEnRaw) && readingsEnRaw.length > 0) {
    readingsEnRaw.forEach((itemEn: any, idx: number) => {
      const itemMl = Array.isArray(readingsMlRaw) ? readingsMlRaw[idx] : null;
      if (typeof itemEn === 'string') {
        result.push({
          citation_en: itemEn,
          citation_ml: typeof itemMl === 'string' ? itemMl : itemEn,
          description_en: '',
          description_ml: '',
        });
      } else if (itemEn && typeof itemEn === 'object') {
        const citEn = itemEn.citation_en || itemEn.citation || itemEn.referenceEn || itemEn.ref || '';
        const citMl = itemMl?.citation_ml || itemMl?.citation || itemMl?.referenceMl || itemEn.citation_ml || itemEn.citation || citEn;
        const descEn = itemEn.description_en || itemEn.description || itemEn.descriptionEn || '';
        const descMl = itemMl?.description_ml || itemMl?.description || itemMl?.descriptionMl || itemEn.description_ml || itemEn.description || descEn;
        result.push({
          citation_en: citEn,
          citation_ml: citMl,
          description_en: descEn,
          description_ml: descMl,
        });
      }
    });
    return result;
  }

  if (Array.isArray(readingsRaw)) {
    readingsRaw.forEach((r: any) => {
      if (typeof r === 'string') {
        result.push({
          citation_en: r,
          citation_ml: r,
          description_en: '',
          description_ml: '',
        });
      } else if (r && typeof r === 'object') {
        const citEn = r.citation_en || r.referenceEn || r.citation || r.ref || '';
        const citMl = r.citation_ml || r.referenceMl || r.citation || r.ref || citEn;
        const descEn = r.description_en || r.descriptionEn || r.description || '';
        const descMl = r.description_ml || r.descriptionMl || r.description || descEn;
        if (citEn || citMl) {
          result.push({
            citation_en: citEn,
            citation_ml: citMl,
            description_en: descEn,
            description_ml: descMl,
          });
        }
      }
    });
  }

  return result;
};

const fallbackFeasts = [
  {
    id: 1,
    title_en: "Sacred Heart of Jesus — Novena Begins",
    title_ml: "ഈശോയുടെ തിരുഹൃദയ നൊവേന ആരംഭം",
    target_date: "2026-06-07",
    mass_time: "6:00 AM Daily",
    type_badge: "Novena",
    location: "Main Sanctuary",
    description_en: "Nine days of devotion to the Sacred Heart of Jesus. All are welcome to participate in this powerful novena.",
    description_ml: "നൊവേന പ്രാർത്ഥനകൾ എല്ലാ ദിവസവും രാവിലെ 6 മണിക്ക് നടക്കും."
  },
  {
    id: 2,
    title_en: "Feast of St Anthony",
    title_ml: "വിശുദ്ധ അന്തോണീസിന്റെ തിരുനാൾ",
    target_date: "2026-06-13",
    mass_time: "6:00 AM & 7:00 AM & 6:00 PM",
    type_badge: "Feast",
    location: "Main Sanctuary",
    description_en: "Patron Saint Feast of our community with solemn holy mass and distribution of bread.",
    description_ml: "അപ്പത്തിന്റെ ആശീർവാദവും വിതരണവും തിരുനാൾ കുർബാനയ്ക്കു ശേഷം ഉണ്ടായിരിക്കും."
  },
  {
    id: 3,
    title_en: "Corpus Christi Procession",
    title_ml: "വിശുദ്ധ കുർബാനയുടെ പ്രദിക്ഷണം",
    target_date: "2026-06-14",
    mass_time: "6:30 PM",
    type_badge: "Feast",
    location: "Main Sanctuary",
    description_en: "Solemn Procession around the parish grounds immediately following the Solemn High Mass.",
    description_ml: "തിരുനാൾ കുർബാനയെ തുടർന്ന് ഇടവക അതിർത്തികളിൽ പ്രദക്ഷിണം ഉണ്ടായിരിക്കും."
  },
  {
    id: 4,
    title_en: "Youth Fellowship",
    title_ml: "യുവജന സഖ്യം കൂട്ടായ്മ",
    target_date: "2026-06-22",
    mass_time: "6:30 PM",
    type_badge: "Event",
    location: "Parish Hall",
    description_en: "Praise, worship, and fellowship for the teenagers and youth of our parish.",
    description_ml: "പാരീഷ് ഹാളിൽ വച്ച് യുവജനങ്ങളുടെ സ്തുതിപ്പും ആരാധനയും."
  },
  {
    id: 5,
    title_en: "Feast of Sts. Peter & Paul",
    title_ml: "വിശുദ്ധ പത്രോസ് ശ്ലീഹായുടെയും പൗലോസ് ശ്ലീഹായുടെയും തിരുനാൾ",
    target_date: "2026-06-29",
    mass_time: "06:00 AM, 07:00 AM",
    type_badge: "Feast",
    location: "Main Sanctuary",
    description_en: "Solemn liturgy celebrating the life and martyrdom of the Apostles Peter and Paul.",
    description_ml: "ശ്ലീഹന്മാരുടെ ഓർമ്മ തിരുനാൾ ആഘോഷങ്ങൾ."
  },
  {
    id: 6,
    title_en: "Feast of St. Joseph (Parish Patron)",
    title_ml: "മാർ യൗസേപ്പിന്റെ പ്രധാന തിരുനാൾ",
    target_date: "2026-03-19",
    mass_time: "6:30 AM & 10:00 AM",
    type_badge: "Feast",
    location: "Main Sanctuary",
    description_en: "Patron Feast Day celebration with solemn high mass and community feast meal.",
    description_ml: "ഇടവക മധ്യസ്ഥനായ വിശുദ്ധ യൗസേപ്പിതാവിന്റെ ആഘോഷമായ തിരുനാൾ ബലി."
  },
  {
    id: 7,
    title_en: "Rosary Month Solemn Devotion & Procession",
    title_ml: "ജപമാല മാസ സമാപന പ്രദക്ഷിണം",
    target_date: "2026-10-14",
    mass_time: "6:30 PM",
    type_badge: "Event",
    location: "Grotto & Parish Grounds",
    description_en: "Solemn Holy Rosary devotion, candlelight procession, and benediction.",
    description_ml: "പരിശുദ്ധ ജപമാല സമർപ്പണവും മെഴുകുതിരി പ്രദക്ഷിണവും ദിവ്യകാരുണ്യ ആശീർവാദവും."
  },
  {
    id: 8,
    title_en: "Feast of St. Teresa of Avila",
    title_ml: "വിശുദ്ധ അമ്മത്രേസ്യായുടെ തിരുനാൾ",
    target_date: "2026-10-15",
    mass_time: "6:30 AM & 6:00 PM",
    type_badge: "Feast",
    location: "Main Sanctuary",
    description_en: "Solemn Feast of St. Teresa of Avila, Doctor of the Church.",
    description_ml: "വേദപാരംഗതയായ വിശുദ്ധ അമ്മത്രേസ്യായുടെ തിരുനാൾ ആഘോഷം."
  },
  {
    id: 9,
    title_en: "Parish Assembly & Family Unit Meet",
    title_ml: "ഇടവക പൊതുയോഗം & കുടുംബ കൂട്ടായ്മ",
    target_date: "2026-10-25",
    mass_time: "11:30 AM",
    type_badge: "Event",
    location: "Parish Hall",
    description_en: "General body meeting of all parishioners and ward unit leaders.",
    description_ml: "എല്ലാ ഇടവകാംഗങ്ങളുടെയും കുടുംബ യൂണിറ്റ് ഭാരവാഹികളുടെയും സംയുക്ത പൊതുയോഗം."
  }
];

export default function FeastCalendarScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t: originalT } = useLanguage();
  
  const [feasts, setFeasts] = useState<any[]>(fallbackFeasts);
  const [calendarDataMap, setCalendarDataMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dynamic Month/Year States (Loads current month/year/day)
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [showAllEvents, setShowAllEvents] = useState(false);

  // 2. Persistent language state switch hook
  const [calLang, setCalLang] = useState<'en' | 'ml'>('en');

  useEffect(() => {
    const initCalLang = async () => {
      try {
        const saved = await SecureStore.getItemAsync('calendar_lang') || localStorage.getItem('calendar_lang');
        if (saved === 'ml' || saved === 'en') {
          setCalLang(saved as 'en' | 'ml');
        }
      } catch (_) {}
    };
    initCalLang();
  }, []);

  const handleLangToggle = async (langVal: 'en' | 'ml') => {
    setCalLang(langVal);
    try {
      await SecureStore.setItemAsync('calendar_lang', langVal);
      localStorage.setItem('calendar_lang', langVal);
    } catch (_) {}
  };

  const t = (key: string): string => {
    const mlDict: Record<string, string> = {
      'calendar-title': 'ഇടവക കലണ്ടർ',
      'calendar-subtext': 'വരുന്ന തിരുനാളുകളും പരിപാടികളും',
      'events-on': 'പരിപാടികൾ: ',
      'events-count': 'എണ്ണം',
      'see-all': 'എല്ലാം കാണുക'
    };
    const enDict: Record<string, string> = {
      'calendar-title': 'Parish Calendar',
      'calendar-subtext': 'Upcoming Feasts & Events',
      'events-on': 'Events on ',
      'events-count': 'events',
      'see-all': 'See All'
    };
    if (calLang === 'ml') {
      return mlDict[key] || originalT(key);
    }
    return enDict[key] || originalT(key);
  };

  const getDayLiturgicalData = (dateStr: string) => {
    if (calendarDataMap[dateStr]) {
      return calendarDataMap[dateStr];
    }
    return dailyReadings[dateStr] || null;
  };

  const fetchFeasts = async () => {
    let token = null;
    try {
      token = await SecureStore.getItemAsync('user_token') || localStorage.getItem('user_token');
    } catch (_) {
      try { token = localStorage.getItem('user_token'); } catch (__) {}
    }

    try {
      // 1. Safe parsing of Events API
      const response = await apiFetch(`${API_BASE_URL}/api/events`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const eventList = Array.isArray(data) 
          ? data 
          : (Array.isArray(data?.events) 
              ? data.events 
              : (Array.isArray(data?.data) 
                  ? data.data 
                  : []));
        setFeasts(eventList.length > 0 ? eventList : fallbackFeasts);
      } else {
        throw new Error('Events API error');
      }
    } catch (error) {
      console.warn('Backend offline or events API unavailable, using fallback feast data.', error);
      setFeasts(fallbackFeasts);
    }

    // 2. Fetch Liturgical Calendar / Readings API with fallback
    try {
      const calResponse = await apiFetch(`${API_BASE_URL}/api/calendar`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (calResponse.ok) {
        const calData = await calResponse.json();
        const list = Array.isArray(calData) 
          ? calData 
          : (Array.isArray(calData?.days) ? calData.days : (Array.isArray(calData?.calendar) ? calData.calendar : []));
        if (list.length > 0) {
          const map: Record<string, any> = {};
          list.forEach((item: any) => {
            const dStr = item.dateString || item.date || item.target_date;
            if (dStr) {
              const norm = normalizeDateStr(dStr);
              if (norm) map[norm] = item;
            }
          });
          setCalendarDataMap(map);
        }
      }
    } catch (calError) {
      console.warn('Calendar API unavailable, hydrating from local liturgical dataset.', calError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeasts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeasts();
  };

  // Month navigation controllers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(1);
  };

  // Helper logic to find active events for grid cell marking
  const getCellEvents = (day: number) => {
    const mmDd = String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${mmDd}`;
    
    const hasHoliday = publicHolidays[mmDd] !== undefined;
    
    const dayData = getDayLiturgicalData(dateStr);
    const hasDatasetFeast = dayData?.isHolyDayOfObligation || 
      (dayData?.occasions && dayData.occasions.some((o: any) => 
        /feast|solemnity|commemoration|memorial|തിരുനാൾ/i.test(o.name_en || o.name_ml || '')
      ));
    const hasLiturgical = liturgicalFeasts[mmDd] !== undefined || getLentInfo(currentMonth + 1, day) !== null || Boolean(hasDatasetFeast);
    
    const hasDbEvent = feasts.some(e =>
      matchesDay(e.target_date || e.event_date || e.date, currentYear, currentMonth + 1, day)
    );

    return { hasHoliday, hasLiturgical, hasDbEvent };
  };

  // Compile combined events array (National Holidays + Liturgical Feasts + Database Events + Daily Scripture Readings)
  const getCombinedEventsForDay = (day: number) => {
    const mmDd = String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${mmDd}`;
    const combined: any[] = [];

    // 1. National Holiday
    if (publicHolidays[mmDd]) {
      combined.push({
        id: `holiday-${mmDd}`,
        title_en: publicHolidays[mmDd].en,
        title_ml: publicHolidays[mmDd].ml,
        type_badge: calLang === 'ml' ? 'അവധി' : 'Holiday',
        isHoliday: true,
        mass_time: calLang === 'ml' ? 'പൊതു അവധി' : 'Public Holiday',
        location: '',
        event_date: dateStr,
        description_en: 'National/Public Holiday',
        description_ml: 'ദേശീയ / പൊതു അവധി ദിനം',
        readings: []
      });
    }

    // 2. Liturgical Feast
    if (liturgicalFeasts[mmDd]) {
      combined.push({
        id: `liturgical-${mmDd}`,
        title_en: liturgicalFeasts[mmDd].en,
        title_ml: liturgicalFeasts[mmDd].ml,
        type_badge: calLang === 'ml' ? 'തിരുനാൾ' : 'Feast',
        isLiturgical: true,
        mass_time: calLang === 'ml' ? 'തിരുക്കർമ്മങ്ങൾ' : 'Solemn Liturgy',
        location: calLang === 'ml' ? 'പ്രധാന അൾത്താര' : 'Main Sanctuary',
        event_date: dateStr,
        description_en: 'Syro-Malabar Liturgical Feast',
        description_ml: 'സീറോ മലബാർ തിരുനാൾ സ്മരണ',
        readings: []
      });
    }

    // 3. Liturgical Lent/Fast
    const lent = getLentInfo(currentMonth + 1, day);
    if (lent) {
      combined.push({
        id: `lent-${mmDd}`,
        title_en: lent.en,
        title_ml: lent.ml,
        type_badge: calLang === 'ml' ? 'നോമ്പ്' : 'Lent',
        isLiturgical: true,
        mass_time: calLang === 'ml' ? 'ഉപവാസക്കാലം' : 'Liturgical Season',
        location: '',
        event_date: dateStr,
        description_en: 'Syro-Malabar Fasting/Lent Range',
        description_ml: 'സീറോ മലബാർ ഉപവാസ / നോമ്പുകാലം',
        readings: []
      });
    }

    // 4. Custom Database events
    const dbEvents = feasts.filter(e =>
      matchesDay(e.target_date || e.event_date || e.date, currentYear, currentMonth + 1, day)
    );

    dbEvents.forEach(e => {
      const dbReadings = normalizeReadings(e.readings, e.readings_en, e.readings_ml);
      combined.push({
        id: `db-${e.id || e._id || Math.random()}`,
        title_en: e.title_en || e.title,
        title_ml: e.title_ml || e.title || '',
        type_badge: e.type_badge || (calLang === 'ml' ? 'ഇടവക പരിപാടി' : 'Parish Event'),
        isDbEvent: true,
        mass_time: e.mass_time || '',
        location: e.location || (calLang === 'ml' ? 'പ്രധാന ദേവാലയം' : 'Main Sanctuary'),
        event_date: e.target_date || e.event_date || e.date || dateStr,
        description_en: e.description_en || e.description || '',
        description_ml: e.description_ml || e.description || '',
        readings: dbReadings
      });
    });

    // 5. Liturgical Calendar Occasions & Daily Scripture Readings
    const dayData = getDayLiturgicalData(dateStr);
    if (dayData) {
      // Backend format (e.g. feastName, season, readings)
      if (dayData.feastName || (dayData.readings && dayData.readings.length > 0)) {
        const backendReadings = normalizeReadings(dayData.readings);
        const feastTitleEn = dayData.feastName || dayData.title || dayData.season || 'Daily Bible Readings';
        const feastTitleMl = dayData.feastNameMl || dayData.titleMl || dayData.seasonMl || 'തിരുവചന വായനകൾ';
        
        const alreadyHasFeast = combined.some(c => 
          c.title_en?.toLowerCase() === feastTitleEn.toLowerCase() ||
          c.title_ml?.toLowerCase() === feastTitleMl.toLowerCase()
        );

        if (!alreadyHasFeast || backendReadings.length > 0) {
          combined.push({
            id: `cal-backend-${dateStr}`,
            title_en: feastTitleEn,
            title_ml: feastTitleMl,
            type_badge: backendReadings.length > 0 
              ? (calLang === 'ml' ? 'ബൈബിൾ വായനകൾ' : 'Scripture Readings')
              : (calLang === 'ml' ? 'തിരുനാൾ' : 'Liturgical'),
            isLiturgical: true,
            isReading: backendReadings.length > 0,
            mass_time: dayData.season || (calLang === 'ml' ? 'ദൈനംദിന വായന' : 'Liturgy of the Word'),
            location: '',
            event_date: dateStr,
            description_en: dayData.season ? `Season: ${dayData.season}` : 'Daily Liturgical Scripture',
            description_ml: dayData.seasonMl ? `കാലം: ${dayData.seasonMl}` : 'ദൈനംദിന തിരുവചന വായനകൾ',
            readings: backendReadings
          });
        }
      }

      // Local daily-readings.json format (occasions)
      if (dayData.occasions && Array.isArray(dayData.occasions)) {
        dayData.occasions.forEach((occ: any, occIdx: number) => {
          const occReadings = normalizeReadings(occ.readings);
          const rawNameEn = (occ.name_en || '').replace(/\t+/g, ' ').trim();
          const rawNameMl = (occ.name_ml || occ.name_en || '').replace(/\t+/g, ' ').trim();
          
          if (!rawNameEn) return;

          // Check if this occasion name is already represented
          const existingItem = combined.find(c => 
            c.title_en?.toLowerCase().includes(rawNameEn.toLowerCase()) ||
            rawNameEn.toLowerCase().includes(c.title_en?.toLowerCase())
          );

          if (existingItem) {
            if (occReadings.length > 0 && (!existingItem.readings || existingItem.readings.length === 0)) {
              existingItem.readings = occReadings;
            }
          } else {
            const isSignificant = occReadings.length > 0 || 
              /saint|st\.|feast|martyr|apostle|virgin|prophet|പരിശുദ്ധ|വിശുദ്ധ|തിരുനാൾ/i.test(rawNameEn);

            if (isSignificant) {
              combined.push({
                id: `cal-occ-${dateStr}-${occIdx}`,
                title_en: rawNameEn,
                title_ml: rawNameMl || rawNameEn,
                type_badge: occReadings.length > 0
                  ? (calLang === 'ml' ? 'ബൈബിൾ വായനകൾ' : 'Scripture Readings')
                  : (calLang === 'ml' ? 'തിരുനാൾ' : 'Feast Day'),
                isLiturgical: true,
                isReading: occReadings.length > 0,
                mass_time: calLang === 'ml' ? 'തിരുവചന ശുശ്രൂഷ' : 'Liturgy of the Word',
                location: '',
                event_date: dateStr,
                description_en: occReadings.length > 0 ? 'Daily Scripture & Readings' : 'Liturgical Commemoration',
                description_ml: occReadings.length > 0 ? 'ദൈനംദിന തിരുവചന വായനകൾ' : 'തിരുനാൾ അനുസ്മരണം',
                readings: occReadings
              });
            }
          }
        });
      }
    }

    return combined;
  };

  // Generate dynamic calendar days list
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const getEventsForMonth = () => {
    let allEvents: any[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      allEvents.push(...getCombinedEventsForDay(d));
    }
    return allEvents;
  };

  const displayedEvents = showAllEvents ? getEventsForMonth() : (selectedDay ? getCombinedEventsForDay(selectedDay) : []);

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ day: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d });
  }
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({ day: null });
  }

  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  // Month rendering translation helpers
  const getMonthAbbr = (dateStr: string) => {
    if (!dateStr) return 'JUN';
    try {
      const parts = dateStr.split('T')[0].split('-');
      const m = parseInt(parts[1], 10);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return months[m - 1] || 'JUN';
    } catch (_) {
      return 'JUN';
    }
  };

  const getDayStr = (dateStr: string) => {
    if (!dateStr) return '07';
    try {
      const parts = dateStr.split('T')[0].split('-');
      return parts[2] ? parts[2].padStart(2, '0') : '07';
    } catch (_) {
      return '07';
    }
  };

  const getMonthTitle = () => {
    return `${monthsDict[calLang][currentMonth]} ${currentYear}`;
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        
        {/* Top Header Row with Chevron Back Button & Title Accent & Language Switch */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('Home')}
            accessibilityLabel="Go back to Home"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.mainTitle}>{t('calendar-title')}</Text>
            <Text style={styles.siennaSubtext}>{t('calendar-subtext')}</Text>
            <View style={styles.goldLine} />
          </View>
          
          {/* Language Switch Selector */}
          <View style={styles.langToggleContainer}>
            <TouchableOpacity 
              style={[styles.langToggleBtn, calLang === 'en' && styles.langToggleBtnActive]} 
              onPress={() => handleLangToggle('en')}
            >
              <Text style={[styles.langToggleText, calLang === 'en' && styles.langToggleTextActive]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.langToggleBtn, calLang === 'ml' && styles.langToggleBtnActive]} 
              onPress={() => handleLangToggle('ml')}
            >
              <Text style={[styles.langToggleText, calLang === 'ml' && styles.langToggleTextActive]}>മലയാളം</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Responsive Monthly Calendar Grid Wrapper */}
        <View style={[globalStyles.card, styles.calendarCard]}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              onPress={handlePrevMonth} 
              style={styles.monthNavBtn}
              accessibilityLabel="Previous month"
            >
              <Ionicons name="chevron-back" size={20} color={colors.darkGold} />
            </TouchableOpacity>
            
            <Text style={styles.calendarMonthTitle}>{getMonthTitle()}</Text>
            
            <TouchableOpacity 
              onPress={handleNextMonth} 
              style={styles.monthNavBtn}
              accessibilityLabel="Next month"
            >
              <Ionicons name="chevron-forward" size={20} color={colors.darkGold} />
            </TouchableOpacity>
            
            <View style={styles.eventsBadge}>
              <Text style={styles.eventsBadgeText}>
                {feasts.length} {t('events-count')}
              </Text>
            </View>
          </View>

          {/* Days of Week Header Row */}
          <View style={styles.daysOfWeekRow}>
            {weekdaysDict[calLang].map((day, idx) => (
              <Text key={idx} style={styles.dayOfWeekText}>{day}</Text>
            ))}
          </View>

          {/* Calendar Days Matrix */}
          <View style={styles.daysMatrix}>
            {weeks.map((week, weekIdx) => (
              <View key={weekIdx} style={styles.weekRow}>
                {week.map((item, idx) => {
                  const isSelected = item.day === selectedDay && !showAllEvents;
                  const markers = getCellEvents(item.day || 0);
                  const hasAny = item.day && (markers.hasHoliday || markers.hasLiturgical || markers.hasDbEvent);
                  
                  return (
                    <TouchableOpacity
                      key={idx}
                      disabled={!item.day}
                      style={[
                        styles.dayCell,
                        isSelected ? styles.dayCellSelected : null,
                        (hasAny && !isSelected) ? styles.dayCellWithEvent : null
                      ]}
                      onPress={() => {
                        if (item.day) {
                          setSelectedDay(item.day);
                          setShowAllEvents(false);
                        }
                      }}
                    >
                      {item.day ? (
                        <>
                          <Text style={[
                            styles.dayText,
                            isSelected ? styles.dayTextSelected : null,
                            (hasAny && !isSelected) ? styles.dayTextWithEvent : null
                          ]}>
                            {item.day}
                          </Text>
                          {/* Layered Visual Markers Row */}
                          <View style={styles.markersContainer}>
                            {markers.hasHoliday && <View style={[styles.markerDot, styles.holidayMarker, isSelected && styles.markerSelected]} />}
                            {markers.hasLiturgical && <View style={[styles.markerDot, styles.liturgicalMarker, isSelected && styles.markerSelected]} />}
                            {markers.hasDbEvent && <View style={[styles.markerDot, styles.dbEventMarker, isSelected && styles.markerSelected]} />}
                          </View>
                        </>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Selected Date Header and See All Toggle Link */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.eventsHeading}>
            {showAllEvents 
              ? (calLang === 'ml' ? 'ഈ മാസത്തെ പ്രധാന വിവരങ്ങൾ' : 'Calendar Overview') 
              : `${t('events-on')}${monthsDict[calLang][currentMonth]} ${selectedDay}`}
          </Text>
          <TouchableOpacity onPress={() => setShowAllEvents(!showAllEvents)} style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>
              {showAllEvents 
                ? `${monthsDict[calLang][currentMonth]} ${selectedDay}` 
                : t('see-all')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Display Event Cards */}
        <View style={styles.eventList}>
          {displayedEvents.map((feastItem, index) => {
            const dateBadgeBg = feastItem.isHoliday 
              ? '#ff5c5c' 
              : (feastItem.isReading 
                  ? '#7c3aed' 
                  : (feastItem.isLiturgical ? '#3b82f6' : colors.darkGold));
            const titleText = calLang === 'ml' 
              ? (feastItem.title_ml || feastItem.title_en) 
              : (feastItem.title_en || feastItem.title_ml);
            const descriptionText = calLang === 'ml' 
              ? (feastItem.description_ml || feastItem.description_en) 
              : (feastItem.description_en || feastItem.description_ml);
            
            return (
              <View key={feastItem.id || index} style={[globalStyles.card, styles.eventCard]}>
                
                {/* Liturgical Colored Date Badge on left margin */}
                <View style={[styles.cardDateBadge, { backgroundColor: dateBadgeBg }]}>
                  <Text style={styles.cardDateDay}>{getDayStr(feastItem.event_date)}</Text>
                  <Text style={styles.cardDateMonth}>{getMonthAbbr(feastItem.event_date)}</Text>
                </View>

                {/* Right side event contents */}
                <View style={styles.cardInfoCol}>
                  <View style={styles.cardBadgeRow}>
                    <View style={[
                      styles.typeBadgeContainer, 
                      feastItem.isHoliday && styles.typeBadgeHoliday, 
                      feastItem.isLiturgical && styles.typeBadgeLiturgical,
                      feastItem.isReading && styles.typeBadgeReading
                    ]}>
                      <Text style={[
                        styles.typeBadgeText, 
                        feastItem.isHoliday && styles.typeTextHoliday, 
                        feastItem.isLiturgical && styles.typeTextLiturgical,
                        feastItem.isReading && styles.typeTextReading
                      ]}>
                        {feastItem.type_badge}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.eventTitle}>{titleText}</Text>

                  {/* Icon details row */}
                  {feastItem.mass_time ? (
                    <View style={styles.iconDetailRow}>
                      <Ionicons name="time-outline" size={15} color={colors.mutedBrown} />
                      <Text style={styles.iconDetailText}>{feastItem.mass_time}</Text>
                    </View>
                  ) : null}

                  {feastItem.location ? (
                    <View style={styles.iconDetailRow}>
                      <Ionicons name="location-outline" size={15} color={colors.mutedBrown} />
                      <Text style={styles.iconDetailText}>{feastItem.location}</Text>
                    </View>
                  ) : null}

                  {descriptionText ? (
                    <Text style={styles.eventDescription}>{descriptionText}</Text>
                  ) : null}

                  {/* Scripture / Bible Readings Section */}
                  {feastItem.readings && feastItem.readings.length > 0 && (
                    <View style={styles.readingsContainer}>
                      <View style={styles.readingsHeaderRow}>
                        <Ionicons name="book-outline" size={15} color={colors.darkGold} style={{ marginRight: 6 }} />
                        <Text style={styles.readingsHeaderText}>
                          {calLang === 'ml' ? 'തിരുവചന വായനകൾ' : 'Scripture Readings'}
                        </Text>
                      </View>
                      
                      {feastItem.readings.map((readingItem: any, rIdx: number) => {
                        const citation = calLang === 'ml' 
                          ? (readingItem.citation_ml || readingItem.citation_en) 
                          : (readingItem.citation_en || readingItem.citation_ml);
                        const desc = calLang === 'ml' 
                          ? (readingItem.description_ml || readingItem.description_en) 
                          : (readingItem.description_en || readingItem.description_ml);

                        return (
                          <View key={rIdx} style={styles.readingRow}>
                            <Ionicons name="bookmark-outline" size={13} color={colors.primary} style={{ marginTop: 2, marginRight: 6 }} />
                            <View style={styles.readingContent}>
                              <Text style={styles.readingCitation}>{citation}</Text>
                              {desc ? (
                                <Text style={styles.readingDescription}>{desc}</Text>
                              ) : null}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

              </View>
            );
          })}

          {displayedEvents.length === 0 && (
            <Text style={styles.noEventsText}>
              {calLang === 'ml'
                ? "ഈ ദിവസത്തിൽ ഇടവക / തിരുക്കർമ്മ പരിപാടികൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല."
                : "No parish or liturgical events registered for this day."}
            </Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // accommodate bottom navigation and FAB spacing
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  headerTextContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
  },
  siennaSubtext: {
    fontSize: 14,
    color: colors.mediumBrown,
    marginTop: 4,
    fontStyle: 'italic',
  },
  goldLine: {
    height: 3,
    backgroundColor: colors.primary,
    width: 60,
    marginTop: 10,
    borderRadius: 1.5,
  },
  langToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    marginLeft: 8,
    marginTop: 4,
  },
  langToggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langToggleBtnActive: {
    backgroundColor: colors.darkGold,
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.mediumBrown,
  },
  langToggleTextActive: {
    color: '#ffffff',
  },

  // Calendar container styling
  calendarCard: {
    padding: 20,
    borderColor: colors.border,
    borderWidth: 1.5,
    backgroundColor: colors.card,
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  calendarMonthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
    textAlign: 'center',
    flex: 1,
  },
  eventsBadge: {
    backgroundColor: isDark ? '#2c2c2c' : '#f5eedc',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventsBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.darkGold,
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6d6',
    paddingBottom: 8,
    marginBottom: 8,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.mutedBrown,
  },
  daysMatrix: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: colors.darkGold,
  },
  dayCellWithEvent: {
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderColor: isDark ? '#2c2c2c' : '#f0e6d6',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dayTextWithEvent: {
    color: colors.darkGold,
    fontWeight: 'bold',
  },
  markersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
    height: 6,
    width: '100%',
  },
  markerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  holidayMarker: {
    backgroundColor: '#ff5c5c',
  },
  liturgicalMarker: {
    backgroundColor: '#3b82f6',
  },
  dbEventMarker: {
    backgroundColor: '#c9a84c',
  },
  markerSelected: {
    backgroundColor: '#ffffff',
  },

  // Events header row
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  eventsHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
  },
  seeAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Event Card list style
  eventList: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    padding: 0,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 120,
    backgroundColor: colors.card,
  },
  cardDateBadge: {
    width: 76,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardDateDay: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 28,
  },
  cardDateMonth: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
    marginTop: 2,
  },
  cardInfoCol: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  cardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: isDark ? '#2c2c2c' : '#f5eedc',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeBadgeHoliday: {
    backgroundColor: 'rgba(255, 92, 92, 0.1)',
    borderColor: '#ff5c5c',
  },
  typeBadgeLiturgical: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.darkGold,
  },
  typeTextHoliday: {
    color: '#ff5c5c',
  },
  typeTextLiturgical: {
    color: '#3b82f6',
  },
  typeBadgeReading: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderColor: '#7c3aed',
  },
  typeTextReading: {
    color: '#7c3aed',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    lineHeight: 21,
    marginBottom: 6,
  },
  iconDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  iconDetailText: {
    fontSize: 13,
    color: colors.mediumBrown,
    marginLeft: 6,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 8,
    fontStyle: 'italic',
  },
  readingsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#2c2c2c' : '#f0e6d6',
  },
  readingsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  readingsHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.darkGold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    paddingVertical: 2,
  },
  readingContent: {
    flex: 1,
  },
  readingCitation: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: colors.primary,
  },
  readingDescription: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 1,
  },
  noEventsText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  }
});
