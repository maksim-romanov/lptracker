import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { container } from "tsyringe";
import type { Address } from "viem";

import { chainlinkQueryKeys } from "./query-keys";
import { GetChainlinkPriceUseCase } from "../../application/use-cases/get-chainlink-price";
import type { ChainlinkPrice } from "../../domain/types";

export interface UseChainlinkPriceOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

export function useChainlinkPrice(
  tokenAddress: Address,
  chainId: number,
  options: UseChainlinkPriceOptions = {},
): UseQueryResult<ChainlinkPrice, Error> {
  const {
    enabled = true,
    refetchInterval = 60000, // 1 minute
    staleTime = 30000, // 30 seconds
  } = options;

  return useQuery({
    queryKey: chainlinkQueryKeys.price(tokenAddress, chainId),
    queryFn: async () => {
      const useCase = container.resolve(GetChainlinkPriceUseCase);
      return await useCase.execute({ tokenAddress, chainId });
    },
    enabled: enabled && !!tokenAddress && !!chainId,
    refetchInterval,
    staleTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useChainlinkAvailability(): UseQueryResult<boolean, Error> {
  return useQuery({
    queryKey: chainlinkQueryKeys.availability(),
    queryFn: async () => {
      const useCase = container.resolve(GetChainlinkPriceUseCase);
      return await useCase.isChainlinkAvailable();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}
