import request from "graphql-request";
import { Address } from "viem";

import { UNISWAP_V4_CONFIGS } from "./api/configs";
import {
  calculateLifetimeFees,
  formatLifetimeFees,
  calculateCurrentPrice,
  calculateInversePrice,
  calculateAprFromInitialInvestment,
} from "./utils/calculation-utils";
import { getFeeGrowthInside, getBasicPoolInfo } from "./utils/pool-utils";
import { getPositionDetails, getStoredPositionInfo } from "./utils/position-utils";
import { getTokenInfo } from "./utils/token-utils";
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

/**
 * Main execution function
 * @returns Position data for UI
 */
async function main() {
  const position = await fetchUserPositions("0xeCa0b7CDd7F2fE6389Ee3720aE415D07ABe0Ed58");
  if (!position) throw new Error("No position found");

  // Get stored position info
  const poolId = "0x864abca0a6202dba5b8868772308da953ff125b0f95015adbf89aaf579e903a8";
  const storedPositionInfo = await getStoredPositionInfo(position, position.tokenId, poolId);

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

  // Get token information
  const [token0Info, token1Info] = await Promise.all([
    getTokenInfo(position.poolKey.currency0),
    getTokenInfo(position.poolKey.currency1),
  ]);

  // Get basic pool info
  const basicPoolInfo = await getBasicPoolInfo("0x864abca0a6202dba5b8868772308da953ff125b0f95015adbf89aaf579e903a8");

  // Get main UI data
  const mainUIData = await getMainUIData(position, storedPositionInfo, lifetimeFees, token0Info, token1Info, poolId);

  // Display information
  console.log("=== POOL INFORMATION ===");
  console.log("Pool ID: 0x864abca0a6202dba5b8868772308da953ff125b0f95015adbf89aaf579e903a8");
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
  console.log("Uncollected Fees:", mainUIData.uncollectedFees);

  console.log("Current Fee Growth Inside:", {
    feeGrowthInside0X128: currentFeeGrowth.feeGrowthInside0X128.toString(),
    feeGrowthInside1X128: currentFeeGrowth.feeGrowthInside1X128.toString(),
  });

  console.log("Stored Fee Growth Inside:", {
    feeGrowthInside0Last: storedPositionInfo.feeGrowthInside0Last.toString(),
    feeGrowthInside1Last: storedPositionInfo.feeGrowthInside1Last.toString(),
  });

  console.log("=== BASIC POOL INFO ===");
  console.log("Pool Liquidity:", basicPoolInfo.liquidity.toString());

  console.log("=== UI DATA FOR DISPLAY ===");
  console.log("Token 0:", mainUIData.tokens.token0);
  console.log("Token 1:", mainUIData.tokens.token1);
  console.log("Invested Amount:", mainUIData.invested);
  console.log("Position Status:", mainUIData.status);
  console.log("Current Tick:", mainUIData.currentTick);
  console.log("Tick Range:", mainUIData.tickRange);
  console.log("Pool Slot Data:", {
    sqrtPriceX96: mainUIData.poolSlotData.sqrtPriceX96.toString(),
    tick: mainUIData.poolSlotData.tick,
    protocolFee: mainUIData.poolSlotData.protocolFee,
    lpFee: mainUIData.poolSlotData.lpFee,
  });

  // Calculate and display current price
  const currentPrice = calculateCurrentPrice(
    mainUIData.poolSlotData,
    mainUIData.tokens.token0.decimals,
    mainUIData.tokens.token1.decimals,
  );
  console.log("Current Price (ETH/USDC):", currentPrice);

  // Calculate and display inverse price
  const inversePrice = calculateInversePrice(
    mainUIData.poolSlotData,
    mainUIData.tokens.token0.decimals,
    mainUIData.tokens.token1.decimals,
  );
  console.log("Inverse Price (USDC/ETH):", inversePrice);

  // Note: Historical APR calculation removed due to RPC node limitations
  // For production, use archive RPC nodes or The Graph for historical data

  // === APR based on initial investment ===
  try {
    // For demonstration, let's assume the position was opened 30 days ago
    // In a real app, you'd get this from subgraph or position creation event
    const daysSinceOpen = 30;

    // Calculate current total value (invested + uncollected fees)
    const currentInvestedValue = Number(mainUIData.invested.token1) + Number(mainUIData.invested.token0) * currentPrice;

    console.log("currentInvestedValue: ", currentInvestedValue);
    const uncollectedFeesValue =
      Number(mainUIData.uncollectedFees.token1LifetimeFees) +
      Number(mainUIData.uncollectedFees.token0LifetimeFees) * currentPrice;
    const currentTotalValue = currentInvestedValue + uncollectedFeesValue;

    // For demonstration, let's assume initial investment was slightly less than current invested value
    // (to account for some price appreciation and fees earned)
    const estimatedInitialValue = currentInvestedValue * 0.95; // 5% less than current invested

    const aprFromInitial = calculateAprFromInitialInvestment(estimatedInitialValue, currentTotalValue, daysSinceOpen);

    console.log("=== APR (based on initial investment) ===");
    console.log("Estimated initial value:", estimatedInitialValue.toFixed(2), "USDC");
    console.log("Current total value:", currentTotalValue.toFixed(2), "USDC");
    console.log("Uncollected fees value:", uncollectedFeesValue.toFixed(2), "USDC");
    console.log("Days since open:", daysSinceOpen);
    console.log("APR (from initial investment):", aprFromInitial.toFixed(2) + "%");
  } catch (err) {
    console.log("Failed to compute APR from initial investment:", err);
  }

  // Export data for UI components
  return mainUIData;
}

// Execute main function
const positionData = await main();
export { positionData };
