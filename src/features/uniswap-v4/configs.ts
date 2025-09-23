import { arbitrum } from "viem/chains";

import type { ChainId } from "../../domain/entities/blockchain";

export const UNISWAP_V4_CONFIGS = {
  42_161: {
    chainId: arbitrum.id,
    name: "arbitrum" as const,
    viemChain: arbitrum,
    positionManagerAddress: "0xd88f38f930b7952f2db2432cb002e7abbf3dd869",
    PositionDescriptor: "0xe2023f3fa515cf070e07fd9d51c1d236e07843f4",
    stateViewAddress: "0x76fd297e2d437cd7f76d50f01afe6160f86e9990",
    PoolManager: "0x360e68faccca8ca495c1b759fd9eee466db9fb32",
    Quoter: "0x3972c00f7ed4885e145823eb7c655375d275a1c5",
    UniversalRouter: "0xa51afafe0263b40edaef0df8781ea9aa03e381a3",
    Permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    subgraphUrl: "https://gateway.thegraph.com/api/subgraphs/id/G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r",
  },
} as const;

// Chain IDs supported by Uniswap V4
export const UNISWAP_V4_SUPPORTED_CHAIN_IDS = [arbitrum.id] as const satisfies readonly ChainId[];

export type SupportedChainId = keyof typeof UNISWAP_V4_CONFIGS;
export type UniswapV4Config = (typeof UNISWAP_V4_CONFIGS)[SupportedChainId];

// Helper functions for chain validation
export function isValidChainId(chainId: number): chainId is SupportedChainId {
  return chainId in UNISWAP_V4_CONFIGS;
}

export function getChainConfig(chainId: number): UniswapV4Config {
  if (!isValidChainId(chainId)) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return UNISWAP_V4_CONFIGS[chainId];
}

// Type guard function to check if a chain ID is supported by Uniswap V4
export function isUniswapV4SupportedChain(chainId: ChainId): chainId is SupportedChainId {
  return (UNISWAP_V4_SUPPORTED_CHAIN_IDS as readonly ChainId[]).includes(chainId);
}
