import { TickMath, SqrtPriceMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";

export function getTokenAmountsFromLiquidity(
  liquidity: bigint,
  tickLower: number,
  tickUpper: number,
  sqrtPriceX96: bigint,
): { amount0: bigint; amount1: bigint } {
  const L = JSBI.BigInt(liquidity.toString());
  const sqrtRatioX96 = JSBI.BigInt(sqrtPriceX96.toString());
  const sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
  const sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

  const tickCurrent = TickMath.getTickAtSqrtRatio(sqrtRatioX96);

  if (tickCurrent <= tickLower) {
    const amount0JSBI = SqrtPriceMath.getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, L, true);
    return { amount0: BigInt(amount0JSBI.toString()), amount1: 0n };
  }

  if (tickCurrent >= tickUpper) {
    const amount1JSBI = SqrtPriceMath.getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, L, true);
    return { amount0: 0n, amount1: BigInt(amount1JSBI.toString()) };
  }

  const amount0InRange = SqrtPriceMath.getAmount0Delta(sqrtRatioX96, sqrtRatioBX96, L, true);
  const amount1InRange = SqrtPriceMath.getAmount1Delta(sqrtRatioAX96, sqrtRatioX96, L, true);
  return {
    amount0: BigInt(amount0InRange.toString()),
    amount1: BigInt(amount1InRange.toString()),
  };
}
