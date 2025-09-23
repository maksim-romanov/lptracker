import { mainnet, arbitrum, base, polygon, optimism } from "viem/chains";

// All chain IDs supported by the application
export const AVAILABLE_CHAIN_IDS = [
  mainnet.id, // 1 - Ethereum Mainnet
  arbitrum.id, // 42161 - Arbitrum One
  base.id, // 8453 - Base
  polygon.id, // 137 - Polygon
  optimism.id, // 10 - Optimism
] as const;

// Default active chains (3 main networks)
export const DEFAULT_ACTIVE_CHAIN_IDS = [
  mainnet.id, // 1
  arbitrum.id, // 42161
  base.id, // 8453
] as const;

export type AvailableChainId = (typeof AVAILABLE_CHAIN_IDS)[number];
