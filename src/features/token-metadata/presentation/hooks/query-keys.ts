import type { Address } from "viem";

export const tokenMetadataQueryKeys = {
  all: ["token-metadata"] as const,

  tokenMetadata: (address: Address, chainId: number) =>
    [...tokenMetadataQueryKeys.all, "token", address, chainId] as const,
} as const;

export type TokenMetadataQueryKey =
  | typeof tokenMetadataQueryKeys.all
  | ReturnType<typeof tokenMetadataQueryKeys.tokenMetadata>;
