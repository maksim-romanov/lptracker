import { createPublicClient, http, type PublicClient } from "viem";
import { arbitrum } from "viem/chains";

// For now we focus on Arbitrum as it has proven working feeds
export type SupportedChainId = 42161;

export const CHAINLINK_CHAIN_CONFIGS = {
  42161: {
    chainId: arbitrum.id,
    name: "arbitrum" as const,
    viemChain: arbitrum,
  },
} as const;

export function makeChainlinkClient(chainId: SupportedChainId): PublicClient {
  const config = CHAINLINK_CHAIN_CONFIGS[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return createPublicClient({
    chain: config.viemChain,
    transport: http(), // Uses default RPC from viem
  });
}

export function isValidChainId(chainId: number): chainId is SupportedChainId {
  return chainId in CHAINLINK_CHAIN_CONFIGS;
}

export function getChainConfig(chainId: number) {
  if (!isValidChainId(chainId)) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return CHAINLINK_CHAIN_CONFIGS[chainId];
}
