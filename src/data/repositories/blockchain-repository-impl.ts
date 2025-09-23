import { DEFAULT_ACTIVE_CHAIN_IDS } from "../../constants/blockchain";
import type { BlockchainSettings, ChainId } from "../../domain/entities/blockchain";
import type { BlockchainRepository } from "../../domain/repositories/blockchain-repository";
import { appStorage, STORAGE_KEYS } from "../mmkv/storage";

const DEFAULT_BLOCKCHAIN_SETTINGS: BlockchainSettings = {
  activeChainIds: [...DEFAULT_ACTIVE_CHAIN_IDS],
};

export class BlockchainRepositoryImpl implements BlockchainRepository {
  async getSettings(): Promise<BlockchainSettings> {
    try {
      const raw = appStorage.getString(STORAGE_KEYS.blockchain);
      if (!raw) return DEFAULT_BLOCKCHAIN_SETTINGS;
      const parsed = JSON.parse(raw) as BlockchainSettings;
      return parsed;
    } catch {
      return DEFAULT_BLOCKCHAIN_SETTINGS;
    }
  }

  async setActiveChains(chainIds: ChainId[]): Promise<void> {
    const current = await this.getSettings();
    const next: BlockchainSettings = { ...current, activeChainIds: chainIds };
    appStorage.set(STORAGE_KEYS.blockchain, JSON.stringify(next));
  }
}
