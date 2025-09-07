import "react-native-reanimated";

import React from "react";

import { ThemeProvider } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { observer } from "mobx-react-lite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { UnistylesRuntime, withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { container } from "di/container";
import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { addressesStore } from "presentation/stores/addresses-store";

// SplashScreen.preventAutoHideAsync();

const UniThemeProvider = withUnistyles(ThemeProvider, (theme) => ({
  value: {
    ...theme,
    dark: UnistylesRuntime.themeName === "dark", // Automatically detect dark theme
    colors: {
      primary: theme.colors.primary, // #FF007A - Uniswap pink
      background: theme.colors.background, // Main background
      card: theme.colors.outline, // Card/surface background
      text: theme.colors.onPrimary, // Primary text
      border: theme.colors.onBackground, // Borders and dividers
      notification: theme.colors.primary, // Badges and notifications
    },
    fonts: {
      regular: {},
      medium: {},
    } as any,
  },
}));

const HeaderBlur = withUnistyles(BlurView, (theme, rt) => ({
  intensity: 50,
  style: {
    height: rt.insets.top,
    backgroundColor: tinycolor(theme.colors.background).setAlpha(0.1).toRgbString(),
  },
}));

const RootLayout = observer(function () {
  React.useEffect(() => {
    container.resolve(AppInitializeUseCase).execute();
    addressesStore.hydrate();
  }, []);

  const hasAnyAddress = addressesStore.items.length > 0;
  return (
    <UniThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <Stack>
            <Stack.Protected guard={!hasAnyAddress}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack.Protected>

            <Stack.Protected guard={hasAnyAddress}>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerTransparent: true,
                  header: () => <HeaderBlur />,
                }}
              />
            </Stack.Protected>

            <Stack.Screen name="+not-found" />
          </Stack>

          <StatusBar style="auto" />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </UniThemeProvider>
  );
});

export default RootLayout;
