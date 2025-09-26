import type { Address } from "viem";

export const tokenPricesQueryKeys = {
  all: ["token-prices"] as const,

  singlePrice: (address: Address, chainId: number) =>
    [...tokenPricesQueryKeys.all, "single", address, chainId] as const,
} as const;

export type TokenPricesQueryKey =
  | typeof tokenPricesQueryKeys.all
  | ReturnType<typeof tokenPricesQueryKeys.singlePrice>;