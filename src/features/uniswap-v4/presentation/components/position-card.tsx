import React from "react";

import { CurrencyAmount, Price, Token } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { ActivityIndicator } from "react-native";
import { formatUnits, parseUnits } from "viem";
import { arbitrum, mainnet } from "viem/chains";

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

const tenPow = (d: number) => JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(d));

export const withUniswapV4Provider = (Component: React.ComponentType<TUniswapV4LPPositionCardProps>) => {
  return function WrappedComponent({ data }: UniswapV4CardProps) {
    if (!isUniswapV4SupportedChain(data.chainId)) throw new Error("Unsupported chain ID is not supported");

    const res = usePositionCard(data.positionId, data.chainId);

    // todo: add skeleton loader
    if (!res.data) return <ActivityIndicator />;

    const price0Usd = 4177.64;
    const price1Usd = 1;

    const USDC_BY_CHAIN: Record<number, { address: `0x${string}`; decimals: number }> = {
      [mainnet.id]: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
      [arbitrum.id]: { address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", decimals: 6 },
    };
    const usdcCfg = USDC_BY_CHAIN[data.chainId];
    const USD = new Token(data.chainId, usdcCfg.address, usdcCfg.decimals, "USDC", "USD");

    const p0Scaled = parseUnits(String(price0Usd), USD.decimals);
    const p1Scaled = parseUnits(String(price1Usd), USD.decimals);

    // 2) Wrapped base tokens and amounts
    const token0 = res.data.tokens.currency0.wrapped;
    const token1 = res.data.tokens.currency1.wrapped;
    const a0 = CurrencyAmount.fromRawAmount(token0, res.data.tokenAmounts.amount0.toString());
    const a1 = CurrencyAmount.fromRawAmount(token1, res.data.tokenAmounts.amount1.toString());

    const tokens = [
      { address: res.data.details.poolKey.currency0, symbol: res.data.tokens.currency0.symbol },
      { address: res.data.details.poolKey.currency1, symbol: res.data.tokens.currency1.symbol },
    ];

    // 3) Prices (quote is the SAME USD object)
    const p0 = new Price(token0, USD, tenPow(token0.decimals), JSBI.BigInt(p0Scaled.toString()));
    const p1 = new Price(token1, USD, tenPow(token1.decimals), JSBI.BigInt(p1Scaled.toString()));

    // 4) Multiply amounts by prices
    const usd0 = a0.multiply(p0); // CurrencyAmount<USD>
    const usd1 = a1.multiply(p1); // CurrencyAmount<USD>
    // Normalize to the SAME USD instance explicitly to avoid currency invariant
    const usd0Norm = CurrencyAmount.fromRawAmount(USD, usd0.quotient);
    const usd1Norm = CurrencyAmount.fromRawAmount(USD, usd1.quotient);
    const totalUsd = usd0Norm.add(usd1Norm);

    // Unclaimed in USD
    const f0 = CurrencyAmount.fromRawAmount(token0, res.data.unclaimed.token0.toString());
    const f1 = CurrencyAmount.fromRawAmount(token1, res.data.unclaimed.token1.toString());
    const unclaimed0 = f0.multiply(p0);
    const unclaimed1 = f1.multiply(p1);
    const unclaimed0Norm = CurrencyAmount.fromRawAmount(USD, unclaimed0.quotient);
    const unclaimed1Norm = CurrencyAmount.fromRawAmount(USD, unclaimed1.quotient);
    const unclaimedUsd = unclaimed0Norm.add(unclaimed1Norm);
    const unclaimedUsdRaw = BigInt(unclaimedUsd.quotient.toString());

    const totalUsdRaw = BigInt(totalUsd.quotient.toString());

    const totalValue = Number(formatUnits(totalUsdRaw, USD.decimals));
    const unclaimedValue = Number(formatUnits(unclaimedUsdRaw, USD.decimals));

    const inRange =
      res.data.currentTick >= res.data.details.tickLower && res.data.currentTick < res.data.details.tickUpper;

    return (
      <Component
        inRange={inRange}
        protocol="uniswap-v4"
        feeBps={res.data.details.poolKey.fee}
        hook={res.data.details.poolKey.hooks}
        chainId={data.chainId}
        tokens={tokens}
        totalValue={totalValue}
        unclaimedValue={unclaimedValue}
      />
    );
  };
};

const UniswapV4PositionCardComponent = withUniswapV4Provider(LPPositionBlockBase);

positionCardRegistry.register("uniswap-v4", UniswapV4PositionCardComponent);
