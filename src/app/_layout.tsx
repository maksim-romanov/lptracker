import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Box } from "@grapp/stacks";
import { ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

import { Header } from "components/navigation/glass-header";
import { configureDI as configureTokenMetadata } from "features/token-metadata/config/di-container";
import { configureTokenPricesDI } from "features/token-prices/config/di-container";
import { configureDI as configureUniswapV4 } from "features/uniswap-v4/config/di-container";
import { queryClient } from "infrastructure/query";
import { blockchainStore } from "presentation/stores/blockchain-store";
import { DarkTheme } from "styles/theme/navigation";

// Initialize feature DI containers
configureTokenMetadata();
configureUniswapV4();
configureTokenPricesDI();

// Initialize blockchain store
blockchainStore.hydrate();

const ModalHeader = () => <Box paddingY={4} />;

export default function RootLayout() {
  return (
    // <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <ThemeProvider value={DarkTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerTransparent: true, header: Header }} />
                <Stack.Screen name="modal" options={{ presentation: "formSheet", title: "Modal" }} />

                <Stack.Screen
                  name="wallets/new"
                  options={{
                    header: ModalHeader,
                    presentation: "formSheet",
                    gestureDirection: "vertical",
                    sheetGrabberVisible: true,
                    sheetInitialDetentIndex: 0,
                    sheetAllowedDetents: "fitToContents",
                    contentStyle: styles.modalContent,
                  }}
                />

                <Stack.Screen
                  name="wallets/[id]"
                  options={{
                    header: ModalHeader,
                    presentation: "formSheet",
                    gestureDirection: "vertical",
                    sheetGrabberVisible: true,
                    sheetInitialDetentIndex: 0,
                    sheetAllowedDetents: "fitToContents",
                    contentStyle: styles.modalContent,
                  }}
                />
              </Stack>

              <StatusBar style="auto" />
            </ThemeProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  modalContent: {
    backgroundColor: theme.colors.surfaceContainer,
  },
}));
