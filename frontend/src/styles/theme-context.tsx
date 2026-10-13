import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';

export const lightColors = {
  background: '#faf6f0',    // Cream base background
  foreground: '#3d2b1f',    // Walnut text/primary foreground
  card: '#fffdf9',          // Creamy white card background
  primary: '#c9a84c',       //Liturgical gold
  mediumBrown: '#6b4c35',
  mutedBrown: '#9e7a60',
  darkGold: '#8b6914',
  border: '#ebdcc3',        // Sand gold border
  error: '#b23b3b',
  success: '#3a7d44',
  textMuted: '#9e7a60',
  overlay: 'rgba(61, 43, 31, 0.45)',
  inputTextBg: '#ffffff',
  inputBorder: '#ebdcc3',
};

export const darkColors = {
  background: '#121212',    // Accessible dark gray background
  foreground: '#f5ebe0',    // Readable light foreground
  card: '#1e1e1e',          // Dark card color
  primary: '#ebdcc3',       // Soft gold/cream accent for dark mode
  mediumBrown: '#ebdcc3',
  mutedBrown: '#a89078',
  darkGold: '#c9a84c',
  border: '#2c2c2c',        // Muted dark border
  error: '#cf6679',
  success: '#81c784',
  textMuted: '#a89078',
  overlay: 'rgba(0, 0, 0, 0.65)',
  inputTextBg: '#1e1e1e',
  inputBorder: '#2c2c2c',
};

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: typeof lightColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = false;
  const colors = lightColors;
  const themeMode = 'light';
  const setThemeMode = () => {};

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
