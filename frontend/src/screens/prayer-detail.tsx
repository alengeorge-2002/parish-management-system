import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { prayersData } from '../data/prayers-data';
import * as SecureStore from 'expo-secure-store';
import dailyReadingsData from '../data/daily-readings.json';

const dailyReadings = dailyReadingsData as Record<string, any>;

export default function PrayerDetailScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const navigation = useNavigation();
  const route = useRoute<any>();

  const { slug, lang } = route.params || { slug: 'morning-prayer', lang: 'en' };
  
  // Custom states for daily bible readings
  const today = new Date();
  const initialDateStr = `2026-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [activeDateStr, setActiveDateStr] = useState(initialDateStr);
  const [calLang, setCalLang] = useState<'en' | 'ml'>('en');

  useEffect(() => {
    const initCalLang = async () => {
      try {
        const saved = await SecureStore.getItemAsync('calendar_lang') || localStorage.getItem('calendar_lang');
        if (saved === 'ml' || saved === 'en') {
          setCalLang(saved as 'en' | 'ml');
        } else if (lang === 'ml') {
          setCalLang('ml');
        }
      } catch (_) {
        if (lang === 'ml') setCalLang('ml');
      }
    };
    initCalLang();
  }, [lang]);

  const handleLangToggle = async (langVal: 'en' | 'ml') => {
    setCalLang(langVal);
    try {
      await SecureStore.setItemAsync('calendar_lang', langVal);
      localStorage.setItem('calendar_lang', langVal);
    } catch (_) {}
  };

  const handlePrevDay = () => {
    try {
      const parts = activeDateStr.split('-');
      const current = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      current.setDate(current.getDate() - 1);
      const newDateStr = `2026-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      setActiveDateStr(newDateStr);
    } catch (_) {}
  };

  const handleNextDay = () => {
    try {
      const parts = activeDateStr.split('-');
      const current = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      current.setDate(current.getDate() + 1);
      const newDateStr = `2026-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      setActiveDateStr(newDateStr);
    } catch (_) {}
  };

  const getFormattedDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      
      const monthsEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthsML = ['ജനുവരി', 'ഫെബ്രുവരി', 'മാർച്ച്', 'ഏപ്രിൽ', 'മേയ്', 'ജൂൺ', 'ജൂലൈ', 'ആഗസ്റ്റ്', 'സെപ്റ്റംബർ', 'ഒക്ടോബർ', 'നവംബർ', 'ഡിസംബർ'];
      
      const activeMonths = calLang === 'ml' ? monthsML : monthsEN;
      return `${day} ${activeMonths[monthIdx]} ${year}`;
    } catch (_) {
      return dateStr;
    }
  };

  // If slug is bible-readings, render dynamic PDF readings view
  if (slug === 'bible-readings') {
    const dayData = dailyReadings[activeDateStr];
    const hasData = dayData && dayData.occasions && dayData.occasions.length > 0;
    
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={28} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.screenTitle}>{calLang === 'ml' ? 'തിരുവചന വായനകൾ' : 'Daily Bible Readings'}</Text>
              <Text style={styles.subtext}>{calLang === 'ml' ? 'യാമങ്ങൾക്കനുസൃതമായ ബൈബിൾ വായനകൾ' : 'Liturgy of the Word'}</Text>
            </View>
            
            {/* Lang switch */}
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
          <View style={styles.goldLine} />
        </View>

        {/* Date Navigator */}
        <View style={styles.dateNavigatorRow}>
          <TouchableOpacity onPress={handlePrevDay} style={styles.dateNavBtn} accessibilityLabel="Previous Day">
            <Ionicons name="chevron-back" size={20} color={colors.darkGold} />
          </TouchableOpacity>
          <Text style={styles.dateNavText}>{getFormattedDate(activeDateStr)}</Text>
          <TouchableOpacity onPress={handleNextDay} style={styles.dateNavBtn} accessibilityLabel="Next Day">
            <Ionicons name="chevron-forward" size={20} color={colors.darkGold} />
          </TouchableOpacity>
        </View>

        {/* Readings Scroll View */}
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {hasData ? (
            dayData.occasions.map((occ: any, occIdx: number) => {
              const occasionName = calLang === 'ml' ? occ.name_ml : occ.name_en;
              const hasReadings = occ.readings && occ.readings.length > 0;
              
              return (
                <View key={occIdx} style={[globalStyles.card, styles.readingCard, { marginBottom: 20 }]}>
                  <Text style={styles.occasionTitle}>{occasionName}</Text>
                  <View style={styles.occasionDivider} />
                  
                  {hasReadings ? (
                    occ.readings.map((reading: any, rIdx: number) => {
                      const citation = calLang === 'ml' ? reading.citation_ml : reading.citation_en;
                      return (
                        <View key={rIdx} style={styles.readingBlock}>
                          <View style={styles.citationRow}>
                            <Ionicons name="book-outline" size={18} color={colors.darkGold} style={{ marginRight: 8 }} />
                            <Text style={styles.readingCitation}>{citation}</Text>
                          </View>
                          {reading.description_en ? (
                            <Text style={styles.readingDescription}>{reading.description_en}</Text>
                          ) : null}
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.noReadingsText}>
                      {calLang === 'ml' ? 'ഈ തിരുനാളിന് പ്രത്യേക വായനകൾ നിശ്ചയിച്ചിട്ടില്ല.' : 'No specific readings listed for this occasion.'}
                    </Text>
                  )}
                </View>
              );
            })
          ) : (
            <View style={[globalStyles.card, styles.readingCard, { alignItems: 'center', paddingVertical: 40 }]}>
              <Ionicons name="calendar-outline" size={40} color={colors.mediumBrown} style={{ marginBottom: 12 }} />
              <Text style={styles.noReadingsText}>
                {calLang === 'ml' ? 'ഈ ദിവസത്തേക്ക് തിരുവചന വായനകൾ ലഭ്യമല്ല.' : 'No scripture readings registered for this date.'}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Fallback morning/evening/rosary layout
  const prayer = prayersData[slug];
  if (!prayer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Prayer not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const content = calLang === 'ml' ? prayer.ml : prayer.en;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.screenTitle}>{content.title}</Text>
            {content.subTitle ? <Text style={styles.subtext}>{content.subTitle}</Text> : null}
          </View>
        </View>
        <View style={styles.goldLine} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={[globalStyles.card, styles.prayerCard]}>
          {content.paragraphs.map((paragraph, index) => {
            const isSignOfCross = paragraph.startsWith('✠') || paragraph.startsWith('1.') || paragraph.startsWith('2.') || paragraph.startsWith('3.') || paragraph.startsWith('4.') || paragraph.startsWith('5.') || paragraph.startsWith('6.') || paragraph.startsWith('7.') || paragraph.startsWith('8.') || paragraph.startsWith('9.') || paragraph.startsWith('10.') || paragraph.startsWith('11.') || paragraph.startsWith('12.') || paragraph.startsWith('13.') || paragraph.startsWith('14.') || paragraph.startsWith('Opening Prayer');
            return (
              <Text 
                key={index} 
                style={[
                  styles.paragraphText, 
                  isSignOfCross && styles.crossText,
                  { marginBottom: index === content.paragraphs.length - 1 ? 0 : 16 }
                ]}
              >
                {paragraph}
              </Text>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  headerTextContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
  },
  subtext: {
    fontSize: 13,
    color: colors.mediumBrown,
    marginTop: 2,
    fontStyle: 'italic',
  },
  goldLine: {
    height: 3,
    backgroundColor: colors.primary,
    width: 60,
    marginTop: 10,
    borderRadius: 1.5,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  prayerCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 20,
  },
  paragraphText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? '"EB Garamond", serif' : 'System',
  },
  crossText: {
    fontWeight: 'bold',
    color: colors.darkGold,
    fontSize: 19,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    fontWeight: 'bold',
  },
  
  // Custom Styles
  langToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  langToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langToggleBtnActive: {
    backgroundColor: colors.darkGold,
  },
  langToggleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.mediumBrown,
  },
  langToggleTextActive: {
    color: '#ffffff',
  },
  dateNavigatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: isDark ? '#1a1a1a' : '#fffcf6',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  dateNavText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGold,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
  },
  readingCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 20,
  },
  occasionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    textAlign: 'center',
  },
  occasionDivider: {
    height: 2,
    backgroundColor: colors.primary,
    width: 80,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 1,
  },
  readingBlock: {
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: colors.darkGold,
    paddingLeft: 12,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  readingCitation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGold,
  },
  readingDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? '"EB Garamond", serif' : 'System',
    fontStyle: 'italic',
  },
  noReadingsText: {
    fontSize: 14,
    color: colors.mediumBrown,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
