import { Box, Stack } from "@grapp/stacks";
import numbro from "numbro";
import { StyleSheet } from "react-native-unistyles";

import { formatAddress } from "utils/hash";

import { Tag } from "./tag";
import { Text } from "./typography/text";

export const TotalBalance = function () {
  return (
    <Box style={styles.container} alignX="center" gap={2}>
      <Stack align="center" space={2}>
        <Text type="subtitle2" color="onPrimary">
          Total Value Locked
        </Text>
        <Text type="headline2" color="onPrimary">
          {numbro(1345982.2323).formatCurrency({
            mantissa: 0,
            thousandSeparated: true,
            trimMantissa: true,
            spaceSeparated: false,
          })}
        </Text>
      </Stack>

      <Tag color="#fff" style={styles.tag}>
        {formatAddress("0x1234567890123456789012345678901234567890")}
      </Tag>
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

  tag: {
    borderRadius: theme.spacing.xl,
    opacity: 0.75,
  },
}));
