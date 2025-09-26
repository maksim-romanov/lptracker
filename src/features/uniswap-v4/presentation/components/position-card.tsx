import React from "react";

import { ActivityIndicator } from "react-native";

import { useTokenPrices } from "features/token-prices/presentation/hooks";
import { isUniswapV4SupportedChain } from "features/uniswap-v4/configs";

import { LPPositionBlockBase } from "../../../../components/blocks/lp-position";
import { positionCardRegistry } from "../../../../components/position-cards/registry";
import type { UniswapV4PositionData } from "../../../../components/position-cards/types";
import { PositionPriceCalculator } from "../../domain/services/position-price-calculator";
import { usePositionCard } from "../hooks/use-position-card";

interface UniswapV4CardProps {
  data: UniswapV4PositionData;
}

// Create calculator instance
const priceCalculator = new PositionPriceCalculator();

const UniswapV4PositionCardComponent = function (props: UniswapV4CardProps) {
  const { chainId, positionId } = props.data;
  if (!isUniswapV4SupportedChain(chainId)) throw new Error("Unsupported chain ID is not supported");

  const { data } = usePositionCard(positionId, chainId);

  const prices = useTokenPrices([
    { tokenAddress: data?.poolKey.currency0, chainId },
    { tokenAddress: data?.poolKey.currency1, chainId },
  ]);

  const totalValueAmount = React.useMemo(() => {
    if (!data) return 0;

    const { tokens, tokenAmounts } = data;

    return priceCalculator.calculatePositionValue([
      [tokens.currency0, tokenAmounts.amount0.toString(), prices.data?.[0]],
      [tokens.currency1, tokenAmounts.amount1.toString(), prices.data?.[1]],
    ]);
  }, [data, prices.data]);

  const unclaimedFeesAmount = React.useMemo((): number => {
    if (!data) return 0;

    const { tokens, unclaimed } = data;
    return priceCalculator.calculatePositionValue([
      [tokens.currency0, unclaimed.token0.toString(), prices.data?.[0]],
      [tokens.currency1, unclaimed.token1.toString(), prices.data?.[1]],
    ]);
  }, [data, prices.data]);

  if (!data) return <ActivityIndicator />;

  const { tokens, feeBps, poolKey, currentTick, tickRange } = data;
  const inRange = currentTick >= tickRange.lower && currentTick <= tickRange.upper;

  const tokensUI = [
    { address: poolKey.currency0, symbol: tokens.currency0.symbol },
    { address: poolKey.currency1, symbol: tokens.currency1.symbol },
  ];

  return (
    <LPPositionBlockBase
      {...props.data}
      tokens={tokensUI}
      inRange={inRange}
      feeBps={feeBps}
      totalValue={totalValueAmount}
      unclaimedFees={unclaimedFeesAmount}
    />
  );
};

positionCardRegistry.register("uniswap-v4", UniswapV4PositionCardComponent);
