import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { API_BASE_URL, apiFetch } from '../config';

// Navigation reference that will be defined and exported in App.tsx
import { navigationRef } from '../../App';

export default function AnnouncementNotificationListener() {
  const { colors, isDark } = useTheme();
  const { language: lang } = useLanguage();
  const insets = useSafeAreaInsets();
  
  const [newAnnouncement, setNewAnnouncement] = useState<any>(null);
  const slideAnim = useRef(new Animated.Value(-160)).current;
  const isBannerVisible = useRef(false);
  const timerRef = useRef<any>(null);

  // Store references to the latest checked announcement ID to prevent multiple triggers
  const lastSeenIdRef = useRef<number | null>(null);
  
  const fetchLatestAnnouncement = async (isFirstLoad: boolean = false) => {
    let token = null;
    try {
      token = await SecureStore.getItemAsync('user_token') || localStorage.getItem('user_token');
    } catch (_) {
      try { token = localStorage.getItem('user_token'); } catch (__) {}
    }

    // Check if notifications are enabled
    let notificationsEnabled = true;
    try {
      const saved = await SecureStore.getItemAsync('notifications_enabled') || localStorage.getItem('notifications_enabled');
      if (saved !== null) {
        notificationsEnabled = saved === 'true';
      }
    } catch (_) {
      try {
        const webSaved = localStorage.getItem('notifications_enabled');
        if (webSaved !== null) {
          notificationsEnabled = webSaved === 'true';
        }
      } catch (__) {}
    }

    if (!notificationsEnabled && !isFirstLoad) {
      return;
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
        const announcements = Array.isArray(data) ? data : [];
        if (announcements.length > 0) {
          const latest = announcements[0]; // Sort order is DESC, so first is newest
          const latestId = latest.id;

          // Load last seen ID from storage if ref is empty
          if (lastSeenIdRef.current === null) {
            try {
              const savedId = await SecureStore.getItemAsync('last_notified_announcement_id') || localStorage.getItem('last_notified_announcement_id');
              if (savedId) {
                lastSeenIdRef.current = parseInt(savedId, 10);
              }
            } catch (_) {
              try {
                const webSavedId = localStorage.getItem('last_notified_announcement_id');
                if (webSavedId) {
                  lastSeenIdRef.current = parseInt(webSavedId, 10);
                }
              } catch (__) {}
            }
          }

          if (isFirstLoad) {
            // On first app boot, mark the current latest announcement as seen so they are not spammed with old announcements
            lastSeenIdRef.current = latestId;
            try {
              await SecureStore.setItemAsync('last_notified_announcement_id', String(latestId));
              localStorage.setItem('last_notified_announcement_id', String(latestId));
            } catch (_) {
              try {
                localStorage.setItem('last_notified_announcement_id', String(latestId));
              } catch (__) {}
            }
            return;
          }

          // If there is a newer announcement and notifications are enabled, trigger the banner
          if (lastSeenIdRef.current !== null && latestId > lastSeenIdRef.current && notificationsEnabled) {
            lastSeenIdRef.current = latestId;
            try {
              await SecureStore.setItemAsync('last_notified_announcement_id', String(latestId));
              localStorage.setItem('last_notified_announcement_id', String(latestId));
            } catch (_) {
              try {
                localStorage.setItem('last_notified_announcement_id', String(latestId));
              } catch (__) {}
            }
            
            triggerNotification(latest);
          }
        }
      }
    } catch (error) {
      console.warn('Notification listener fetch error:', error);
    }
  };

  const triggerNotification = (announcement: any) => {
    setNewAnnouncement(announcement);
    isBannerVisible.current = true;

    // Animate banner in
    Animated.spring(slideAnim, {
      toValue: insets.top > 0 ? insets.top + 10 : 20,
      useNativeDriver: Platform.OS !== 'web',
      friction: 8,
      tension: 40,
    }).start();

    // Auto-dismiss after 7 seconds
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      dismissBanner();
    }, 7000);
  };

  const dismissBanner = () => {
    isBannerVisible.current = false;
    Animated.timing(slideAnim, {
      toValue: -160,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setNewAnnouncement(null);
    });
  };

  const handleBannerPress = () => {
    dismissBanner();
    // Navigate to the Announcements screen using global ref
    if (navigationRef.isReady()) {
      // Announcements screen is registered as "Announcements" under Tab Navigator in App.tsx
      (navigationRef as any).navigate('Announcements');
    }
  };

  useEffect(() => {
    // Initial fetch to mark existing announcements as read/seen
    fetchLatestAnnouncement(true);

    // Periodically poll every 20 seconds
    const intervalId = setInterval(() => {
      fetchLatestAnnouncement(false);
    }, 20000);

    return () => {
      clearInterval(intervalId);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!newAnnouncement) return null;

  const titleLabel = lang === 'ml' ? 'പുതിയ അറിയിപ്പ് 🔔' : 'New Announcement 🔔';
  const actionLabel = lang === 'ml' ? 'വായിക്കുക' : 'Read';

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.card,
          borderColor: colors.primary,
          shadowColor: colors.foreground,
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.bannerContent} 
        onPress={handleBannerPress} 
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`New announcement: ${newAnnouncement.title}. Press to read.`}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="notifications" size={24} color={colors.primary} />
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.bannerTitle, { color: colors.primary }]}>{titleLabel}</Text>
          <Text style={[styles.announcementTitle, { color: colors.foreground }]} numberOfLines={1}>
            {newAnnouncement.title}
          </Text>
          <Text style={[styles.announcementSnippet, { color: colors.textMuted }]} numberOfLines={1}>
            {newAnnouncement.content}
          </Text>
        </View>
        <View style={styles.actionsWrapper}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleBannerPress}>
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={dismissBanner}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute' as any,
    left: 16,
    right: 16,
    zIndex: 99999,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    backgroundColor: '#fffdf9',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 20px rgba(61, 43, 31, 0.15)',
        position: 'fixed' as any,
        maxWidth: 500,
        alignSelf: 'center',
        top: 20,
        left: '50%',
        marginLeft: -250,
      },
    }),
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  announcementSnippet: {
    fontSize: 13,
  },
  actionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
