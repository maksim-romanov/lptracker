import "react-native-reanimated";

import React from "react";

import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { UnistylesRuntime, withUnistyles } from "react-native-unistyles";

// SplashScreen.preventAutoHideAsync();

const UniThemeProvider = withUnistyles(ThemeProvider, (theme) => ({
  value: {
    ...theme,
    dark: UnistylesRuntime.themeName === "dark", // Automatically detect dark theme
    colors: {
      primary: theme.colors.primary, // #FF007A - Uniswap pink
      background: theme.colors.background, // Main background
      card: theme.colors.backgroundModule, // Card/surface background
      text: theme.colors.textPrimary, // Primary text
      border: theme.colors.border, // Borders and dividers
      notification: theme.colors.error, // Badges and notifications
    },
    fonts: {
      regular: {},
      medium: {},
    },
  } as ReactNavigation.Theme,
}));

export default function RootLayout() {
  return (
    <UniThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style="auto" />
    </UniThemeProvider>
  );
}
