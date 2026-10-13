import '@expo/metro-runtime';
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// Register PWA Service Worker & Meta Tags on Web Platform
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const head = document.head;

  if (!document.querySelector('link[rel="manifest"]')) {
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    head.appendChild(manifestLink);
  }

  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = '/apple-touch-icon.png';
    head.appendChild(appleIcon);
  }

  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    const appleCapable = document.createElement('meta');
    appleCapable.name = 'apple-mobile-web-app-capable';
    appleCapable.content = 'yes';
    head.appendChild(appleCapable);
  }

  if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
    const appleStatus = document.createElement('meta');
    appleStatus.name = 'apple-mobile-web-app-status-bar-style';
    appleStatus.content = 'black-translucent';
    head.appendChild(appleStatus);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration failed:', err);
        });
    });
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

