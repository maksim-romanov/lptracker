import type { Address } from "viem";

import type { SupportedChainId } from "../../configs";

export const uniswapV4QueryKeys = {
  all: ["uniswap-v4"] as const,

  positions: () => [...uniswapV4QueryKeys.all, "positions"] as const,

  positionsList: (filters: { owner?: Address; chainId?: SupportedChainId }) =>
    [...uniswapV4QueryKeys.positions(), "list", filters] as const,

  multiChainPositionsList: (filters: { owner?: Address; chainIds?: SupportedChainId[] }) =>
    [...uniswapV4QueryKeys.positions(), "multi-chain-list", filters] as const,

  positionDetail: (tokenId: string | bigint, chainId: SupportedChainId) =>
    [
      ...uniswapV4QueryKeys.positions(),
      "detail",
      typeof tokenId === "bigint" ? tokenId.toString() : tokenId,
      chainId,
    ] as const,
} as const;

export type UniswapV4QueryKey = ReturnType<(typeof uniswapV4QueryKeys)[keyof typeof uniswapV4QueryKeys]>;
