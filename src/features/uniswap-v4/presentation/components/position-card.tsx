import React from "react";

import { BigintIsh, Currency, CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { ActivityIndicator } from "react-native";
import { parseUnits } from "viem";

import { useTokenPrices } from "features/token-prices/presentation/hooks";
import { isUniswapV4SupportedChain } from "features/uniswap-v4/configs";

import { LPPositionBlockBase } from "../../../../components/blocks/lp-position";
import { positionCardRegistry } from "../../../../components/position-cards/registry";
import type { UniswapV4PositionData } from "../../../../components/position-cards/types";
import { usePositionCard } from "../hooks/use-position-card";

interface UniswapV4CardProps {
  data: UniswapV4PositionData;
}

const createPriceFraction = (decimalPrice?: number, decimalPlaces: number = 6) => {
  if (decimalPrice === undefined || decimalPrice === null || !isFinite(decimalPrice)) return new Fraction(0);
  const numeratorUnits = parseUnits(decimalPrice.toString(), decimalPlaces);
  const denominatorUnits = 10n ** BigInt(decimalPlaces);
  return new Fraction(numeratorUnits.toString(), denominatorUnits.toString());
};

const getTokenPrice = (currency: Currency, rawAmount: BigintIsh, priceFraction: Fraction) => {
  const currencyAmount = CurrencyAmount.fromRawAmount(currency, rawAmount);

  return currencyAmount
    .multiply(priceFraction)
    .asFraction.divide(new Fraction((10n ** BigInt(currency.decimals)).toString()));
};

const UniswapV4PositionCardComponent = function (props: UniswapV4CardProps) {
  const { chainId, positionId } = props.data;
  if (!isUniswapV4SupportedChain(chainId)) throw new Error("Unsupported chain ID is not supported");

  const { data } = usePositionCard(positionId, chainId);

  const price = useTokenPrices([
    { tokenAddress: data?.poolKey.currency0, chainId },
    { tokenAddress: data?.poolKey.currency1, chainId },
  ]);

  const token0PriceFraction = createPriceFraction(price.data?.[0]?.price, 6);
  const token1PriceFraction = createPriceFraction(price.data?.[1]?.price, 6);

  const totalValueAmount = React.useMemo(() => {
    if (!data) return 0;

    const { tokens, tokenAmounts } = data;
    const amountUsd0 = getTokenPrice(tokens.currency0, tokenAmounts.amount0.toString(), token0PriceFraction);
    const amountUsd1 = getTokenPrice(tokens.currency1, tokenAmounts.amount1.toString(), token1PriceFraction);
    return Number(amountUsd0.add(amountUsd1).toSignificant(6));
  }, [data, token0PriceFraction, token1PriceFraction]);

  const unclaimedFeesAmount = React.useMemo((): number => {
    if (!data) return 0;

    const { tokens, unclaimed } = data;
    const amountUsd0 = getTokenPrice(tokens.currency0, unclaimed.token0.toString(), token0PriceFraction);
    const amountUsd1 = getTokenPrice(tokens.currency1, unclaimed.token1.toString(), token1PriceFraction);
    return Number(amountUsd0.add(amountUsd1).toSignificant(6));
  }, [data, token0PriceFraction, token1PriceFraction]);

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
