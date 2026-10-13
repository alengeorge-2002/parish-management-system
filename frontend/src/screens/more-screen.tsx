import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform, ImageBackground, Switch, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { globalStyles, colors as staticColors } from '../styles/accessible-theme';
import { useLanguage } from '../localization/language-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme-context';

export default function MoreScreen() {
  const { language: lang, setLanguage: setLang, t, setUserToken } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { themeMode, setThemeMode, colors, isDark } = useTheme();

  useEffect(() => {
    const loadNotificationSetting = async () => {
      try {
        const saved = await SecureStore.getItemAsync('notifications_enabled') || localStorage.getItem('notifications_enabled');
        if (saved !== null) {
          setNotificationsEnabled(saved === 'true');
        }
      } catch (_) {
        try {
          const webSaved = localStorage.getItem('notifications_enabled');
          if (webSaved !== null) {
            setNotificationsEnabled(webSaved === 'true');
          }
        } catch (__) {}
      }
    };
    loadNotificationSetting();
  }, []);

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await SecureStore.setItemAsync('notifications_enabled', String(value));
      localStorage.setItem('notifications_enabled', String(value));
    } catch (_) {
      try {
        localStorage.setItem('notifications_enabled', String(value));
      } catch (__) {}
    }
  };

  const styles = getStyles(colors, isDark);

  const handleConfessionPress = () => {
    Alert.alert(t('confession-timings-title'), t('mass-times-body'));
  };

  const handleAdorationPress = () => {
    Alert.alert(t('adoration-timings-title'), t('mass-times-body'));
  };

  const handleLocationPress = async () => {
    const lat = 11.2678125;
    const lng = 75.8366875;
    const label = encodeURIComponent("St. Joseph's Church, Devagiri");
    
    // Platform-specific maps URL scheme
    const scheme = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    });

    try {
      const supported = await Linking.canOpenURL(scheme);
      if (supported) {
        await Linking.openURL(scheme);
      } else {
        // Fallback to web google maps
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.warn("Failed to open map URL:", error);
      Alert.alert(t('location-map-title'), "St. Joseph's Church, Devagiri\nKozhikode, Kerala, India\nLatitude: 11.2678° N, Longitude: 75.8367° E");
    }
  };

  const handleContactOfficePress = () => {
    Alert.alert(t('contact-parish-office-title'), "Calling Parish Administration Desk at +91 495 270 1234...");
  };

  const handleShareAppPress = () => {
    Alert.alert(t('share-app-title'), "Sharing Parish Management App...\nCheck it out at https://stjosephdevagiri.org/app");
  };

  const handleRateAppPress = () => {
    Alert.alert(t('rate-app-title'), "Thank you for supporting our parish! Redirecting to App Store rating page...");
  };

  const handleAboutChurchPress = () => {
    Alert.alert(t('about-church-title'), "St. Joseph's Church, Devagiri\nEstablished: 1956\nDiocese: Thamarassery Diocese\nParish Community: Devagiri Parish Family");
  };

  const handleLogoutPress = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('user_token');
        localStorage.removeItem('access_key');
      } else {
        await SecureStore.deleteItemAsync('user_token');
        await SecureStore.deleteItemAsync('access_key');
      }
    } catch (e) {
      console.warn('Failed to clear token:', e);
    }
    setUserToken(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={[globalStyles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

      
      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.mainTitle, { color: colors.foreground }]}>{t('more-title')}</Text>
        <View style={[styles.goldLine, { backgroundColor: colors.primary }]} />
      </View>

      {/* Hero Banner */}
      <ImageBackground
        source={require('../../assets/parish_interior.png')}
        style={styles.heroCard}
        imageStyle={{ width: '100%', height: '100%', borderRadius: 16, resizeMode: 'cover' }}
        resizeMode="cover"
      >

        <View style={styles.heroOverlay}>
          <View style={[styles.heroBadge, { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(235, 220, 195, 0.15)' : 'rgba(201, 168, 76, 0.15)' }]}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </View>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>ST JOSEPH CHURCH DEVAGIRI</Text>
            <Text style={[styles.heroSub, { color: colors.border }]}>ദേവഗിരി, താമരശ്ശേരി — Est. 1956</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Section 1: Parish (ഇടവക) */}
      <Text style={[styles.sectionHeader, { color: colors.mediumBrown }]}>{t('parish-section').toUpperCase()}</Text>
      <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        
        {/* Confession */}
        <TouchableOpacity style={styles.groupRow} onPress={handleConfessionPress}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#2c2c2c' : '#f5eedc', borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={20} color={colors.darkGold} />
            </View>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{t('confession-timings-title')}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={[styles.rowValue, { color: colors.mutedBrown }]}>{t('confession-timings-value')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.border} style={styles.chevron} />
          </View>
        </TouchableOpacity>

        <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

        {/* Adoration */}
        <TouchableOpacity style={styles.groupRow} onPress={handleAdorationPress}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#2c2c2c' : '#f5eedc', borderColor: colors.border }]}>
              <Ionicons name="sunny-outline" size={20} color={colors.darkGold} />
            </View>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{t('adoration-timings-title')}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={[styles.rowValue, { color: colors.mutedBrown }]}>{t('adoration-timings-value')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.border} style={styles.chevron} />
          </View>
        </TouchableOpacity>

        <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

        {/* Location & Map */}
        <TouchableOpacity style={styles.groupRow} onPress={handleLocationPress}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#2c2c2c' : '#f5eedc', borderColor: colors.border }]}>
              <Ionicons name="location-outline" size={20} color={colors.darkGold} />
            </View>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{t('location-map-title')}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text numberOfLines={1} style={[styles.rowValue, { color: colors.mutedBrown, maxWidth: 120 }]}>{t('location-map-value')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.border} style={styles.chevron} />
          </View>
        </TouchableOpacity>

        <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

        {/* Contact Parish Office */}
        <TouchableOpacity style={[styles.groupRow, { borderBottomWidth: 0 }]} onPress={handleContactOfficePress}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#2c2c2c' : '#f5eedc', borderColor: colors.border }]}>
              <Ionicons name="call-outline" size={20} color={colors.darkGold} />
            </View>
            <Text numberOfLines={2} style={[styles.rowTitle, { color: colors.foreground, maxWidth: 150 }]}>{t('contact-parish-office-title')}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={[styles.rowValue, { color: colors.mutedBrown }]}>{t('contact-parish-office-value')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.border} style={styles.chevron} />
          </View>
        </TouchableOpacity>

      </View>

      {/* Section 2: Preferences (മുൻഗണനകൾ) */}
      <Text style={[styles.sectionHeader, { color: colors.mediumBrown }]}>{t('preferences-section').toUpperCase()}</Text>
      <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        
        {/* Notifications Switch */}
        <View style={styles.groupRow}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#2c2c2c' : '#f5eedc', borderColor: colors.border }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.darkGold} />
            </View>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{t('notifications-title')}</Text>
          </View>
          <Switch 
            value={notificationsEnabled} 
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={notificationsEnabled ? colors.foreground : "#fff"}
          />
        </View>

        <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

        {/* Language Selection Toggle */}
        <View style={styles.groupRow}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#2c2c2c' : '#f5eedc', borderColor: colors.border }]}>
              <Ionicons name="language-outline" size={20} color={colors.darkGold} />
            </View>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{t('language-title')}</Text>
          </View>
          <View style={[styles.langSelectorCapsule, { backgroundColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.langSelectorBtn, lang === 'en' && { backgroundColor: colors.primary }]}
              onPress={() => setLang('en')}
            >
              <Text style={[styles.langSelectorBtnText, { color: lang === 'en' ? '#ffffff' : colors.mediumBrown }]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.langSelectorBtn, lang === 'ml' && { backgroundColor: colors.primary }]}
              onPress={() => setLang('ml')}
            >
              <Text style={[styles.langSelectorBtnText, { color: lang === 'ml' ? '#ffffff' : colors.mediumBrown }]}>ML</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Section 3: App (ആപ്പ്) */}
      <Text style={[styles.sectionHeader, { color: colors.mediumBrown }]}>{t('app-section').toUpperCase()}</Text>
      <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        
        {/* Share App */}
        <TouchableOpacity style={styles.groupRow} onPress={handleShareAppPress}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#2c2c2c' : '#f5eedc', borderColor: colors.border }]}>
              <Ionicons name="share-social-outline" size={20} color={colors.darkGold} />
            </View>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{t('share-app-title')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.border} style={styles.chevron} />
        </TouchableOpacity>

        <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

        {/* Rate App */}
        <TouchableOpacity style={styles.groupRow} onPress={handleRateAppPress}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#2c2c2c' : '#f5eedc', borderColor: colors.border }]}>
              <Ionicons name="star-outline" size={20} color={colors.darkGold} />
            </View>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{t('rate-app-title')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.border} style={styles.chevron} />
        </TouchableOpacity>

        <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

        {/* About St. Joseph Church */}
        <TouchableOpacity style={styles.groupRow} onPress={handleAboutChurchPress}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#2c2c2c' : '#f5eedc', borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.darkGold} />
            </View>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{t('about-church-title')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.border} style={styles.chevron} />
        </TouchableOpacity>

        <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

        {/* Log Out */}
        <TouchableOpacity style={[styles.groupRow, { borderBottomWidth: 0 }]} onPress={handleLogoutPress}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#2c2c2c' : '#fff8e7', borderColor: colors.border }]}>
              <Ionicons name="log-out-outline" size={20} color={colors.darkGold} />
            </View>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{t('logout')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.border} style={styles.chevron} />
        </TouchableOpacity>

      </View>

      {/* Footer Branding */}
      <View style={styles.footerContainer}>
        <View style={styles.footerBrandingRow}>
          <Ionicons name="add" size={18} color={colors.primary} style={styles.footerCross} />
          <Text style={[styles.footerText, { color: colors.mutedBrown }]}>{t('footer-text')}</Text>
        </View>
        <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>{t('footer-subtext')}</Text>
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
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
  },
  goldLine: {
    height: 3,
    backgroundColor: colors.primary,
    width: 60,
    marginTop: 10,
    borderRadius: 1.5,
  },
  
  // Hero banner styles
  heroCard: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 3,
  },

  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: '#ffffff',
    letterSpacing: 1,
  },
  heroSub: {
    fontSize: 13,
    color: '#ebdcc3',
    marginTop: 4,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },

  // Group section headers
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: colors.mediumBrown,
    marginBottom: 10,
    marginTop: 10,
  },

  // Grouped cards container
  groupedCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16, // Exactly 16px corner radius globally
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: '0 4px 10px rgba(61, 43, 31, 0.05)' }
    })
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 68, // Senior target height strictly in [60, 75]
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f5eedc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(61, 43, 31, 0.05)',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 13,
    color: colors.mutedBrown,
    marginRight: 8,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  chevron: {
    marginTop: 1,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#f2ebd9',
    marginHorizontal: 16,
  },

  // Language selector button style
  langSelectorCapsule: {
    flexDirection: 'row',
    backgroundColor: '#ebdcc3',
    borderRadius: 10,
    padding: 3,
    width: 100,
    height: 40,
    alignItems: 'center',
  },
  langSelectorBtn: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langSelectorBtnActive: {
    backgroundColor: colors.primary,
  },
  langSelectorBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.mediumBrown,
  },
  langSelectorBtnTextActive: {
    color: colors.card,
  },

  // Footer branding styles
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 36,
  },
  footerBrandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  footerCross: {
    marginRight: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: staticColors.mutedBrown,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    letterSpacing: 0.5,
  },
  footerSubtext: {
    fontSize: 11.5,
    color: staticColors.textMuted,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
    marginTop: 4,
  },

  // Modal styles for Appearance selector
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(61,43,31,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 4,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 16,
      }
    })
  },
  modalDragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ebdcc3',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flexDirection: 'column',
    gap: 12,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 64,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
