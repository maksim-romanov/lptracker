import { Token, ChainId } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v4-sdk";
import { Address } from "viem";

import { calculateInvestedAmounts, formatLifetimeFees, LifetimeFees } from "./calculation-utils";
import { getCurrentTick, getPoolSlotData, PoolSlotData } from "./pool-utils";
import { PositionDetails, PositionStatus, calculatePositionStatus } from "./position-utils";
import { TokenInfo } from "./token-utils";

// UI data interface
export interface PositionUIData {
  token0: TokenInfo;
  token1: TokenInfo;
  investedAmount: {
    token0: string;
    token1: string;
  };
  status: PositionStatus;
  currentTick: number;
  tickRange: {
    lower: number;
    upper: number;
  };
  poolSlotData: PoolSlotData;
}

// Main UI data interface
export interface MainUIData {
  tokens: {
    token0: TokenInfo;
    token1: TokenInfo;
  };
  invested: {
    token0: string;
    token1: string;
  };
  status: PositionStatus;
  currentTick: number;
  tickRange: {
    lower: number;
    upper: number;
  };
  uncollectedFees: {
    token0: string;
    token1: string;
  };
  poolSlotData: PoolSlotData;
}

/**
 * Generate pool ID from position details
 * @param positionDetails - Position details
 * @returns Pool ID
 */
export function generatePoolId(positionDetails: PositionDetails): string {
  const currency0 = new Token(
    ChainId.ARBITRUM_ONE,
    positionDetails.poolKey.currency0,
    18, // Will be updated with actual decimals
    "TOKEN0",
    "Token 0",
  );
  const currency1 = new Token(
    ChainId.ARBITRUM_ONE,
    positionDetails.poolKey.currency1,
    6, // Will be updated with actual decimals
    "TOKEN1",
    "Token 1",
  );

  return Pool.getPoolId(
    currency0,
    currency1,
    positionDetails.poolKey.fee,
    positionDetails.poolKey.tickSpacing,
    positionDetails.poolKey.hooks,
  );
}

/**
 * Get position UI data
 * @param positionDetails - Position details
 * @param storedPositionInfo - Stored position info
 * @param lifetimeFees - Lifetime fees
 * @param token0Info - Token0 information
 * @param token1Info - Token1 information
 * @param poolId - Pool ID
 * @returns Position UI data
 */
export async function getPositionUIData(
  positionDetails: PositionDetails,
  storedPositionInfo: {
    liquidity: bigint;
    feeGrowthInside0Last: bigint;
    feeGrowthInside1Last: bigint;
  },
  lifetimeFees: LifetimeFees,
  token0Info: TokenInfo,
  token1Info: TokenInfo,
  poolId: string,
): Promise<PositionUIData> {
  console.log("=== FETCHING UI DATA ===");

  // Get pool slot data (includes current tick, price, fees)
  const poolSlotData = await getPoolSlotData(poolId);

  // Calculate position status
  const status = calculatePositionStatus(poolSlotData.tick, positionDetails.tickLower, positionDetails.tickUpper);

  // Calculate invested amounts
  const investedAmount = calculateInvestedAmounts(
    storedPositionInfo.liquidity,
    positionDetails.tickLower,
    positionDetails.tickUpper,
    poolSlotData.tick,
    token0Info.decimals,
    token1Info.decimals,
  );

  return {
    token0: token0Info,
    token1: token1Info,
    investedAmount,
    status,
    currentTick: poolSlotData.tick,
    tickRange: {
      lower: positionDetails.tickLower,
      upper: positionDetails.tickUpper,
    },
    poolSlotData,
  };
}

/**
 * Get main UI data for display
 * @param positionDetails - Position details
 * @param storedPositionInfo - Stored position info
 * @param lifetimeFees - Lifetime fees
 * @param token0Info - Token0 information
 * @param token1Info - Token1 information
 * @param poolId - Pool ID
 * @returns Main UI data
 */
export async function getMainUIData(
  positionDetails: PositionDetails,
  storedPositionInfo: {
    liquidity: bigint;
    feeGrowthInside0Last: bigint;
    feeGrowthInside1Last: bigint;
  },
  lifetimeFees: LifetimeFees,
  token0Info: TokenInfo,
  token1Info: TokenInfo,
  poolId: string,
): Promise<MainUIData> {
  const uiData = await getPositionUIData(
    positionDetails,
    storedPositionInfo,
    lifetimeFees,
    token0Info,
    token1Info,
    poolId,
  );

  const formattedFees = formatLifetimeFees(lifetimeFees, token0Info.decimals, token1Info.decimals);

  return {
    tokens: {
      token0: uiData.token0,
      token1: uiData.token1,
    },
    invested: uiData.investedAmount,
    status: uiData.status,
    currentTick: uiData.currentTick,
    tickRange: uiData.tickRange,
    uncollectedFees: formattedFees,
    poolSlotData: uiData.poolSlotData,
  };
}
