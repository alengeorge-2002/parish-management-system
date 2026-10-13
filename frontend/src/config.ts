import { Platform } from 'react-native';
import axios from 'axios';

let rawUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
if (rawUrl.includes(':3000')) {
  rawUrl = rawUrl.replace(':3000', ':5000');
}
export const API_URL = rawUrl;
export const API_BASE_URL = API_URL.replace(/\/api\/?$/, '');

// Configure global headers and timeout for Axios to bypass warnings and avoid hangs
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
axios.defaults.timeout = 5000;

// Helper fetch function to automatically inject the ngrok skip warning header and 5000ms timeout
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let urlString = typeof input === 'string' ? input : input.toString();
  if (urlString.includes(':3000')) {
    urlString = urlString.replace(':3000', ':5000');
  }

  const newInit: RequestInit = { ...init };
  
  if (newInit.headers) {
    if (newInit.headers instanceof Headers) {
      newInit.headers.set('ngrok-skip-browser-warning', 'true');
    } else if (Array.isArray(newInit.headers)) {
      newInit.headers = [...newInit.headers, ['ngrok-skip-browser-warning', 'true']];
    } else {
      newInit.headers = {
        ...(newInit.headers as Record<string, string>),
        'ngrok-skip-browser-warning': 'true',
      };
    }
  } else {
    newInit.headers = {
      'ngrok-skip-browser-warning': 'true',
    };
  }

  // Apply strict timeout of 5000 milliseconds using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  newInit.signal = controller.signal;

  try {
    const response = await fetch(urlString, newInit);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (urlString.includes('localhost')) {
      try {
        const altUrl = urlString.replace('localhost', '127.0.0.1');
        const altController = new AbortController();
        const altTimeout = setTimeout(() => altController.abort(), 5000);
        const altInit = { ...newInit, signal: altController.signal };
        const altResponse = await fetch(altUrl, altInit);
        clearTimeout(altTimeout);
        return altResponse;
      } catch (_) {}
    }
    throw error;
  }
}


