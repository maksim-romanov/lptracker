import type { Address } from "viem";

import type { TokenPrice } from "./types";

export interface PriceProviderRepository {
  readonly name: string;
  getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice>;
}
