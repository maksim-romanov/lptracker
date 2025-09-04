import "react-native-reanimated";

import React from "react";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style="auto" />
    </>
  );
}
