import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Box, Column, Columns, Inline, Stack } from "@grapp/stacks";
import numbro from "numbro";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { SupportedProtocol } from "components/position-cards";
import { TokensImages } from "components/shared/tokens-imgs";
import { ChainId } from "domain/entities/blockchain";

import { ChainTag, FeeBpsTag, InRangeTag, ProtocolTag } from "../tag/presets";
import { Text } from "../typography/text";

const TrendUpIcon = withUnistyles(FontAwesome6, (theme) => ({
  color: theme.colors.success,
  size: 16,
  name: "arrow-trend-up",
}));

export interface BaseLPPositionCardProps {
  tokens: { address: string; symbol?: string }[];
  inRange: boolean;
  chainId: ChainId;
  protocol: SupportedProtocol;
  feeBps: number;
}

export const LPPositionBlockBase = ({ tokens, chainId, inRange, protocol, feeBps }: BaseLPPositionCardProps) => {
  return (
    <Box style={styles.container} rowGap={8}>
      <Stack space={4}>
        <Columns alignY="center">
          <Column flex="fluid">
            <Inline space={2} alignY="center">
              <TokensImages tokens={tokens} chainId={chainId} />
              <Text type="headline4">{tokens.map((token) => token.symbol).join("/")}</Text>
            </Inline>
          </Column>

          <Column flex="content">
            <InRangeTag inRange={inRange} />
          </Column>
        </Columns>

        <Inline space={2}>
          <ChainTag chainId={chainId} />
          <FeeBpsTag feeBps={feeBps} />
          <ProtocolTag protocol={protocol} />
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
