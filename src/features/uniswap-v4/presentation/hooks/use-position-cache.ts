import { useMemo } from "react";

import { useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

import { uniswapV4QueryKeys } from "./query-keys";
import type { SupportedChainId } from "../../configs";
import type { PositionSummary } from "../../domain/types";

export function usePositionCache() {
  const queryClient = useQueryClient();

  return useMemo(
    () => ({
      /**
       * Invalidate specific position data
       */
      invalidatePosition: (tokenId: bigint, chainId: SupportedChainId) => {
        return queryClient.invalidateQueries({
          queryKey: uniswapV4QueryKeys.positionDetail(tokenId, chainId),
        });
      },

      /**
       * Invalidate user's positions list for single chain
       */
      invalidatePositionsList: (owner: Address, chainId: SupportedChainId) => {
        return queryClient.invalidateQueries({
          queryKey: uniswapV4QueryKeys.positionsList({ owner, chainId }),
        });
      },

      /**
       * Invalidate user's multi-chain positions
       */
      invalidateMultiChainPositions: (owner: Address, chainIds: SupportedChainId[]) => {
        return queryClient.invalidateQueries({
          queryKey: uniswapV4QueryKeys.multiChainPositionsList({ owner, chainIds }),
        });
      },

      /**
       * Get position data from cache without refetch
       */
      getPositionFromCache: (tokenId: bigint, chainId: SupportedChainId) => {
        return queryClient.getQueryData<PositionSummary>(uniswapV4QueryKeys.positionDetail(tokenId, chainId));
      },

      /**
       * Invalidate all uniswap-v4 related queries
       */
      invalidateAll: () => {
        return queryClient.invalidateQueries({
          queryKey: uniswapV4QueryKeys.all,
        });
      },

      /**
       * Clear all uniswap-v4 cache
       */
      clearAll: () => {
        queryClient.removeQueries({
          queryKey: uniswapV4QueryKeys.all,
        });
      },
    }),
    [queryClient],
  );
}
