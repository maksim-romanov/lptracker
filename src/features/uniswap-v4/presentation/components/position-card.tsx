import React from "react";

import { ActivityIndicator } from "react-native";

import { isUniswapV4SupportedChain } from "features/uniswap-v4/configs";

import { BaseLPPositionCardProps, LPPositionBlockBase } from "../../../../components/blocks/lp-position";
import { positionCardRegistry } from "../../../../components/position-cards/registry";
import type { UniswapV4PositionData } from "../../../../components/position-cards/types";
import { usePositionCard } from "../hooks/use-position-card";

interface UniswapV4CardProps {
  data: UniswapV4PositionData;
}

interface TUniswapV4LPPositionCardProps extends BaseLPPositionCardProps {
  protocol: "uniswap-v4";
  hook?: string;
}

export const withUniswapV4Provider = (Component: React.ComponentType<TUniswapV4LPPositionCardProps>) => {
  return function WrappedComponent({ data }: UniswapV4CardProps) {
    if (!isUniswapV4SupportedChain(data.chainId)) throw new Error("Unsupported chain ID is not supported");

    const res = usePositionCard(data.positionId, data.chainId);

    // todo: add skeleton loader
    if (!res.data) return <ActivityIndicator />;

    const { tokens, feeBps, poolKey, currentTick, tickRange } = res.data;
    const inRange = currentTick >= tickRange.lower && currentTick <= tickRange.upper;

    return (
      <Component
        inRange={inRange}
        protocol="uniswap-v4"
        feeBps={feeBps}
        hook={poolKey.hooks}
        chainId={data.chainId}
        tokens={[
          { address: poolKey.currency0, symbol: tokens.currency0.symbol },
          { address: poolKey.currency1, symbol: tokens.currency1.symbol },
        ]}
      />
    );
  };
};

const UniswapV4PositionCardComponent = withUniswapV4Provider(LPPositionBlockBase);

positionCardRegistry.register("uniswap-v4", UniswapV4PositionCardComponent);
