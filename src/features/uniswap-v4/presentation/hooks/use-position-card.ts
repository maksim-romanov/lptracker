import { useQuery } from "@tanstack/react-query";
import { container } from "tsyringe";

import { GetPositionCardUseCase } from "features/uniswap-v4/application/use-cases/get-position-card";

import { uniswapV4QueryKeys } from "./query-keys";
import type { QueryError } from "../../../../infrastructure/query/types";
import type { SupportedChainId } from "../../configs";

export function usePositionCard(tokenId: bigint, chainId: SupportedChainId) {
  return useQuery({
    queryKey: uniswapV4QueryKeys.positionCard(tokenId?.toString() || "", chainId),
    queryFn: async () => {
      if (!tokenId || !chainId) throw new Error("TokenId and chainId are required");
      const useCase = container.resolve(GetPositionCardUseCase);
      return useCase.execute({ tokenId, chainId });
    },
    staleTime: 30 * 1000, // 30 seconds - prices and fees change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
    enabled: !!tokenId && !!chainId,
    refetchInterval: 60 * 1000, // Auto-refresh every minute when component is active
    refetchIntervalInBackground: false, // Don't update in background
    retry: (failureCount, error: QueryError) => {
      // Don't retry if position not found or authentication errors
      if (error?.status === 404 || error?.status === 401) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
