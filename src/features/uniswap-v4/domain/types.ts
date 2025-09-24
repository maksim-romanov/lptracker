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
  currentTick: number;
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
}
