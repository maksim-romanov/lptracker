import type { BlockchainSettings, ChainId } from "../entities/blockchain";

export interface BlockchainRepository {
  getSettings(): Promise<BlockchainSettings>;
  setActiveChains(chainIds: ChainId[]): Promise<void>;
}
