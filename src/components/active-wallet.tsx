import Ionicons from "@expo/vector-icons/Ionicons";
import { Box } from "@grapp/stacks";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { formatAddress } from "utils/hash";

import { Text } from "./typography/text";

const WalletIcon = withUnistyles(Ionicons, (theme) => ({
  color: theme.colors.onPrimary,
  size: 26,
  name: "wallet" as const,
}));

export const ActiveWallet = function () {
  return (
    <Box style={styles.container} direction="row" alignY="center" gap={4}>
      <WalletIcon />

      <Box rowGap={1}>
        <Text type="subtitle2" color="onPrimary">
          Active Wallet
        </Text>
        <Text type="headline5" color="onPrimary">
          {formatAddress("0x1234567890123456789012345678901234567890")}
        </Text>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
    borderRadius: theme.spacing.md,
  },
}));
