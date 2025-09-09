import type { Chain } from "viem";
import { arbitrum, mainnet } from "viem/chains";

export const UNISWAP_V4_CONFIGS = {
  ethereum: {
    chain: "ethereum" as const,
    viemChain: mainnet,
    positionManagerAddress: "0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e",
    subgraphUrl: "https://gateway.thegraph.com/api/subgraphs/id/G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r",
  },
  arbitrum: {
    chain: "arbitrum" as const,
    viemChain: arbitrum,
    positionManagerAddress: "0xd88f38f930b7952f2db2432cb002e7abbf3dd869",
    stateViewAddress: "0x76fd297e2d437cd7f76d50f01afe6160f86e9990",
    subgraphUrl: "https://gateway.thegraph.com/api/subgraphs/id/G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r",
  },
} as const;

export type SupportedChain = keyof typeof UNISWAP_V4_CONFIGS;
export type UniswapV4Config = (typeof UNISWAP_V4_CONFIGS)[SupportedChain];
