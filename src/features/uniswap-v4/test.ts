import request from "graphql-request";
import { Address } from "viem";

import { UNISWAP_V4_CONFIGS } from "./api/configs";
import { getTokenInfo } from "./utils/token-utils";
import { getPositionDetails, getStoredPositionInfo } from "./utils/position-utils";
import { getFeeGrowthInside, getBasicPoolInfo } from "./utils/pool-utils";
import { calculateLifetimeFees, formatLifetimeFees } from "./utils/calculation-utils";
import { getMainUIData } from "./utils/ui-data-utils";

const arbitrumConfig = UNISWAP_V4_CONFIGS.arbitrum;

// Subgraph interfaces
interface SubgraphPosition {
  id: string;
  tokenId: string;
  owner: string;
}

const GET_POSITIONS_QUERY = `
  query GetPositions($owner: String!) {
    positions(where: { owner: $owner }) {
      tokenId
      owner
      id
    }
  }
`;

/**
 * Get position IDs from subgraph
 * @param owner - User address
 * @returns Array of position token IDs
 */
async function getPositionIds(owner: Address): Promise<bigint[]> {
  const headers = {
    Authorization: "Bearer " + "483aa90f30cf4a8250dee1c72c643c9d",
  };

  const response = await request<{ positions: SubgraphPosition[] }>(
    arbitrumConfig.subgraphUrl,
    GET_POSITIONS_QUERY,
    { owner: owner.toLowerCase() },
    headers,
  );

  return response.positions.map((p) => BigInt(p.tokenId));
}

/**
 * Fetch user positions
 * @param userAddress - User address
 * @returns Position details or null
 */
async function fetchUserPositions(userAddress: Address) {
  try {
    const tokenIds = await getPositionIds(userAddress);
    console.log(`Found ${tokenIds.length} positions on Unichain`);

    const [tokenId] = tokenIds;
    if (!tokenId) return null;
    return await getPositionDetails(tokenId);
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Main execution
async function main() {
  const position = await fetchUserPositions("0xeCa0b7CDd7F2fE6389Ee3720aE415D07ABe0Ed58");
  if (!position) throw new Error("No position found");

  // Get stored position info
  const storedPositionInfo = await getStoredPositionInfo(position, position.tokenId);

  // Get current fee growth
  const currentFeeGrowth = await getFeeGrowthInside(
    "0x864abca0a6202dba5b8868772308da953ff125b0f95015adbf89aaf579e903a8", // poolId
    position.tickLower,
    position.tickUpper,
  );

  // Calculate lifetime fees
  const lifetimeFees = calculateLifetimeFees(
    storedPositionInfo.liquidity,
    currentFeeGrowth.feeGrowthInside0X128,
    currentFeeGrowth.feeGrowthInside1X128,
    storedPositionInfo.feeGrowthInside0Last,
    storedPositionInfo.feeGrowthInside1Last,
  );

  console.log("lifetimeFees: >>> ", formatLifetimeFees(lifetimeFees, 18, 6));

// Pool data interface
interface PoolData {
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

// ABI for PoolManager contract - using correct Uniswap V4 ABI
const POOL_MANAGER_ABI = [
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
    name: "getProtocolFees",
    type: "function",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [
      { name: "token0", type: "uint128" },
      { name: "token1", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    name: "getSwapFees",
    type: "function",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [
      { name: "token0", type: "uint128" },
      { name: "token1", type: "uint128" },
    ],
    stateMutability: "view",
  },
] as const;

// ABI for StateView contract - more reliable for getting pool data
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
] as const;

async function getPoolData(poolId: string): Promise<PoolData> {
  try {
    console.log("Fetching pool data for poolId:", poolId);

    // Try to get slot0 data from StateView first
    let sqrtPriceX96: bigint, tick: number, protocolFee: number, lpFee: number;
    let liquidity: bigint;
    let feeGrowthGlobal0X128: bigint, feeGrowthGlobal1X128: bigint;

    try {
      // Get slot0 data (price, tick, fees) from StateView
      [sqrtPriceX96, tick, protocolFee, lpFee] = (await publicClient.readContract({
        address: arbitrumConfig.stateViewAddress,
        abi: STATE_VIEW_ABI,
        functionName: "getSlot0",
        args: [poolId],
      })) as readonly [bigint, number, number, number];

      // Get current liquidity from StateView
      liquidity = (await publicClient.readContract({
        address: arbitrumConfig.stateViewAddress,
        abi: STATE_VIEW_ABI,
        functionName: "getLiquidity",
        args: [poolId],
      })) as bigint;

      // Get global fee growth from StateView
      [feeGrowthGlobal0X128, feeGrowthGlobal1X128] = (await publicClient.readContract({
        address: arbitrumConfig.stateViewAddress,
        abi: STATE_VIEW_ABI,
        functionName: "getFeeGrowthGlobal",
        args: [poolId],
      })) as readonly [bigint, bigint];
    } catch (stateViewError) {
      console.log("StateView failed, trying PoolManager...");

      // Fallback to PoolManager
      [sqrtPriceX96, tick, protocolFee, lpFee] = (await publicClient.readContract({
        address: arbitrumConfig.PoolManager,
        abi: POOL_MANAGER_ABI,
        functionName: "getSlot0",
        args: [poolId],
      })) as readonly [bigint, number, number, number];

      liquidity = (await publicClient.readContract({
        address: arbitrumConfig.PoolManager,
        abi: POOL_MANAGER_ABI,
        functionName: "getLiquidity",
        args: [poolId],
      })) as bigint;

      [feeGrowthGlobal0X128, feeGrowthGlobal1X128] = (await publicClient.readContract({
        address: arbitrumConfig.PoolManager,
        abi: POOL_MANAGER_ABI,
        functionName: "getFeeGrowthGlobal",
        args: [poolId],
      })) as readonly [bigint, bigint];
    }

    return {
      liquidity,
      sqrtPriceX96,
      tick,
      feeGrowthGlobal0X128,
      feeGrowthGlobal1X128,
      protocolFees: {
        token0: 0n, // Set to 0 for now
        token1: 0n,
      },
      swapFees: {
        token0: 0n, // Set to 0 for now
        token1: 0n,
      },
    };
  } catch (error) {
    console.error("Error fetching pool data:", error);
    throw error;
  }
}

// Since direct pool data calls are failing, let's use the data we already have
// and create a simplified pool data structure from existing information

console.log("=== POOL INFORMATION ===");
console.log("Pool ID:", poolId);
console.log("Pool Key:", {
  currency0: position.poolKey.currency0,
  currency1: position.poolKey.currency1,
  fee: position.poolKey.fee,
  tickSpacing: position.poolKey.tickSpacing,
  hooks: position.poolKey.hooks,
});

console.log("=== POSITION INFORMATION ===");
console.log("Position Details:", {
  tokenId: position.tokenId.toString(),
  tickLower: position.tickLower,
  tickUpper: position.tickUpper,
  liquidity: storedPositionInfo.liquidity.toString(),
});

console.log("=== FEE INFORMATION ===");
console.log("Uncollected Fees:", {
  token0LifetimeFees: formatUnits(lifetimeFees.token0LifetimeFees, 18),
  token1LifetimeFees: formatUnits(lifetimeFees.token1LifetimeFees, 6),
});

console.log("Current Fee Growth Inside:", {
  feeGrowthInside0X128: currentFeeGrowth.feeGrowthInside0X128.toString(),
  feeGrowthInside1X128: currentFeeGrowth.feeGrowthInside1X128.toString(),
});

console.log("Stored Fee Growth Inside:", {
  feeGrowthInside0Last: storedPositionInfo.feeGrowthInside0Last.toString(),
  feeGrowthInside1Last: storedPositionInfo.feeGrowthInside1Last.toString(),
});

// Let's try to get some basic pool information using a different approach
async function getBasicPoolInfo(poolId: string) {
  try {
    // Try to get pool liquidity using a different method
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

const basicPoolInfo = await getBasicPoolInfo(poolId);
console.log("=== BASIC POOL INFO ===");
console.log("Pool Liquidity:", basicPoolInfo.liquidity.toString());

// Calculate position value based on available data
function calculateSimplePositionValue(
  liquidity: bigint,
  tickLower: number,
  tickUpper: number,
): { estimatedValue: string } {
  // This is a very simplified calculation
  // In reality, you'd need the current price and more complex math
  const estimatedValue = (Number(liquidity) / 1e18).toFixed(6);
  return { estimatedValue };
}

const simplePositionValue = calculateSimplePositionValue(
  storedPositionInfo.liquidity,
  position.tickLower,
  position.tickUpper,
);

console.log("=== POSITION VALUE ESTIMATE ===");
console.log("Estimated Position Value (simplified):", simplePositionValue.estimatedValue, "ETH equivalent");

// ===== UI DATA FUNCTIONS =====

// Token information interface
interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

// Position status enum
enum PositionStatus {
  IN_RANGE = "IN_RANGE",
  OUT_OF_RANGE = "OUT_OF_RANGE",
  UNKNOWN = "UNKNOWN",
}

// UI data interface
interface PositionUIData {
  token0: TokenInfo;
  token1: TokenInfo;
  investedAmount: {
    token0: string;
    token1: string;
    totalUSD: string;
  };
  status: PositionStatus;
  currentTick: number;
  tickRange: {
    lower: number;
    upper: number;
  };
}

// Get token information
async function getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
  // Handle native ETH first
  if (tokenAddress === "0x0000000000000000000000000000000000000000") {
    return {
      address: tokenAddress,
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    };
  }

  try {
    // ERC20 ABI for token info
    const ERC20_ABI = [
      {
        name: "symbol",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
      },
      {
        name: "name",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
      },
      {
        name: "decimals",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
      },
    ] as const;

    const [symbol, name, decimals] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "symbol",
      }),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "name",
      }),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "decimals",
      }),
    ]);

    return {
      address: tokenAddress,
      symbol: symbol as string,
      name: name as string,
      decimals: decimals as number,
    };
  } catch (error) {
    console.error(`Error fetching token info for ${tokenAddress}:`, error);
    // Return unknown token info
    return {
      address: tokenAddress,
      symbol: "UNKNOWN",
      name: "Unknown Token",
      decimals: 18,
    };
  }
}

// Get current tick from pool
async function getCurrentTick(poolId: string): Promise<number> {
  try {
    // Try to get current tick from StateView
    const tick = await publicClient.readContract({
      address: arbitrumConfig.stateViewAddress,
      abi: [
        {
          name: "getCurrentTick",
          type: "function",
          inputs: [{ name: "poolId", type: "bytes32" }],
          outputs: [{ name: "tick", type: "int24" }],
          stateMutability: "view",
        },
      ],
      functionName: "getCurrentTick",
      args: [poolId],
    });
    return tick as number;
  } catch (error) {
    console.log("Could not fetch current tick, using estimated value");
    // Return a reasonable estimate based on the position range
    return Math.floor((position.tickLower + position.tickUpper) / 2);
  }
}

// Calculate position status
function calculatePositionStatus(currentTick: number, tickLower: number, tickUpper: number): PositionStatus {
  if (currentTick >= tickLower && currentTick <= tickUpper) {
    return PositionStatus.IN_RANGE;
  } else {
    return PositionStatus.OUT_OF_RANGE;
  }
}

// Calculate invested amounts (simplified calculation)
function calculateInvestedAmounts(
  liquidity: bigint,
  tickLower: number,
  tickUpper: number,
  currentTick: number,
  token0Decimals: number,
  token1Decimals: number,
): { token0: string; token1: string; totalUSD: string } {
  // This is a simplified calculation
  // In a real implementation, you'd need to calculate the exact amounts
  // based on the current tick position and liquidity

  const Q96 = 2n ** 96n;

  // Calculate price from tick (simplified)
  const price = Math.pow(1.0001, currentTick);

  // Estimate token amounts based on liquidity and price
  const liquidityNumber = Number(liquidity);
  console.log("DEBUG - liquidity (bigint):", liquidity.toString());
  console.log("DEBUG - liquidityNumber (Number):", liquidityNumber);
  console.log("DEBUG - price from tick:", price);
  console.log("DEBUG - sqrt(price):", Math.sqrt(price));

  const token0Amount = liquidityNumber / (2 * Math.sqrt(price)) / Math.pow(10, token0Decimals);
  const token1Amount = (liquidityNumber * Math.sqrt(price)) / 2 / Math.pow(10, token1Decimals);

  // Estimate USD value (assuming token1 is USDC)
  const totalUSD = token1Amount + token0Amount * 3000; // Assuming ETH = $3000

  return {
    token0: token0Amount.toFixed(6),
    token1: token1Amount.toFixed(6),
    totalUSD: totalUSD.toFixed(2),
  };
}

// Main function to get UI data
async function getPositionUIData(): Promise<PositionUIData> {
  console.log("=== FETCHING UI DATA ===");

  // Get token information
  const [token0Info, token1Info] = await Promise.all([
    getTokenInfo(position.poolKey.currency0),
    getTokenInfo(position.poolKey.currency1),
  ]);

  // Get current tick
  const currentTick = await getCurrentTick(poolId);

  // Calculate position status
  const status = calculatePositionStatus(currentTick, position.tickLower, position.tickUpper);

  // Calculate invested amounts
  const investedAmount = calculateInvestedAmounts(
    storedPositionInfo.liquidity,
    position.tickLower,
    position.tickUpper,
    currentTick,
    token0Info.decimals,
    token1Info.decimals,
  );

  return {
    token0: token0Info,
    token1: token1Info,
    investedAmount,
    status,
    currentTick,
    tickRange: {
      lower: position.tickLower,
      upper: position.tickUpper,
    },
  };
}

// Get and display UI data
const uiData = await getPositionUIData();

console.log("=== UI DATA FOR DISPLAY ===");
console.log("Token 0:", uiData.token0);
console.log("Token 1:", uiData.token1);
console.log("Invested Amount:", uiData.investedAmount);
console.log("Position Status:", uiData.status);
console.log("Current Tick:", uiData.currentTick);
console.log("Tick Range:", uiData.tickRange);

// Export data for UI components
export const positionData = {
  tokens: {
    token0: uiData.token0,
    token1: uiData.token1,
  },
  invested: uiData.investedAmount,
  status: uiData.status,
  currentTick: uiData.currentTick,
  tickRange: uiData.tickRange,
  uncollectedFees: {
    token0: formatUnits(lifetimeFees.token0LifetimeFees, uiData.token0.decimals),
    token1: formatUnits(lifetimeFees.token1LifetimeFees, uiData.token1.decimals),
  },
};

// async function getCurrentFeeGrowthV4(positionDetails) {
//   const [feeGrowthInside0X128, feeGrowthInside1X128] = await publicClient.readContract({
//     address: arbitrumConfig.stateViewAddress,
//     functionName: 'getFeeGrowthInside',
//     args: [poolId, position.tickLower, position.tickUpper],
//     abi: [
//       {
//         name: 'getFeeGrowthInside',
//         type: 'function',
//         inputs: [
//           { name: 'poolId', type: 'bytes32' },
//           { name: 'tickLower', type: 'int24' },
//           { name: 'tickUpper', type: 'int24' },
//         ],
//         outputs: [{ type: 'uint128' }, { type: 'uint128' }],
//         stateMutability: 'view',
//       },
//     ]
//   })

//   console.log('feeGrowthInside0X128, feeGrowthInside1X128: ', feeGrowthInside0X128, feeGrowthInside1X128)
// }

// await getCurrentFeeGrowthV4(position)

// async function getStoredPositionInfoV4(positionDetails, tokenId, owner) {
//   const salt = `0x${tokenId.toString(16).padStart(64, '0')}`
//   const [liquidity, feeGrowthInside0Last, feeGrowthInside1Last] = await publicClient.readContract({
//     address: arbitrumConfig.stateViewAddress,
//     functionName: 'getPositionInfo',
//     args: [poolId, arbitrumConfig.positionManagerAddress, position.tickLower, position.tickUpper, salt],
//   })
// }

// async function getCurrentFeeGrowthV4(positionDetails) {
//   const [feeGrowthInside0X128, feeGrowthInside1X128] = await publicClient.readContract({
//     address: "0x7ffe42c4a5deea5b0fec41c94c136cf115597227",
//     functionName: 'getFeeGrowthInside',
//     args: [poolId, tickLower, tickUpper],
//   })
// }

// if(!positions) throw new Error('No positions found')
// const poisitonDetails = getPositionDetails(positions.tokenId)
// console.log('poisitonDetails: ', poisitonDetails)
