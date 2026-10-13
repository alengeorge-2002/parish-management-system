import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, typography } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';

export default function ServicesScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t } = useLanguage();
  const [countdownText, setCountdownText] = useState('...');

  // Live countdown logic to find the next scheduled Holy Mass
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const day = now.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday

      // Mass schedules
      // Sunday: 8:00 AM, 10:00 AM, 5:30 PM (17:30)
      // Mon-Sat: 7:00 AM
      const massSchedules: { day: number; hour: number; minute: number }[] = [];

      // Mon-Sat at 7:00 AM
      for (let i = 1; i <= 6; i++) {
        massSchedules.push({ day: i, hour: 7, minute: 0 });
      }
      // Sunday Masses
      massSchedules.push({ day: 0, hour: 8, minute: 0 });
      massSchedules.push({ day: 0, hour: 10, minute: 0 });
      massSchedules.push({ day: 0, hour: 17, minute: 30 });

      let minDiff = Infinity;
      let nextMass = null;

      massSchedules.forEach(schedule => {
        let diffDays = schedule.day - day;
        if (diffDays < 0) diffDays += 7;

        const scheduleTime = new Date(now);
        scheduleTime.setDate(now.getDate() + diffDays);
        scheduleTime.setHours(schedule.hour, schedule.minute, 0, 0);

        let diffMs = scheduleTime.getTime() - now.getTime();
        // If the mass is today but already passed, push it to next week
        if (diffMs <= 0) {
          scheduleTime.setDate(scheduleTime.getDate() + 7);
          diffMs = scheduleTime.getTime() - now.getTime();
        }

        if (diffMs < minDiff) {
          minDiff = diffMs;
          nextMass = scheduleTime;
        }
      });

      if (nextMass) {
        const diffSecs = Math.floor(minDiff / 1000);
        const hours = Math.floor(diffSecs / 3600);
        const mins = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;

        const hrStr = hours > 0 ? `${hours}h ` : '';
        const minStr = `${mins}m `;
        const secStr = `${secs}s`;
        setCountdownText(`${hrStr}${minStr}${secStr}`);
      } else {
        setCountdownText('--');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleItemPress = (title: string, desc: string) => {
    Alert.alert(title, desc);
  };

  const handleGivingPress = () => {
    Alert.alert(t('donations-and-offerings'), `${t('giving-options-desc')}...`);
  };

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
        <Text style={styles.countdownSubtitle}>{t('todays-mass-label').toUpperCase()}</Text>
        <Text style={styles.countdownTitle}>{t('todays-mass')}</Text>
        <View style={styles.countdownTimerBox}>
          <Text style={styles.countdownLabel}>NEXT HOLY MASS IN:</Text>
          <Text style={styles.countdownTimer}>{countdownText}</Text>
        </View>
      </View>

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
