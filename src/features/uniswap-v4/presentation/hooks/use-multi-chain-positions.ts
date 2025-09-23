import { useQuery } from "@tanstack/react-query";
import { container } from "tsyringe";
import type { Address } from "viem";

import { uniswapV4QueryKeys } from "./query-keys";
import type { QueryError } from "../../../../infrastructure/query/types";
import { blockchainStore } from "../../../../presentation/stores/blockchain-store";
import { GetMultiChainPositionIdsUseCase } from "../../application/use-cases/get-multi-chain-position-ids";
import { isUniswapV4SupportedChain, type SupportedChainId } from "../../configs";

// Hook that uses manually specified chain IDs
export function useMultiChainPositions(owner: Address | null, chainIds: SupportedChainId[]) {
  return useQuery({
    queryKey: uniswapV4QueryKeys.multiChainPositionsList({
      owner: owner || undefined,
      chainIds: chainIds.length > 0 ? chainIds : undefined,
    }),
    queryFn: async () => {
      try {
        console.log("QUERY start 111");
        if (!owner || chainIds.length === 0) throw new Error("Owner and at least one chain ID are required");
        console.log("QUERY start 222");
        const useCase = container.resolve<GetMultiChainPositionIdsUseCase>("GetMultiChainPositionIdsUseCase");
        console.log("QUERY start 333");
        return useCase.execute({ owner, chainIds });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - position IDs rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
    enabled: !!owner && chainIds.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error: QueryError) => {
      // Don't retry on 404 or authentication errors
      if (error?.status === 404 || error?.status === 401) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (data) => ({
      // All positions across all chains
      allPositions: data.allPositions,

      // Results broken down by chain
      chainResults: data.chainResults,

      // Summary information
      totalCount: data.totalCount,
      successfulChains: data.successfulChains,
      failedChains: data.failedChains,

      // Convenience flags
      hasPositions: data.totalCount > 0,
      hasErrors: data.failedChains.length > 0,
      isPartialSuccess: data.successfulChains.length > 0 && data.failedChains.length > 0,
    }),
  });
}

// Hook that automatically uses active chains from blockchain store
export function useMultiChainPositionsAuto(owner: Address | null) {
  // Filter active chains to only include those supported by Uniswap V4
  const supportedActiveChains = blockchainStore.activeChainIds.filter(isUniswapV4SupportedChain);

  return useMultiChainPositions(owner, supportedActiveChains);
}
