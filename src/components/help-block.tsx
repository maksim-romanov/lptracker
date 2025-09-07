import { Box } from "@grapp/stacks";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./typography/text";

export const HelpBlock = function () {
  return (
    <Box style={styles.container} rowGap={2}>
      <Text type="subtitle2">Track Any Wallet</Text>
      <Text color="outline" type="body2">
        Add any wallet address to track{" "}
        <Text color="primary" type="subtitle2" style={styles.highlighted}>
          Uniswap
        </Text>{" "}
        V3 & V4 positions.{" "}
        <Text color="outline" style={styles.highlighted}>
          No private keys needed - view-only access
        </Text>
        .
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.md,
  },

  highlighted: {
    textDecorationLine: "underline",
  },
}));
