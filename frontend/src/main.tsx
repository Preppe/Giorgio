import { createRoot } from 'react-dom/client';

import * as Sentry from '@sentry/react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

import App from './App.tsx';
import './index.css';

if (
  import.meta.env.NODE_ENV === 'production' &&
  import.meta.env.VITE_SENTRY_DSN
) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
  });
}

// Configure status bar for native iOS app
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Light });
  StatusBar.setBackgroundColor({ color: '#0a0a0a' });
  StatusBar.setOverlaysWebView({ overlay: true });
}

createRoot(document.getElementById('root')!).render(<App />);
