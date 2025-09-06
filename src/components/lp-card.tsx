import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Octicons from "@expo/vector-icons/Octicons";
import { Box, Column, Columns, Inline, Stack } from "@grapp/stacks";
import numbro from "numbro";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Tag } from "./tag";
import { Text } from "./typography/text";

numbro.setLanguage("en");

const SuccessTag = withUnistyles(Tag, (theme) => ({
  color: theme.colors.success,
}));

const TrendUpIcon = withUnistyles(FontAwesome6, (theme) => ({
  color: theme.colors.success,
  size: 16,
  name: "arrow-trend-up",
}));

export const LPCard = function () {
  return (
    <Box style={styles.container} rowGap={6}>
      <Stack space={2}>
        <Columns alignY="center">
          <Column flex="fluid">
            <Text type="headline4">ETH/USDC</Text>
          </Column>

          <Column flex="content">
            <SuccessTag>in Range</SuccessTag>
          </Column>
        </Columns>

        <Inline space={2}>
          <Tag
            prefix={
              <Box height={12} width={12}>
                <Octicons name="dot-fill" size={12} color="red" />
              </Box>
            }
            color="red"
          >
            OP
          </Tag>
          <Tag>0.3%</Tag>
          <Tag color="#FF007A">V3</Tag>
        </Inline>
      </Stack>

      <Columns space={10} defaultFlex="content" alignX="left">
        <Column flex="content" style={{ flexShrink: 1 }}>
          <Box rowGap={2}>
            <Text type="caption">Value</Text>

            <Text type="headline5" color="onSurface" numberOfLines={1} style={{ flexShrink: 1 }}>
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

            <Text type="headline5" color="onSurface" numberOfLines={1}>
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
          <Box rowGap={2}>
            <Text type="caption">APR</Text>

            <Inline space={2} alignY="center">
              <TrendUpIcon />

              <Text type="headline5" color="success" numberOfLines={1}>
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
    borderRadius: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
}));
