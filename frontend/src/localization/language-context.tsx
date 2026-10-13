import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';

import enUs from './en-us.json';
import mlIn from './ml-in.json';

type Language = 'en' | 'ml';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  userToken: string | null;
  setUserToken: (token: string | null) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: enUs,
  ml: mlIn,
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const saved = await SecureStore.getItemAsync('user-language');
        if (saved === 'en' || saved === 'ml') {
          setLanguageState(saved);
        } else {
          // Fallback to localStorage on web
          const localSaved = localStorage.getItem('user-language');
          if (localSaved === 'en' || localSaved === 'ml') {
            setLanguageState(localSaved);
          }
        }
      } catch (_) {
        try {
          const localSaved = localStorage.getItem('user-language');
          if (localSaved === 'en' || localSaved === 'ml') {
            setLanguageState(localSaved);
          }
        } catch (__) {}
      }
    };
    loadSavedLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await SecureStore.setItemAsync('user-language', lang);
    } catch (_) {
      try {
        localStorage.setItem('user-language', lang);
      } catch (__) {}
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, userToken, setUserToken }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
