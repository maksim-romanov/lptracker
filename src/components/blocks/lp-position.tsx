import React from "react";

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Box, Column, Columns, Inline, Stack } from "@grapp/stacks";
import numbro from "numbro";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { SupportedProtocol } from "components/position-cards";
import { TokensImages } from "components/shared/tokens-imgs";
import { ChainId } from "domain/entities/blockchain";
import { useTokenPrices } from "features/token-prices/presentation/hooks";

import { ChainTag, FeeBpsTag, InRangeTag, ProtocolTag } from "../tag/presets";
import { Text } from "../typography/text";

const TrendUpIcon = withUnistyles(FontAwesome6, (theme) => ({
  color: theme.colors.success,
  size: 16,
  name: "arrow-trend-up",
}));

type Token = { address: string; symbol?: string };
export interface BaseLPPositionCardProps {
  tokens: Token[];
  inRange: boolean;
  chainId: ChainId;
  protocol: SupportedProtocol;
  feeBps: number;

  // totalValueTokens: (Token & { amountUSD: number })[];
  // unclaimedFeesTokens: (Token & { amount: bigint; amountUSD: number })[];

  totalValue?: number;
  unclaimedFees?: number;
}

export const LPPositionBlockBase = function (props: BaseLPPositionCardProps) {
  const { tokens, chainId, inRange, protocol, feeBps, totalValue, unclaimedFees } = props;

  return (
    <Box style={styles.container} rowGap={8}>
      <Stack space={4}>
        <Inline alignY="center">
          <Inline space={4} alignY="center" flex="fluid">
            <TokensImages tokens={tokens} chainId={chainId} />
            <Text type="headline4">{tokens.map((token) => token.symbol).join("/")}</Text>
          </Inline>

          <Box marginRight={2}>
            <InRangeTag inRange={inRange} />
          </Box>
        </Inline>

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
              {numbro(totalValue).formatCurrency({
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
              {numbro(unclaimedFees).formatCurrency({
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
