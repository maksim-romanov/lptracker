import type { Address } from "viem";

import type { TokenMetadata } from "./types";

export interface MetadataRepository {
  getTokenMetadata(tokenAddress: Address, chainId: number): Promise<TokenMetadata>;
}

export interface MetadataProviderRepository {
  getTokenMetadata(tokenAddress: Address, chainId: number): Promise<TokenMetadata>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
}
