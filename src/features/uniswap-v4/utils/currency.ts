import type { Currency } from "@uniswap/sdk-core";
import { Token, Ether } from "@uniswap/sdk-core";
import type { Address } from "viem";

import { isNativeAddress } from "../constants/addresses";

// Re-export for convenience
export { isNativeAddress };

/**
 * Creates a Currency object (Token or Ether) based on the address
 * @param address - Token contract address (zero address for native ETH)
 * @param chainId - Chain ID
 * @param metadata - Token metadata (decimals, symbol, name)
 * @returns Currency object
 */
export function createCurrency(
  address: Address,
  chainId: number,
  metadata: { decimals: number; symbol: string; name?: string },
): Currency {
  if (isNativeAddress(address)) {
    return Ether.onChain(chainId);
  }

  return new Token(chainId, address, metadata.decimals, metadata.symbol, metadata.name);
}
