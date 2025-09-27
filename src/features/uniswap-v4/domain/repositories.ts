import type { Address } from "viem";

import type { SupportedChainId } from "../configs";
import type { PositionDetails, Slot0State, StoredPositionInfo, FeeGrowthSnapshot, FullPositionData } from "./types";

export interface PositionRepository {
  getPositionIds(owner: Address, chainId: SupportedChainId): Promise<bigint[]>;
  getPositionDetails(tokenId: bigint, chainId: SupportedChainId): Promise<PositionDetails>;
  getStoredPositionInfo(tokenId: bigint, chainId: SupportedChainId): Promise<StoredPositionInfo>;
  getFullPositionData(tokenId: bigint, chainId: SupportedChainId): Promise<FullPositionData>;
}

export interface PoolRepository {
  getSlot0State(poolId: string, chainId: SupportedChainId): Promise<Slot0State>;
  getFeeGrowthInside(
    poolId: string,
    tickLower: number,
    tickUpper: number,
    chainId: SupportedChainId,
  ): Promise<FeeGrowthSnapshot>;
}

export interface TokenRepository {
  getTokenMetadata(
    tokenAddress: Address,
    chainId: SupportedChainId,
  ): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  }>;
}
