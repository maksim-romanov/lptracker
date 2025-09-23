/**
 * Example usage of useMultiChainPositions hook
 */

import { useMultiChainPositions } from "./use-multi-chain-positions";
import { arbitrum, mainnet } from "viem/chains";

// Example component usage
export function ExampleUsage() {
  const userAddress = "0x123..." as `0x${string}`;

  // Fetch positions from multiple chains
  const {
    data,
    isLoading,
    error
  } = useMultiChainPositions(userAddress, [arbitrum.id, mainnet.id]);

  if (isLoading) return "Loading positions...";
  if (error) return `Error: ${error.message}`;

  return {
    // All positions across all chains (flat array)
    allPositions: data?.allPositions || [],

    // Total count
    totalCount: data?.totalCount || 0,

    // Results by chain
    arbitrumPositions: data?.chainResults.find(r => r.chainId === arbitrum.id)?.positions || [],
    mainnetPositions: data?.chainResults.find(r => r.chainId === mainnet.id)?.positions || [],

    // Status info
    hasPositions: data?.hasPositions || false,
    hasErrors: data?.hasErrors || false,
    isPartialSuccess: data?.isPartialSuccess || false,

    // Which chains succeeded/failed
    successfulChains: data?.successfulChains || [],
    failedChains: data?.failedChains || [],
  };
}