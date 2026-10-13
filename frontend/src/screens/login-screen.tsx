import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { colors, typography } from '../styles/accessible-theme';
import { useTheme } from '../styles/theme-context';
import { useLanguage } from '../localization/language-context';
import { API_BASE_URL } from '../config';

export default function LoginScreen({ onLoginSuccess }: any) {
  const { colors, isDark } = useTheme();
  const { language: lang, setLanguage: setLang, t } = useLanguage();
  const [otpAccessKey, setOtpAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!otpAccessKey.trim()) {
      const err = lang === 'ml' ? 'ആക്സസ് കീ നൽകേണ്ടതുണ്ട്' : 'Access key is required';
      setErrorMsg(err);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Dispatches asynchronous axios post request to local login endpoint
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { 
        access_key: otpAccessKey.trim(),
        accessKey: otpAccessKey.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      if (response.status === 200 && data.token) {
        // Write the returned JWT token directly to web local storage
        try {
          localStorage.setItem('user_token', data.token);
          localStorage.setItem('user_first_name', data.user.firstName || '');
          localStorage.setItem('user_last_name', data.user.lastName || '');
          localStorage.setItem('user_role', data.user.role || 'parishioner');
        } catch (_) {}

        // SecureStore fallback for native devices
        try {
          await SecureStore.setItemAsync('user_token', data.token);
          await SecureStore.setItemAsync('user_first_name', data.user.firstName || '');
          await SecureStore.setItemAsync('user_last_name', data.user.lastName || '');
          await SecureStore.setItemAsync('user_role', data.user.role || 'parishioner');
        } catch (_) {}

        /* 
         * DEVELOPER COMMENT:
         * The handleLogin subroutine is configured and ready for future One-Time Password (OTP) 
         * validation/integration logic.
         */
        onLoginSuccess(data.token);
      } else {
        const rawError = data.error || 'Authentication failed';
        const displayError = lang === 'ml' && (rawError.toLowerCase().includes('invalid') || rawError.toLowerCase().includes('fail'))
          ? 'ആക്സസ് കീ തെറ്റാണ്'
          : rawError;
        setErrorMsg(displayError);
      }
    } catch (e: any) {
      console.error(e);
      let errorMsgText = '';
      if (e.response && e.response.data) {
        const rawError = e.response.data.error || e.response.data.message || 'Authentication failed';
        errorMsgText = lang === 'ml' && (rawError.toLowerCase().includes('invalid') || rawError.toLowerCase().includes('fail'))
          ? 'ആക്സസ് കീ തെറ്റാണ്'
          : rawError;
      } else {
        errorMsgText = lang === 'ml' 
          ? 'നെറ്റ്‌വർക്ക് തകരാർ. ദയവായി പിന്നീട് ശ്രമിക്കുക.' 
          : 'Network error. Please check your connection and try again.';
      }
      setErrorMsg(errorMsgText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Language Toggle */}
      <View style={styles.langToggleContainer}>
        <View style={[styles.langCapsule, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.langToggleBtn, lang === 'en' && { backgroundColor: colors.darkGold }]}
            onPress={() => setLang('en')}
            accessibilityLabel="Switch to English"
            accessibilityRole="button"
          >
            <Text style={[styles.langToggleText, { color: lang === 'en' ? '#ffffff' : colors.mutedBrown }]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langToggleBtn, lang === 'ml' && { backgroundColor: colors.darkGold }]}
            onPress={() => setLang('ml')}
            accessibilityLabel="Switch to Malayalam"
            accessibilityRole="button"
          >
            <Text style={[styles.langToggleText, { color: lang === 'ml' ? '#ffffff' : colors.mutedBrown }]}>മലയാളം</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Parish Branding Header Group */}
      <View style={styles.headerGroup}>
        <Text style={styles.brandingLogo}>🕊️</Text>
        <Text style={[styles.brandingTitle, { color: colors.foreground }]}>ST. JOSEPH CHURCH DEVAGIRI</Text>
        <Text style={[styles.brandingSubtitle, { color: colors.textMuted }]}>
          {lang === 'ml' ? 'ദേവഗിരി ഇടവക കുടുംബം' : 'Devagiri Parish Family'}
        </Text>
      </View>

      {/* Login Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.foreground }]}>
          {lang === 'ml' ? 'ആക്സസ് കീ' : 'ACCESS KEY'}
        </Text>
        
        {/* Oversized text input field with exactly 16px border radius */}
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputTextBg, borderColor: colors.inputBorder, color: colors.foreground }]}
          placeholder="Enter your permanent access key"
          placeholderTextColor={colors.textMuted}
          value={otpAccessKey}
          onChangeText={setOtpAccessKey}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          accessibilityLabel="Enter your permanent access key"
        />

        {errorMsg !== '' ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
        ) : null}

        {/* Full-width sign-in button (64px height) */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
          disabled={loading}
          accessibilityLabel="Sign In"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator size="small" color={isDark ? colors.background : "#ffffff"} />
          ) : (
            <Text style={[styles.buttonText, { color: isDark ? colors.background : '#ffffff' }]}>
              {lang === 'ml' ? 'പ്രവേശിക്കുക' : 'SIGN IN'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf6f0', // strict background token
    justifyContent: 'center',
    padding: 24,
    ...Platform.select({
      web: {
        maxWidth: 480,
        alignSelf: 'center',
        width: '100%',
      }
    })
  },
  langToggleContainer: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
  },
  langCapsule: {
    flexDirection: 'row',
    backgroundColor: '#fffdf9',
    borderColor: '#ebdcc3',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 3,
    width: 170,
    height: 52,
    alignItems: 'center',
  },
  langToggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langToggleBtnActive: {
    backgroundColor: '#8b6914',
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9e7a60',
  },
  langToggleTextActive: {
    color: '#ffffff',
  },
  headerGroup: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandingLogo: {
    fontSize: 64,
    marginBottom: 16,
  },
  brandingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, serif' : 'System', // Cinzel font branding
    color: '#3d2b1f', // strict foreground token
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  brandingSubtitle: {
    fontSize: 14,
    color: '#9e7a60',
    marginTop: 8,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fffdf9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ebdcc3',
    padding: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3d2b1f', // strict foreground token
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    color: '#3d2b1f', // strict foreground token
    borderWidth: 2,
    borderColor: '#ebdcc3',
    borderRadius: 16, // exactly 16px border radius
    paddingHorizontal: 16,
    fontSize: 18,
    height: 64, // oversized height
    marginBottom: 16,
  },
  errorText: {
    color: '#b23b3b',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#c9a84c', // primary gold background
    height: 64, // strictly between 60px and 75px
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  buttonText: {
    fontFamily: Platform.OS === 'web' ? 'Nunito, sans-serif' : 'System', // Nunito font
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', // bold white text
    letterSpacing: 1,
  }
});
