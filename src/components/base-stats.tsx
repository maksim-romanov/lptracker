import Feather from "@expo/vector-icons/Feather";
import { Box, Columns, Stack } from "@grapp/stacks";
import numbro from "numbro";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Text } from "./typography/text";

const DollarIcon = withUnistyles(Feather, (theme) => ({
  color: theme.colors.success,
  size: 24,
  name: "dollar-sign" as const,
}));

const DropletIcon = withUnistyles(Feather, (theme) => ({
  color: theme.colors.secondary,
  size: 24,
  name: "droplet" as const,
}));

export const BaseStats = function () {
  return (
    <Columns space={4}>
      <Box rowGap={2} alignX="center" style={styles.container} flex="fluid">
        <DollarIcon />

        <Stack space={2} align="center">
          <Text color="outline" type="caption">
            24h Fees
          </Text>

          <Text type="headline4">
            {numbro(89.13).formatCurrency({
              average: true,
              mantissa: 2,
              trimMantissa: true,
              spaceSeparated: false,
            })}
          </Text>

          <Text type="subtitle2" color="success">
            {numbro(0.0125).format({
              output: "percent",
              mantissa: 2,
              trimMantissa: true,
              spaceSeparated: false,
              prefix: "+",
            })}
          </Text>
        </Stack>
      </Box>

      <Box rowGap={2} alignX="center" style={styles.container} flex="fluid">
        <DropletIcon />
        <Text color="outline">Active Positions</Text>
        <Text type="headline4">{4}</Text>
        <Text type="subtitle2" color="outline">
          In range
        </Text>
      </Box>
    </Columns>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
}));
