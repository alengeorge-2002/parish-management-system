import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { globalStyles, colors as staticColors, typography } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { API_BASE_URL, apiFetch } from '../config';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DirectoryScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [mainSearch, setMainSearch] = useState('');
  const [priestSearch, setPriestSearch] = useState('');
  const [memberSearchHouse, setMemberSearchHouse] = useState('');
  const [selectedWardFilter, setSelectedWardFilter] = useState('All');
  const [familiesData, setFamiliesData] = useState<any[]>([]);
  const [membersData, setMembersData] = useState<any[]>([]);
  const [wards, setWards] = useState<string[]>(["All"]);
  const [clergyData, setClergyData] = useState<any[]>([]);
  const [housesData, setHousesData] = useState<any[]>([]);
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const [ministriesData, setMinistriesData] = useState<any[]>([]);
  const [selectedMinistryId, setSelectedMinistryId] = useState<number | null>(null);
  const [parishCouncilList, setParishCouncilList] = useState<any[]>([]);
  const [quickContacts, setQuickContacts] = useState<any[]>([
    {
      role_title: 'Vicar',
      name: 'Rev. Fr. Joseph Mathew',
      phone_number: '+919845000001',
      email: 'pp.stjosephdevagiri@gmail.com'
    },
    {
      role_title: 'Assistant Vicar',
      name: 'Rev. Fr. George Varghese',
      phone_number: '+919845000002',
      email: 'assoc.stjosephdevagiri@gmail.com'
    },
    {
      role_title: 'Parish Secretary',
      name: 'Adv. Mary Antony',
      phone_number: '+914952701234',
      email: 'mary.antony@gmail.com'
    }
  ]);

  useEffect(() => {
    const fetchDirectoryData = async () => {
      let token = null;
      try {
        token = await SecureStore.getItemAsync('user_token') || localStorage.getItem('user_token');
      } catch (_) {
        try { token = localStorage.getItem('user_token'); } catch (__) {}
      }

      try {
        const [familiesRes, wardsRes, membersRes, clergyRes, housesRes, ministriesRes, councilRes, quickContactsRes] = await Promise.all([
          apiFetch(`${API_BASE_URL}/api/admin/families`, {
            headers: { 
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          }),
          apiFetch(`${API_BASE_URL}/api/admin/wards`, {
            headers: { 
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          }),
          apiFetch(`${API_BASE_URL}/api/admin/members`, {
            headers: { 
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          }),
          apiFetch(`${API_BASE_URL}/api/directory/clergy`, {
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          apiFetch(`${API_BASE_URL}/api/directory/religious-houses`, {
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          apiFetch(`${API_BASE_URL}/api/directory/ministries`, {
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          apiFetch(`${API_BASE_URL}/api/directory/parish-council`, {
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          apiFetch(`${API_BASE_URL}/api/directory/quick-contacts`, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
        ]);

        const getInitials = (name: string) => {
          const cleaned = name.replace(/^(Rev\.\s+Fr\.|Fr\.|Sr\.|Br\.)\s+/i, '');
          const parts = cleaned.trim().split(/\s+/);
          if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
          }
          return parts[0] ? parts[0][0].toUpperCase() : '';
        };

        if (clergyRes.ok) {
          const rawClergyList = await clergyRes.json();
          const clergyList = Array.isArray(rawClergyList) ? rawClergyList : [];
          const mappedClergy = clergyList.map((item: any) => ({
            id: item.id,
            name: item.name,
            role: item.designation || '',
            role_type: item.role_type,
            group: item.role_type === 'parish-priest' ? 'parish-priests' : 'religious-sisters',
            phone: item.phone_number || '',
            email: item.email || '',
            avatar: getInitials(item.name),
            avatarUrl: item.avatar_url && item.avatar_url.startsWith('/uploads') 
              ? `${API_BASE_URL}${item.avatar_url}` 
              : (item.avatar_url || ''),
            address: item.address || '',
            bloodGroup: item.blood_group || '',
            house_id: item.house_id
          }));
          setClergyData(mappedClergy);
        }

        if (housesRes.ok) {
          const rawHousesList = await housesRes.json();
          setHousesData(Array.isArray(rawHousesList) ? rawHousesList : []);
        }

        if (ministriesRes.ok) {
          const rawMinistriesList = await ministriesRes.json();
          setMinistriesData(Array.isArray(rawMinistriesList) ? rawMinistriesList : []);
        }

        if (councilRes.ok) {
          const councilList = await councilRes.json();
          setParishCouncilList(Array.isArray(councilList) ? councilList : []);
        }

        if (quickContactsRes && quickContactsRes.ok) {
          const contactsList = await quickContactsRes.json();
          setQuickContacts(Array.isArray(contactsList) ? contactsList : []);
        }

        // Only map families, members, and wards if all three are returned successfully (typically for admin roles)
        if (familiesRes.ok && wardsRes.ok && membersRes.ok) {
          const [rawFamilies, rawWardsList, rawMembersList] = await Promise.all([
            familiesRes.json(),
            wardsRes.json(),
            membersRes.json()
          ]);

          const families = Array.isArray(rawFamilies) ? rawFamilies : [];
          const wardsList = Array.isArray(rawWardsList) ? rawWardsList : [];
          const membersList = Array.isArray(rawMembersList) ? rawMembersList : [];

          setMembersData(membersList);

          const wardMap = new Map<string, string>();
          wardsList.forEach((w: any) => {
            const wId = String(w._id || w.id || '');
            if (wId) wardMap.set(wId, w.ward_name);
          });

          // Dynamically set the wards list from database
          const uniqueWards = ["All", ...wardsList.map((w: any) => w.ward_name).filter(Boolean)];
          setWards(uniqueWards);

          const mappedFamilies = families.map((fam: any) => {
            const wardIdVal = fam.ward_id || fam.ward;
            const wardObj = typeof fam.ward === 'object' ? fam.ward : (typeof fam.ward_id === 'object' ? fam.ward_id : null);
            const rawIdKey = String(wardIdVal?._id || wardIdVal || '');
            const wardNameLookup = rawIdKey ? wardMap.get(rawIdKey) : null;
            const wardName = wardNameLookup || wardObj?.ward_name || fam.ward_name || '';

            const houseNameVal = fam.house_name ? fam.house_name.trim() : (fam.family_name ? fam.family_name.trim() : '');
            const unitNumVal = fam.unit_number ? fam.unit_number.toString().trim() : '';
            const finalAddress = fam.home_address ? fam.home_address.trim() : (fam.address ? fam.address.trim() : '');

            return {
              id: fam._id || fam.id,
              familyName: fam.family_name || fam.house_name || 'Unnamed Family',
              headOfFamily: fam.head_of_family || '',
              houseName: houseNameVal || fam.family_name || 'Household',
              homeAddress: finalAddress,
              unitNumber: unitNumVal,
              ward: wardName || 'Parish Ward',
              wardId: fam.ward_id || fam.ward,
              photoUrl: fam.family_photo_url && fam.family_photo_url.startsWith('/uploads') 
                ? `${API_BASE_URL}${fam.family_photo_url}` 
                : (fam.family_photo_url || ''),
              contactNumber: fam.contact_number || '',
              email: fam.email || ''
            };
          });

          setFamiliesData(mappedFamilies);
        }
      } catch (error) {
        console.warn('Failed to fetch live directory data from API:', error);
      }
    };

    fetchDirectoryData();
  }, []);

  const topCategories = [
    { 
      id: 'convent',
      title: t('st-josephs-convent'), 
      subtext: t('convent-members-count'), 
      icon: "business-outline",
      iconType: "ionicons",
      hasViewLink: true
    },
    { 
      id: 'religious',
      title: t('priests-and-religious'), 
      subtext: t('priests-count'), 
      icon: "person-outline",
      iconType: "ionicons"
    },
    { 
      id: 'council',
      title: t('parish-council-title'), 
      subtext: t('council-members-count'), 
      icon: "crown-outline",
      iconType: "material"
    }
  ];

  const communityCategories = [
    { 
      id: 'ministries',
      title: t('ministries-title'), 
      subtext: t('groups-count'), 
      icon: "heart-outline",
      iconType: "ionicons"
    },
    { 
      id: 'ward',
      title: t('ward-directory-title'), 
      subtext: t('wards-count'), 
      icon: "home-outline",
      iconType: "ionicons"
    }
  ];

  const renderCategoryIcon = (icon: string, type: string) => {
    if (type === 'material') {
      return <MaterialCommunityIcons name={icon as any} size={24} color={colors.darkGold} />;
    }
    return <Ionicons name={icon as any} size={24} color={colors.darkGold} />;
  };

  const handleCategoryPress = (category: any) => {
    if (category.id === 'convent' || category.id === 'religious') {
      setActiveCategory('priests');
      setPriestSearch('');
    } else if (category.id === 'ward') {
      setActiveCategory('ward');
      setMemberSearchHouse('');
      setSelectedWardFilter('All');
    } else if (category.id === 'council') {
      (navigation as any).navigate('ParishCouncil');
    } else if (category.id === 'ministries') {
      setActiveCategory('ministries');
      setSelectedMinistryId(null);
    } else {
      Alert.alert(category.title, category.subtext);
    }
  };

  const handleSyncContacts = () => {
    Alert.alert("Sync Contacts", "Syncing parish directory contacts to your phone's address book...");
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(err => {
      Alert.alert("Error", "Could not initiate phone call: " + err.message);
    });
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(err => {
      Alert.alert("Error", "Could not open mail client: " + err.message);
    });
  };

  const handleContactOffice = () => {
    Linking.openURL('tel:+914952701234').catch(err => {
      Alert.alert("Error", "Could not call Parish Office: " + err.message);
    });
  };

  // 17. Filter logic: Type in oversized search bar instantly sifts family profiles
  const getFilteredFamiliesGlobal = (query: string) => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase().trim();
    
    return familiesData.map(fam => {
      // 1. Direct family property matches
      const houseMatches = 
        fam.houseName.toLowerCase().includes(lowerQuery) ||
        fam.homeAddress.toLowerCase().includes(lowerQuery) ||
        fam.unitNumber.toLowerCase().includes(lowerQuery) ||
        fam.ward.toLowerCase().includes(lowerQuery);

      // 2. Member match via sub-array loop
      const matchingMembers = membersData.filter(m => {
        if (m.family_id !== fam.id) return false;
        const firstName = (m.first_name || '').toLowerCase().trim();
        const lastName = (m.last_name || '').toLowerCase().trim();
        const fullName = `${firstName} ${lastName}`.trim();
        return firstName.includes(lowerQuery) || 
               lastName.includes(lowerQuery) || 
               fullName.includes(lowerQuery);
      });

      if (houseMatches || matchingMembers.length > 0) {
        return {
          ...fam,
          matchedByMember: !houseMatches && matchingMembers.length > 0,
          matchedMemberId: matchingMembers.length > 0 ? matchingMembers[0].id : undefined
        };
      }
      return null;
    }).filter((item): item is any => item !== null);
  };

  // Sub-view filters
  const getFilteredClergySub = () => {
    return clergyData.filter(item => 
      item.name.toLowerCase().includes(priestSearch.toLowerCase()) ||
      item.role.toLowerCase().includes(priestSearch.toLowerCase()) ||
      t(item.name).toLowerCase().includes(priestSearch.toLowerCase()) ||
      t(item.role).toLowerCase().includes(priestSearch.toLowerCase())
    );
  };

  const getFilteredFamiliesSub = () => {
    const lowerQuery = memberSearchHouse.toLowerCase().trim();
    return familiesData.map(fam => {
      const matchWard = selectedWardFilter === 'All' || 
        fam.ward === selectedWardFilter;
      if (!matchWard) return null;

      if (lowerQuery === '') return fam;

      // Evaluate house name and member individual names concurrently
      const houseMatches = fam.houseName.toLowerCase().includes(lowerQuery);

      const matchingMembers = membersData.filter(m => {
        if (m.family_id !== fam.id) return false;
        const firstName = (m.first_name || '').toLowerCase().trim();
        const lastName = (m.last_name || '').toLowerCase().trim();
        const fullName = `${firstName} ${lastName}`.trim();
        return firstName.includes(lowerQuery) || 
               lastName.includes(lowerQuery) || 
               fullName.includes(lowerQuery);
      });

      if (houseMatches || matchingMembers.length > 0) {
        return {
          ...fam,
          matchedByMember: !houseMatches && matchingMembers.length > 0,
          matchedMemberId: matchingMembers.length > 0 ? matchingMembers[0].id : undefined
        };
      }
      return null;
    }).filter((item): item is any => item !== null);
  };

  const isSearchingGlobal = mainSearch.trim() !== '';
  const filteredFamiliesGlobal = getFilteredFamiliesGlobal(mainSearch);

  const displayedClergySub = getFilteredClergySub();
  const parishPriests = displayedClergySub.filter(item => item.group === 'parish-priests');
  const visitingPriests = displayedClergySub.filter(item => item.group === 'visiting-priests');
  const religiousSisters = displayedClergySub.filter(item => item.group === 'religious-sisters');

  const displayedFamiliesSub = getFilteredFamiliesSub();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {(activeCategory === 'st-josephs-monastery' || activeCategory === 'men-religious-houses' || activeCategory === 'women-religious-houses') ? (
        <View style={styles.header}>
          <View style={styles.subViewHeaderRow}>
            <TouchableOpacity 
              style={styles.headerBackButton} 
              onPress={() => {
                if (selectedHouseId !== null) {
                  setSelectedHouseId(null);
                } else {
                  setSelectedProfile(null);
                  setActiveCategory(null);
                }
              }}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={22} color={isDark ? colors.foreground : "#594539"} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.subViewTitle}>
                {selectedHouseId !== null 
                  ? housesData.find(h => h.id === selectedHouseId)?.name 
                  : activeCategory === 'st-josephs-monastery' 
                    ? t('st-josephs-monastery') 
                    : activeCategory === 'men-religious-houses' 
                      ? t('men-religious-houses-header') 
                      : t('women-religious-houses-header')}
              </Text>
              <Text style={styles.siennaSubtext}>{t('parish-clergy-subtext')}</Text>
            </View>
          </View>
        </View>
      ) : activeCategory === 'ward' ? (
        <View style={styles.header}>
          <View style={styles.subViewHeaderRow}>
            <TouchableOpacity 
              style={styles.headerBackButton} 
              onPress={() => {
                setSelectedProfile(null);
                setActiveCategory(null);
              }}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={28} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.subViewTitle}>{t('ward-directory-title')}</Text>
              <Text style={styles.siennaSubtext}>{t('ward-desc')}</Text>
            </View>
          </View>
          <View style={styles.goldLine} />
        </View>
      ) : activeCategory === 'ministries' ? (
        <View style={styles.header}>
          <View style={styles.subViewHeaderRow}>
            <TouchableOpacity 
              style={styles.headerBackButton} 
              onPress={() => {
                if (selectedMinistryId !== null) {
                  setSelectedMinistryId(null);
                } else {
                  setSelectedProfile(null);
                  setActiveCategory(null);
                }
              }}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={28} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.subViewTitle}>
                {selectedMinistryId !== null 
                  ? ministriesData.find(m => m.id === selectedMinistryId)?.title 
                  : t('ministries-title')}
              </Text>
              <Text style={styles.siennaSubtext}>{t('ministries-desc')}</Text>
            </View>
          </View>
          <View style={styles.goldLine} />
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.mainTitle}>{t('parish-directory')}</Text>
          <Text style={styles.siennaSubtext}>{t('connect-with-our-parish-family')}</Text>
          <View style={styles.goldLine} />
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button (64px target) for sub-views inside details view */}
        {selectedProfile !== null && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setSelectedProfile(null);
            }}
            accessibilityLabel="Go back to list"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>{"← Back to List"}</Text>
          </TouchableOpacity>
        )}

        {/* PROFILE DETAILS VIEW */}
        {selectedProfile !== null ? (
          <View style={[globalStyles.card, styles.detailsCard]}>
            <View style={styles.detailsHeader}>
              {selectedProfile.familyPhotoUrl && selectedProfile.familyPhotoUrl.trim() !== '' ? (
                <Image 
                  source={{ uri: selectedProfile.familyPhotoUrl }} 
                  style={styles.familyPhoto} 
                  accessibilityLabel="Family Photo"
                />
              ) : selectedProfile.houseName ? (
                <View style={styles.imagePlaceholderBox}>
                  <Ionicons name="image-outline" size={48} color={colors.mutedBrown} />
                  <Text style={styles.imagePlaceholderText}>No Photo</Text>
                </View>
              ) : (
                <View style={styles.largeAvatarCircle}>
                  {selectedProfile.avatarUrl ? (
                    <Image 
                      source={{ uri: selectedProfile.avatarUrl }} 
                      style={{ width: '100%', height: '100%', borderRadius: 37 }} 
                      resizeMode="cover"
                      accessibilityLabel="Clergy Avatar"
                    />
                  ) : (
                    <Text style={styles.largeAvatarInitials}>{selectedProfile.avatar}</Text>
                  )}
                </View>
              )}
              <Text style={styles.detailsName}>{t(selectedProfile.name)}</Text>
              <Text style={styles.detailsRole}>
                {selectedProfile.roleKey ? t(selectedProfile.roleKey) : t(selectedProfile.role)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsInfoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{selectedProfile.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{selectedProfile.email}</Text>
              </View>
              {selectedProfile.houseName ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>House Name:</Text>
                    <Text style={styles.infoValue}>{selectedProfile.houseName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ward:</Text>
                    <Text style={styles.infoValue}>{selectedProfile.ward}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Unit Number:</Text>
                    <Text style={styles.infoValue}>{selectedProfile.unitNumber}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Blood Group:</Text>
                    <Text style={styles.infoValue}>{selectedProfile.bloodGroup || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Occupation:</Text>
                    <Text style={styles.infoValue}>{selectedProfile.occupation || 'N/A'}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Community:</Text>
                    <Text style={styles.infoValue}>
                      {selectedProfile.group === 'parish-priests' ? t('parish-priests-header') :
                       selectedProfile.group === 'visiting-priests' ? t('visiting-priests-header') : t('religious-sisters-header')}
                    </Text>
                  </View>
                  {selectedProfile.address ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Congregation:</Text>
                      <Text style={styles.infoValue}>{t(selectedProfile.address)}</Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>

            <View style={styles.detailsActionRow}>
              <TouchableOpacity
                style={[globalStyles.button, styles.actionBtn]}
                onPress={() => handlePhonePress(selectedProfile.phone)}
                accessibilityLabel="Call contact"
                accessibilityRole="button"
              >
                <Text style={globalStyles.buttonText}>Call Contact</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[globalStyles.buttonSecondary, styles.actionBtnSecondary]}
                onPress={() => handleEmailPress(selectedProfile.email)}
                accessibilityLabel="Email contact"
                accessibilityRole="button"
              >
                <Text style={globalStyles.buttonTextSecondary}>Email Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (activeCategory === 'st-josephs-monastery' || activeCategory === 'men-religious-houses' || activeCategory === 'women-religious-houses') ? (
          <View>
            {(activeCategory === 'men-religious-houses' || activeCategory === 'women-religious-houses') && selectedHouseId === null ? (
              <View style={styles.listSection}>
                {housesData
                  .filter(h => {
                    const isMen = activeCategory === 'men-religious-houses';
                    if (isMen) {
                      return h.houseType === 'men' || h.house_type === 'men' || h.category_type === 'men' || (h.name && (h.name.includes('Monastery') || h.name.includes('Bhavan'))) || h.category === 'Monastery';
                    }
                    return h.houseType === 'women' || h.house_type === 'women' || h.category_type === 'women' || (h.name && (h.name.includes('Convent') || h.name.includes('സന്യാസിനി'))) || h.category === 'Convent';
                  })
                  .map((house) => {
                    const resCount = Array.isArray(house.residents) && house.residents.length > 0
                      ? house.residents.length
                      : (house.residentCount || house.resident_count || 5);

                    return (
                      <TouchableOpacity
                        key={house.id || house._id}
                        style={styles.leadershipRowCard}
                        onPress={() => setSelectedHouseId(house.id || house._id)}
                        accessibilityLabel={house.name}
                        accessibilityRole="button"
                      >
                        <View style={styles.leadershipIconBox}>
                          <Ionicons name="business-outline" size={22} color={colors.darkGold} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.leadershipTitle}>{house.name}</Text>
                          {house.malayalamName ? (
                            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>{house.malayalamName}</Text>
                          ) : null}
                          <Text style={{ fontSize: 12, color: colors.darkGold, marginTop: 3 }}>
                            {`${resCount} ${resCount === 1 ? 'അംഗം' : 'അംഗങ്ങൾ'} • ${house.superiorInCharge || house.superior_in_charge || house.superior || 'Superior'}`}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.mediumBrown} />
                      </TouchableOpacity>
                    );
                  })}
                {housesData.filter(h => {
                  const isMen = activeCategory === 'men-religious-houses';
                  if (isMen) {
                    return h.houseType === 'men' || h.house_type === 'men' || h.category_type === 'men' || (h.name && (h.name.includes('Monastery') || h.name.includes('Bhavan'))) || h.category === 'Monastery';
                  }
                  return h.houseType === 'women' || h.house_type === 'women' || h.category_type === 'women' || (h.name && (h.name.includes('Convent') || h.name.includes('സന്യാസിനി'))) || h.category === 'Convent';
                }).length === 0 && (
                  <Text style={styles.noResults}>No religious houses registered.</Text>
                )}
              </View>
            ) : (
              (() => {
                let targetHouseId = selectedHouseId;
                if (activeCategory === 'st-josephs-monastery' && selectedHouseId === null) {
                  const monasteryHouse = housesData.find(h => h.name?.includes("Monastery") || h.name?.includes("St. Joseph"));
                  targetHouseId = monasteryHouse ? (monasteryHouse.id || monasteryHouse._id) : null;
                }

                const selectedHouse = housesData.find(h => String(h.id || h._id) === String(targetHouseId));
                const directResidents = Array.isArray(selectedHouse?.residents) ? selectedHouse.residents : [];

                const housePersonnel = clergyData.filter(item => String(item.house_id) === String(targetHouseId)).map(c => ({
                  ...c,
                  avatar: c.avatar || 'Cl'
                }));
                const priests = housePersonnel.filter(item => item.group === 'parish-priests' || item.group === 'visiting-priests');
                const sisters = housePersonnel.filter(item => item.group === 'religious-sisters');

                return (
                  <View>
                    {/* Selected House Banner */}
                    {selectedHouse && (
                      <View style={[styles['ministry-detail-header-card'], { marginBottom: 16 }]}>
                        <Text style={styles['ministry-detail-title']}>{selectedHouse.name}</Text>
                        {selectedHouse.malayalamName ? (
                          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{selectedHouse.malayalamName}</Text>
                        ) : null}
                        <Text style={{ fontSize: 13, color: colors.darkGold, fontWeight: 'bold', marginTop: 6 }}>
                          {`Superior: ${selectedHouse.superiorInCharge || selectedHouse.superior_in_charge || selectedHouse.superior || 'Sr. Superior'}`}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                          {`Contact: ${selectedHouse.contactNumber || selectedHouse.contact_number || selectedHouse.phone || '+91 98765 43210'}`}
                        </Text>
                      </View>
                    )}

                    {/* Direct Residents List */}
                    {directResidents.length > 0 && (
                      <View style={styles.listSection}>
                        <Text style={styles.subSectionHeader}>
                          {selectedHouse?.houseType === 'men' || selectedHouse?.name?.includes('Monastery') ? 'Resident Priests & Brothers' : 'Resident Sisters'}
                        </Text>
                        {directResidents.map((r: any, idx: number) => {
                          const rName = r.name || r.fullName || r.religiousName || 'Resident Member';
                          const rDesig = r.designation || 'Member';
                          const rPhone = r.phone || selectedHouse?.contactNumber || selectedHouse?.contact_number || selectedHouse?.phone || '';
                          const cleanName = rName.replace(/^(Rev\.\s+Fr\.|Fr\.|Sr\.|Br\.)\s+/i, '');
                          const initials = cleanName.slice(0, 2).toUpperCase();

                          return (
                            <View key={r._id || r.id || idx} style={styles.sisterRowCard}>
                              <View style={styles.sisterAvatarSquircle}>
                                {r.photo || r.photoUrl ? (
                                  <Image 
                                    source={{ uri: r.photo || r.photoUrl }} 
                                    style={{ width: '100%', height: '100%', borderRadius: 14 }} 
                                    resizeMode="cover"
                                    accessibilityLabel="Resident Avatar"
                                  />
                                ) : (
                                  <Text style={styles.sisterAvatarText}>{initials}</Text>
                                )}
                              </View>
                              <View style={styles.sisterInfo}>
                                <Text style={styles.sisterName}>{rName}</Text>
                                <Text style={styles.sisterSub}>{rDesig}</Text>
                                {rPhone ? (
                                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{rPhone}</Text>
                                ) : null}
                              </View>
                              {rPhone ? (
                                <TouchableOpacity 
                                  style={styles.sisterCallBtn}
                                  onPress={() => handlePhonePress(rPhone)}
                                  accessibilityLabel={`Call ${rName}`}
                                  accessibilityRole="button"
                                >
                                  <Ionicons name="call-outline" size={20} color={colors.darkGold} />
                                </TouchableOpacity>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {/* Additional Linked Priests */}
                    {priests.length > 0 && (
                      <View style={styles.listSection}>
                        <Text style={styles.subSectionHeader}>{t('parish-priests-header')}</Text>
                        {priests.map((item) => (
                          <View key={item.id} style={styles.priestCard}>
                            <View style={styles.priestCardTopAccent} />
                            <View style={styles.priestCardHeader}>
                              <View style={styles.priestAvatarSquare}>
                                {item.avatarUrl ? (
                                  <Image 
                                    source={{ uri: item.avatarUrl }} 
                                    style={{ width: '100%', height: '100%', borderRadius: 16 }} 
                                    resizeMode="cover"
                                    accessibilityLabel="Priest Avatar"
                                  />
                                ) : (
                                  <Text style={styles.priestAvatarText}>{item.avatar}</Text>
                                )}
                              </View>
                              <View style={styles.priestHeaderInfo}>
                                <Text style={styles.priestName}>{t(item.name).toUpperCase()}</Text>
                                <View style={styles.roleBadge}>
                                  <Text style={styles.roleBadgeText}>{t(item.role)}</Text>
                                </View>
                              </View>
                            </View>
                            <View style={styles.priestDetailsContainer}>
                              {item.phone && (
                                <View style={styles.priestDetailsRow}>
                                  <Ionicons name="call-outline" size={16} color={colors.textMuted} style={styles.detailsIcon} />
                                  <Text style={styles.detailsText}>{item.phone}</Text>
                                </View>
                              )}
                            </View>
                            <View style={styles.priestActionButtonsRow}>
                              <TouchableOpacity 
                                style={styles.priestCallBtn}
                                onPress={() => handlePhonePress(item.phone)}
                                accessibilityLabel={`Call ${t(item.name)}`}
                                accessibilityRole="button"
                              >
                                <Ionicons name="call-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                                <Text style={styles.priestCallBtnText}>{t('button-call')}</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Additional Linked Sisters */}
                    {sisters.length > 0 && (
                      <View style={styles.listSection}>
                        <Text style={styles.subSectionHeader}>{t('religious-sisters-header')}</Text>
                        {sisters.map((item) => (
                          <View key={item.id} style={styles.sisterRowCard}>
                            <View style={styles.sisterAvatarSquircle}>
                              {item.avatarUrl ? (
                                <Image 
                                  source={{ uri: item.avatarUrl }} 
                                  style={{ width: '100%', height: '100%', borderRadius: 14 }} 
                                  resizeMode="cover"
                                  accessibilityLabel="Sister Avatar"
                                />
                              ) : (
                                <Text style={styles.sisterAvatarText}>{item.avatar}</Text>
                              )}
                            </View>
                            <View style={styles.sisterInfo}>
                              <Text style={styles.sisterName}>{t(item.name)}</Text>
                              <Text style={styles.sisterSub}>{t(item.role)}{item.address ? ` - ${t(item.address)}` : ''}</Text>
                            </View>
                            <TouchableOpacity 
                              style={styles.sisterCallBtn}
                              onPress={() => handlePhonePress(item.phone)}
                              accessibilityLabel={`Call ${t(item.name)}`}
                              accessibilityRole="button"
                            >
                              <Ionicons name="call-outline" size={20} color={colors.darkGold} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    {directResidents.length === 0 && priests.length === 0 && sisters.length === 0 && (
                      <Text style={styles.noResults}>No personnel records found for this house.</Text>
                    )}
                  </View>
                );
              })()
            )}
          </View>
        ) : activeCategory === 'ministries' ? (
          // MINISTRIES SUB-VIEW
          <View>
            {selectedMinistryId === null ? (
              <View style={styles.listSection}>
                {ministriesData.map((ministry) => (
                  <TouchableOpacity
                    key={ministry.id}
                    style={styles.leadershipRowCard}
                    onPress={() => setSelectedMinistryId(ministry.id)}
                    accessibilityLabel={ministry.title}
                    accessibilityRole="button"
                  >
                    <View style={styles.leadershipIconBox}>
                      <Ionicons name="people-outline" size={22} color={colors.darkGold} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.leadershipTitle}>{ministry.title}</Text>
                      <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                        {ministry.member_count} {ministry.member_count === 1 ? t('member-count-singular') : t('member-count-plural')}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.mediumBrown} />
                  </TouchableOpacity>
                ))}
                {ministriesData.length === 0 && (
                  <Text style={styles.noResults}>{t('no-ministries-found')}</Text>
                )}
              </View>
            ) : (
              (() => {
                const ministry = ministriesData.find(m => m.id === selectedMinistryId);
                if (!ministry) return null;

                return (
                  <View>
                    {/* Ministry Details Header Card */}
                    <View style={styles['ministry-detail-header-card']}>
                      <Text style={styles['ministry-detail-title']}>{ministry.title}</Text>
                      {ministry.description ? (
                        <Text style={styles['ministry-detail-description']}>{ministry.description}</Text>
                      ) : null}
                    </View>

                    {/* Members List Section */}
                    <View style={styles.listSection}>
                      {ministry.members && ministry.members.length > 0 ? (
                        ministry.members.map((mem: any) => (
                          <View key={mem.assignment_id} style={styles['ministry-member-card']}>
                            <View style={styles['ministry-member-avatar-box']}>
                              <Text style={styles['ministry-member-avatar-text']}>
                                {((mem.first_name?.[0] || '') + (mem.last_name?.[0] || '')).toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles['ministry-member-info']}>
                              <Text style={styles['ministry-member-name']}>{mem.first_name} {mem.last_name}</Text>
                              <Text style={styles['ministry-member-role']}>{mem.role_title}</Text>
                            </View>
                            {mem.phone_number ? (
                              <TouchableOpacity 
                                style={styles['ministry-member-call-btn']}
                                onPress={() => handlePhonePress(mem.phone_number)}
                                accessibilityLabel={`Call ${mem.first_name}`}
                                accessibilityRole="button"
                              >
                                <Ionicons name="call-outline" size={20} color={colors.darkGold} />
                              </TouchableOpacity>
                            ) : null}
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noResults}>{t('no-members-found')}</Text>
                      )}
                    </View>
                  </View>
                );
              })()
            )}
          </View>
        ) : activeCategory === 'ward' ? (
          // WARD MEMBERS SUB-VIEW
          <View>
            <View style={[globalStyles.card, styles.filterBox]}>
              <Text style={styles.filterBoxTitle}>{t('search-families-title')}</Text>
              
              <Text style={globalStyles.label}>{t('house-name')}</Text>
              <TextInput
                style={[globalStyles.input, styles.filterInput]}
                placeholder={t('search-house-name-placeholder')}
                placeholderTextColor="#9e7a60"
                value={memberSearchHouse}
                onChangeText={setMemberSearchHouse}
                accessibilityLabel="Filter by house name"
              />

              <Text style={globalStyles.label}>{t('filter-ward')}</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.wardChipsScroll}
                contentContainerStyle={styles.wardChipsContent}
              >
                {wards.map((w) => {
                  const active = selectedWardFilter === w;
                  return (
                    <TouchableOpacity
                      key={w}
                      style={[styles.wardChip, active ? styles.wardChipActive : styles.wardChipInactive]}
                      onPress={() => setSelectedWardFilter(w)}
                      accessibilityLabel={`Filter ward ${w}`}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.wardChipText, active ? styles.wardChipTextActive : styles.wardChipTextInactive]}>
                        {w}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.listSection}>
              <Text style={styles.listHeader}>
                {selectedWardFilter === 'All' ? t('search-families-title') : `${selectedWardFilter} - ${t('search-families-title')}`}
              </Text>
              {displayedFamiliesSub.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[globalStyles.card, styles.profileRow, { height: 'auto', paddingVertical: 14 }]}
                  onPress={() => (navigation as any).navigate('FamilyTableView', { family: item, highlightMemberId: item.matchedMemberId })}
                  accessibilityLabel={`View ${item.houseName}`}
                >
                  <View style={styles.profileText}>
                    <Text style={[styles.profileName, { fontSize: 17, marginBottom: 4 }]}>{item.houseName}</Text>
                    <Text style={[styles.profileRole, { fontSize: 13, color: colors.textMuted, marginBottom: 2 }]}>{item.homeAddress}</Text>
                    <Text style={[styles.profileSub, { fontSize: 12, fontWeight: 'bold' }]}>
                      {`${t('unit-number')}: ${item.unitNumber} • ${item.ward}`}
                    </Text>
                    {item.matchedByMember && (
                      <Text style={styles.matchedMemberIndicator}>
                        {t('contains-member-matching-query')}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {displayedFamiliesSub.length === 0 && (
                <Text style={styles.noResults}>{t('no-households-found')}</Text>
              )}
            </View>
          </View>
        ) : (
          // MAIN DIRECTORY CATEGORY LIST
          <View>
            {/* 1. Oversized Search Bar (64px) */}
            <TextInput
              style={[globalStyles.input, styles.oversizedSearchBar]}
              placeholder={t('search-households-placeholder')}
              placeholderTextColor="#9e7a60"
              value={mainSearch}
              onChangeText={setMainSearch}
              accessibilityLabel="Search Directory"
            />

            {/* If user is searching globally, display dynamic list filtering results directly */}
            {isSearchingGlobal ? (
              <View style={styles.listSection}>
                <Text style={styles.listHeader}>{t('search-families-title')}</Text>
                {filteredFamiliesGlobal.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[globalStyles.card, styles.profileRow, { height: 'auto', paddingVertical: 14 }]}
                    onPress={() => (navigation as any).navigate('FamilyTableView', { family: item, highlightMemberId: item.matchedMemberId })}
                    accessibilityLabel={`View ${item.houseName}`}
                  >
                    <View style={styles.profileText}>
                      <Text style={[styles.profileName, { fontSize: 17, marginBottom: 4 }]}>{item.houseName}</Text>
                      <Text style={[styles.profileRole, { fontSize: 13, color: colors.textMuted, marginBottom: 2 }]}>{item.homeAddress}</Text>
                      <Text style={[styles.profileSub, { fontSize: 12, fontWeight: 'bold' }]}>
                        {`${t('unit-number')}: ${item.unitNumber} • ${item.ward}`}
                      </Text>
                      {item.matchedByMember && (
                        <Text style={styles.matchedMemberIndicator}>
                          {t('contains-member-matching-query')}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}

                {filteredFamiliesGlobal.length === 0 && (
                  <Text style={styles.noResults}>{t('no-directory-records')}</Text>
                )}
              </View>
            ) : (
              (() => {
                const monasteryHouse = housesData.find(h => h.name === "St. Joseph's Monastery");
                const monasteryCount = monasteryHouse 
                  ? clergyData.filter(c => c.house_id === monasteryHouse.id).length 
                  : 4;
                const menHousesCount = housesData.filter(h => h.category_type === 'men').length;
                const womenHousesCount = housesData.filter(h => h.category_type === 'women').length;
                const councilCount = parishCouncilList.length > 0 ? parishCouncilList.length : 12;

                return (
                  <View>
                    {/* 3. Sync Banner */}
                    <View style={[globalStyles.card, styles.syncBanner]}>
                      <View style={styles.syncTextCol}>
                        <Text style={styles.syncTitle}>Offline Contacts Sync</Text>
                        <Text style={styles.syncDesc}>Sync all parish office numbers directly into your mobile contacts.</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.syncBtn} 
                        onPress={handleSyncContacts}
                        accessibilityLabel="Sync directory contacts"
                        accessibilityRole="button"
                      >
                        <Text style={styles.syncBtnText}>{t('sync-now').toUpperCase()}</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Clergy & Leadership Section */}
                    <Text style={styles.clergyLeadershipHeader}>{t('clergy-and-leadership')}</Text>
                    <View style={styles['box-grid-container']}>
                      {[
                        { 
                          id: 'st-josephs-monastery', 
                          title: t('st-josephs-monastery'), 
                          subtext: `${monasteryCount} ${monasteryCount === 1 ? t('member-count-singular') : t('member-count-plural')}`, 
                          icon: 'business-outline',
                          iconType: 'ionicons' 
                        },
                        { 
                          id: 'men-religious-houses', 
                          title: t('men-religious-houses'), 
                          subtext: `${menHousesCount} ${menHousesCount === 1 ? t('house-count-singular') : t('house-count-plural')}`, 
                          icon: 'people-outline',
                          iconType: 'ionicons' 
                        },
                        { 
                          id: 'women-religious-houses', 
                          title: t('women-religious-houses'), 
                          subtext: `${womenHousesCount} ${womenHousesCount === 1 ? t('house-count-singular') : t('house-count-plural')}`, 
                          icon: 'star-outline',
                          iconType: 'ionicons' 
                        },
                        { 
                          id: 'parish-council-option', 
                          title: t('parish-council-option'), 
                          subtext: `${councilCount} ${councilCount === 1 ? t('member-count-singular') : t('member-count-plural')}`, 
                          icon: 'crown-outline',
                          iconType: 'material' 
                        }
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          style={styles['box-grid-card']}
                          onPress={() => {
                            if (option.id === 'parish-council-option') {
                              (navigation as any).navigate('ParishCouncil');
                            } else {
                              setActiveCategory(option.id);
                              setSelectedHouseId(null);
                            }
                          }}
                          accessibilityLabel={option.title}
                          accessibilityRole="button"
                        >
                          <View style={styles['box-grid-icon-badge']}>
                            {option.iconType === 'material' ? (
                              <MaterialCommunityIcons name={option.icon as any} size={22} color={colors.darkGold} />
                            ) : (
                              <Ionicons name={option.icon as any} size={22} color={colors.darkGold} />
                            )}
                          </View>
                          <Text style={styles['box-grid-title']}>{option.title}</Text>
                          <Text style={styles['box-grid-subtext']}>{option.subtext}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* 2. PARISH COMMUNITY section */}
                    <Text style={styles.sectionHeader}>{t('parish-community').toUpperCase()}</Text>
                    <View style={styles['box-grid-container']}>
                      {communityCategories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={styles['box-grid-card']}
                          onPress={() => handleCategoryPress(category)}
                          accessibilityLabel={category.title}
                          accessibilityRole="button"
                        >
                          <View style={styles['box-grid-icon-badge']}>
                            {renderCategoryIcon(category.icon, category.iconType)}
                          </View>
                          <Text style={styles['box-grid-title']}>{category.title}</Text>
                          <Text style={styles['box-grid-subtext']}>{category.subtext}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Quick Contacts Section */}
                    <Text style={styles['quick-contacts-header']}>{t('quick-contacts')}</Text>
                    <View style={styles['quick-contacts-card']}>
                      {quickContacts.map((contact, index) => {
                        const roleKey = contact.role_title.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <View key={contact.role_title}>
                            <View style={styles['quick-contact-row']}>
                              <View style={styles['quick-contact-icon-box']}>
                                <Ionicons name="call-outline" size={22} color={colors.darkGold} />
                              </View>
                              <View style={styles['quick-contact-info']}>
                                <Text style={styles['quick-contact-title']}>{t(roleKey)}</Text>
                                <Text style={styles['quick-contact-sub']}>{contact.name}</Text>
                              </View>
                              <TouchableOpacity 
                                style={styles['quick-call-btn']}
                                onPress={() => handlePhonePress(contact.phone_number)}
                                accessibilityLabel={`Call ${contact.name}`}
                                accessibilityRole="button"
                              >
                                <Text style={styles['quick-call-btn-text']}>{t('button-call') || 'Call'}</Text>
                              </TouchableOpacity>
                            </View>
                            {index < quickContacts.length - 1 && (
                              <View style={styles['quick-contact-divider']} />
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Scripture Banner Card */}
                    <View style={styles.scriptureBannerCard}>
                      <Text style={styles.scriptureText}>{t('directory-verse-text')}</Text>
                      <Text style={styles.scriptureRef}>— {t('directory-verse-ref')}</Text>
                    </View>
                  </View>
                );
              })()
            )}
          </View>
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
  subViewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border, // sand gold border
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  headerTitleContainer: {
    flex: 1,
  },
  subViewTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 1280, // fluid responsive layout up to 1280px width
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: colors.mediumBrown,
    marginBottom: 12,
    marginTop: 8,
  },

  // Back Button target (exactly 64px)
  backButton: {
    height: 64, // Senior touch target height [60, 75] px
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
  },

  // Oversized Search Bar
  oversizedSearchBar: {
    minHeight: 64, // Strictly 64px senior target
    fontSize: 17,
    fontFamily: Platform.OS === 'web' ? 'Nunito, sans-serif' : 'System',
  },
  searchBar: {
    minHeight: 64,
    fontSize: 17,
    marginBottom: 16,
  },

  // Offline Sync Banner (minHeight 64px on Sync Now button)
  syncBanner: {
    borderColor: colors.border,
    borderWidth: 2,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  syncTextCol: {
    width: '100%',
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  syncDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },
  syncBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16, // Exactly 16px
    height: 64, // Senior touch target [60, 75] px
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  syncBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
    letterSpacing: 1,
  },

  // Staggered two-column grid matching Prayers screen
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
  gridCard: {
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4', // Warm cream matching mockup
    borderColor: colors.border, // Soft gold-beige border
    borderWidth: 1.5,
    borderRadius: 16, // Globally exactly 16px border-radius
    padding: 16,
    alignItems: 'flex-start', // Left aligned matching mockup
    justifyContent: 'flex-start',
    minHeight: 120,
    ...Platform.select({
      web: { cursor: 'pointer', boxShadow: '0 4px 8px rgba(61,43,31,0.04)' }
    })
  },
  gridCardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14, // squircle icon box matching mockup
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderColor: colors.border,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'left',
    marginBottom: 6,
    lineHeight: 21,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  gridCardSub: {
    fontSize: 12.5,
    color: colors.mediumBrown,
    textAlign: 'left',
    lineHeight: 17,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  viewLink: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 10,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },

  'quick-contacts-header': {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, "Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
    color: colors.mediumBrown,
    marginBottom: 16,
    marginTop: 12,
  },
  'quick-contacts-card': {
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4', // premium cream background
    borderColor: colors.border, // sand-gold border
    borderWidth: 1.5,
    borderRadius: 16, // Globally exactly 16px border-radius
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  'quick-contact-row': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 72,
  },
  'quick-contact-divider': {
    height: 1,
    backgroundColor: isDark ? '#2c2c2c' : '#f0e6d6',
  },
  'quick-contact-icon-box': {
    width: 44,
    height: 44,
    borderRadius: 12, // 12px squircle phone outline badge
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderColor: colors.border,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  'quick-contact-info': {
    flex: 1,
    justifyContent: 'center',
  },
  'quick-contact-title': {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
    lineHeight: 19,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
  },
  'quick-contact-sub': {
    fontSize: 12.5,
    color: colors.mediumBrown,
    marginTop: 2,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  'quick-call-btn': {
    backgroundColor: colors.primary, // solid gold call buttons
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  'quick-call-btn-text': {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scriptureBannerCard: {
    backgroundColor: isDark ? '#2a2a2a' : '#523a2b',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }
    })
  },
  scriptureText: {
    fontSize: 16.5,
    fontStyle: 'italic',
    lineHeight: 24,
    color: '#ffffff',
    fontFamily: Platform.OS === 'web' ? '"EB Garamond", serif' : 'System',
    textAlign: 'left',
    marginBottom: 8,
  },
  scriptureRef: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: Platform.OS === 'web' ? '"EB Garamond", serif' : 'System',
    textAlign: 'left',
  },

  // Clergy / Lay member list rows (each row height 72px)
  listSection: {
    gap: 10,
    marginBottom: 20,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
  },

  listHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.mediumBrown,
    letterSpacing: 1.5,
    marginBottom: 4,
    marginTop: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 72, // Senior accessibility height [60, 75] px
    marginBottom: 0,
    borderColor: colors.border,
    borderWidth: 2,
    minWidth: Platform.OS === 'web' ? 320 : '100%',
    flex: Platform.OS === 'web' ? 1 : 0,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },

  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#2c2c2c' : '#ebdcc3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  profileText: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  profileRole: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  profileSub: {
    fontSize: 10,
    color: colors.primary,
    marginTop: 1,
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
    backgroundColor: isDark ? '#2c2c2c' : '#f5edd6',
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  avatarEmoji: {
    fontSize: 22,
  },
  circleIconBtn: {
    width: 56, // senior comfortable size
    height: 56, // senior comfortable size
    borderRadius: 16, // Exactly 16px
    backgroundColor: isDark ? '#2c2c2c' : '#f5edd6',
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  circleIconText: {
    fontSize: 20,
  },
  subSectionHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#6b4c35', // Sienna
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 12,
  },
  priestCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 10px rgba(61, 43, 31, 0.05)',
      }
    })
  },
  priestCardTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
  },
  priestCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    marginBottom: 12,
  },
  priestAvatarSquare: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: isDark ? '#1e1e1e' : '#6b5e35', // dark golden brown
    alignItems: 'center',
    justifyContent: 'center',
  },
  priestAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priestHeaderInfo: {
    marginLeft: 14,
    flex: 1,
  },
  priestName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  roleBadgeText: {
    color: '#9e7a60',
    fontSize: 11,
    fontWeight: '700',
  },
  priestDetailsContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    gap: 8,
  },
  priestDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsIcon: {
    marginRight: 8,
    color: colors.foreground,
  },
  detailsText: {
    fontSize: 13,
    color: colors.foreground,
    fontWeight: '500',
  },
  priestActionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
  },
  priestCallBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: isDark ? '#1e1e1e' : '#a27b3d', // liturgical gold-brown
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  priestCallBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priestEmailBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  priestEmailBtnText: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: 'bold',
  },
  sisterRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  sisterAvatarSquircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: isDark ? '#2c2c2c' : '#ebdcc3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sisterAvatarText: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: 'bold',
  },
  sisterInfo: {
    marginLeft: 12,
    flex: 1,
  },
  sisterName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  sisterSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  sisterCallBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  officeCard: {
    backgroundColor: isDark ? '#1e1e1e' : '#594539', // Dark walnut-brown
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    marginBottom: 20,
    gap: 8,
  },
  officeTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
  },
  officeContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  officeIcon: {
    marginRight: 10,
  },
  officeText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  officeHours: {
    color: '#ebdcc3',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
  noResults: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  detailsCard: {
    borderColor: colors.primary,
    borderWidth: 2.5,
    padding: 24,
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  familyPhoto: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  imagePlaceholderBox: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: isDark ? '#2c2c2c' : '#f5eedc',
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.mutedBrown,
    marginTop: 4,
  },
  largeAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDark ? '#2c2c2c' : '#ebdcc3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  largeAvatarInitials: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  detailsName: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    color: colors.foreground,
    textAlign: 'center',
  },
  detailsRole: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1.5,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  detailsInfoBox: {
    gap: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.mediumBrown,
  },
  infoValue: {
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '600',
  },
  detailsActionRow: {
    gap: 10,
  },
  actionBtn: {
    height: 64, // strictly senior accessibility height
  },
  actionBtnSecondary: {
    height: 64, // strictly senior accessibility height
  },

  // Privacy notice
  noticeCard: {
    borderColor: colors.border,
    borderWidth: 2,
    padding: 16,
    marginTop: 10,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 6,
  },
  noticeDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  officeContactBtn: {
    backgroundColor: '#d97706', // Amber accent
    borderRadius: 16, // Exactly 16px
    height: 64, // Senior touch target [60, 75] px
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  officeContactBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // Ward view filter details
  filterBox: {
    borderColor: colors.border,
    borderWidth: 2,
    padding: 16,
    marginBottom: 20,
  },
  filterBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 12,
  },
  filterInput: {
    minHeight: 64, // Senior accessibility targets
    marginBottom: 12,
  },
  wardChipsScroll: {
    marginTop: 4,
    marginHorizontal: -16,
  },
  wardChipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  wardChip: {
    height: 64, // Senior touch target target height [60, 75] px
    borderRadius: 32,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    minWidth: 100,
  },
  wardChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  wardChipInactive: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  wardChipText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  wardChipTextActive: {
    color: colors.foreground,
  },
  wardChipTextInactive: {
    color: colors.mediumBrown,
  },
  matchedMemberIndicator: {
    fontSize: 12,
    color: colors.mediumBrown,
    fontStyle: 'italic',
    marginTop: 6,
  },
  clergyLeadershipHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, "Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
    color: colors.foreground,
    marginBottom: 16,
    marginTop: 12,
  },
  leadershipRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4', // Warm cream
    borderColor: colors.border, // Soft gold-beige border
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    minHeight: 72,
    ...Platform.select({
      web: { cursor: 'pointer', boxShadow: '0 4px 8px rgba(61,43,31,0.04)' }
    })
  },
  leadershipIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderColor: colors.border,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  leadershipTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
  },
  'box-grid-container': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  'box-grid-card': {
    width: '48%',
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 20,
    minHeight: 145,
    justifyContent: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 8px rgba(61, 43, 31, 0.04)'
      }
    })
  },
  'box-grid-icon-badge': {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderColor: colors.border,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  'box-grid-title': {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'left',
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Bold',
    lineHeight: 21,
  },
  'box-grid-subtext': {
    fontSize: 12.5,
    color: colors.mediumBrown,
    textAlign: 'left',
    marginTop: 6,
    fontFamily: Platform.OS === 'web' ? '"Noto Serif Malayalam", serif' : 'NotoSerifMalayalam-Regular',
  },
  'ministry-detail-header-card': {
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  'ministry-detail-title': {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.foreground,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System',
    marginBottom: 8,
  },
  'ministry-detail-description': {
    fontSize: 15,
    color: colors.mediumBrown,
    lineHeight: 22,
    fontFamily: Platform.OS === 'web' ? 'Nunito, sans-serif' : 'System',
  },
  'ministry-member-card': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  'ministry-member-avatar-box': {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: isDark ? '#2c2c2c' : '#ebdcc3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  'ministry-member-avatar-text': {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: 'bold',
  },
  'ministry-member-info': {
    marginLeft: 12,
    flex: 1,
  },
  'ministry-member-name': {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  'ministry-member-role': {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  'ministry-member-call-btn': {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDark ? '#1e1e1e' : '#fffdf4',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
});
