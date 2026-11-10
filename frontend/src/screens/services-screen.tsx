import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { API_BASE_URL, apiFetch } from '../config';

interface MassTimingItem {
  id: string;
  time: string;
  language: string;
  celebrant: string;
  notes?: string;
}

interface ScriptureReadingItem {
  reading: string;
  citation: string;
}

interface DayScheduleState {
  schedule_date: string;
  feast_title: string;
  feast_title_ml?: string;
  liturgical_season: string;
  mass_timings: MassTimingItem[];
  scripture_readings: ScriptureReadingItem[];
}

const DEFAULT_MASSES: MassTimingItem[] = [
  { id: 'm1', time: '06:30 AM', language: 'Malayalam', celebrant: 'Parish Priest', notes: '' },
  { id: 'm2', time: '06:00 PM', language: 'Malayalam', celebrant: 'Parish Priest', notes: '' },
];

const getLocalDateStr = (d = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseMassTimeMinutes = (timeStr: string): number | null => {
  const clean = (timeStr || '').trim().toUpperCase();
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const min = parseInt(match12[2], 10);
    const period = match12[3];
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  }
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
  }
  return null;
};

export default function ServicesScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t, language: lang } = useLanguage();
  const [countdownText, setCountdownText] = useState('...');
  const [nextMassLabel, setNextMassLabel] = useState('');
  const [todaySchedule, setTodaySchedule] = useState<DayScheduleState>(() => ({
    schedule_date: getLocalDateStr(),
    feast_title: 'Ferial day — no major feast',
    feast_title_ml: '',
    liturgical_season: 'Ordinary',
    mass_timings: DEFAULT_MASSES,
    scripture_readings: [],
  }));
  const [tomorrowMasses, setTomorrowMasses] = useState<MassTimingItem[]>(DEFAULT_MASSES);

  const loadTodaySchedule = useCallback(async () => {
    try {
      const today = new Date();
      const todayStr = getLocalDateStr(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowStr = getLocalDateStr(tomorrow);

      const [todayRes, tomorrowRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/api/calendar/day?date=${todayStr}`),
        apiFetch(`${API_BASE_URL}/api/calendar/day?date=${tomorrowStr}`).catch(() => null),
      ]);

      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodaySchedule({
          schedule_date: data.schedule_date || todayStr,
          feast_title: data.feast_title || 'Ferial day — no major feast',
          feast_title_ml: data.feast_title_ml || '',
          liturgical_season: data.liturgical_season || 'Ordinary',
          mass_timings: Array.isArray(data.mass_timings) ? data.mass_timings : DEFAULT_MASSES,
          scripture_readings: Array.isArray(data.scripture_readings) ? data.scripture_readings : [],
        });
      }

      if (tomorrowRes && tomorrowRes.ok) {
        const tData = await tomorrowRes.json();
        if (Array.isArray(tData.mass_timings) && tData.mass_timings.length > 0) {
          setTomorrowMasses(tData.mass_timings);
        }
      }
    } catch (err) {
      console.warn('Could not load daily calendar schedule, using default masses:', err);
    }
  }, []);

  useEffect(() => {
    loadTodaySchedule();
    const unsubscribe = navigation?.addListener?.('focus', () => {
      loadTodaySchedule();
    });
    return unsubscribe;
  }, [loadTodaySchedule, navigation]);

  // Live countdown computed dynamically from today's (or tomorrow's) Mass timings
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const candidates: { target: Date; item: MassTimingItem }[] = [];

      (todaySchedule.mass_timings || []).forEach((item) => {
        const totalMins = parseMassTimeMinutes(item.time);
        if (totalMins === null) return;
        const target = new Date(now);
        target.setHours(Math.floor(totalMins / 60), totalMins % 60, 0, 0);
        if (target.getTime() > now.getTime()) {
          candidates.push({ target, item });
        }
      });

      if (candidates.length === 0) {
        (tomorrowMasses.length > 0 ? tomorrowMasses : DEFAULT_MASSES).forEach((item) => {
          const totalMins = parseMassTimeMinutes(item.time);
          if (totalMins === null) return;
          const target = new Date(now);
          target.setDate(now.getDate() + 1);
          target.setHours(Math.floor(totalMins / 60), totalMins % 60, 0, 0);
          candidates.push({ target, item });
        });
      }

      candidates.sort((a, b) => a.target.getTime() - b.target.getTime());

      if (candidates.length > 0) {
        const next = candidates[0];
        const minDiff = Math.max(0, next.target.getTime() - now.getTime());
        const diffSecs = Math.floor(minDiff / 1000);
        const hours = Math.floor(diffSecs / 3600);
        const mins = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;

        const hrStr = hours > 0 ? `${hours}h ` : '';
        const minStr = `${mins}m `;
        const secStr = `${secs}s`;
        setCountdownText(`${hrStr}${minStr}${secStr}`);
        setNextMassLabel(`${next.item.time} • ${next.item.language}`);
      } else {
        setCountdownText('--');
        setNextMassLabel('');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [todaySchedule.mass_timings, tomorrowMasses]);

  const handleItemPress = (title: string, desc: string) => {
    Alert.alert(title, desc);
  };

  const handleGivingPress = () => {
    Alert.alert(t('donations-and-offerings'), `${t('giving-options-desc')}...`);
  };

  const hasCustomFeast =
    todaySchedule.feast_title &&
    todaySchedule.feast_title.trim() !== 'Ferial day — no major feast';

  const sacraments = [
    { title: t('mass-timings'), desc: t('mass-timings-desc'), icon: "✠", screen: 'MassTimings' },
    { title: t('confession-timings'), desc: t('confession-desc'), icon: "✟" }
  ];

  const ministries = [
    { title: t('parish-announcements'), desc: t('announcement-desc'), icon: "🕪", screen: 'Announcements' }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={globalStyles.container} showsVerticalScrollIndicator={false}>

      {/* Fixed top header section with Cinzel font */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>{t('parish-services')}</Text>
        <Text style={styles.siennaSubtext}>{t('sacraments-ministries-support')}</Text>
        <View style={styles.goldLine} />
      </View>

      {/* 1. High-Contrast Mass Countdown Card */}
      <View style={styles.countdownCard}>
        <Text style={styles.countdownSubtitle}>
          {hasCustomFeast
            ? `${todaySchedule.liturgical_season.toUpperCase()} • ${
                lang === 'ml' && todaySchedule.feast_title_ml
                  ? todaySchedule.feast_title_ml
                  : todaySchedule.feast_title
              }`
            : t('todays-mass-label').toUpperCase()}
        </Text>
        <Text style={styles.countdownTitle}>{t('todays-mass')}</Text>
        <View style={styles.countdownTimerBox}>
          <Text style={styles.countdownLabel}>
            {nextMassLabel ? `NEXT HOLY MASS (${nextMassLabel.toUpperCase()}) IN:` : 'NEXT HOLY MASS IN:'}
          </Text>
          <Text style={styles.countdownTimer}>{countdownText}</Text>
        </View>
      </View>

      {/* 1b. Today's Mass Timings (Dynamic from Admin Dashboard) */}
      <Text style={styles.sectionHeader}>
        {lang === 'ml' ? 'ഇന്നത്തെ കുർബാന സമയങ്ങൾ' : "TODAY'S MASS TIMINGS"}
      </Text>
      <View style={styles.listContainer}>
        {todaySchedule.mass_timings.length > 0 ? (
          todaySchedule.mass_timings.map((mass, idx) => (
            <View
              key={mass.id || `${mass.time}-${idx}`}
              style={[
                styles.dynamicMassRow,
                idx === todaySchedule.mass_timings.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.massTimeBadge}>
                <Text style={styles.massTimeBadgeText}>{mass.time}</Text>
              </View>
              <View style={styles.listItemText}>
                <Text style={styles.listItemTitle}>
                  {mass.language} Holy Mass
                </Text>
                <Text style={styles.listItemDesc}>
                  {(mass.celebrant || 'Parish Priest').replace(/\bAssociate Pastor\b/gi, 'Assistant Vicar').replace(/\bSenior Pastor\b/gi, 'Vicar')}
                  {mass.notes ? ` • ${mass.notes}` : ''}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.dynamicEmptyBox}>
            <Text style={styles.listItemDesc}>
              {lang === 'ml' ? 'ഇന്ന് പ്രത്യേക കുർബാന ക്രമീകരണങ്ങളില്ല.' : 'No Masses scheduled for today.'}
            </Text>
          </View>
        )}
      </View>

      {/* 1c. Today's Scripture Readings (Dynamic from Admin Dashboard) */}
      {todaySchedule.scripture_readings.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>
            {lang === 'ml' ? 'ഇന്നത്തെ തിരുവചന വായനകൾ' : "TODAY'S SCRIPTURE READINGS"}
          </Text>
          <View style={styles.listContainer}>
            {todaySchedule.scripture_readings.map((item, idx) => (
              <View
                key={`${item.reading}-${idx}`}
                style={[
                  styles.readingRow,
                  idx === todaySchedule.scripture_readings.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.readingTypeLabel}>{item.reading.toUpperCase()}</Text>
                <Text style={styles.readingCitationText}>{item.citation}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* 2. Three-Section Itemized Lists */}

      {/* Section A: Sacraments */}
      <Text style={styles.sectionHeader}>{t('sacraments').toUpperCase()}</Text>
      <View style={styles.listContainer}>
        {sacraments.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.listItem}
            onPress={() => item.screen ? navigation.navigate(item.screen) : handleItemPress(item.title, item.desc)}
            accessibilityLabel={item.title}
            accessibilityRole="button"
          >
            <Text style={styles.listItemIcon}>{item.icon}</Text>
            <View style={styles.listItemText}>
              <Text style={styles.listItemTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.listItemDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.listArrow}>❯</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section B: Ministries */}
      <Text style={styles.sectionHeader}>{t('ministries').toUpperCase()}</Text>
      <View style={styles.listContainer}>
        {ministries.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.listItem}
            onPress={() => item.screen ? navigation.navigate(item.screen) : handleItemPress(item.title, item.desc)}
            accessibilityLabel={item.title}
            accessibilityRole="button"
          >
            <Text style={styles.listItemIcon}>{item.icon}</Text>
            <View style={styles.listItemText}>
              <Text style={styles.listItemTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.listItemDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.listArrow}>❯</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Giving Section */}
      <Text style={styles.sectionHeader}>{t('giving').toUpperCase()}</Text>
      <TouchableOpacity
        style={[globalStyles.card, styles.givingCard]}
        onPress={handleGivingPress}
        accessibilityLabel="Giving options"
        accessibilityRole="button"
      >
        <View style={styles.givingCardHeader}>
          <Text style={styles.givingTitle}>{t('donations-and-offerings')}</Text>
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineBadgeText}>{t('online').toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.givingDescription}>
          {t('giving-options-desc')}
        </Text>
      </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 1280, // fluid responsive layout up to 1280px width
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
  },
  siennaSubtext: {
    fontSize: 15,
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
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: colors.mediumBrown,
    marginBottom: 10,
    marginTop: 14,
  },

  // High-Contrast Countdown Card (Foreground dark background, gold text)
  countdownCard: {
    backgroundColor: colors.foreground, // walnut deep dark brown
    borderRadius: 16, // Globally exactly 16px corner radius
    padding: 20,
    marginBottom: 24,
    borderWidth: 2.5,
    borderColor: colors.primary, // gold border outline
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
      }
    })
  },
  countdownSubtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 4,
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  countdownTimerBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 220, 195, 0.2)',
    paddingTop: 14,
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.mutedBrown,
    letterSpacing: 1.5,
  },
  countdownTimer: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.primary, // liturgical gold timer text
    marginTop: 4,
  },

  // Itemized List Component styles (height 68px senior accessibility)
  listContainer: {
    backgroundColor: colors.card,
    borderRadius: 16, // Globally exactly 16px
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 68, // Senior accessibility height target [60, 75]
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  listItemIcon: {
    fontSize: 24,
    color: colors.primary,
    marginRight: 14,
    width: 28,
    textAlign: 'center',
  },
  listItemText: {
    flex: 1,
    justifyContent: 'center',
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  listItemDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  listArrow: {
    fontSize: 14,
    color: colors.border,
    marginLeft: 8,
  },

  // Giving section
  givingCard: {
    borderColor: colors.border,
    borderWidth: 2,
    marginTop: 4,
    padding: 16,
    height: 120, // appropriate size for container
  },
  dynamicMassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    gap: 14,
  },
  massTimeBadge: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 88,
    alignItems: 'center',
  },
  massTimeBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  dynamicEmptyBox: {
    padding: 16,
    alignItems: 'center',
  },
  readingRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  readingTypeLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    color: colors.darkGold || colors.primary,
    marginBottom: 3,
  },
  readingCitationText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  givingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  givingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    flex: 1,
  },
  onlineBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  onlineBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  givingDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
