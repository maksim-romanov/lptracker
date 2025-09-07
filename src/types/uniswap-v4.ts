import { Address } from "viem";

export type SupportedChain = "ethereum" | "arbitrum";

export interface UniswapV4Config {
  chain: SupportedChain;
  positionManagerAddress: Address;
  subgraphUrl: string;
  subgraphKey: string;
}

export interface SubgraphPosition {
  id: string;
  tokenId: string;
  owner: string;
}

export interface PackedPositionInfo {
  getTickUpper(): number;
  getTickLower(): number;
  hasSubscriber(): boolean;
}

export interface PositionDetails {
  tokenId: bigint;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  poolKey: {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
  };
}

export interface UniswapV4Position {
  tokenId: string;
  owner: string;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  poolKey: {
    currency0: string;
    currency1: string;
    fee: number;
    tickSpacing: number;
    hooks: string;
  };
  chain: SupportedChain;
}

export const UNISWAP_V4_CONFIGS: Record<SupportedChain, UniswapV4Config> = {
  ethereum: {
    chain: "ethereum",
    positionManagerAddress: "0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e",
    subgraphUrl: "https://gateway.thegraph.com/api/subgraphs/id/G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r",
    subgraphKey: "483aa90f30cf4a8250dee1c72c643c9d",
  },
  arbitrum: {
    chain: "arbitrum",
    positionManagerAddress: "0xd88f38f930b7952f2db2432cb002e7abbf3dd869",
    subgraphUrl: "https://gateway.thegraph.com/api/subgraphs/id/G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r",
    subgraphKey: "483aa90f30cf4a8250dee1c72c643c9d",
  },
};
