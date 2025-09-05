import "react-native-reanimated";

import React from "react";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";

// SplashScreen.preventAutoHideAsync();

// const UniThemeProvider = withUnistyles(ThemeProvider, (theme) => ({
//   value: {
//     ...theme,
//     dark: UnistylesRuntime.themeName === "dark", // Automatically detect dark theme
//     colors: {
//       primary: theme.colors.interactiveActive, // #FF007A - Uniswap pink
//       background: theme.colors.background, // Main background
//       card: theme.colors.backgroundModule, // Card/surface background
//       text: theme.colors.textPrimary, // Primary text
//       border: theme.colors.border, // Borders and dividers
//       notification: theme.colors.error, // Badges and notifications
//     },
//     fonts: {
//       regular: {},
//       medium: {},
//     },
//   },
// }));

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style="auto" />
    </KeyboardProvider>
  );
}
