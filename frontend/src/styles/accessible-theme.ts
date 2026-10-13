import { StyleSheet, Platform } from 'react-native';

export const colors = {
  // Theme tokens
  background: '#faf6f0',    // Cream base background
  foreground: '#3d2b1f',    // Walnut text/primary foreground
  card: '#fffdf9',          // Creamy white card background
  primary: '#c9a84c',       // Polish liturgical gold

  // Additional palette tokens
  mediumBrown: '#6b4c35',   // Medium brown
  mutedBrown: '#9e7a60',    // Muted brown
  darkGold: '#8b6914',      // Dark gold
  
  // Support colors
  border: '#ebdcc3',        // Sand gold border lines
  error: '#b23b3b',         // Crimson liturgical red
  success: '#3a7d44',       // Green liturgical emerald
  textMuted: '#9e7a60',     // Muted brown secondary text
  overlay: 'rgba(61, 43, 31, 0.45)', // Translucent walnut overlay
};

export const typography = {
  heading: {
    fontFamily: Platform.OS === 'web' ? 'Cinzel, "Noto Serif Malayalam", "Noto Sans Malayalam", serif' : 'NotoSerifMalayalam-Bold',
    fontSize: 26,
    lineHeight: 34,
    fontWeight: 'bold' as const,
    color: colors.foreground,
  },
  scripture: {
    fontFamily: Platform.OS === 'web' ? '"EB Garamond", "Noto Serif Malayalam", "Noto Sans Malayalam", serif' : 'NotoSerifMalayalam-Regular',
    fontSize: 20,
    lineHeight: 28,
    fontStyle: 'italic' as const,
    color: colors.foreground,
  },
  body: {
    fontFamily: Platform.OS === 'web' ? 'Nunito, "Noto Serif Malayalam", "Noto Sans Malayalam", serif' : 'NotoSerifMalayalam-Regular',
    fontSize: 18,
    lineHeight: 26,
    color: colors.textMuted,
  },
  bodyBold: {
    fontFamily: Platform.OS === 'web' ? 'Nunito, "Noto Serif Malayalam", "Noto Sans Malayalam", serif' : 'NotoSerifMalayalam-Bold',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: 'bold' as const,
    color: colors.foreground,
  },
  buttonText: {
    fontFamily: Platform.OS === 'web' ? 'Nunito, "Noto Serif Malayalam", sans-serif' : 'NotoSerifMalayalam-Bold',
    fontSize: 19,
    fontWeight: 'bold' as const,
    color: colors.card,
  },
  helper: {
    fontFamily: Platform.OS === 'web' ? 'Nunito, "Noto Serif Malayalam", sans-serif' : 'NotoSerifMalayalam-Regular',
    fontSize: 16,
    lineHeight: 22,
    color: colors.mutedBrown,
  }
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16, // Exactly 16px corner radius globally
    borderWidth: 2,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 10px rgba(61, 43, 31, 0.06)',
      }
    })
  },
  button: {
    backgroundColor: colors.foreground, // Dark walnut button
    minHeight: 64, // Oversized senior touch target (strictly between 60px and 75px)
    borderRadius: 16, // Exactly 16px corner radius
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: colors.foreground,
    marginVertical: 8,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    minHeight: 64, // Oversized senior touch target (strictly between 60px and 75px)
    borderRadius: 16, // Exactly 16px corner radius
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 2.5,
    borderColor: colors.primary, // Gold outline
    marginVertical: 8,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  input: {
    backgroundColor: colors.card,
    color: colors.foreground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16, // Exactly 16px corner radius
    paddingHorizontal: 16,
    fontSize: 18,
    minHeight: 64, // Oversized senior touch target (strictly between 60px and 75px)
    marginBottom: 16,
    fontFamily: Platform.OS === 'web' ? 'Nunito, sans-serif' : 'System',
  },
  label: {
    fontFamily: Platform.OS === 'web' ? 'Nunito, sans-serif' : 'System',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 8,
  },
  buttonText: {
    ...typography.buttonText,
  },
  buttonTextSecondary: {
    ...typography.buttonText,
    color: colors.foreground,
  }
});
