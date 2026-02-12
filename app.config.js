export default {
  expo: {
    name: 'Hyper Chief',
    slug: 'hyper-chief',
    scheme: 'hyper-chief',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.hyper.chief',
      infoPlist: {
        NSCameraUsageDescription: 'This app uses the camera to scan booking QR codes.',
        NSPhotoLibraryUsageDescription: 'This app uses the photo library to save reports and venue images.',
        NSLocationWhenInUseUsageDescription: 'This app uses your location to show nearby services and venue maps.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.hyper.chief',
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    "extra": {
      "eas": {
        "projectId": "e26d64c6-6c2c-4bf7-9c5b-ccd1845fe515"
      }
    },
    owner: 'hitendras940',
    plugins: [
      [
        'expo-camera',
        {
          recordAudioPermission: 'Allow $(PRODUCT_NAME) to access your microphone.'
        }
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.'
        }
      ],
      'expo-image-picker',
      'expo-notifications',
      'expo-media-library'
    ]
  },
};
