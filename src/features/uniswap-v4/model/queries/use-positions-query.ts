import { useCallback, useMemo } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Address } from "viem";

import { container } from "../../../../di/container";
import { GetUserPositionsUseCaseImpl } from "../../model/use-cases/get-user-positions";
import { SupportedChain } from "../types";

// Query keys for React Query
export const uniswapV4QueryKeys = {
  all: ["uniswap-v4"] as const,
  positions: () => [...uniswapV4QueryKeys.all, "positions"] as const,
  positionsByUser: (userAddress: Address) => [...uniswapV4QueryKeys.positions(), userAddress] as const,
  positionsByUserAndChain: (userAddress: Address, chain: SupportedChain) =>
    [...uniswapV4QueryKeys.positionsByUser(userAddress), chain] as const,
};

/**
 * Hook for fetching Uniswap V4 positions using React Query
 */
const getUserPositionsUseCase = container.resolve(GetUserPositionsUseCaseImpl);

export const useUniswapV4Positions = (
  userAddress: Address,
  chain?: SupportedChain,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  },
) => {
  const queryKey = useMemo(() => {
    return chain
      ? uniswapV4QueryKeys.positionsByUserAndChain(userAddress, chain)
      : uniswapV4QueryKeys.positionsByUser(userAddress);
  }, [userAddress, chain]);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      return await getUserPositionsUseCase.execute(userAddress, chain);
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return query;
};

/**
 * Hook for managing Uniswap V4 positions cache
 */
export const useUniswapV4PositionsCache = () => {
  const queryClient = useQueryClient();

  const invalidatePositions = useCallback(
    (userAddress: Address, chain?: SupportedChain) => {
      const queryKey = chain
        ? uniswapV4QueryKeys.positionsByUserAndChain(userAddress, chain)
        : uniswapV4QueryKeys.positionsByUser(userAddress);

      return queryClient.invalidateQueries({ queryKey });
    },
    [queryClient],
  );

  const removePositions = useCallback(
    (userAddress: Address, chain?: SupportedChain) => {
      const queryKey = chain
        ? uniswapV4QueryKeys.positionsByUserAndChain(userAddress, chain)
        : uniswapV4QueryKeys.positionsByUser(userAddress);

      return queryClient.removeQueries({ queryKey });
    },
    [queryClient],
  );

  const clearAllPositions = useCallback(() => {
    return queryClient.removeQueries({ queryKey: uniswapV4QueryKeys.positions() });
  }, [queryClient]);

  const prefetchPositions = useCallback(
    async (userAddress: Address, chain?: SupportedChain) => {
      const queryKey = chain
        ? uniswapV4QueryKeys.positionsByUserAndChain(userAddress, chain)
        : uniswapV4QueryKeys.positionsByUser(userAddress);

      return queryClient.prefetchQuery({
        queryKey,
        queryFn: () => getUserPositionsUseCase.execute(userAddress, chain),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
    [queryClient],
  );

  return {
    invalidatePositions,
    removePositions,
    clearAllPositions,
    prefetchPositions,
  };
};

/**
 * Hook for getting positions by chain
 */
// The ByChain/All helpers are intentionally omitted to keep the API minimal.
