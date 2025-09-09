import { Address, createPublicClient, http, formatUnits } from "viem";
import { arbitrum } from "viem/chains";

import { UNISWAP_V4_CONFIGS } from "../api/configs";

const arbitrumConfig = UNISWAP_V4_CONFIGS.arbitrum;
const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

// Position status enum
export enum PositionStatus {
  IN_RANGE = "IN_RANGE",
  OUT_OF_RANGE = "OUT_OF_RANGE",
  UNKNOWN = "UNKNOWN",
}

// Position details interface
export interface PositionDetails {
  tokenId: bigint;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  poolKey: {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
  };
}

// Packed position info interface
interface PackedPositionInfo {
  getTickUpper(): number;
  getTickLower(): number;
  hasSubscriber(): boolean;
}

// Position manager ABI
const POSITION_MANAGER_ABI = [
  {
    name: "getPoolAndPositionInfo",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "poolKey",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      { name: "info", type: "uint256" },
    ],
  },
  {
    name: "getPositionLiquidity",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "liquidity", type: "uint128" }],
  },
] as const;

/**
 * Decode packed position info
 * @param value - Packed position info value
 * @returns Decoded position info
 */
function decodePositionInfo(value: bigint): PackedPositionInfo {
  return {
    getTickUpper: () => {
      const raw = Number((value >> 32n) & 0xffffffn);
      return raw >= 0x800000 ? raw - 0x1000000 : raw;
    },
    getTickLower: () => {
      const raw = Number((value >> 8n) & 0xffffffn);
      return raw >= 0x800000 ? raw - 0x1000000 : raw;
    },
    hasSubscriber: () => (value & 0xffn) !== 0n,
  };
}

/**
 * Get position details by token ID
 * @param tokenId - Position token ID
 * @returns Position details
 */
export async function getPositionDetails(tokenId: bigint): Promise<PositionDetails> {
  // Get pool key and packed position info
  const [poolKey, infoValue] = (await publicClient.readContract({
    address: arbitrumConfig.positionManagerAddress,
    abi: POSITION_MANAGER_ABI,
    functionName: "getPoolAndPositionInfo",
    args: [tokenId],
  })) as readonly [
    {
      currency0: Address;
      currency1: Address;
      fee: number;
      tickSpacing: number;
      hooks: Address;
    },
    bigint,
  ];

  // Get current liquidity
  const liquidity = (await publicClient.readContract({
    address: arbitrumConfig.positionManagerAddress,
    abi: POSITION_MANAGER_ABI,
    functionName: "getPositionLiquidity",
    args: [tokenId],
  })) as bigint;

  // Decode packed position info
  const positionInfo = decodePositionInfo(infoValue);

  return {
    tokenId,
    tickLower: positionInfo.getTickLower(),
    tickUpper: positionInfo.getTickUpper(),
    liquidity,
    poolKey,
  };
}

/**
 * Calculate position status based on current tick
 * @param currentTick - Current pool tick
 * @param tickLower - Position lower tick
 * @param tickUpper - Position upper tick
 * @returns Position status
 */
export function calculatePositionStatus(currentTick: number, tickLower: number, tickUpper: number): PositionStatus {
  if (currentTick >= tickLower && currentTick <= tickUpper) {
    return PositionStatus.IN_RANGE;
  } else {
    return PositionStatus.OUT_OF_RANGE;
  }
}

/**
 * Get position liquidity and fee growth info
 * @param positionDetails - Position details
 * @param tokenId - Position token ID
 * @param poolId - Pool ID
 * @returns Position liquidity and fee growth info
 */
export async function getStoredPositionInfo(
  positionDetails: PositionDetails,
  tokenId: bigint,
  poolId: string,
): Promise<{
  liquidity: bigint;
  feeGrowthInside0Last: bigint;
  feeGrowthInside1Last: bigint;
}> {
  const salt = `0x${tokenId.toString(16).padStart(64, "0")}`;
  const [liquidity, feeGrowthInside0Last, feeGrowthInside1Last] = (await publicClient.readContract({
    address: arbitrumConfig.stateViewAddress,
    abi: [
      {
        name: "getPositionInfo",
        type: "function",
        inputs: [
          { name: "poolId", type: "bytes32" },
          { name: "positionManager", type: "address" },
          { name: "tickLower", type: "int24" },
          { name: "tickUpper", type: "int24" },
          { name: "salt", type: "bytes32" },
        ],
        outputs: [
          { name: "liquidity", type: "uint128" },
          { name: "feeGrowthInside0Last", type: "uint128" },
          { name: "feeGrowthInside1Last", type: "uint128" },
        ],
      },
    ],
    functionName: "getPositionInfo",
    args: [poolId, arbitrumConfig.positionManagerAddress, positionDetails.tickLower, positionDetails.tickUpper, salt],
  })) as readonly [bigint, bigint, bigint];

  return {
    liquidity,
    feeGrowthInside0Last,
    feeGrowthInside1Last,
  };
}
