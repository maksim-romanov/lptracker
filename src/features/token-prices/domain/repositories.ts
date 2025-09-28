import type { Address } from "viem";

import type { TokenPrice } from "./types";

export interface PriceProviderRepository {
  getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
}
