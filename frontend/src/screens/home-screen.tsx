import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ImageBackground, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { globalStyles, colors, typography } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, apiFetch } from '../config';

export default function HomeScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const { language: lang, setLanguage: setLang, t } = useLanguage();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [upcomingFeasts, setUpcomingFeasts] = useState<any[]>([]);
  const [todayMassText, setTodayMassText] = useState<string>('');

  useEffect(() => {
    fetchAnnouncements();
    fetchUpcomingFeasts();
    fetchTodayMass();
  }, [lang]);

  const fetchTodayMass = async () => {
    let token = null;
    try {
      token = await SecureStore.getItemAsync('user_token') || localStorage.getItem('user_token');
    } catch (_) {
      try { token = localStorage.getItem('user_token'); } catch (__) {}
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/api/calendar/today`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          const timings = data.massTimings?.length
            ? data.massTimings.map((m: any) => m.time || m).join(' & ')
            : (data.mass_time || data.time || '');
          if (timings) {
            setTodayMassText(lang === 'ml' ? `ഇന്നത്തെ കുർബാന: ${timings}` : `Today's Mass: ${timings}`);
          }
        }
      }
    } catch (err) {
      console.warn('[HomeScreen] Today mass fetch error:', err);
    }
  };

  const fetchUpcomingFeasts = async () => {
    let token = null;
    try {
      token = await SecureStore.getItemAsync('user_token') || localStorage.getItem('user_token');
    } catch (_) {
      try { token = localStorage.getItem('user_token'); } catch (__) {}
    }

    let dbFeasts: any[] = [];
    try {
      // Fetch custom feasts/events from API
      const response = await apiFetch(`${API_BASE_URL}/api/events`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        dbFeasts = await response.json();
      }
    } catch (error) {
      console.warn('Backend offline, using empty list for DB feasts.', error);
    }

    const today = new Date();
    // Set hours to 0 to compare just the date part
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const candidates: any[] = [];

    // 1. Process Database Feasts
    dbFeasts.forEach((e: any) => {
      const dateVal = e.target_date || e.event_date;
      if (!dateVal) return;
      const eventDate = new Date(dateVal.split('T')[0]);
      if (eventDate >= todayStart) {
        candidates.push({
          date: eventDate,
          title: lang === 'ml' && e.title_ml ? e.title_ml : (e.title_en || e.title),
          subtitle: e.mass_time ? (lang === 'ml' ? `കുർബാന സമയം: ${e.mass_time}` : `Mass time: ${e.mass_time}`) : '',
        });
      }
    });

    // 2. Process Static Liturgical Feasts
    const staticFeastsList: Record<string, { en: string; ml: string }> = {
      '01-01': { en: "Naming of Our Lord", ml: "ഈശോയുടെ നാമകരണം" },
      '01-03': { en: "St. Kuriakose Chavara", ml: "വിശുദ്ധ ചാവറയച്ചൻ" },
      '01-06': { en: "Feast of Denha", ml: "ദനഹാ തിരുനാൾ" },
      '07-03': { en: "St. Thomas (Dukhrana)", ml: "വിശുദ്ധ തോമാശ്ലീഹ" },
      '08-15': { en: "Assumption of Mary", ml: "മാതാവിന്റെ സ്വർഗ്ഗാരോഹണം" },
      '09-08': { en: "Nativity of Our Lady", ml: "മാതാവിന്റെ ജനനപ്പെരുന്നാൾ" },
      '09-14': { en: "Exaltation of Holy Cross", ml: "കുരിശിന്റെ പുകഴ്ച" },
      '12-08': { en: "Immaculate Conception", ml: "അമലോത്ഭവ തിരുനാൾ" },
      '12-18': { en: "Cross of Mylapore", ml: "മൈലാപ്പൂർ കുരിശ്" },
      '12-25': { en: "Yeldho (Christmas)", ml: "ക്രിസ്തുമസ്" }
    };

    Object.entries(staticFeastsList).forEach(([mmDd, names]) => {
      const [mStr, dStr] = mmDd.split('-');
      const monthIdx = parseInt(mStr, 10) - 1;
      const dayVal = parseInt(dStr, 10);

      // Project for current year
      let eventDate = new Date(today.getFullYear(), monthIdx, dayVal);
      // If it already passed this year, project to next year
      if (eventDate < todayStart) {
        eventDate = new Date(today.getFullYear() + 1, monthIdx, dayVal);
      }

      // Check if we already have a database event on this exact date and with the same name to avoid duplicates
      const isDuplicate = candidates.some(c => 
        c.date.getFullYear() === eventDate.getFullYear() &&
        c.date.getMonth() === eventDate.getMonth() &&
        c.date.getDate() === eventDate.getDate()
      );

      if (!isDuplicate) {
        candidates.push({
          date: eventDate,
          title: lang === 'ml' ? names.ml : names.en,
          subtitle: lang === 'ml' ? 'തിരുക്കർമ്മങ്ങൾ' : 'Solemn Liturgy',
        });
      }
    });

    // 3. Sort candidates ascending by date
    candidates.sort((a, b) => a.date.getTime() - b.date.getTime());

    // 4. Take the next 3 feasts
    const nextThree = candidates.slice(0, 3).map(c => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsMl = ['ജനു', 'ഫെബ്രു', 'മാർ', 'ഏപ്രി', 'മേയ്', 'ജൂൺ', 'ജൂലൈ', 'ആഗ', 'സെപ്റ്റ', 'ഒക്ടോ', 'നവം', 'ഡിസം'];
      
      const d = String(c.date.getDate()).padStart(2, '0');
      const m = lang === 'ml' ? monthsMl[c.date.getMonth()] : months[c.date.getMonth()];
      
      return {
        day: d,
        month: m,
        title: c.title,
        subtitle: c.subtitle,
      };
    });

    setUpcomingFeasts(nextThree);
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    let token = null;
    try {
      token = await SecureStore.getItemAsync('user_token') || localStorage.getItem('user_token');
    } catch (_) {
      try { token = localStorage.getItem('user_token'); } catch (__) {}
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/api/announcements`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.warn('[HomeScreen] Announcements API fetch error:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMassTimes = () => {
    navigation.navigate('MassTimings');
  };

  const handleReadings = () => {
    navigation.navigate('PrayerDetail', { slug: 'bible-readings', lang: lang });
  };

  const latestAnnouncement = announcements[0] || null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={[globalStyles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

      
      {/* 1. Language Toggle & 2. Greeting */}
      <View style={styles.headerRow}>
        <View style={styles.greetingCol}>
          <Text style={[styles.greetingLabel, { color: colors.primary }]}>{t('good-morning').toUpperCase()}</Text>
          <Text style={[styles.praiseText, { color: colors.foreground }]}>{t('praise-the-lord')}</Text>
        </View>
        
        {/* Language selector capsule (64px height) */}
        <View style={[styles.langCapsule, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.langToggleBtn, lang === 'en' && { backgroundColor: colors.darkGold }]}
            onPress={() => setLang('en')}
            accessibilityLabel="Switch to English"
            accessibilityRole="button"
          >
            <Text style={[styles.langToggleText, { color: lang === 'en' ? '#ffffff' : colors.mutedBrown }]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langToggleBtn, lang === 'ml' && { backgroundColor: colors.darkGold }]}
            onPress={() => setLang('ml')}
            accessibilityLabel="Switch to Malayalam"
            accessibilityRole="button"
          >
            <Text style={[styles.langToggleText, { color: lang === 'ml' ? '#ffffff' : colors.mutedBrown }]}>മലയാളം</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mass status sub-bullet */}
      <View style={styles.massSubtextRow}>
        <View style={[styles.goldBullet, { backgroundColor: colors.primary }]} />
        <Text style={[styles.massSubtext, { color: colors.mediumBrown }]}>{todayMassText || t('todays-mass')}</Text>
      </View>

      {/* 3. Hero Card */}
      <ImageBackground
        source={require('../../assets/parish_interior.png')}
        style={styles.heroCard}
        imageStyle={{ width: '100%', height: '100%', borderRadius: 16, resizeMode: 'cover' }}
        resizeMode="cover"
      >

        <View style={styles.heroOverlay}>
          <View style={[styles.heroBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.heroBadgeText}>{t('hero-badge')}</Text>
          </View>
          <Text style={styles.heroTitle}>{t('hero-title')}</Text>
          <View style={styles.heroLocationRow}>
            <Ionicons name="location-sharp" size={16} color="#ffffff" />
            <Text style={styles.heroLocationText}>{t('hero-address')}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* 4. Quick Access Grid (Redesigned with squircle icon containers and outline vector icons) */}
      <View style={styles.quickAccessGrid}>
        <TouchableOpacity 
          style={[styles.quickAccessItem, styles.quickAccessItemWarm]} 
          onPress={handleMassTimes}
          accessibilityLabel={t('mass-timings')}
          accessibilityRole="button"
        >
          <View style={[styles.quickAccessIconBox, styles.quickAccessIconBoxWarm]}>
            <Ionicons name="time-outline" size={28} color={colors.darkGold} />
          </View>
          <Text numberOfLines={2} style={[styles.quickAccessText, { color: colors.foreground }]}>
            {t('mass-timings').replace(' ', '\n')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickAccessItem, styles.quickAccessItemGrey]} 
          onPress={() => navigation.navigate('Prayers')}
          accessibilityLabel={t('novena-prayers')}
          accessibilityRole="button"
        >
          <View style={[styles.quickAccessIconBox, styles.quickAccessIconBoxGrey]}>
            <Ionicons name="star-outline" size={28} color={colors.darkGold} />
          </View>
          <Text numberOfLines={2} style={[styles.quickAccessText, { color: colors.foreground }]}>
            {t('novena-prayers').replace(' ', '\n')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickAccessItem, styles.quickAccessItemWarm]} 
          onPress={handleReadings}
          accessibilityLabel={t('daily-readings')}
          accessibilityRole="button"
        >
          <View style={[styles.quickAccessIconBox, styles.quickAccessIconBoxWarm, isDark && { backgroundColor: '#2a2a2a' }]}>
            <Ionicons name="book-outline" size={28} color={colors.darkGold} />
          </View>
          <Text numberOfLines={2} style={[styles.quickAccessText, { color: colors.foreground }]}>
            {t('daily-readings').replace(' ', '\n')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 5. Announcements Section */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>{t('parish-announcements')}</Text>
          <View style={[styles.titleUnderlineAccent, { backgroundColor: colors.primary }]} />
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Announcements')} 
          style={styles.viewAllBtn}
          accessibilityLabel={t('view-all')}
          accessibilityRole="button"
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>{t('view-all')} ➔</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
      ) : latestAnnouncement ? (
        <View style={[globalStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.announcementMeta}>
            <View style={[styles.announcementDateBadge, { backgroundColor: isDark ? '#2c2c2c' : '#f5edd6', borderColor: colors.border }]}>
              <Text style={[styles.announcementDateText, { color: colors.foreground }]}>
                {(() => {
                  const dVal = latestAnnouncement.date || latestAnnouncement.announcement_date || latestAnnouncement.created_at || latestAnnouncement.createdAt;
                  if (!dVal) return '';
                  try {
                    const d = new Date(dVal);
                    if (isNaN(d.getTime())) return String(dVal).substring(0, 10);
                    const m = (d.getMonth() + 1).toString().padStart(2, '0');
                    const day = d.getDate().toString().padStart(2, '0');
                    return `${m}-${day}`;
                  } catch (_) {
                    return String(dVal).substring(0, 10);
                  }
                })()}
              </Text>
            </View>
          </View>
          <Text style={[styles.announcementTitle, { color: colors.foreground }]}>
            {latestAnnouncement.title || latestAnnouncement.heading || latestAnnouncement.name}
          </Text>
          <Text style={[styles.announcementContent, { color: colors.mediumBrown }]}>
            {latestAnnouncement.content || latestAnnouncement.description || latestAnnouncement.message || latestAnnouncement.text}
          </Text>
        </View>
      ) : null}

      {/* 6. Upcoming Feasts List (Interactive cards have height 72px for senior accessibility) */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>{t('upcoming-feasts')}</Text>
          <View style={[styles.titleUnderlineAccent, { backgroundColor: colors.primary }]} />
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('FeastCalendar')} 
          style={styles.viewAllBtn}
          accessibilityLabel={t('see-all')}
          accessibilityRole="button"
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>{t('see-all')} ➔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.feastsList}>
        {upcomingFeasts.map((feast, index) => (
          <TouchableOpacity 
            key={index} 
            style={[globalStyles.card, styles.feastItemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Alert.alert(feast.title, lang === 'ml' ? `തിരുനാൾ തീയതി: ${feast.month} ${feast.day}` : `Upcoming Feast on ${feast.month} ${feast.day}`)}
            accessibilityLabel={`Feast details for ${feast.title}`}
            accessibilityRole="button"
          >
            <View style={[styles.feastDateBox, { backgroundColor: colors.darkGold }]}>
              <Text style={styles.feastDateDay}>{feast.day}</Text>
              <Text style={styles.feastDateMonth}>{feast.month.toUpperCase()}</Text>
            </View>
            <View style={styles.feastTextContainer}>
              <Text style={[styles.feastTitle, { color: colors.foreground }]}>{feast.title}</Text>
              {feast.subtitle ? <Text style={[styles.feastSubtitle, { color: colors.textMuted }]}>{feast.subtitle}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.feastChevron} />
          </TouchableOpacity>
        ))}
      </View>

      {/* 7. Daily Verse */}
      <View style={[styles.verseCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.primary }]}>
        <Text style={[styles.verseLabel, { color: colors.primary }]}>✨ {t('daily-bible-verse')}</Text>
        <Text style={[styles.verseText, { color: colors.foreground }]}>{t('bible-verse-text')}</Text>
        <Text style={[styles.verseRef, { color: colors.mediumBrown }]}>— {t('bible-verse-ref')}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingCol: {
    flex: 1,
    marginRight: 8,
  },
  greetingLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: colors.primary,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, "Noto Serif Malayalam", sans-serif' : 'NotoSerifMalayalam-Bold',
  },
  praiseText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, "Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
    color: colors.foreground,
    marginTop: 4,
    lineHeight: 30,
  },
  langCapsule: {
    flexDirection: 'row',
    backgroundColor: '#fffdf9',
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 4,
    width: 190,
    height: 64, // strictly 64px senior accessibility target
    alignItems: 'center',
  },
  langToggleBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langToggleBtnActive: {
    backgroundColor: colors.darkGold,
    ...Platform.select({
      web: { boxShadow: '0 2px 6px rgba(61,43,31,0.08)' }
    })
  },
  langToggleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.mutedBrown,
  },
  langToggleTextActive: {
    color: '#ffffff',
  },
  massSubtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  goldBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  massSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mediumBrown,
  },
  heroCard: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 3,
  },

  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    padding: 20,
    justifyContent: 'flex-end',
    borderRadius: 16,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: '#ffffff',
    marginTop: 4,
    marginBottom: 4,
    ...Platform.select({
      web: { textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }
    })
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  heroLocationText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 6,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Nunito, "Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  
  // Quick Access Grid (Touch targets strictly 68px)
  // Quick Access Grid (Redesigned squarish cards)
  quickAccessGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickAccessItem: {
    flex: 1,
    borderRadius: 16, // Exactly 16px corner radius globally
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    height: 135, // Premium squarish/tall card height
    ...Platform.select({
      web: { cursor: 'pointer', boxShadow: '0 4px 8px rgba(61,43,31,0.04)' }
    })
  },
  quickAccessItemWarm: {
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4', // Warm light cream
    borderColor: colors.border, // Soft gold-beige border
  },
  quickAccessItemGrey: {
    backgroundColor: isDark ? '#252525' : '#f5f0e6', // Soft light warm grey
    borderColor: isDark ? '#333333' : '#dfd4be', // Light warm grey border
  },
  quickAccessIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18, // soft squircle corners matching mockup
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickAccessIconBoxWarm: {
    backgroundColor: isDark ? '#2a2a2a' : '#f5eedc', // soft gold/cream container background
  },
  quickAccessIconBoxGrey: {
    backgroundColor: isDark ? '#2c2c2c' : '#ebdcc3', // slightly darker gold/cream container background
  },
  quickAccessText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 16.5,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },

  // Headings & View All
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleWrapper: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, "Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
    color: colors.foreground,
    paddingBottom: 4,
  },
  titleUnderlineAccent: {
    height: 3,
    backgroundColor: colors.primary,
    width: 48,
    borderRadius: 2,
  },
  viewAllBtn: {
    height: 64, // Touch target between 60px and 75px
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: Platform.OS === 'web' ? 'Nunito, "Noto Serif Malayalam", sans-serif' : 'NotoSerifMalayalam-Bold',
  },

  // Announcements card details
  announcementMeta: {
    marginBottom: 8,
  },
  announcementDateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: isDark ? '#2c2c2c' : '#f5edd6',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  announcementDateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 6,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
  },
  announcementContent: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.mediumBrown,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },

  // Feasts list
  feastsList: {
    marginBottom: 20,
  },
  feastItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16,
    minHeight: 80,
  },
  feastDateBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.darkGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  feastDateDay: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 19,
  },
  feastDateMonth: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  feastTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  feastTitle: {
    fontSize: 15.5,
    fontWeight: 'bold',
    color: colors.foreground,
    lineHeight: 20,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
  },
  feastSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 16,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  feastChevron: {
    marginLeft: 'auto',
  },

  // Daily Verse Card
  verseCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 2,
    borderLeftWidth: 6,
    borderLeftColor: colors.primary,
    borderRadius: 16, // Exactly 16px corner radius
    padding: 20,
    marginBottom: 20,
  },
  verseLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, "Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
    marginBottom: 8,
  },
  verseText: {
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 26,
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? '"EB Garamond", "Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
    marginBottom: 8,
  },
  verseRef: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mediumBrown,
    textAlign: 'right',
    fontFamily: Platform.OS === 'web' ? '"EB Garamond", "Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
});
