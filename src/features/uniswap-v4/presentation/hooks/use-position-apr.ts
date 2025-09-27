import { useQuery } from "@tanstack/react-query";
import { container } from "tsyringe";

import { CalculatePositionAprUseCase } from "../../application/use-cases/calculate-position-apr";

import { uniswapV4QueryKeys } from "./query-keys";
import type { QueryError } from "../../../../infrastructure/query/types";
import type { SupportedChainId } from "../../configs";

export interface UsePositionAprResult {
  apr24h?: number;
  apr7d?: number;
  apr30d?: number;
  preferredApr?: number; // Preferred APR for UI display (prioritizes 7d, then 24h, then 30d)
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  warnings?: string[];
}

export function usePositionApr(tokenId: bigint, chainId: SupportedChainId): UsePositionAprResult {
  const query = useQuery({
    queryKey: uniswapV4QueryKeys.positionApr(tokenId?.toString() || "", chainId),
    queryFn: async () => {
      if (!tokenId || !chainId) throw new Error("TokenId and chainId are required");

      const useCase = container.resolve(CalculatePositionAprUseCase);
      const result = await useCase.execute({
        tokenId,
        chainId,
        periods: ["24h", "7d", "30d"],
        forceRefresh: false,
      });

      return {
        apr24h: result.result.apr24h?.apr,
        apr7d: result.result.apr7d?.apr,
        apr30d: result.result.apr30d?.apr,
        warnings: result.warnings,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - APR changes less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
    enabled: !!tokenId && !!chainId,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    refetchIntervalInBackground: false,
    retry: (failureCount, error: QueryError) => {
      // Don't retry if position not found or authentication errors
      if (error?.status === 404 || error?.status === 401) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Calculate preferred APR for UI display
  const preferredApr = query.data?.apr7d ?? query.data?.apr24h ?? query.data?.apr30d;

  return {
    apr24h: query.data?.apr24h,
    apr7d: query.data?.apr7d,
    apr30d: query.data?.apr30d,
    preferredApr,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    warnings: query.data?.warnings,
  };
}