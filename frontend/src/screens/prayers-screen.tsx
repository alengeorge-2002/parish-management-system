import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, Platform, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { globalStyles, typography } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { Ionicons } from '@expo/vector-icons';
import enUs from '../localization/en-us.json';
import mlIn from '../localization/ml-in.json';

export default function PrayersScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const { language: globalLang } = useLanguage();
  const navigation = useNavigation<any>();

  const [localLang, setLocalLang] = useState(globalLang);

  useEffect(() => {
    setLocalLang(globalLang);
  }, [globalLang]);

  const getTranslation = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: enUs,
      ml: mlIn
    };
    return translations[localLang]?.[key] || translations['en']?.[key] || key;
  };

  const resumePrayers = [
    { id: 'holy-rosary', title: getTranslation('holy-rosary'), progress: getTranslation('rosary-progress'), icon: "ellipse-outline" },
    { id: 'morning-prayer', title: getTranslation('morning-prayer'), progress: getTranslation('morning-progress'), icon: "sunny-outline" },
    { id: 'novena-prayers', title: getTranslation('novena-prayers'), progress: getTranslation('novena-progress'), icon: "star-outline" }
  ];

  const categories = [
    { id: 'morning-prayer', title: getTranslation('morning-prayer'), desc: getTranslation('lauds-desc'), icon: "sunny-outline" },
    { id: 'holy-rosary', title: getTranslation('holy-rosary'), desc: getTranslation('rosary-desc'), icon: "ellipse-outline" },
    { id: 'novena-prayers', title: getTranslation('novena-prayers'), desc: getTranslation('novena-desc'), icon: "star-outline" },
    { id: 'stations-of-the-cross', title: getTranslation('stations-of-the-cross'), desc: getTranslation('stations-desc'), icon: "paper-plane-outline" },
    { id: 'bible-readings', title: getTranslation('bible-readings'), desc: getTranslation('bible-desc'), icon: "book-outline" },
    { id: 'prayer-requests', title: getTranslation('prayer-requests'), desc: getTranslation('requests-desc'), icon: "chatbox-outline" },
    { id: 'audio-bible', title: getTranslation('audio-bible'), desc: getTranslation('audio-desc'), icon: "headset-outline" },
    { id: 'evening-prayer', title: getTranslation('evening-prayer'), desc: getTranslation('evening-desc'), icon: "moon-outline" }
  ];

  const getCardStyles = (index: number) => {
    const isGrey = index === 1 || index === 3 || index === 6;
    if (isDark) {
      return {
        backgroundColor: isGrey ? '#252525' : '#1e1e1e',
        borderColor: isGrey ? '#333333' : '#2c2c2c',
      };
    }
    return {
      backgroundColor: isGrey ? '#f5f0e6' : '#fffdf4',
      borderColor: isGrey ? '#dfd4be' : '#ebdcc3',
    };
  };

  const handleResumePress = (slug: string) => {
    navigation.navigate('PrayerDetail', { slug, lang: localLang });
  };

  const handleCategoryPress = (slug: string) => {
    navigation.navigate('PrayerDetail', { slug, lang: localLang });
  };

  // Splitting categories for 2-column staggered grid
  const leftColumnCategories = categories.filter((_, idx) => idx % 2 === 0);
  const rightColumnCategories = categories.filter((_, idx) => idx % 2 !== 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={globalStyles.container} showsVerticalScrollIndicator={false}>

      
      {/* Page Title Header & Language Toggle */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextCol}>
          <Text style={styles.mainTitle}>{getTranslation('prayers-and-devotions')}</Text>
          <Text style={styles.siennaSubtext}>{getTranslation('deepen-your-spiritual-journey')}</Text>
          <View style={styles.goldLine} />
        </View>

        {/* Language selector capsule (64px height) */}
        <View style={[styles.langCapsule, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.langToggleBtn, localLang === 'en' && styles.langToggleBtnActive]}
            onPress={() => setLocalLang('en')}
            accessibilityLabel="Switch to English"
            accessibilityRole="button"
          >
            <Text style={[styles.langToggleText, { color: localLang === 'en' ? '#ffffff' : colors.mutedBrown }]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langToggleBtn, localLang === 'ml' && styles.langToggleBtnActive]}
            onPress={() => setLocalLang('ml')}
            accessibilityLabel="Switch to Malayalam"
            accessibilityRole="button"
          >
            <Text style={[styles.langToggleText, { color: localLang === 'ml' ? '#ffffff' : colors.mutedBrown }]}>മലയാളം</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 1. Continue Praying Pills (Horizontal scrolling row of pill-shaped buttons) */}
      <Text style={styles.sectionHeader}>{getTranslation('continue-praying').toUpperCase()}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsScrollContent}
        style={styles.pillsScroll}
      >
        {resumePrayers.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.prayerPill}
            onPress={() => handleResumePress(item.id)}
            accessibilityLabel={`Resume ${item.title}`}
            accessibilityRole="button"
          >
            <Ionicons name={item.icon as any} size={22} color={colors.darkGold} style={{ marginRight: 8 }} />
            <View style={styles.pillTextCol}>
              <Text style={styles.pillTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.pillProgress}>{item.progress}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 2. Novena Hero Banner */}
      <ImageBackground
        source={require('../../assets/rosary_beads.png')}
        style={styles.heroCard}
        imageStyle={{ width: '100%', height: '100%', borderRadius: 16, resizeMode: 'cover' }}
        resizeMode="cover"
      >

        <View style={styles.heroOverlay}>
          <View style={styles.goldBadge}>
            <Text style={styles.goldBadgeText}>{getTranslation('todays-novena').toUpperCase()}</Text>
          </View>
          <Text style={styles.heroHeading}>{getTranslation('sacred-heart-novena')}</Text>
        </View>
      </ImageBackground>

      {/* Scripture quote banner (EB Garamond font) */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>{getTranslation('bible-verse-text')}</Text>
        <Text style={styles.quoteRef}>— {getTranslation('bible-verse-ref')}</Text>
      </View>

      {/* 3. Two-Column Staggered Grid of Prayer Categories */}
      <Text style={styles.sectionHeader}>{getTranslation('prayer-categories').toUpperCase()}</Text>
      
      <View style={styles.staggeredGrid}>
        
        {/* Left Column */}
        <View style={styles.gridColumn}>
          {leftColumnCategories.map((item, index) => {
            const originalIndex = index * 2;
            const cardColors = getCardStyles(originalIndex);
            
            return (
              <TouchableOpacity
                key={originalIndex}
                style={[
                  globalStyles.card,
                  styles.gridCard,
                  { 
                    backgroundColor: cardColors.backgroundColor, 
                    borderColor: cardColors.borderColor,
                    minHeight: 120 
                  }
                ]}
                onPress={() => handleCategoryPress(item.id)}
                accessibilityLabel={item.title}
                accessibilityRole="button"
              >
                <View style={styles.gridCardIconBox}>
                  <Ionicons name={item.icon as any} size={22} color={colors.darkGold} />
                </View>
                <Text style={styles.gridCardTitle}>{item.title}</Text>
                <Text numberOfLines={3} style={styles.gridCardSub}>{item.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Column */}
        <View style={[styles.gridColumn, !isMobile && styles.rightColumnOffset]}>
          {rightColumnCategories.map((item, index) => {
            const originalIndex = index * 2 + 1;
            const cardColors = getCardStyles(originalIndex);

            return (
              <TouchableOpacity
                key={originalIndex}
                style={[
                  globalStyles.card,
                  styles.gridCard,
                  { 
                    backgroundColor: cardColors.backgroundColor, 
                    borderColor: cardColors.borderColor,
                    minHeight: 120 
                  }
                ]}
                onPress={() => handleCategoryPress(item.id)}
                accessibilityLabel={item.title}
                accessibilityRole="button"
              >
                <View style={styles.gridCardIconBox}>
                  <Ionicons name={item.icon as any} size={22} color={colors.darkGold} />
                </View>
                <Text style={styles.gridCardTitle}>{item.title}</Text>
                <Text numberOfLines={3} style={styles.gridCardSub}>{item.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 16,
  },
  langCapsule: {
    flexDirection: 'row',
    backgroundColor: '#fffdf9',
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 4,
    width: 190,
    height: 64,
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
    marginTop: 8,
  },
  
  // Continue Praying Pills styles (height 64px senior targets)
  pillsScroll: {
    marginBottom: 24,
    marginHorizontal: -20,
  },
  pillsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  prayerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 32, // Pill shaped circular border
    paddingHorizontal: 16,
    height: 64, // Exact senior accessibility height target [60, 75]
    minWidth: 160,
    maxWidth: 240,
    ...Platform.select({
      web: { cursor: 'pointer', boxShadow: '0 4px 8px rgba(61,43,31,0.04)' }
    })
  },
  pillIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  pillTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  pillTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  pillProgress: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Novena hero banner
  heroCard: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 3,
  },

  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 20,
    justifyContent: 'flex-end',
    borderRadius: 16,
  },
  goldBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  goldBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.foreground,
    letterSpacing: 1,
  },
  heroHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: '#ffffff',
  },

  // Scripture Card
  quoteCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 2,
    borderLeftWidth: 6,
    borderLeftColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 25,
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? '"EB Garamond", serif' : 'System',
    marginBottom: 6,
  },
  quoteRef: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mediumBrown,
    textAlign: 'right',
    fontFamily: Platform.OS === 'web' ? '"EB Garamond", serif' : 'System',
  },

  // Staggered grid
  staggeredGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  gridColumn: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
  },
  rightColumnOffset: {
    marginTop: 24, // vertical offset for staggering
  },
  gridCard: {
    borderWidth: 1.5,
    borderRadius: 16, // Globally exactly 16px border-radius
    padding: 16,
    alignItems: 'flex-start', // Left aligned matching mockup
    justifyContent: 'flex-start',
    marginBottom: 0, // spacing handled by column gap
    ...Platform.select({
      web: { cursor: 'pointer', boxShadow: '0 4px 8px rgba(61,43,31,0.04)' }
    })
  },
  gridCardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14, // squircle icon box
    backgroundColor: colors.card, // white container matching mockup
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(61, 43, 31, 0.08)', // very subtle border
  },
  gridCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'left', // Left aligned matching mockup
    marginBottom: 6,
    lineHeight: 21,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  gridCardSub: {
    fontSize: 12.5,
    color: colors.mediumBrown,
    textAlign: 'left', // Left aligned matching mockup
    lineHeight: 17,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
});
