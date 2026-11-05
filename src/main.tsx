import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { UPDATE_EVENT, setUpdater } from './components/UpdateBanner';

// Register Service Worker for 100% offline PWA caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new Event(UPDATE_EVENT));
    },
    onOfflineReady() {
      console.log('PWA: Prêt pour fonctionnement hors-ligne.');
    },
  });
  setUpdater(updateSW);
}

import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </ThemeProvider>
);
