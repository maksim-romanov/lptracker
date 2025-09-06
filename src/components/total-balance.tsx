import { Box } from "@grapp/stacks";
import numbro from "numbro";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./typography/text";

export const TotalBalance = function () {
  return (
    <Box style={styles.container} alignX="center">
      <Text type="subtitle2">Total Value Locked</Text>
      <Text type="headline2">
        {numbro(1345982.2323).formatCurrency({
          mantissa: 0,
          thousandSeparated: true,
          trimMantissa: true,
          spaceSeparated: false,
        })}
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.spacing.md,
  },
}));
