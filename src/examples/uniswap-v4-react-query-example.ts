import { Address } from "viem";

import { useUniswapV4Positions, useUniswapV4PositionsCache } from "../features/uniswap-v4";

/**
 * This file intentionally avoids JSX to prevent TS errors in non-UI contexts.
 * Use these examples as reference inside real components/screens.
 */

export const UniswapV4PositionsExample = () => {
  const userAddress = "0xeca0b7cdd7f2fe6389ee3720ae415d07abe0ed58" as Address;

  const arbitrumQuery = useUniswapV4Positions(userAddress, "arbitrum", { enabled: true, staleTime: 5 * 60 * 1000 });

  const allQuery = useUniswapV4Positions(userAddress);
  const ethereumQuery = useUniswapV4Positions(userAddress, "ethereum");

  const { invalidatePositions, clearAllPositions, prefetchPositions } = useUniswapV4PositionsCache();

  return {
    arbitrumQuery,
    allQuery,
    ethereumQuery,
    invalidateArbitrum: () => invalidatePositions(userAddress, "arbitrum"),
    clearAll: () => clearAllPositions(),
    prefetchEthereum: () => prefetchPositions(userAddress, "ethereum"),
  };
};

export const CacheManagementExample = () => {
  const userAddress = "0xeca0b7cdd7f2fe6389ee3720ae415d07abe0ed58" as Address;
  const { invalidatePositions, removePositions, clearAllPositions, prefetchPositions } = useUniswapV4PositionsCache();

  return {
    invalidateArbitrum: () => invalidatePositions(userAddress, "arbitrum"),
    invalidateEthereum: () => invalidatePositions(userAddress, "ethereum"),
    removeArbitrum: () => removePositions(userAddress, "arbitrum"),
    removeAll: () => removePositions(userAddress),
    clearAll: () => clearAllPositions(),
    prefetchArbitrum: () => prefetchPositions(userAddress, "arbitrum"),
    prefetchEthereum: () => prefetchPositions(userAddress, "ethereum"),
    prefetchAll: () => prefetchPositions(userAddress),
  };
};
