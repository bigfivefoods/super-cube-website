import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Super-Cube® Learn — native shell (iOS / Android).
 *
 * Strategy: load the live Next.js deployment in a WebView (not static export).
 * This keeps App Router, LMS APIs, and media working without a full native rewrite.
 *
 * Override with env:
 *   CAPACITOR_SERVER_URL=https://www.super-cube.me
 *   CAPACITOR_SERVER_URL=http://10.0.2.2:3000   # Android emulator → host
 */
const serverUrl =
  process.env.CAPACITOR_SERVER_URL || "https://www.super-cube.me";

const config: CapacitorConfig = {
  appId: "me.supercube.learn",
  appName: "Super-Cube Learn",
  // Minimal local assets; primary UI loads from server.url
  webDir: "native-shell",
  server: {
    url: `${serverUrl.replace(/\/$/, "")}/learn`,
    cleartext: serverUrl.startsWith("http://"),
    allowNavigation: [
      "https://www.super-cube.me/*",
      "https://super-cube.me/*",
      "http://localhost/*",
      "http://10.0.2.2/*",
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0a0a0a",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0a",
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "SuperCubeLearn",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#ffffff",
  },
};

export default config;
