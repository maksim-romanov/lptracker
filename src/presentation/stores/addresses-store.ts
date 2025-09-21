import { makeAutoObservable, runInAction } from "mobx";
import { Address } from "viem";

import { container } from "di/container";
import type { ERC20Address } from "domain/entities/addresses";
import { AddressesManagementUseCase } from "domain/use-cases/addresses";

export class AddressesStore {
  items: ERC20Address[] = [];
  activeAddress: Address | undefined = undefined;
  loading = false;

  private readonly addressesManagement = container.resolve(AddressesManagementUseCase);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get active(): string | undefined {
    return this.activeAddress;
  }

  getAddressName(address: Address): string | undefined {
    const item = this.items.find((item) => item.address.toLowerCase() === address.toLowerCase());
    return item?.name;
  }

  async hydrate(): Promise<void> {
    this.loading = true;
    try {
      const state = await this.addressesManagement.getState();
      this.updateState(state);
    } catch (error) {
      console.error("Failed to hydrate addresses:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async add(address: ERC20Address): Promise<void> {
    this.loading = true;
    try {
      const state = await this.addressesManagement.addAddress(address);
      this.updateState(state);
    } catch (error) {
      console.error("Failed to add address:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async remove(address: Address): Promise<void> {
    this.loading = true;
    try {
      const state = await this.addressesManagement.removeAddress(address);
      this.updateState(state);
    } catch (error) {
      // Don't log error if user cancelled the deletion
      if (error instanceof Error && error.message !== "User cancelled deletion") {
        console.error("Failed to remove address:", error);
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
      const state = await this.addressesManagement.setActiveAddress(address);
      this.updateState(state);
    } catch (error) {
      console.error("Failed to set active address:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async update(oldAddress: Address, newAddress: ERC20Address): Promise<void> {
    this.loading = true;
    try {
      const state = await this.addressesManagement.updateAddress(oldAddress, newAddress);
      this.updateState(state);
    } catch (error) {
      console.error("Failed to update address:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  private updateState(state: { items: ERC20Address[]; activeAddress?: Address | undefined }): void {
    runInAction(() => {
      this.items = state.items;
      this.activeAddress = state.activeAddress;
    });
  }
}

export const addressesStore = new AddressesStore();
