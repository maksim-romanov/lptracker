import { useEffect } from "react";

import { Address } from "viem";

import { useUniswapV4Positions } from "features/uniswap-v4";

/**
 * Test hook for checking Uniswap V4 positions on specific network using React Query
 */
export const useUniswapV4Test = (userAddress: Address, chain: "ethereum" | "arbitrum" = "arbitrum") => {
  const {
    data: positions = [],
    isLoading,
    error,
    refetch,
  } = useUniswapV4Positions(userAddress, chain, {
    enabled: true,
    staleTime: 0, // Always fetch fresh data for tests
  });

  useEffect(() => {
    if (userAddress) {
      console.log(`[UNISWAP V4 TEST] ==========================================`);
      console.log(`[UNISWAP V4 TEST] Starting fetch for address: ${userAddress}`);
      console.log(`[UNISWAP V4 TEST] Network: ${chain.toUpperCase()}`);
      console.log(`[UNISWAP V4 TEST] ==========================================`);
    }
  }, [userAddress, chain]);

  useEffect(() => {
    if (positions.length > 0) {
      console.log(`[UNISWAP V4 TEST] ✅ Successfully fetched ${positions.length} positions on ${chain}`);
      console.log(`[UNISWAP V4 TEST] 📊 Position details:`);

      positions.forEach((position, index) => {
        console.log(`[UNISWAP V4 TEST] Position ${index + 1}:`);
        console.log(`  - Token ID: ${position.tokenId}`);
        console.log(`  - Chain: ${position.chain}`);
        console.log(`  - Token0: ${position.poolKey.currency0}`);
        console.log(`  - Token1: ${position.poolKey.currency1}`);
        console.log(`  - Fee: ${position.poolKey.fee / 10000}%`);
        // Packed ticks are part of info; no direct tickLower/tickUpper on inferred type
        console.log(`  - Liquidity: ${position.liquidity}`);
        console.log(`  - Hooks: ${position.poolKey.hooks}`);
        console.log(`  - Tick Spacing: ${position.poolKey.tickSpacing}`);
      });
    } else if (positions.length === 0 && !isLoading && !error) {
      console.log(`[UNISWAP V4 TEST] ℹ️  No positions found for this address on ${chain}`);
    }
  }, [positions, chain, isLoading, error]);

  useEffect(() => {
    if (error) {
      console.error(`[UNISWAP V4 TEST] ❌ Error fetching positions:`, error);
      console.error(`[UNISWAP V4 TEST] Error message: ${error.message}`);
    }
  }, [error]);

  useEffect(() => {
    if (!isLoading && (positions.length > 0 || error)) {
      console.log(`[UNISWAP V4 TEST] ==========================================`);
    }
  }, [isLoading, positions.length, error]);

  return {
    positions,
    isLoading,
    error: error?.message || null,
    refetch,
    chain,
    userAddress,
  };
};
