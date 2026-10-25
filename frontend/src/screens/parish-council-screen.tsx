import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Platform, 
  Alert, 
  Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { typography, globalStyles } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { API_BASE_URL, apiFetch } from '../config';

interface CouncilMember {
  id: string;
  nameKey: string;
  roleKey: string;
  designationKey: string;
  phone: string;
  email: string;
  avatar: string;
}

export default function ParishCouncilScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'representatives' | 'executive'>('representatives');
  const [liveCouncilData, setLiveCouncilData] = useState<{ executive: CouncilMember[]; representatives: CouncilMember[] }>({ executive: [], representatives: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCouncil = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/api/directory/parish-council`);
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

            const executive: CouncilMember[] = [];
            const representatives: CouncilMember[] = [];

            list.forEach(item => {
              const firstName = item.first_name || item.firstName || '';
              const lastName = item.last_name || item.lastName || '';
              const fullName = `${firstName} ${lastName}`.trim() || item.occupantName || item.holder || 'Council Member';
              const member: CouncilMember = {
                id: (item.id || item._id || '').toString(),
                nameKey: fullName,
                roleKey: item.role_title || item.roleTitle || item.seat || 'Council Member',
                designationKey: item.role_title || item.roleTitle || item.seat || 'Council Member',
                phone: item.phone_number || item.phone || '',
                email: item.email || '',
                avatar: getInitials(fullName)
              };

              if (item.committee_type === 'executive' || item.category === 'Executive') {
                executive.push(member);
              } else {
                representatives.push(member);
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
        {currentMembers.map((member) => {
          const name = t(member.nameKey);
          return (
            <View key={member.id} style={[globalStyles.card, styles.memberCard]}>
              {/* Left Margin Avatar */}
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{member.avatar}</Text>
              </View>

              {/* Text Info */}
              <View style={styles.textContainer}>
                <Text numberOfLines={1} style={styles.memberName}>{name}</Text>
                <Text numberOfLines={2} style={styles.memberRole}>
                  {t(member.designationKey)}
                </Text>
              </View>

              {/* Far Right Action Buttons */}
              <View style={styles.rowActionBtnGroup}>
                <TouchableOpacity 
                  style={styles.actionIconButton}
                  onPress={() => handlePhonePress(member.phone, name)}
                  accessibilityLabel={`Call ${name}`}
                  accessibilityRole="button"
                >
                  <Ionicons name="call-outline" size={20} color={colors.error} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionIconButton}
                  onPress={() => handleEmailPress(member.email, name)}
                  accessibilityLabel={`Email ${name}`}
                  accessibilityRole="button"
                >
                  <Ionicons name="mail-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
  memberName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
  },
  memberRole: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
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
