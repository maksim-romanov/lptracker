import { useQuery } from "@tanstack/react-query";
import { container } from "tsyringe";
import type { Address } from "viem";

import { uniswapV4QueryKeys } from "./query-keys";
import type { QueryError } from "../../../../infrastructure/query/types";
import { GetPositionIdsUseCase } from "../../application/use-cases/get-position-ids";
import type { SupportedChainId } from "../../configs";

export function usePositionIds(owner: Address | null, chainId: SupportedChainId | null) {
  return useQuery({
    queryKey: uniswapV4QueryKeys.positionsList({ owner: owner || undefined, chainId: chainId || undefined }),
    queryFn: async () => {
      if (!owner || !chainId) throw new Error("Owner and chainId are required");
      const useCase = container.resolve(GetPositionIdsUseCase);
      return useCase.execute({ owner, chainId });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - position IDs rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
    enabled: !!owner && !!chainId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error: QueryError) => {
      // Don't retry on 404 or authentication errors
      if (error?.status === 404 || error?.status === 401) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
