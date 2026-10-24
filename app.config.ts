import type { ExpoConfig } from "expo/config";

// Values loaded from .env by the Expo CLI.
const name = process.env.EXPO_PUBLIC_APP_NAME || "SadhyamIAS";
const androidPackage =
  process.env.ANDROID_PACKAGE || "com.sadhyamias.app";

const config: ExpoConfig = {
  name,
  slug: "sadhyamias",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "sadhyamias",
  userInterfaceStyle: "light",
  backgroundColor: "#021424",

  platforms: ["android", "web"],

  android: {
    package: androidPackage,
    versionCode: 1,

    adaptiveIcon: {
      backgroundColor: "#f97316",
      foregroundImage:
        "./assets/images/android-icon-foreground.png",
      backgroundImage:
        "./assets/images/android-icon-background.png",
      monochromeImage:
        "./assets/images/android-icon-monochrome.png",
    },

    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: "resize",

    // Keep only the permissions required by your app.
    permissions: ["android.permission.INTERNET"],
  },

  web: {
    output: "single",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#021424",
        image: "./assets/images/splash-icon.png",
        imageWidth: 96,
      },
    ],
  ],

  experiments: {
    typedRoutes: false,
    reactCompiler: false,
  },

  extra: {
    eas: {
      projectId: "101dbb9e-d7c1-436e-896e-5e4453b5650a",
    },
  },
};

export default config;