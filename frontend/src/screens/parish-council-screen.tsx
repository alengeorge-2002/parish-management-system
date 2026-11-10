import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Platform, 
  Alert, 
  Linking,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { typography, globalStyles } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { API_BASE_URL, apiFetch } from '../config';

interface CouncilSeat {
  id: string;
  seatTitle: string;
  name: string;
  houseName: string;
  wardName: string;
  wardNumber: number | string | null;
  phone: string;
  email: string;
  status: 'filled' | 'vacant';
  category: 'executive' | 'ward_rep';
  avatar: string;
}

export default function ParishCouncilScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t, language } = useLanguage();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'representatives' | 'executive'>('representatives');
  const [liveCouncilData, setLiveCouncilData] = useState<{ executive: CouncilSeat[]; representatives: CouncilSeat[] }>({ executive: [], representatives: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCouncil = async () => {
      try {
        let response = await apiFetch(`${API_BASE_URL}/api/parish-council/seats`);
        if (!response.ok) {
          response = await apiFetch(`${API_BASE_URL}/api/directory/parish-council`);
        }
        if (response.ok) {
          const list: any[] = await response.json();
          if (Array.isArray(list)) {
            const getInitials = (name: string) => {
              const cleaned = name.replace(/^(Rev\.\s+Fr\.|Fr\.|Sr\.|Br\.)\s+/i, '');
              const parts = cleaned.trim().split(/\s+/);
              if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
              }
              return parts[0] ? parts[0][0].toUpperCase() : '';
            };

            const executive: CouncilSeat[] = [];
            const representatives: CouncilSeat[] = [];

            list.forEach(item => {
              const firstName = item.first_name || item.firstName || '';
              const lastName = item.last_name || item.lastName || '';
              const resolvedName =
                item.occupant_name ||
                item.occupantName ||
                `${firstName} ${lastName}`.trim() ||
                '';
              const isFilled =
                (item.status === 'filled' || Boolean(item.member_id)) &&
                Boolean(resolvedName) &&
                resolvedName.toLowerCase() !== 'unassigned';
              const rawTitle = item.seat_title || item.role_title || item.roleTitle || item.seat || 'Council Seat';
              const isExec =
                (item.category || '').toLowerCase() === 'executive' ||
                (item.committee_type || '').toLowerCase() === 'executive';

              const seat: CouncilSeat = {
                id: (item.id || item._id || '').toString(),
                seatTitle: rawTitle,
                name: isFilled ? resolvedName : '',
                houseName: isFilled ? (item.house_name || item.houseName || '') : '',
                wardName: item.ward_name || item.wardName || '',
                wardNumber: item.ward_number ?? item.wardNumber ?? null,
                phone: isFilled ? (item.phone || item.phone_number || '') : '',
                email: isFilled ? (item.email || '') : '',
                status: isFilled ? 'filled' : 'vacant',
                category: isExec ? 'executive' : 'ward_rep',
                avatar: isFilled ? getInitials(resolvedName) : '',
              };

              if (isExec) {
                executive.push(seat);
              } else {
                representatives.push(seat);
              }
            });

            setLiveCouncilData({ executive, representatives });
          }
        }
      } catch (error) {
        console.warn('Failed to load dynamic council data:', error);
        setLiveCouncilData({ executive: [], representatives: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchCouncil();
  }, []);

  const handlePhonePress = (phone: string, name: string) => {
    if (!phone) {
      Alert.alert(t('error'), 'No phone number available');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert(t('error'), `Could not call ${name}`);
    });
  };

  const handleEmailPress = (email: string, name: string) => {
    if (!email) {
      Alert.alert(t('error'), 'No email address available');
      return;
    }
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert(t('error'), `Could not email ${name}`);
    });
  };

  const currentMembers = activeTab === 'representatives' ? liveCouncilData.representatives : liveCouncilData.executive;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Header Bar */}
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
            <Text style={styles.screenTitle}>{t('parish-council-title')}</Text>
            <Text style={styles.subtext}>{t('council-dir-desc')}</Text>
          </View>
        </View>
        <View style={styles.goldLine} />
      </View>

      {/* Segmented Tab Bar */}
      <View style={styles.tabBarContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'representatives' ? styles.tabActive : styles.tabInactive]}
          onPress={() => setActiveTab('representatives')}
          accessibilityLabel={t('ward-representatives')}
          accessibilityRole="button"
        >
          <Text style={[styles.tabText, activeTab === 'representatives' ? styles.tabTextActive : styles.tabTextInactive]}>
            {t('ward-representatives')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'executive' ? styles.tabActive : styles.tabInactive]}
          onPress={() => setActiveTab('executive')}
          accessibilityLabel={t('executive-committee')}
          accessibilityRole="button"
        >
          <Text style={[styles.tabText, activeTab === 'executive' ? styles.tabTextActive : styles.tabTextInactive]}>
            {t('executive-committee')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Council Members List */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : currentMembers.length === 0 ? (
          <View style={[globalStyles.card, styles.emptyCard]}>
            <Ionicons name="people-outline" size={32} color={colors.mutedBrown} />
            <Text style={styles.emptyCardTitle}>
              {language === 'ml' ? 'കൗൺസിൽ സീറ്റുകൾ ഒന്നും ലഭ്യമല്ല' : 'No council seats listed yet'}
            </Text>
          </View>
        ) : (
          currentMembers.map((seat) => {
            const isFilled = seat.status === 'filled';
            const wardHeaderLabel = seat.wardName
              ? `Ward #${seat.wardNumber || ''} · ${seat.wardName}`
              : t(seat.seatTitle);

            return (
              <View key={seat.id} style={[globalStyles.card, styles.memberCard]}>
                {/* Left Margin Avatar */}
                <View style={isFilled ? styles.avatarCircle : styles.vacantAvatarCircle}>
                  {isFilled ? (
                    <Text style={styles.avatarInitials}>{seat.avatar}</Text>
                  ) : (
                    <Ionicons name="person-outline" size={20} color={colors.mutedBrown} />
                  )}
                </View>

                {/* Text Info */}
                <View style={styles.textContainer}>
                  {isFilled ? (
                    <>
                      {activeTab === 'representatives' ? (
                        <>
                          <Text numberOfLines={1} style={styles.wardLabelText}>
                            {wardHeaderLabel}
                          </Text>
                          <Text numberOfLines={1} style={styles.memberName}>
                            {t(seat.name)}
                          </Text>
                          {seat.houseName ? (
                            <Text numberOfLines={1} style={styles.memberHouse}>
                              {seat.houseName}
                            </Text>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <Text numberOfLines={2} style={styles.wardLabelText}>
                            {t(seat.seatTitle)}
                          </Text>
                          <Text numberOfLines={1} style={styles.memberName}>
                            {t(seat.name)}
                          </Text>
                          {seat.houseName ? (
                            <Text numberOfLines={1} style={styles.memberHouse}>
                              {seat.houseName}
                            </Text>
                          ) : null}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Text numberOfLines={2} style={styles.vacantSeatTitle}>
                        {activeTab === 'representatives' && seat.wardName
                          ? `Ward #${seat.wardNumber || ''} · ${seat.wardName}`
                          : t(seat.seatTitle)}
                      </Text>
                      {activeTab === 'representatives' && (
                        <Text numberOfLines={1} style={styles.memberRole}>
                          {t(seat.seatTitle)}
                        </Text>
                      )}
                    </>
                  )}
                </View>

                {/* Far Right Action Buttons or Vacant Badge */}
                {isFilled ? (
                  <View style={styles.rowActionBtnGroup}>
                    {seat.phone ? (
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => handlePhonePress(seat.phone, seat.name)}
                        accessibilityLabel={`Call ${seat.name}`}
                        accessibilityRole="button"
                      >
                        <Ionicons name="call-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    ) : null}
                    {seat.email ? (
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => handleEmailPress(seat.email, seat.name)}
                        accessibilityLabel={`Email ${seat.name}`}
                        accessibilityRole="button"
                      >
                        <Ionicons name="mail-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.vacantBadge}>
                    <Text style={styles.vacantBadgeText}>Vacant / ഒഴിവ്</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
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
    borderRadius: 16, // Exactly 16px rounded corners
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border, // Sand gold border lines
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
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
  },
  subtext: {
    fontSize: 14,
    color: colors.mediumBrown,
    marginTop: 2,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  goldLine: {
    height: 3,
    backgroundColor: colors.primary,
    width: 60,
    marginTop: 10,
    borderRadius: 1.5,
  },
  tabBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    height: 64, // Senior touch target height [60, 75] px
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  tabActive: {
    backgroundColor: '#c9a84c', // Solid gold background
    borderColor: '#c9a84c',
    borderWidth: 1.5,
    borderRadius: 32, // Pills border radius
  },
  tabInactive: {
    backgroundColor: 'transparent', // Transparent fill
    borderColor: colors.border, // Thin cream outline
    borderWidth: 1.5,
    borderRadius: 32, // Pills border radius
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Nunito, sans-serif' : 'System',
  },
  tabTextActive: {
    color: '#ffffff', // Bold white Nunito text
  },
  tabTextInactive: {
    color: '#c9a84c', // Gold text
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 1280, // fluid responsive layout matching household lookup
    width: '100%',
    alignSelf: 'center',
  },
  memberCard: {
    backgroundColor: '#fff8e7', // Premium cream background
    borderRadius: 16, // Exactly 16px corner radius
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#2c2c2c' : '#ebdcc3', // Sand gold background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: colors.primary, // Gold border accent
  },
  vacantAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#25221d' : '#f5ebd6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? 'Nunito, sans-serif' : 'System',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  wardLabelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.darkGold,
    marginBottom: 2,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", sans-serif' : 'NotoSerifMalayalam-SemiBold',
  },
  memberName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
  },
  memberHouse: {
    fontSize: 12,
    color: colors.mediumBrown,
    marginTop: 2,
    fontFamily: Platform.OS === 'web' ? 'Nunito, sans-serif' : 'System',
  },
  memberRole: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  vacantSeatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-SemiBold',
  },
  vacantBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: isDark ? '#2a241c' : '#f5ebd6',
    borderWidth: 1,
    borderColor: colors.border,
  },
  vacantBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.mutedBrown,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", sans-serif' : 'NotoSerifMalayalam-SemiBold',
  },
  loadingState: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: isDark ? colors.card : '#fff8e7',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 10,
  },
  emptyCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedBrown,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", sans-serif' : 'NotoSerifMalayalam-SemiBold',
  },
  rowActionBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(178, 59, 59, 0.1)', // Identical pink-tint background shape
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  }
});
