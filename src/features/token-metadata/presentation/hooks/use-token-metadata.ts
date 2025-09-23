import { useQuery } from "@tanstack/react-query";
import { container } from "tsyringe";
import type { Address } from "viem";

import { tokenMetadataQueryKeys } from "./query-keys";
import type { QueryError } from "../../../../infrastructure/query/types";
import { GetTokenMetadataUseCase } from "../../application/use-cases/get-token-metadata";

export function useTokenMetadata(tokenAddress: Address | undefined, chainId: number | undefined) {
  return useQuery({
    queryKey: tokenMetadataQueryKeys.tokenMetadata(tokenAddress || "0x0", chainId || 0),
    queryFn: async () => {
      if (!tokenAddress || !chainId) throw new Error("Token address and chain ID are required");
      const useCase = container.resolve<GetTokenMetadataUseCase>("GetTokenMetadataUseCase");
      return useCase.execute({ tokenAddress, chainId });
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - token metadata rarely changes
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days in cache
    enabled: !!tokenAddress && !!chainId,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: QueryError) => {
      // Don't retry on 404 (token not found) or authentication errors
      if (error?.status === 404 || error?.status === 401) return false;
      return failureCount < 2; // Limited retries for metadata
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
