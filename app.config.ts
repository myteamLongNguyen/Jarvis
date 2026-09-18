import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Jarvis',
  slug: 'Jarvis',
  version: '1.0.0',
  orientation: 'default',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.carrgroup.jarvis',
    infoPlist: {
      // Only standard HTTPS — declaring it skips the export-compliance question
      // App Store Connect otherwise asks on every TestFlight build.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.carrgroup.jarvis',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    [
      'expo-image-picker',
      {
        photosPermission: 'Jarvis accesses your photos so you can attach them to a property.',
        // Smart Scan's "Take a photo" opens the camera. Without this string iOS
        // terminates the app the moment the camera is requested.
        cameraPermission: 'Jarvis uses the camera to photograph invoices, leases and statements for Smart Scan.',
        microphonePermission: false,
      },
    ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
});
