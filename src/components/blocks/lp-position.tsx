import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Box, Column, Columns, Inline, Stack } from "@grapp/stacks";
import numbro from "numbro";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AdaptiveTag, PrimaryTag, SecondaryTag, SuccessTag } from "../tag/presets";
import { Text } from "../typography/text";

const TrendUpIcon = withUnistyles(FontAwesome6, (theme) => ({
  color: theme.colors.success,
  size: 16,
  name: "arrow-trend-up",
}));

export const LPPositionBlock = function () {
  return (
    <Box style={styles.container} rowGap={8}>
      <Stack space={2}>
        <Columns alignY="center">
          <Column flex="fluid">
            <Text type="headline4">ETH/USDC</Text>
          </Column>

          <Column flex="content">
            <SuccessTag glow>in range</SuccessTag>
          </Column>
        </Columns>

        <Inline space={2}>
          <AdaptiveTag color="red">OP</AdaptiveTag>
          <SecondaryTag>0.3%</SecondaryTag>
          <PrimaryTag>V3</PrimaryTag>
        </Inline>
      </Stack>

      <Columns space={6} defaultFlex="content" alignX="left">
        <Column flex="content" style={{ flexShrink: 1 }}>
          <Box rowGap={1}>
            <Text type="caption" color="onSurfaceVariant">
              Value
            </Text>

            <Text type="headline4" numberOfLines={1} style={{ flexShrink: 1 }}>
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
          <Box rowGap={1}>
            <Text type="caption" color="onSurfaceVariant">
              Unclaimed
            </Text>

            <Text type="headline6" numberOfLines={1}>
              {numbro(100.1).formatCurrency({
                average: true,
                mantissa: 2,
                trimMantissa: true,
                spaceSeparated: false,
              })}
            </Text>
          </Box>
        </Column>

        <Column>
          <Box rowGap={1}>
            <Text type="caption" color="onSurfaceVariant">
              APR
            </Text>

            <Inline space={2} alignY="center">
              <TrendUpIcon />

              <Text type="headline6" numberOfLines={1}>
                {numbro(0.0312).format({
                  output: "percent",
                  mantissa: 2,
                  trimMantissa: true,
                  spaceSeparated: false,
                })}
              </Text>
            </Inline>
          </Box>
        </Column>
      </Columns>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: theme.colors.outline,

    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
}));
