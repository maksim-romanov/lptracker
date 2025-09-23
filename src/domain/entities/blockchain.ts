import type { AvailableChainId } from "../../constants/blockchain";

export interface BlockchainSettings {
  activeChainIds: AvailableChainId[];
}

export interface ChainInfo {
  chainId: AvailableChainId;
  isActive: boolean;
}

export type ChainId = AvailableChainId;
