import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  RefreshControl,
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { globalStyles, typography } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { API_BASE_URL, apiFetch } from '../config';

interface Announcement {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  priority?: string;
  announcement_date?: string;
  created_at?: string;
}

export default function AnnouncementsScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
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
        const rawData: Announcement[] = Array.isArray(data) ? data : [];
        
        // Sort announcements by date timestamp descending (latest first)
        const sortedData = rawData.sort((a: any, b: any) => {
          const dateA = new Date(a.date || a.announcement_date || a.created_at || a.createdAt || 0).getTime();
          const dateB = new Date(b.date || b.announcement_date || b.created_at || b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        setAnnouncements(sortedData);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.warn('[AnnouncementsScreen] API fetch error:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '06-02';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '06-02';
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}-${day}`;
    } catch (_) {
      return '06-02';
    }
  };

  const renderItem = ({ item }: { item: Announcement }) => {
    const isHighPriority = item.priority?.toLowerCase() === 'high';
    
    return (
      <View style={[globalStyles.card, styles.announcementCard]}>
        <View style={styles.cardHeader}>
          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{formatDate(item.announcement_date || item.created_at)}</Text>
          </View>

          {/* Priority Badge */}
          {item.priority && (
            <View style={[
              styles.priorityBadge, 
              isHighPriority ? styles.priorityHigh : styles.priorityNormal
            ]}>
              <Text style={[
                styles.priorityText, 
                isHighPriority ? styles.priorityTextHigh : styles.priorityTextNormal
              ]}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.announcementTitle}>{item.title}</Text>
        <Text style={styles.announcementContent}>{item.content}</Text>

        {/* Display image if present */}
        {item.image_url && item.image_url.trim() !== '' && (
          <Image 
            source={{ uri: item.image_url.startsWith('/uploads') ? `${API_BASE_URL}${item.image_url}` : item.image_url }}
            style={styles.announcementImage}
            resizeMode="cover"
          />
        )}
      </View>
    );
  };

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
            <Text style={styles.screenTitle}>{t('parish-announcements')}</Text>
            <Text style={styles.subtext}>Latest updates and news</Text>
          </View>
        </View>
        <View style={styles.goldLine} />
      </View>

      {/* Announcements List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
              colors={[colors.primary]} 
              tintColor={colors.primary}
            />
          }
        >
          {announcements.map((item: any) => {
            const itemTitle = item.title || item.heading || item.name || 'Parish Announcement';
            const itemContent = item.content || item.description || item.message || item.text || '';
            const itemImg = item.posterImage || item.imageUrl || item.image_url || item.poster_url;
            const isHigh = item.priority && String(item.priority).toLowerCase() === 'high';

            return (
              <View key={item.id || item._id} style={[globalStyles.card, styles.announcementCard]}>
                <View style={styles.cardHeader}>
                  {/* Date Badge */}
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>{formatDate(item.announcement_date || item.created_at || item.createdAt || item.date)}</Text>
                  </View>

                  {/* Priority Badge */}
                  {item.priority && (
                    <View style={[
                      styles.priorityBadge, 
                      isHigh ? styles.priorityHigh : styles.priorityNormal
                    ]}>
                      <Text style={[
                        styles.priorityText, 
                        isHigh ? styles.priorityTextHigh : styles.priorityTextNormal
                      ]}>
                        {String(item.priority).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.announcementTitle}>{itemTitle}</Text>
                <Text style={styles.announcementContent}>{itemContent}</Text>

                {/* Display image if present */}
                {itemImg && String(itemImg).trim() !== '' && (
                  <Image 
                    source={{ uri: String(itemImg).startsWith('/uploads') ? `${API_BASE_URL}${itemImg}` : itemImg }}
                    style={styles.announcementImage}
                    resizeMode="cover"
                  />
                )}
              </View>
            );
          })}
          {announcements.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No announcements found.</Text>
            </View>
          )}
        </ScrollView>
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
  },
  subtext: {
    fontSize: 14,
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
  listContainer: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  announcementCard: {
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.card,
    flexGrow: 0,
    flexShrink: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateBadge: {
    backgroundColor: isDark ? '#2c2c2c' : '#f5edd6',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  priorityBadge: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  priorityHigh: {
    backgroundColor: 'rgba(178, 59, 59, 0.1)',
    borderWidth: 1,
    borderColor: colors.error,
  },
  priorityNormal: {
    backgroundColor: isDark ? '#252525' : '#f5f0e6',
    borderWidth: 1,
    borderColor: isDark ? '#333333' : '#dfd4be',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  priorityTextHigh: {
    color: colors.error,
  },
  priorityTextNormal: {
    color: colors.mutedBrown,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.mediumBrown,
  },
  announcementImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    fontStyle: 'italic',
  }
});
