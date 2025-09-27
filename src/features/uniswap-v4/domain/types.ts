import type { Currency } from "@uniswap/sdk-core";
import type { Address } from "viem";

export interface PoolKey {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}

export interface PositionDetails {
  tokenId: bigint;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  poolKey: PoolKey;
}

export interface FeeGrowthSnapshot {
  feeGrowthInside0X128: bigint;
  feeGrowthInside1X128: bigint;
}

export interface StoredPositionInfo extends FeeGrowthSnapshot {
  liquidity: bigint;
}

export interface Slot0State {
  sqrtPriceX96: bigint;
  tickCurrent: number;
}

export interface TokenAmounts {
  amount0: bigint;
  amount1: bigint;
}

export interface TokenMetadata {
  currency0: Currency;
  currency1: Currency;
}

export interface PositionSummary {
  poolId: `0x${string}`;
  details: PositionDetails;
  slot0: Slot0State;
  stored: StoredPositionInfo;
  currentFeeGrowth: FeeGrowthSnapshot;
  unclaimed: { token0: bigint; token1: bigint };
  tokenAmounts: TokenAmounts;
  tokens: TokenMetadata;
}

export interface PositionCard {
  tokenId: bigint;
  poolKey: PoolKey;
  tickRange: { lower: number; upper: number };
  tokens: TokenMetadata;
  currentTick: number;
  feeBps: number;
  unclaimed: { token0: bigint; token1: bigint };
  tokenAmounts: TokenAmounts;

  // totalValue: { address: Address; symbol?: string; amount: bigint }[];
  // unclaimedFees: { address: Address; symbol?: string; amount: bigint }[];
}

export interface FullPositionData {
  details: PositionDetails;
  stored: StoredPositionInfo;
}

export interface PositionSnapshot {
  timestamp: number;
  blockNumber: number;
  feeGrowthInside0X128: bigint;
  feeGrowthInside1X128: bigint;
  positionValueUsd: number;
}

export interface AprCalculationInput {
  currentData: {
    feeGrowthInside0X128: bigint;
    feeGrowthInside1X128: bigint;
    timestamp: number;
    positionValueUsd: number;
  };
  historicalData: {
    feeGrowthInside0X128: bigint;
    feeGrowthInside1X128: bigint;
    timestamp: number;
    positionValueUsd: number;
  };
  liquidity: bigint;
  token0Decimals: number;
  token1Decimals: number;
  token0PriceUsd: number;
  token1PriceUsd: number;
}

export interface AprResult {
  apr: number; // Annual percentage rate as a number (e.g., 15.5 for 15.5%)
  feesEarnedUsd: number; // Total fees earned in USD over the period
  period: '24h' | '7d' | '30d';
  annualizationFactor: number; // Factor used to annualize (e.g., 365 for daily)
}

export interface AprCalculationResult {
  apr24h?: AprResult;
  apr7d?: AprResult;
  apr30d?: AprResult;
  error?: string;
}
