import { createPublicClient, http, type PublicClient } from "viem";
import { mainnet, bsc, polygon, avalanche, arbitrum, optimism } from "viem/chains";

import type { SupportedChainId } from "../configs";

export const CHAINLINK_CHAIN_CONFIGS = {
  1: {
    chainId: mainnet.id,
    name: "ethereum" as const,
    viemChain: mainnet,
  },
  56: {
    chainId: bsc.id,
    name: "bsc" as const,
    viemChain: bsc,
  },
  137: {
    chainId: polygon.id,
    name: "polygon" as const,
    viemChain: polygon,
  },
  43114: {
    chainId: avalanche.id,
    name: "avalanche" as const,
    viemChain: avalanche,
  },
  42161: {
    chainId: arbitrum.id,
    name: "arbitrum" as const,
    viemChain: arbitrum,
  },
  10: {
    chainId: optimism.id,
    name: "optimism" as const,
    viemChain: optimism,
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
