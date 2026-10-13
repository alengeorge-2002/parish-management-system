import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { Ionicons } from '@expo/vector-icons';

export default function MassTimingsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t } = useLanguage();

  const sundaySchedules = [
    t('sun-slot-1'),
    t('sun-slot-2'),
    t('sun-slot-3'),
    t('sun-slot-4'),
    t('sun-slot-5')
  ];

  const weekdaySchedules = [
    t('week-slot-1'),
    t('week-slot-2'),
    t('week-slot-3')
  ];

  const specialDevotions = [
    t('dev-slot-1'),
    t('dev-slot-2')
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={globalStyles.container} showsVerticalScrollIndicator={false}>

      
      {/* 4. Top-Left Chevron-Left Back Button and Title Header */}
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
          <Text style={styles.mainTitle}>{t('mass-timings-title')}</Text>
          <Text style={styles.siennaSubtext}>{t('holy-mass-schedule')}</Text>
          <View style={styles.goldLine} />
        </View>
      </View>

      {/* 6. Sunday Mass Section Header (small-caps muted sienna) */}
      <Text style={styles.sectionHeader}>{t('sunday-mass-header').toUpperCase()}</Text>
      
      {/* 7. Sunday Mass List Cards */}
      <View style={styles.listContainer}>
        {sundaySchedules.map((slot, index) => {
          const cardBg = isDark
            ? (index % 2 === 0 ? colors.card : '#252525')
            : (index % 2 === 0 ? '#ffffff' : '#fffdf4');
          return (
            <View 
              key={index} 
              style={[styles.scheduleCard, { backgroundColor: cardBg }]}
            >
              <View style={styles.iconBox}>
                <Ionicons name="time-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.scheduleText}>{slot}</Text>
            </View>
          );
        })}
      </View>

      {/* 8. Weekday Mass Section Header */}
      <Text style={styles.sectionHeader}>{t('weekday-mass-header').toUpperCase()}</Text>
      
      {/* 9. Weekday Mass List Cards */}
      <View style={styles.listContainer}>
        {weekdaySchedules.map((slot, index) => {
          const cardBg = isDark
            ? (index % 2 === 0 ? colors.card : '#252525')
            : (index % 2 === 0 ? '#ffffff' : '#fffdf4');
          return (
            <View 
              key={index} 
              style={[styles.scheduleCard, { backgroundColor: cardBg }]}
            >
              <View style={styles.iconBox}>
                <Ionicons name="calendar-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.scheduleText}>{slot}</Text>
            </View>
          );
        })}
      </View>

      {/* 10. Special Devotions Section Header */}
      <Text style={styles.sectionHeader}>{t('special-devotions-header').toUpperCase()}</Text>
      
      {/* 11. Special Devotions Cards */}
      <View style={styles.listContainer}>
        {specialDevotions.map((slot, index) => {
          const cardBg = isDark
            ? (index % 2 === 0 ? colors.card : '#252525')
            : (index % 2 === 0 ? '#ffffff' : '#fffdf4');
          return (
            <View 
              key={index} 
              style={[styles.scheduleCard, { backgroundColor: cardBg }]}
            >
              <View style={styles.iconBox}>
                <Ionicons name="time-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.scheduleText}>{slot}</Text>
            </View>
          );
        })}
      </View>

      {/* 12. Bottom Banner Card (Sunday Live Stream with gold live badge) */}
      <View style={[globalStyles.card, styles.liveStreamCard]}>
        <View style={styles.liveStreamHeader}>
          <Ionicons name="logo-youtube" size={24} color={colors.foreground} style={styles.youtubeIcon} />
          <Text style={styles.liveStreamTitle}>{t('livestream-title')}</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>{t('live-badge')}</Text>
          </View>
        </View>
        <Text style={styles.liveStreamDesc}>{t('livestream-desc')}</Text>
      </View>

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
    marginBottom: 12,
    marginTop: 16,
  },
  listContainer: {
    gap: 10,
    marginBottom: 16,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16, // Globally exactly 16px corner radius
    padding: 16,
    minHeight: 64, // Senior touch target [60, 75] px
    ...Platform.select({
      web: { boxShadow: '0 2px 6px rgba(61,43,31,0.02)' }
    })
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scheduleText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.foreground,
    lineHeight: 20,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  
  // Live Stream Banner styling
  liveStreamCard: {
    marginTop: 16,
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
  },
  liveStreamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  youtubeIcon: {
    marginRight: 10,
  },
  liveStreamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    flex: 1,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
  },
  liveBadge: {
    backgroundColor: '#a37a3e', // gold live badge matching theme
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  liveBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  liveStreamDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.mediumBrown,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
});
