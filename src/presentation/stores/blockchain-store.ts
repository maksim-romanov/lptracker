import { computed, makeAutoObservable, runInAction } from "mobx";

import { AVAILABLE_CHAIN_IDS, DEFAULT_ACTIVE_CHAIN_IDS } from "../../constants/blockchain";
import { container } from "../../di/container";
import type { BlockchainSettings, ChainId, ChainInfo } from "../../domain/entities/blockchain";
import { BlockchainManagementUseCase } from "../../domain/use-cases/blockchain";

export class BlockchainStore {
  activeChainIds: ChainId[] = [...DEFAULT_ACTIVE_CHAIN_IDS];
  loading = false;

  private readonly blockchainManagement = container.resolve(BlockchainManagementUseCase);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  @computed
  get availableChainIds(): ChainId[] {
    return [...AVAILABLE_CHAIN_IDS];
  }

  @computed
  get chainInfos(): ChainInfo[] {
    return AVAILABLE_CHAIN_IDS.map((chainId) => ({
      chainId,
      isActive: this.activeChainIds.includes(chainId),
    }));
  }

  isChainActive = (chainId: ChainId): boolean => {
    return this.activeChainIds.includes(chainId);
  };

  async enableChain(chainId: ChainId): Promise<void> {
    if (this.isChainActive(chainId)) return;

    this.loading = true;
    try {
      const newChainIds = [...this.activeChainIds, chainId];
      const settings = await this.blockchainManagement.setActiveChains(newChainIds);
      this.updateSettings(settings);
    } catch (error) {
      console.error("Failed to enable chain:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async disableChain(chainId: ChainId): Promise<void> {
    if (!this.isChainActive(chainId)) return;

    this.loading = true;
    try {
      const newChainIds = this.activeChainIds.filter((id) => id !== chainId);
      const settings = await this.blockchainManagement.setActiveChains(newChainIds);
      this.updateSettings(settings);
    } catch (error) {
      console.error("Failed to disable chain:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async toggleChain(chainId: ChainId): Promise<void> {
    if (this.isChainActive(chainId)) {
      await this.disableChain(chainId);
    } else {
      await this.enableChain(chainId);
    }
  }

  async setActiveChains(chainIds: ChainId[]): Promise<void> {
    this.loading = true;
    try {
      const settings = await this.blockchainManagement.setActiveChains(chainIds);
      this.updateSettings(settings);
    } catch (error) {
      console.error("Failed to set active chains:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async hydrate(): Promise<void> {
    this.loading = true;
    try {
      const settings = await this.blockchainManagement.getSettings();
      this.updateSettings(settings);
    } catch (error) {
      console.error("Failed to hydrate blockchain settings:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  private updateSettings(settings: BlockchainSettings): void {
    runInAction(() => {
      this.activeChainIds = settings.activeChainIds;
    });
  }
}

export const blockchainStore = new BlockchainStore();
