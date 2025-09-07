import Ionicons from "@expo/vector-icons/Ionicons";
import { Box } from "@grapp/stacks";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { formatAddress } from "utils/hash";

import { Tag } from "./tag";
import { Text } from "./typography/text";

const WalletIcon = withUnistyles(Ionicons, (theme) => ({
  color: theme.colors.onSurface,
  size: 24,
  name: "wallet-outline" as const,
}));

type TProps = {
  address: string;
  name: string;
  isActive: boolean;
};

const ActiveTag = withUnistyles(Tag, (theme) => ({
  color: theme.colors.primary,
  children: "Active",
}));

export const WalletItem = function ({ address, name, isActive }: TProps) {
  return (
    <Box style={[styles.container, isActive && styles.active]} direction="row" alignY="center" gap={4}>
      {isActive ? <WalletIcon style={styles.activeIcon} name="wallet" /> : <WalletIcon />}

      <Box rowGap={1} flex="fluid">
        <Text type="caption">{name}</Text>
        <Text type="headline6" color={isActive ? "primary" : "onSurface"}>
          {formatAddress(address)}
        </Text>
      </Box>

      {isActive && <ActiveTag />}
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },

  active: {
    borderColor: theme.colors.primary,
  },

  activeIcon: {
    color: theme.colors.primary,
  },
}));
