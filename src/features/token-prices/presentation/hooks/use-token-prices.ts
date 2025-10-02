import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { container } from "tsyringe";
import type { Address } from "viem";

import { tokenPricesQueryKeys } from "./query-keys";
import type { QueryError } from "../../../../infrastructure/query/types";
import { GetTokenPriceUseCase } from "../../application/use-cases/get-token-price";
import type { TokenPrice } from "../../domain/types";

export interface TokenInput {
  tokenAddress: Address;
  chainId: number;
}

export interface UseTokenPricesOptions {
  enabled?: boolean;
  staleTime?: number;
  retry?: number;
}

export interface UseTokenPricesResult {
  data: TokenPrice[];
  results: UseQueryResult<TokenPrice, QueryError>[];
  isLoading: boolean;
  isError: boolean;
  errors: QueryError[];
  loadingCount: number;
  successCount: number;
  errorCount: number;
  hasPartialData: boolean;
}

export function useTokenPrices(
  tokens: Partial<TokenInput>[],
  options: UseTokenPricesOptions = {},
): UseTokenPricesResult {
  const safeTokens = tokens.filter((token) => token.tokenAddress && token.chainId) as TokenInput[];

  const { enabled = true, staleTime = 60 * 1000, retry = 2 } = options;

  const queries = useQueries({
    queries: safeTokens?.map((token) => ({
      queryKey: tokenPricesQueryKeys.singlePrice(token.tokenAddress, token.chainId),
      queryFn: async () => {
        // Rate limiting is now handled automatically by RateLimiterRepository decorator
        // No need for manual sequential delays - the decorator queues requests
        // and smooths out traffic peaks using execEvenly option
        const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");
        return useCase.execute(token);
      },
      enabled: enabled && !!token.tokenAddress && !!token.chainId,
      staleTime,
      retry: (failureCount: number, error: QueryError) => {
        // Don't retry on 404 or authentication errors
        if (error?.status === 404 || error?.status === 401) {
          return false;
        }
        return failureCount < retry;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })),
  });

  const data = queries.map((q) => q.data).filter((item): item is TokenPrice => item !== undefined);
  const errors = queries.filter((q) => q.error).map((q) => q.error!);
  const loadingCount = queries.filter((q) => q.isLoading).length;
  const successCount = queries.filter((q) => q.data).length;
  const errorCount = queries.filter((q) => q.error).length;

  return {
    data,
    results: queries,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
    errors,
    loadingCount,
    successCount,
    errorCount,
    hasPartialData: successCount > 0 && (loadingCount > 0 || errorCount > 0),
  };
}
