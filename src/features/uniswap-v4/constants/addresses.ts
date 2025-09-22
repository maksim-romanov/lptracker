import type { Address } from "viem";

/**
 * The zero address (0x0000...0000) used in Ethereum to represent native ETH
 */
export const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

/**
 * Checks if the given address is the zero address (native ETH)
 * @param address - The address to check
 * @returns true if the address is the zero address
 */
export function isNativeAddress(address: Address): boolean {
  return address.toLowerCase() === ZERO_ADDRESS;
}

/**
 * Checks if the given address is a valid non-zero address
 * @param address - The address to check
 * @returns true if the address is valid and not zero
 */
export function isValidNonZeroAddress(address: Address | string): boolean {
  if (!address) return false;
  return address.toLowerCase() !== ZERO_ADDRESS;
}
