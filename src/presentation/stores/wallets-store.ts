import { computed, makeAutoObservable, runInAction } from "mobx";
import { Address } from "viem";

import { container } from "di/container";
import type { Wallet } from "domain/entities/wallets";
import { WalletsUseCase } from "domain/use-cases/wallets";

export class WalletsStore {
  wallets: Wallet[] = [];
  activeWallet: Address | undefined = undefined;
  loading = false;

  private readonly walletsUseCase = container.resolve(WalletsUseCase);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  @computed
  get active(): string | undefined {
    return this.activeWallet;
  }

  @computed
  get getWalletDisplayName() {
    return (address: Address, maxLength: number = 8): string => {
      const wallet = this.wallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
      if (wallet?.name) {
        return wallet.name;
      }

      if (address.length <= maxLength) {
        return address;
      }

      const start = address.slice(0, 4);
      const end = address.slice(-4);
      return `${start}...${end}`;
    };
  }

  @computed
  get getWalletName() {
    return (address: Address): string | undefined => {
      const wallet = this.wallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
      return wallet?.name;
    };
  }

  isExistingWallet(address: Address): boolean {
    return this.wallets.some((wallet) => wallet.address.toLowerCase() === address.toLowerCase());
  }

  async hydrate(): Promise<void> {
    this.loading = true;
    try {
      const state = await this.walletsUseCase.getState();
      this.updateState(state);
    } catch (error) {
      console.error("Failed to hydrate wallets:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async add(wallet: Wallet): Promise<void> {
    this.loading = true;
    try {
      const state = await this.walletsUseCase.addWallet(wallet);
      this.updateState(state);
    } catch (error) {
      console.error("Failed to add wallet:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async remove(address: Address): Promise<void> {
    this.loading = true;
    try {
      const state = await this.walletsUseCase.removeWallet({ address });
      this.updateState(state);
    } catch (error) {
      if (error instanceof Error && error.message !== "User cancelled deletion") {
        console.error("Failed to remove wallet:", error);
      }
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async setActive(address: Address | undefined): Promise<void> {
    this.loading = true;
    try {
      const state = await this.walletsUseCase.setActiveWallet(address);
      this.updateState(state);
    } catch (error) {
      console.error("Failed to set active wallet:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async update(oldAddress: Address, newWallet: Wallet): Promise<void> {
    this.loading = true;
    try {
      const state = await this.walletsUseCase.updateWallet({
        oldAddress,
        newAddress: newWallet.address,
        name: newWallet.name,
      });
      this.updateState(state);
    } catch (error) {
      console.error("Failed to update wallet:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  private updateState(state: { wallets: Wallet[]; activeWallet?: Address | undefined }): void {
    runInAction(() => {
      this.wallets = state.wallets;
      this.activeWallet = state.activeWallet;
    });
  }
}

export const walletsStore = new WalletsStore();
