import type { Address } from "viem";

export const chainlinkQueryKeys = {
  all: ["chainlink"] as const,
  prices: () => [...chainlinkQueryKeys.all, "prices"] as const,
  price: (tokenAddress: Address, chainId: number) => [...chainlinkQueryKeys.prices(), tokenAddress, chainId] as const,
  availability: () => [...chainlinkQueryKeys.all, "availability"] as const,
};
