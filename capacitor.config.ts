import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymbro.app',
  appName: 'GymBro',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // For live reload during development on mobile device/emulator:
    // url: 'http://10.0.2.2:3000',
    cleartext: true,
  },
  backgroundColor: '#090d16',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#090d16',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#090d16',
    },
  },
};

export default config;
