import { useQuery } from "@tanstack/react-query";
import { container } from "tsyringe";
import type { Address } from "viem";

import { uniswapV4QueryKeys } from "./query-keys";
import type { QueryError } from "../../../../infrastructure/query/types";
import { GetMultiChainPositionIdsUseCase } from "../../application/use-cases/get-multi-chain-position-ids";
import type { SupportedChainId } from "../../configs";

export function useMultiChainPositions(owner: Address | null, chainIds: SupportedChainId[]) {
  return useQuery({
    queryKey: uniswapV4QueryKeys.multiChainPositionsList({
      owner: owner || undefined,
      chainIds: chainIds.length > 0 ? chainIds : undefined,
    }),
    queryFn: async () => {
      if (!owner || chainIds.length === 0) {
        throw new Error("Owner and at least one chain ID are required");
      }
      const useCase = container.resolve("GetMultiChainPositionIdsUseCase") as GetMultiChainPositionIdsUseCase;
      return useCase.execute({ owner, chainIds });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - position IDs rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
    enabled: !!owner && chainIds.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
