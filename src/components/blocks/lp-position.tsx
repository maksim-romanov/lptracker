import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Box, Column, Columns, Inline, Stack } from "@grapp/stacks";
import numbro from "numbro";
import { ActivityIndicator } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { TokensImages } from "components/shared/tokens-imgs";
import { ChainId } from "domain/entities/blockchain";
import { usePositionCard } from "features/uniswap-v4/presentation/hooks/use-position-card";

import { ChainTag, FeeBpsTag, InRangeTag, ProtocolTag } from "../tag/presets";
import { Text } from "../typography/text";

const TrendUpIcon = withUnistyles(FontAwesome6, (theme) => ({
  color: theme.colors.success,
  size: 16,
  name: "arrow-trend-up",
}));

type TProps = {
  chainId: ChainId;
  positionId: bigint;
};
interface BaseLPPositionCardProps {
  tokens: { address: string; symbol?: string }[];
  inRange: boolean;
  chainId: ChainId;
  protocol: "uniswap-v4" | "uniswap-v3";
}

interface TUniswapV4LPPositionCardProps extends BaseLPPositionCardProps {
  protocol: "uniswap-v4";
  hook?: string;
  feeBps: number;
}

const withUniswapV4Provider = (Component: React.ComponentType<TUniswapV4LPPositionCardProps>) => {
  return function WrappedComponent({ chainId, positionId }: TProps) {
    const res = usePositionCard(positionId, chainId);

    // todo: add skeleton loader
    if (!res.data) return <ActivityIndicator />;

    const tokens = [res.data.tokens.currency0.wrapped, res.data.tokens.currency1.wrapped];

    return (
      <Component
        inRange
        protocol="uniswap-v4"
        feeBps={res.data.details.poolKey.fee}
        hook={res.data.details.poolKey.hooks}
        chainId={chainId}
        tokens={tokens}
      />
    );
  };
};

export const LPPositionBlock = withUniswapV4Provider(function ({
  tokens,
  chainId,
  inRange,
  protocol,
  feeBps,
}: TUniswapV4LPPositionCardProps) {
  return (
    <Box style={styles.container} rowGap={8}>
      <Stack space={4}>
        <Columns alignY="center">
          <Column flex="fluid">
            <Inline space={2} alignY="center">
              <TokensImages tokens={tokens} />
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
});

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
