import { formatUnits } from "viem";

// Lifetime fees type
export type LifetimeFees = {
  token0LifetimeFees: bigint;
  token1LifetimeFees: bigint;
};

// Invested amounts type
export interface InvestedAmounts {
  token0: string;
  token1: string;
}

export interface AprBreakdown {
  token0Fees7d: string; // formatted
  token1Fees7d: string; // formatted
  feesValueNowUSD?: number; // optional, caller can supply price to value
  aprPercent: number; // annualized based on 7d
}

/**
 * Calculate lifetime fees for a position
 * @param liquidity - Position liquidity
 * @param feeGrowthInside0Current - Current fee growth for token0
 * @param feeGrowthInside1Current - Current fee growth for token1
 * @param feeGrowthInside0Last - Last stored fee growth for token0
 * @param feeGrowthInside1Last - Last stored fee growth for token1
 * @returns Lifetime fees
 */
export function calculateLifetimeFees(
  liquidity: bigint,
  feeGrowthInside0Current: bigint,
  feeGrowthInside1Current: bigint,
  feeGrowthInside0Last: bigint,
  feeGrowthInside1Last: bigint,
): LifetimeFees {
  const Q128 = 2n ** 128n;

  // Calculate the difference between current and last fee growth
  const feeGrowthInside0Delta = feeGrowthInside0Current - feeGrowthInside0Last;
  const feeGrowthInside1Delta = feeGrowthInside1Current - feeGrowthInside1Last;

  return {
    token0LifetimeFees: (feeGrowthInside0Delta * liquidity) / Q128,
    token1LifetimeFees: (feeGrowthInside1Delta * liquidity) / Q128,
  };
}

/**
 * Calculate price from sqrtPriceX96
 * @param sqrtPriceX96 - Square root price in Q96 format
 * @param token0Decimals - Token0 decimals
 * @param token1Decimals - Token1 decimals
 * @returns Price
 */
export function calculatePriceFromSqrtPriceX96(
  sqrtPriceX96: bigint,
  token0Decimals: number,
  token1Decimals: number,
): number {
  const Q96 = 2n ** 96n;
  const price = Number(sqrtPriceX96) / Number(Q96);
  const adjustedPrice = price ** 2;
  const decimalsAdjustment = 10 ** (token0Decimals - token1Decimals);
  return adjustedPrice * decimalsAdjustment;
}

/**
 * Calculate current price from pool slot data
 * @param poolSlotData - Pool slot data
 * @param token0Decimals - Token0 decimals
 * @param token1Decimals - Token1 decimals
 * @returns Current price
 */
export function calculateCurrentPrice(
  poolSlotData: { sqrtPriceX96: bigint; tick: number },
  token0Decimals: number,
  token1Decimals: number,
): number {
  return calculatePriceFromSqrtPriceX96(poolSlotData.sqrtPriceX96, token0Decimals, token1Decimals);
}

/**
 * Calculate inverse price (token1/token0) from pool slot data
 * @param poolSlotData - Pool slot data
 * @param token0Decimals - Token0 decimals
 * @param token1Decimals - Token1 decimals
 * @returns Inverse price
 */
export function calculateInversePrice(
  poolSlotData: { sqrtPriceX96: bigint; tick: number },
  token0Decimals: number,
  token1Decimals: number,
): number {
  const directPrice = calculatePriceFromSqrtPriceX96(poolSlotData.sqrtPriceX96, token0Decimals, token1Decimals);
  return 1 / directPrice;
}

/**
 * Calculate invested amounts using proper AMM math
 * @param liquidity - Position liquidity
 * @param tickLower - Lower tick
 * @param tickUpper - Upper tick
 * @param currentTick - Current tick
 * @param token0Decimals - Token0 decimals
 * @param token1Decimals - Token1 decimals
 * @returns Invested amounts
 */
export function calculateInvestedAmounts(
  liquidity: bigint,
  tickLower: number,
  tickUpper: number,
  currentTick: number,
  token0Decimals: number,
  token1Decimals: number,
): InvestedAmounts {
  // Convert liquidity to number for calculations
  const L = Number(liquidity);

  // Calculate sqrt prices from ticks using more precise math
  const sqrtPriceLower = Math.sqrt(Math.pow(1.0001, tickLower));
  const sqrtPriceUpper = Math.sqrt(Math.pow(1.0001, tickUpper));
  const sqrtPriceCurrent = Math.sqrt(Math.pow(1.0001, currentTick));

  let token0Amount = 0;
  let token1Amount = 0;

  if (currentTick < tickLower) {
    // Position is entirely in token0
    // Formula: L * (1/sqrt(P_lower) - 1/sqrt(P_upper))
    token0Amount = L * (1 / sqrtPriceLower - 1 / sqrtPriceUpper);
  } else if (currentTick >= tickUpper) {
    // Position is entirely in token1
    // Formula: L * (sqrt(P_upper) - sqrt(P_lower))
    token1Amount = L * (sqrtPriceUpper - sqrtPriceLower);
  } else {
    // Position is active (in range)
    // Formula for token0: L * (1/sqrt(P_current) - 1/sqrt(P_upper))
    // Formula for token1: L * (sqrt(P_current) - sqrt(P_lower))
    token0Amount = L * (1 / sqrtPriceCurrent - 1 / sqrtPriceUpper);
    token1Amount = L * (sqrtPriceCurrent - sqrtPriceLower);
  }

  // Convert to proper decimals with higher precision
  const token0AmountFormatted = token0Amount / Math.pow(10, token0Decimals);
  const token1AmountFormatted = token1Amount / Math.pow(10, token1Decimals);

  return {
    token0: token0AmountFormatted.toFixed(6), // Back to 6 decimals for consistency
    token1: token1AmountFormatted.toFixed(6), // Back to 6 decimals for consistency
  };
}

/**
 * Calculate simple position value based on available data
 * @param liquidity - Position liquidity
 * @param tickLower - Lower tick
 * @param tickUpper - Upper tick
 * @returns Estimated position value
 */
export function calculateSimplePositionValue(
  liquidity: bigint,
  tickLower: number,
  tickUpper: number,
): { estimatedValue: string } {
  // Placeholder retained for compatibility
  const estimatedValue = (Number(liquidity) / 1e18).toFixed(6);
  return { estimatedValue };
}

/**
 * Annualize 7d fees to APR (caller values fees externally in token1 or USD)
 */
export function annualize7dApr(feesValueNow: number, positionValueNow: number): number {
  if (!isFinite(feesValueNow) || !isFinite(positionValueNow) || positionValueNow <= 0) return 0;
  const weeklyReturn = feesValueNow / positionValueNow; // 7-day return
  return weeklyReturn * (365 / 7) * 100; // percentage
}

/**
 * Calculate APR based on initial investment and current value (including fees)
 * @param initialValue - Initial position value when opened
 * @param currentValue - Current position value (invested + uncollected fees)
 * @param daysSinceOpen - Days since position was opened
 * @returns APR percentage
 */
export function calculateAprFromInitialInvestment(
  initialValue: number,
  currentValue: number,
  daysSinceOpen: number,
): number {
  if (
    !isFinite(initialValue) ||
    !isFinite(currentValue) ||
    !isFinite(daysSinceOpen) ||
    initialValue <= 0 ||
    currentValue <= 0 ||
    daysSinceOpen <= 0
  )
    return 0;

  const totalReturn = (currentValue - initialValue) / initialValue; // Total return ratio
  const dailyReturn = totalReturn / daysSinceOpen; // Daily return ratio
  const annualizedReturn = dailyReturn * 365; // Annualized return ratio
  return annualizedReturn * 100; // Convert to percentage
}

/**
 * Format lifetime fees for display
 * @param lifetimeFees - Lifetime fees
 * @param token0Decimals - Token0 decimals
 * @param token1Decimals - Token1 decimals
 * @returns Formatted fees
 */
export function formatLifetimeFees(
  lifetimeFees: LifetimeFees,
  token0Decimals: number,
  token1Decimals: number,
): {
  token0LifetimeFees: string;
  token1LifetimeFees: string;
} {
  return {
    token0LifetimeFees: formatUnits(lifetimeFees.token0LifetimeFees, token0Decimals),
    token1LifetimeFees: formatUnits(lifetimeFees.token1LifetimeFees, token1Decimals),
  };
}
