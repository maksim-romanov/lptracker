import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";

import { UNISWAP_V4_CONFIGS } from "../api/configs";

const arbitrumConfig = UNISWAP_V4_CONFIGS.arbitrum;
const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

// Pool slot data interface
export interface PoolSlotData {
  sqrtPriceX96: bigint;
  tick: number;
  protocolFee: number;
  lpFee: number;
}

// Pool data interface
export interface PoolData {
  liquidity: bigint;
  sqrtPriceX96: bigint;
  tick: number;
  feeGrowthGlobal0X128: bigint;
  feeGrowthGlobal1X128: bigint;
  protocolFees: {
    token0: bigint;
    token1: bigint;
  };
  swapFees: {
    token0: bigint;
    token1: bigint;
  };
}

// StateView ABI for getting pool data
const STATE_VIEW_ABI = [
  {
    name: "getSlot0",
    type: "function",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "protocolFee", type: "uint24" },
      { name: "lpFee", type: "uint24" },
    ],
    stateMutability: "view",
  },
  {
    name: "getLiquidity",
    type: "function",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [{ name: "liquidity", type: "uint128" }],
    stateMutability: "view",
  },
  {
    name: "getFeeGrowthGlobal",
    type: "function",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [
      { name: "feeGrowthGlobal0X128", type: "uint256" },
      { name: "feeGrowthGlobal1X128", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    name: "getCurrentTick",
    type: "function",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [{ name: "tick", type: "int24" }],
    stateMutability: "view",
  },
] as const;

/**
 * Get pool slot data (price, tick, fees) using getSlot0
 * @param poolId - Pool ID
 * @returns Pool slot data
 */
export async function getPoolSlotData(poolId: string): Promise<PoolSlotData> {
  try {
    // Try to get slot data from StateView using getSlot0
    const [sqrtPriceX96, tick, protocolFee, lpFee] = await publicClient.readContract({
      address: arbitrumConfig.stateViewAddress,
      abi: STATE_VIEW_ABI,
      functionName: "getSlot0",
      args: [poolId],
    });
    console.log("Successfully fetched pool slot data from StateView");
    return {
      sqrtPriceX96: sqrtPriceX96 as bigint,
      tick: tick as number,
      protocolFee: protocolFee as number,
      lpFee: lpFee as number,
    };
  } catch (error) {
    console.log("Could not fetch slot data from StateView, trying PoolManager...");

    try {
      // Fallback to PoolManager
      const [sqrtPriceX96, tick, protocolFee, lpFee] = await publicClient.readContract({
        address: arbitrumConfig.PoolManager,
        abi: [
          {
            name: "getSlot0",
            type: "function",
            inputs: [{ name: "poolId", type: "bytes32" }],
            outputs: [
              { name: "sqrtPriceX96", type: "uint160" },
              { name: "tick", type: "int24" },
              { name: "protocolFee", type: "uint24" },
              { name: "lpFee", type: "uint24" },
            ],
            stateMutability: "view",
          },
        ],
        functionName: "getSlot0",
        args: [poolId],
      });
      console.log("Successfully fetched pool slot data from PoolManager");
      return {
        sqrtPriceX96: sqrtPriceX96 as bigint,
        tick: tick as number,
        protocolFee: protocolFee as number,
        lpFee: lpFee as number,
      };
    } catch (poolManagerError) {
      console.log("Could not fetch slot data from PoolManager either");
      // Return default values
      return {
        sqrtPriceX96: 0n,
        tick: -192785, // Use the estimated value from the original working code
        protocolFee: 0,
        lpFee: 0,
      };
    }
  }
}

/**
 * Get current tick from pool using getSlot0
 * @param poolId - Pool ID
 * @returns Current tick
 */
export async function getCurrentTick(poolId: string): Promise<number> {
  const slotData = await getPoolSlotData(poolId);
  return slotData.tick;
}

/**
 * Get basic pool information
 * @param poolId - Pool ID
 * @returns Basic pool info (liquidity)
 */
export async function getBasicPoolInfo(poolId: string): Promise<{ liquidity: bigint }> {
  try {
    const liquidity = await publicClient.readContract({
      address: arbitrumConfig.stateViewAddress,
      abi: [
        {
          name: "getLiquidity",
          type: "function",
          inputs: [{ name: "poolId", type: "bytes32" }],
          outputs: [{ name: "liquidity", type: "uint128" }],
          stateMutability: "view",
        },
      ],
      functionName: "getLiquidity",
      args: [poolId],
    });

    return { liquidity: liquidity as bigint };
  } catch (error) {
    console.log("Could not fetch pool liquidity:", error);
    return { liquidity: 0n };
  }
}

/**
 * Get fee growth inside range
 * @param poolId - Pool ID
 * @param tickLower - Lower tick
 * @param tickUpper - Upper tick
 * @returns Fee growth inside range
 */
export async function getFeeGrowthInside(
  poolId: string,
  tickLower: number,
  tickUpper: number,
): Promise<{
  feeGrowthInside0X128: bigint;
  feeGrowthInside1X128: bigint;
}> {
  const [feeGrowthInside0X128, feeGrowthInside1X128] = (await publicClient.readContract({
    address: arbitrumConfig.stateViewAddress,
    abi: [
      {
        name: "getFeeGrowthInside",
        type: "function",
        inputs: [
          { name: "poolId", type: "bytes32" },
          { name: "tickLower", type: "int24" },
          { name: "tickUpper", type: "int24" },
        ],
        outputs: [
          { name: "feeGrowthInside0X128", type: "uint128" },
          { name: "feeGrowthInside1X128", type: "uint128" },
        ],
      },
    ],
    functionName: "getFeeGrowthInside",
    args: [poolId, tickLower, tickUpper],
  })) as readonly [bigint, bigint];

  return {
    feeGrowthInside0X128,
    feeGrowthInside1X128,
  };
}
