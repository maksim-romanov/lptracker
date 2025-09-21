import { Address } from "viem";

import { addressesStore } from "presentation/stores/addresses-store";

/**
 * Get the name of an address if it exists in the addresses store
 * @param address - The address to look up
 * @returns The name of the address if found, undefined otherwise
 */
export const getAddressName = (address: Address): string | undefined => {
  return addressesStore.getAddressName(address);
};

/**
 * Get the display name for an address - returns the custom name if available, otherwise returns a shortened address
 * @param address - The address to get display name for
 * @param maxLength - Maximum length for the shortened address (default: 8)
 * @returns The display name for the address
 */
export const getAddressDisplayName = (address: Address, maxLength: number = 8): string => {
  const name = getAddressName(address);
  if (name) {
    return name;
  }

  // Return shortened address: first 4 chars + ... + last 4 chars
  if (address.length <= maxLength) {
    return address;
  }

  const start = address.slice(0, 4);
  const end = address.slice(-4);
  return `${start}...${end}`;
};

/**
 * Check if an address has a custom name
 * @param address - The address to check
 * @returns True if the address has a custom name, false otherwise
 */
export const hasAddressName = (address: Address): boolean => {
  return getAddressName(address) !== undefined;
};
