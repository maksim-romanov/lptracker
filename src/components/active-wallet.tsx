import React from "react";

import Ionicons from "@expo/vector-icons/Ionicons";
import { Box } from "@grapp/stacks";
import { TouchableOpacity } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { addressesStore } from "presentation/stores/addresses-store";
import { formatAddress } from "utils/hash";

import { observer } from "mobx-react-lite";
import { SelectWalletModal } from "./select-wallet-modal";
import { Text } from "./typography/text";

const WalletIcon = withUnistyles(Ionicons, (theme) => ({
  color: theme.colors.onPrimary,
  size: 26,
  name: "wallet" as const,
}));

const BrandShadow = withUnistyles(Shadow, (theme) => ({
  startColor: tinycolor(theme.colors.primary).setAlpha(0.1).toRgbString(),
  distance: 10,
  offset: [0, 5] as [number, number],
  stretch: true,
}));

export const ActiveWallet = observer(function () {
  const address = addressesStore.activeAddress;
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <>
      <BrandShadow>
        <TouchableOpacity onPress={() => setIsVisible(true)}>
          <Box style={styles.container} direction="row" alignY="center" gap={4}>
            <WalletIcon />

            <Box rowGap={1}>
              <Text type="subtitle2" color="onPrimary">
                Active Wallet
              </Text>
              <Text type="headline5" color="onPrimary">
                {address ? formatAddress(address) : "No active wallet"}
              </Text>
            </Box>
          </Box>
        </TouchableOpacity>
      </BrandShadow>

      <SelectWalletModal isVisible={isVisible} onClose={() => setIsVisible(false)} />
    </>
  );
});

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.spacing.md,
  },
}));
