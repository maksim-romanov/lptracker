import { Address } from "viem";

import {
  useUniswapV4Positions,
  useUniswapV4PositionsCache,
  useUniswapV4PositionsByChain,
  useUniswapV4AllPositions,
} from "../hooks/use-uniswap-v4-positions-query";

/**
 * Example component showing how to use Uniswap V4 React Query hooks
 */
export const UniswapV4PositionsExample = () => {
  const userAddress = "0xeca0b7cdd7f2fe6389ee3720ae415d07abe0ed58" as Address;

  // Example 1: Fetch positions for specific chain
  const {
    positions: arbitrumPositions,
    isLoading: isLoadingArbitrum,
    error: arbitrumError,
    refetch: refetchArbitrum,
  } = useUniswapV4Positions(userAddress, "arbitrum", {
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Example 2: Fetch all positions across all chains
  const {
    positions: allPositions,
    isLoading: isLoadingAll,
    error: allError,
  } = useUniswapV4AllPositions(userAddress);

  // Example 3: Get positions filtered by chain
  const { positions: ethereumPositions } = useUniswapV4PositionsByChain(userAddress, "ethereum");

  // Example 4: Cache management
  const { invalidatePositions, clearAllPositions, prefetchPositions } = useUniswapV4PositionsCache();

  const handleInvalidateArbitrum = () => {
    invalidatePositions(userAddress, "arbitrum");
  };

  const handleClearAll = () => {
    clearAllPositions();
  };

  const handlePrefetchEthereum = () => {
    prefetchPositions(userAddress, "ethereum");
  };

  return {
    // Data
    arbitrumPositions,
    allPositions,
    ethereumPositions,

    // Loading states
    isLoadingArbitrum,
    isLoadingAll,

    // Errors
    arbitrumError,
    allError,

    // Actions
    refetchArbitrum,
    handleInvalidateArbitrum,
    handleClearAll,
    handlePrefetchEthereum,
  };
};

/**
 * Example of using the hooks in a React component
 */
export const UniswapV4PositionsComponent = () => {
  const userAddress = "0xeca0b7cdd7f2fe6389ee3720ae415d07abe0ed58" as Address;

  const { positions, isLoading, error, refetch } = useUniswapV4Positions(userAddress, "arbitrum");
  const { invalidatePositions } = useUniswapV4PositionsCache();

  if (isLoading) {
    return <div>Loading positions...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Uniswap V4 Positions ({positions.length})</h2>

      <div>
        <button onClick={() => refetch()}>Refresh</button>
        <button onClick={() => invalidatePositions(userAddress, "arbitrum")}>
          Invalidate Cache
        </button>
      </div>

      {positions.map((position) => (
        <div key={position.tokenId} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h3>Position #{position.tokenId}</h3>
          <p><strong>Chain:</strong> {position.chain}</p>
          <p><strong>Token0:</strong> {position.poolKey.currency0}</p>
          <p><strong>Token1:</strong> {position.poolKey.currency1}</p>
          <p><strong>Fee:</strong> {(position.poolKey.fee / 10000).toFixed(2)}%</p>
          <p><strong>Tick Range:</strong> {position.tickLower} to {position.tickUpper}</p>
          <p><strong>Liquidity:</strong> {position.liquidity.toString()}</p>
          {position.poolKey.hooks !== "0x0000000000000000000000000000000000000000" && (
            <p><strong>Hooks:</strong> {position.poolKey.hooks}</p>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Example of cache management utilities
 */
export const CacheManagementExample = () => {
  const userAddress = "0xeca0b7cdd7f2fe6389ee3720ae415d07abe0ed58" as Address;

  const {
    invalidatePositions,
    removePositions,
    clearAllPositions,
    prefetchPositions,
  } = useUniswapV4PositionsCache();

  return {
    // Invalidate specific user's positions on specific chain
    invalidateArbitrum: () => invalidatePositions(userAddress, "arbitrum"),
    invalidateEthereum: () => invalidatePositions(userAddress, "ethereum"),

    // Remove specific user's positions from cache
    removeArbitrum: () => removePositions(userAddress, "arbitrum"),
    removeAll: () => removePositions(userAddress),

    // Clear all positions cache
    clearAll: () => clearAllPositions(),

    // Prefetch positions
    prefetchArbitrum: () => prefetchPositions(userAddress, "arbitrum"),
    prefetchEthereum: () => prefetchPositions(userAddress, "ethereum"),
    prefetchAll: () => prefetchPositions(userAddress),
  };
};
