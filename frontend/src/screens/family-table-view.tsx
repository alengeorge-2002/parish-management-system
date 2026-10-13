import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Platform, 
  Modal, 
  Linking, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { globalStyles, typography } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { API_BASE_URL, apiFetch } from '../config';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function FamilyTableView() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t, language } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { family, highlightMemberId } = route.params as { family: any, highlightMemberId?: number };
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      let token = null;
      try {
        token = await SecureStore.getItemAsync('user_token') || localStorage.getItem('user_token');
      } catch (_) {
        try { token = localStorage.getItem('user_token'); } catch (__) {}
      }

      try {
        const response = await apiFetch(`${API_BASE_URL}/api/admin/members`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const rawMembers = await response.json();
          const allMembers = Array.isArray(rawMembers) ? rawMembers : [];
          // Filter members belonging strictly to this family_id
          const familyMembers = allMembers.filter((m: any) => m.family_id === family.id);
          
          // Map to rows
          const mapped = familyMembers.map((m: any) => {
            const formatVal = (val: any) => {
              if (val === null || val === undefined || val === '' || val === '-') {
                return '-';
              }
              // Format ISO date string to YYYY-MM-DD
              if (typeof val === 'string' && val.includes('T')) {
                return val.split('T')[0];
              }
              return val;
            };

            return {
              id: m.id,
              name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Unnamed Member',
              relation: m.relationship_role || 'Member',
              dob: formatVal(m.dob),
              dom: formatVal(m.dom),
              occupation: formatVal(m.occupation),
              bloodGroup: formatVal(m.blood_group),
              phone: m.phone_number || family.contactNumber || '',
              email: m.email || family.email || '',
              avatar: m.relationship_role === 'Husband' || m.relationship_role === 'Father' ? '👨' : 
                     (m.relationship_role === 'Wife' || m.relationship_role === 'Mother' ? '👩' : 
                     (m.relationship_role === 'Son' ? '👦' : 
                     (m.relationship_role === 'Daughter' ? '👧' : '👤')))
            };
          });
          setMembers(mapped);
        }
      } catch (e) {
        console.warn('Failed to load family members:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyMembers();
  }, [family.id]);

  const handlePhonePress = (phone: string) => {
    if (!phone) {
      Alert.alert(t('error'), 'No phone number available');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(err => {
      Alert.alert(t('error'), 'Could not open phone dialer');
    });
  };

  const handleEmailPress = (email: string) => {
    if (!email) {
      Alert.alert(t('error'), 'No email address available');
      return;
    }
    Linking.openURL(`mailto:${email}`).catch(err => {
      Alert.alert(t('error'), 'Could not open email client');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header with house name in Cinzel Font */}
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
            <Text numberOfLines={1} style={styles.houseTitle}>
              {family.houseName.toUpperCase()}
            </Text>
            <Text style={styles.wardSubtext}>
              {family.ward}
            </Text>
          </View>
        </View>
        <View style={styles.goldLine} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollBodyContent}>
          {/* Family Card summary at the top */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryHouse}>{family.houseName}</Text>
            <Text style={styles.summaryAddress}>{family.homeAddress}</Text>
            <Text style={styles.summaryUnit}>
              {`${t('unit-number')}: ${family.unitNumber}`}
            </Text>
          </View>

          {/* Structured Responsive Table */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollView}>
            <View style={styles.tableContainer}>
              {/* Table Header Row */}
              <View style={styles.tableHeaderRow}>
                <View style={[styles.headerCell, styles.colSl]}>
                  <Text style={styles.headerCellText}>{t('col-sl-no')}</Text>
                </View>
                <View style={[styles.headerCell, styles.colName]}>
                  <Text style={styles.headerCellText}>{t('col-name')}</Text>
                </View>
                <View style={[styles.headerCell, styles.colRelation]}>
                  <Text style={styles.headerCellText}>{t('col-relation')}</Text>
                </View>
                <View style={[styles.headerCell, styles.colDob]}>
                  <Text style={styles.headerCellText}>{t('col-dob')}</Text>
                </View>
                <View style={[styles.headerCell, styles.colDom]}>
                  <Text style={styles.headerCellText}>{t('col-dom')}</Text>
                </View>
                <View style={[styles.headerCell, styles.colOccupation]}>
                  <Text style={styles.headerCellText}>{t('col-occupation')}</Text>
                </View>
                <View style={[styles.headerCell, styles.colBlood]}>
                  <Text style={styles.headerCellText}>{t('col-blood-group')}</Text>
                </View>
              </View>

              {/* Table Data Rows */}
              {members.map((item, index) => (
                <TouchableOpacity 
                  key={item.id}
                  style={[
                    styles.tableDataRow, 
                    index % 2 === 1 && styles.tableDataRowAlternate,
                    item.id === highlightMemberId && styles.highlightedRow
                  ]}
                  onPress={() => setSelectedMember(item)}
                  accessibilityLabel={`View details for ${item.name}`}
                  activeOpacity={0.7}
                >
                  <View style={[styles.dataCell, styles.colSl]}>
                    <Text style={styles.dataCellText}>{index + 1}</Text>
                  </View>
                  <View style={[styles.dataCell, styles.colName]}>
                    <Text style={[styles.dataCellText, styles.boldText]}>{item.name}</Text>
                  </View>
                  <View style={[styles.dataCell, styles.colRelation]}>
                    <Text style={styles.dataCellText}>{item.relation}</Text>
                  </View>
                  <View style={[styles.dataCell, styles.colDob]}>
                    <Text style={styles.dataCellText}>{item.dob}</Text>
                  </View>
                  <View style={[styles.dataCell, styles.colDom]}>
                    <Text style={styles.dataCellText}>{item.dom}</Text>
                  </View>
                  <View style={[styles.dataCell, styles.colOccupation]}>
                    <Text style={styles.dataCellText}>{item.occupation}</Text>
                  </View>
                  <View style={[styles.dataCell, styles.colBlood]}>
                    <Text style={styles.dataCellText}>{item.bloodGroup}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {members.length === 0 && (
                <View style={styles.emptyTable}>
                  <Text style={styles.emptyTableText}>{t('no-members-found')}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </ScrollView>
      )}

      {/* Clean Bottom Drawer / Modal */}
      {selectedMember && (
        <Modal
          visible={selectedMember !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedMember(null)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity 
              style={styles.modalDismissArea}
              activeOpacity={1}
              onPress={() => setSelectedMember(null)}
            />
            <View style={styles.modalCard}>
              {/* Drag Indicator Bar */}
              <View style={styles.modalDragHandle} />

              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>{t('modal-details-title')}</Text>
                <TouchableOpacity 
                  onPress={() => setSelectedMember(null)}
                  style={styles.modalCloseButton}
                  accessibilityLabel="Close dialog"
                >
                  <Ionicons name="close-circle-outline" size={28} color={colors.mutedBrown} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                {/* Avatar and Name */}
                <View style={styles.modalProfileRow}>
                  <View style={styles.modalAvatarCircle}>
                    <Text style={styles.modalAvatarEmoji}>{selectedMember.avatar}</Text>
                  </View>
                  <View style={styles.modalProfileText}>
                    <Text style={styles.modalMemberName}>{selectedMember.name}</Text>
                    <Text style={styles.modalMemberRelation}>
                      {`${t('modal-role')}: ${selectedMember.relation}`}
                    </Text>
                  </View>
                </View>

                {/* Additional Info Cards */}
                <View style={styles.modalDetailsBox}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="home-outline" size={20} color={colors.darkGold} style={styles.modalIcon} />
                    <View style={styles.modalInfoTextContainer}>
                      <Text style={styles.modalInfoLabel}>{t('modal-address')}</Text>
                      <Text style={styles.modalInfoValue}>
                        {`${family.houseName}, ${family.homeAddress} (${family.ward})`}
                      </Text>
                    </View>
                  </View>

                  {selectedMember.phone ? (
                    <TouchableOpacity 
                      style={styles.modalInfoRow}
                      onPress={() => handlePhonePress(selectedMember.phone)}
                      accessibilityLabel="Call number"
                    >
                      <Ionicons name="call-outline" size={20} color={colors.darkGold} style={styles.modalIcon} />
                      <View style={styles.modalInfoTextContainer}>
                        <Text style={styles.modalInfoLabel}>{t('modal-phone')}</Text>
                        <Text style={[styles.modalInfoValue, styles.linkText]}>
                          {selectedMember.phone}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  {selectedMember.email ? (
                    <TouchableOpacity 
                      style={styles.modalInfoRow}
                      onPress={() => handleEmailPress(selectedMember.email)}
                      accessibilityLabel="Send email"
                    >
                      <Ionicons name="mail-outline" size={20} color={colors.darkGold} style={styles.modalIcon} />
                      <View style={styles.modalInfoTextContainer}>
                        <Text style={styles.modalInfoLabel}>{t('modal-email')}</Text>
                        <Text style={[styles.modalInfoValue, styles.linkText]}>
                          {selectedMember.email}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    borderRadius: 12,
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
  houseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
    letterSpacing: 1,
  },
  wardSubtext: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollBody: {
    flex: 1,
  },
  scrollBodyContent: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: '0 4px 10px rgba(61,43,31,0.04)' }
    })
  },
  summaryHouse: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 4,
  },
  summaryAddress: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 6,
  },
  summaryUnit: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
  },
  
  // Responsive Table styling
  tableScrollView: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tableContainer: {
    flexDirection: 'column',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#2c2c2c' : '#ebdcc3',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    height: 52,
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#f2ebd9',
    minHeight: 64, // Touch target height
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  tableDataRowAlternate: {
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
  },
  headerCell: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  dataCell: {
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  headerCellText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  dataCellText: {
    fontSize: 14,
    color: colors.foreground,
  },
  boldText: {
    fontWeight: 'bold',
  },
  emptyTable: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTableText: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  // Column Width mappings to ensure perfect layout spacing
  colSl: { width: 60 },
  colName: { width: 220 },
  colRelation: { width: 120 },
  colDob: { width: 110 },
  colDom: { width: 110 },
  colOccupation: { width: 150 },
  colBlood: { width: 110 },

  // Bottom Modal Drawer Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(61,43,31,0.5)', // soft overlay
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
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
    backgroundColor: isDark ? '#2c2c2c' : '#ebdcc3',
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
    color: colors.foreground,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flexDirection: 'column',
  },
  modalProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff8e7',
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalAvatarEmoji: {
    fontSize: 32,
  },
  modalProfileText: {
    flex: 1,
  },
  modalMemberName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  modalMemberRelation: {
    fontSize: 14,
    color: colors.mediumBrown,
    marginTop: 4,
    fontWeight: '600',
  },
  modalDetailsBox: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  modalInfoTextContainer: {
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.mutedBrown,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 15,
    color: colors.foreground,
    lineHeight: 20,
  },
  linkText: {
    color: colors.darkGold,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  highlightedRow: {
    borderWidth: 2.5,
    borderColor: '#c9a84c', // gold border
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4', // soft warm glow background
  }
});
