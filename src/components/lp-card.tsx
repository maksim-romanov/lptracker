import { Box, Column, Columns, Inline, Stack } from "@grapp/stacks";
import numbro from "numbro";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./typography/text";

const Chip = function ({ children }: React.PropsWithChildren) {
  return (
    <View style={styles.chip}>
      <Text type="caption">{children}</Text>
    </View>
  );
};

numbro.setLanguage("en");

export const LPCard = function () {
  return (
    <Box style={styles.container} rowGap={6}>
      <Stack space={2}>
        <Text type="headline3">ETH/USDC</Text>

        <Inline space={2}>
          <Chip>ETH</Chip>
          <Chip>0.3%</Chip>
          <Chip>V3</Chip>
        </Inline>
      </Stack>

      <Columns space={7} defaultFlex="content" alignX="left">
        <Column flex="content" style={{ flexShrink: 1 }}>
          <Box rowGap={2}>
            <Text type="caption">Value</Text>

            <Text type="headline5" color="surface" numberOfLines={1} style={{ flexShrink: 1 }}>
              {numbro(1234980).formatCurrency({
                average: true,
                mantissa: 2,
                trimMantissa: true,
                spaceSeparated: false,
              })}
            </Text>
          </Box>
        </Column>

        <Column flex="content">
          <Box rowGap={2}>
            <Text type="caption">Unclaimed</Text>

            <Text type="headline5" color="surface" numberOfLines={1}>
              {numbro(100.1).formatCurrency({
                average: true,
                mantissa: 2,
                trimMantissa: true,
                spaceSeparated: false,
              })}
            </Text>
          </Box>
        </Column>

        <Column flex="1/3">
          <Box rowGap={2}>
            <Text type="caption">APR</Text>

            <Text type="headline5" color="surface" numberOfLines={1}>
              {numbro(0.0312).format({
                output: "percent",
                mantissa: 2,
                trimMantissa: true,
                spaceSeparated: false,
              })}
            </Text>
          </Box>
        </Column>
      </Columns>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },

  chip: {
    backgroundColor: "red",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.xs,
  },
}));
