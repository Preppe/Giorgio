import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.fumarola.giorgio',
  appName: 'Giorgio',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0a0a0a',
      overlaysWebView: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#00bcd4',
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: 'ionic',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#0a0a0a',
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
    handleApplicationURL: false,
    limitsNavigationsToAppBoundDomains: false,
    presentationStyle: 'fullscreen',
    statusBarStyle: 'lightcontent',
    // Imposta la status bar per essere gestita dal sistema
    // ma lascia che l'app inizi da sotto la status bar
    webViewBounce: false,
    disallowOverscroll: true,
    keyboardDisplayRequiresUserAction: false,
    suppressesIncrementalRendering: false,
    allowsInlineMediaPlayback: true,
    allowsAirPlayForMediaPlayback: true,
    allowsPictureInPictureMediaPlayback: true,
    allowsBackForwardNavigationGestures: true,
    minimumFontSize: 0,
    mediaPlaybackRequiresUserAction: false,
    enableViewportScale: false,
    allowsNavigationActionPolicy: true,
    allowsNewWindowActionPolicy: true,
    resourcesType: 'public',
    shell: {
      mode: 'tabbed',
    },
  },
};

export default config;
