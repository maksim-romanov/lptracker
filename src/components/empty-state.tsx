import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Box, Stack } from "@grapp/stacks";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { Text } from "./typography/text";

const EmptyIcon = withUnistyles(FontAwesome6, (theme) => ({
  color: tinycolor(theme.colors.primary).darken(10).toRgbString(),
  size: 64,
  name: "chart-line",
}));

export const EmptyState = function () {
  const walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

  const formatWalletAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box style={styles.container}>
      <Stack space={8} align="center">
        <Box style={styles.iconContainer}>
          <EmptyIcon />
        </Box>

        <Stack space={4} align="center">
          <Text type="headline3" color="onSurface">
            No positions found
          </Text>

          <Text type="body1" color="outline" style={styles.centeredText}>
            Wallet{" "}
            <Text type="body1" color="primary">
              {formatWalletAddress(walletAddress)}
            </Text>{" "}
            doesn&apos;t have any v3 and v4 positions on{" "}
            <Text type="body1" color="primary">
              Uniswap
            </Text>{" "}
            yet
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.giant,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: "dashed",
  },
  title: {
    textAlign: "center",
    fontWeight: "600",
  },
  centeredText: {
    textAlign: "center",
  },
}));
