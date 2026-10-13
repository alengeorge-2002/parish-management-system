import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Animated, Platform, Alert, Dimensions, useWindowDimensions, DeviceEventEmitter } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import { colors as staticColors, typography } from './src/styles/accessible-theme';
import { HomeScreen, PrayersScreen, ServicesScreen, ParishDirectoryScreen, MoreScreen, MassTimingsScreen, FeastCalendarScreen, LoginScreen, FamilyTableView, ParishCouncilScreen, AnnouncementsScreen, PrayerDetailScreen, AnnouncementNotificationListener } from './src/screens';
import { initializePushNotifications } from './src/utils/NotificationManager';

export const navigationRef = createNavigationContainerRef();
import { LanguageProvider, useLanguage } from './src/localization/language-context';
import { ThemeProvider, useTheme } from './src/styles/theme-context';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// import * as SplashScreen from 'expo-splash-screen';
// SplashScreen.preventAutoHideAsync(); // Commented out to bypass boot splash deadlocks


import { useFonts, NotoSerifMalayalam_400Regular, NotoSerifMalayalam_600SemiBold, NotoSerifMalayalam_700Bold } from '@expo-google-fonts/noto-serif-malayalam';

// Google Fonts loader & In-Memory PWA Registration
if (Platform.OS === 'web') {
  try {
    if (!document.getElementById('noto-serif-malayalam-styles')) {
      const style = document.createElement('style');
      style.id = 'noto-serif-malayalam-styles';
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Nunito:ital,wght@0,300..900;1,300..900&family=Noto+Serif+Malayalam:wght@400;500;600;700&display=swap');
        
        html, body, #root {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background-color: #FAF6F0;
          overflow-x: hidden;
          font-family: 'Nunito', 'Noto Serif Malayalam', serif;
        }

        * {
          font-family: 'Nunito', 'Noto Serif Malayalam', serif;
        }

        /* React Native Web text overrides so Malayalam script glyphs always render Noto Serif Malayalam */
        div, span, p, a, button, input, select, textarea, [class*="r-fontFamily"], [class*="css-text"] {
          font-family: 'Nunito', 'Noto Serif Malayalam', serif;
        }

        .font-malayalam, [lang="ml"], .malayalam-text {
          font-family: 'Noto Serif Malayalam', serif !important;
        }
      `;
      document.head.appendChild(style);
    }
  } catch (_) {}
  // PWA Standalone Meta Tags
  try {
    if (!document.querySelector('meta[name="theme-color"]')) {
      const metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      metaTheme.content = '#F4C430';
      document.head.appendChild(metaTheme);
    }
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const metaApple = document.createElement('meta');
      metaApple.name = 'apple-mobile-web-app-capable';
      metaApple.content = 'yes';
      document.head.appendChild(metaApple);
    }
  } catch (_) {}

  // Manifest and Service Worker Registration for PWA on Port 8081
  try {
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  } catch (_) {}
}



const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'NotoSerifMalayalam-Regular': NotoSerifMalayalam_400Regular,
    'NotoSerifMalayalam-SemiBold': NotoSerifMalayalam_600SemiBold,
    'NotoSerifMalayalam-Bold': NotoSerifMalayalam_700Bold,
  });

  if (!fontsLoaded && Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF6F0' }}>
        <ActivityIndicator size="large" color="#F4C430" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <MainAppWrapper />
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

// Custom Tab Bar with Spring-Animated Top Indicator Line
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [tabBarWidth, setTabBarWidth] = useState(393);
  
  // Filter out MassTimings, FeastCalendar, FamilyTableView, ParishCouncil, Announcements, and PrayerDetail from the visible tab routes
  const visibleRoutes = state.routes.filter((route: any) => 
    route.name !== 'MassTimings' && 
    route.name !== 'FeastCalendar' && 
    route.name !== 'FamilyTableView' &&
    route.name !== 'ParishCouncil' &&
    route.name !== 'Announcements' &&
    route.name !== 'PrayerDetail'
  );
  const tabWidth = tabBarWidth / visibleRoutes.length;
  const springAnim = useRef(new Animated.Value(0)).current;

  const currentRouteName = state.routes[state.index].name;

  // The active index in the visible tabs (defaults to Home index if active screen is MassTimings, FeastCalendar, or Announcements)
  const activeVisibleIndex = visibleRoutes.findIndex((r: any) => {
    if (currentRouteName === 'MassTimings' || currentRouteName === 'FeastCalendar' || currentRouteName === 'Announcements') {
      return r.name === 'Home';
    }
    if (currentRouteName === 'PrayerDetail') {
      return r.name === 'Prayers';
    }
    if (currentRouteName === 'FamilyTableView' || currentRouteName === 'ParishCouncil') {
      return r.name === 'Directory';
    }
    return r.name === currentRouteName;
  });

  const targetIndex = activeVisibleIndex >= 0 ? activeVisibleIndex : 0;

  useEffect(() => {
    Animated.spring(springAnim, {
      toValue: targetIndex * tabWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  }, [targetIndex, tabWidth]);

  return (
    <View 
      style={[
        styles.tabBarContainer, 
        { 
          backgroundColor: colors.card, 
          borderTopColor: colors.border,
          paddingBottom: insets.bottom || 12
        }
      ]}
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        if (width) setTabBarWidth(width);
      }}
    >
      {/* Spring Animated Top Border Line */}
      <Animated.View style={[
        styles.animatedIndicator,
        {
          width: tabWidth,
          transform: [{ translateX: springAnim }]
        }
      ]}>
        <View style={[styles.indicatorLine, { backgroundColor: colors.primary }]} />
      </Animated.View>

      <View style={styles.tabsRow}>
        {visibleRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          // Home tab is focused if either current screen is Home, MassTimings, or FeastCalendar
          const isFocused = (currentRouteName === route.name) || 
            (route.name === 'Home' && (currentRouteName === 'MassTimings' || currentRouteName === 'FeastCalendar')) ||
            (route.name === 'Directory' && currentRouteName === 'FamilyTableView');

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            const shouldNavigate = ((currentRouteName === 'MassTimings' || currentRouteName === 'FeastCalendar') && route.name === 'Home') ||
              (currentRouteName === 'FamilyTableView' && route.name === 'Directory') ||
              (currentRouteName === 'PrayerDetail' && route.name === 'Prayers') ? true : !isFocused;

            if (shouldNavigate && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconComponent = null;
          const iconColor = isFocused ? colors.darkGold : colors.mutedBrown;
          const iconSize = 22;

          if (route.name === 'Home') {
            iconComponent = <Ionicons name="home-outline" size={iconSize} color={iconColor} />;
          } else if (route.name === 'Prayers') {
            iconComponent = <Ionicons name="book-outline" size={iconSize} color={iconColor} />;
          } else if (route.name === 'Services') {
            iconComponent = <MaterialCommunityIcons name="church-outline" size={iconSize} color={iconColor} />;
          } else if (route.name === 'Directory') {
            iconComponent = <Ionicons name="people-outline" size={iconSize} color={iconColor} />;
          } else if (route.name === 'More') {
            iconComponent = <Ionicons name="ellipsis-horizontal" size={iconSize} color={iconColor} />;
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabButton}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View style={[
                styles.iconContainer,
                isFocused && { backgroundColor: isDark ? 'rgba(235, 220, 195, 0.16)' : 'rgba(201, 168, 76, 0.16)' }
              ]}>
                {iconComponent}
              </View>
              <Text 
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.darkGold : colors.mutedBrown }
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Main App Container with Web Bezel / Simulator
function MainAppWrapper() {
  const { t, userToken, setUserToken } = useLanguage();
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  
  // Drawer Animation (translateX) - Slides from the LEFT
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerSlideAnim = useRef(new Animated.Value(-300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Live status bar time
  const [currentTime, setCurrentTime] = useState('09:41');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };


  useEffect(() => {
    // Clock for status bar
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      initializePushNotifications().catch(() => {});
    }
  }, []);

  useEffect(() => {
    // Root lifecycle evaluation of stored user token on application boot
    const evaluateUserToken = async () => {
      try {
        let token = null;
        try {
          token = await SecureStore.getItemAsync('user_token') || localStorage.getItem('user_token');
        } catch (_) {
          try {
            token = localStorage.getItem('user_token');
          } catch (__) {}
        }
        
        if (token) {
          setUserToken(token);
        }
      } catch (e) {
        console.warn('Failed to evaluate user token on boot:', e);
      } finally {
        setIsLoading(false);
        // try { await SplashScreen.hideAsync(); } catch (_) {}
      }
    };

    evaluateUserToken();
  }, []);

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerSlideAnim, {
        toValue: 0,
        useNativeDriver: Platform.OS !== 'web',
        friction: 8,
        tension: 40,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(drawerSlideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start(() => setDrawerOpen(false));
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.bodyBold, styles.loadingText, { color: colors.foreground }]}>
          Loading Parish Hub...
        </Text>
      </View>
    );
  }

  // Bottom Navigation Navigation Shell
  const appContent = (
    <View style={{ flex: 1, position: 'relative' }}>
      {userToken === null ? (
        <LoginScreen onLoginSuccess={(token: string) => setUserToken(token)} />
      ) : (
        <NavigationContainer ref={navigationRef}>
          <Tab.Navigator
            backBehavior="history"
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={() => ({
              headerShown: false,
              headerStyle: [styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }],
              headerTitleStyle: [styles.headerTitle, { color: colors.foreground }],
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={openDrawer}
                  style={styles.hamburgerButton}
                  accessibilityLabel="Open navigation drawer"
                  accessibilityRole="button"
                >
                  <Text style={[styles.hamburgerIcon, { color: colors.foreground }]}>☰</Text>
                </TouchableOpacity>
              ),
            })}
          >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              tabBarLabel: t('tab-home'),
              headerTitle: t('tab-home')
            }} 
          />
          <Tab.Screen 
            name="Prayers" 
            component={PrayersScreen} 
            options={{ 
              tabBarLabel: t('tab-prayers'),
              headerTitle: t('tab-prayers')
            }} 
          />
          <Tab.Screen 
            name="Services" 
            component={ServicesScreen} 
            options={{ 
              tabBarLabel: t('tab-services'),
              headerTitle: t('tab-services')
            }} 
          />
          <Tab.Screen 
            name="Directory" 
            component={ParishDirectoryScreen} 
            options={{ 
              tabBarLabel: t('tab-directory'),
              headerTitle: t('tab-directory')
            }} 
          />
          <Tab.Screen 
            name="More" 
            component={MoreScreen} 
            options={{ 
              tabBarLabel: t('tab-more'),
              headerTitle: t('tab-more')
            }} 
          />
          <Tab.Screen 
            name="MassTimings" 
            component={MassTimingsScreen} 
            options={{ 
              tabBarLabel: t('mass-timings-title'),
              headerTitle: t('mass-timings-title'),
              headerShown: false
            }} 
          />
          <Tab.Screen 
            name="FeastCalendar" 
            component={FeastCalendarScreen} 
            options={{ 
              tabBarLabel: t('calendar-title'),
              headerTitle: t('calendar-title'),
              headerShown: false
            }} 
          />
          <Tab.Screen 
            name="FamilyTableView" 
            component={FamilyTableView} 
            options={{ 
              tabBarLabel: 'Family Table',
              headerTitle: 'Family Table',
              headerShown: false
            }} 
          />
          <Tab.Screen 
            name="ParishCouncil" 
            component={ParishCouncilScreen} 
            options={{ 
              tabBarLabel: 'Parish Council',
              headerTitle: 'Parish Council',
              headerShown: false
            }} 
          />
          <Tab.Screen 
            name="Announcements" 
            component={AnnouncementsScreen} 
            options={{ 
              tabBarLabel: 'Announcements',
              headerTitle: 'Announcements',
              headerShown: false
            }} 
          />
          <Tab.Screen 
            name="PrayerDetail" 
            component={PrayerDetailScreen} 
            options={{ 
              tabBarLabel: 'Prayer Detail',
              headerTitle: 'Prayer Detail',
              headerShown: false
            }} 
          />
        </Tab.Navigator>
          <AnnouncementNotificationListener />
        </NavigationContainer>
      )}

      {/* Sliding Left Side Drawer */}
      {drawerOpen && (
        <>
          <Animated.View style={[
            styles.backdrop,
            { opacity: backdropOpacity, backgroundColor: colors.overlay }
          ]}>
            <TouchableOpacity 
              style={{ flex: 1 }}
              activeOpacity={1} 
              onPress={closeDrawer} 
              accessibilityLabel="Close menu"
            />
          </Animated.View>
          
          <Animated.View style={[
            styles.drawerContainer,
            {
              transform: [{ translateX: drawerSlideAnim }],
              backgroundColor: colors.card,
              borderRightColor: colors.primary,
            }
          ]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerLogo}>🕊️</Text>
              <Text style={[styles.drawerTitle, { color: colors.foreground }]}>{t('badge')}</Text>
              <Text style={[styles.drawerSubtitle, { color: colors.textMuted }]}>{t('parish')}</Text>
            </View>
            
            <View style={[styles.drawerDivider, { backgroundColor: colors.border }]} />
 
            <View style={styles.drawerMenu}>
              <TouchableOpacity 
                style={[styles.drawerItem, { backgroundColor: colors.background, borderColor: colors.border }]} 
                onPress={() => { closeDrawer(); Alert.alert(t('daily-readings'), t('readings-body')); }}
              >
                <Text style={[styles.drawerItemText, { color: colors.foreground }]}>📖 {t('daily-readings')}</Text>
              </TouchableOpacity>
 
              {deferredPrompt && (
                <TouchableOpacity 
                  style={[styles.drawerItem, { backgroundColor: colors.darkGold, borderColor: colors.primary }]} 
                  onPress={() => { closeDrawer(); handleInstallPWA(); }}
                >
                  <Text style={[styles.drawerItemText, { color: '#ffffff' }]}>📲 Install App to Home Screen</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.drawerItem, { backgroundColor: colors.background, borderColor: colors.border }]} 
                onPress={() => { closeDrawer(); Alert.alert(t('priests-and-religious'), t('priests-desc')); }}
              >
                <Text style={[styles.drawerItemText, { color: colors.foreground }]}>📞 {t('priests-and-religious')}</Text>
              </TouchableOpacity>
            </View>

 
            <TouchableOpacity style={styles.closeButton} onPress={closeDrawer}>
              <Text style={[styles.closeButtonText, { color: colors.mediumBrown }]}>◀ {t('close').toUpperCase()}</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </View>
  );
 
  // Return simulated screen wrapper for Web, or direct content for Native
  if (Platform.OS === 'web') {
    return (
      <View style={styles.desktopWrapper}>
        <View style={[styles.mainCanvas, { backgroundColor: colors.background }]}>
          {appContent}
        </View>
      </View>
    );
  }
 
  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {appContent}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: staticColors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: staticColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: staticColors.foreground,
  },
  header: {
    backgroundColor: staticColors.card,
    borderBottomWidth: 2,
    borderBottomColor: staticColors.border,
    height: 76,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: staticColors.foreground,
  },
  hamburgerButton: {
    marginLeft: 16,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburgerIcon: {
    fontSize: 28,
    color: staticColors.foreground,
    fontWeight: 'bold',
  },
  
  // Custom Tab Bar styles
  tabBarContainer: {
    backgroundColor: staticColors.card,
    borderTopColor: staticColors.border,
    borderTopWidth: 2,
    minHeight: 76,
    position: 'relative',
  },
  animatedIndicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorLine: {
    height: 3,
    width: 24, // small clean indicator capsule centered above tab
    backgroundColor: staticColors.primary,
    borderRadius: 1.5,
  },
  tabsRow: {
    flexDirection: 'row',
    height: 72,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 64,
    height: 32,
    borderRadius: 16, // rounded pill/capsule background
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(201, 168, 76, 0.16)', // soft gold/cream capsule background shape
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Nunito, sans-serif' : 'System',
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },

  // Sliding Side Drawer styles (slides in from left)
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: staticColors.overlay,
    zIndex: 999,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: staticColors.card,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderRightWidth: 3,
    borderRightColor: staticColors.primary,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: staticColors.foreground,
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '10px 0 24px rgba(61, 43, 31, 0.12)',
      }
    })
  },
  drawerHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerLogo: {
    fontSize: 48,
    marginBottom: 8,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: staticColors.foreground,
    textAlign: 'center',
  },
  drawerSubtitle: {
    fontSize: 14,
    color: staticColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  drawerDivider: {
    height: 1.5,
    backgroundColor: staticColors.border,
    marginVertical: 16,
  },
  drawerMenu: {
    flex: 1,
  },
  drawerItem: {
    backgroundColor: '#faf6f0',
    borderWidth: 1.5,
    borderColor: staticColors.border,
    borderRadius: 16, // Exactly 16px border radius
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    minHeight: 64, // Oversized senior touch target comfort
    justifyContent: 'center',
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: staticColors.foreground,
  },
  closeButton: {
    marginTop: 8,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 64, // Oversized senior touch target comfort
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: staticColors.mediumBrown,
  },

  // Web Shell & Viewport Setup (Full width on Web, Native on Mobile)
  desktopWrapper: Platform.select({
    web: {
      flex: 1,
      width: '100%',
      minHeight: '100vh',
      backgroundColor: staticColors.background,
    },
    default: {
      flex: 1,
    }
  }) as any,
  mainCanvas: Platform.select({
    web: {
      flex: 1,
      width: '100%',
      minHeight: '100vh',
      backgroundColor: staticColors.background,
    },
    default: {
      flex: 1,
    }
  }) as any



});
