import { Alert } from "react-native";
import { Address, isAddress } from "viem";

import type { WalletsState, Wallet } from "domain/entities/wallets";
import type { WalletsRepository } from "domain/repositories/wallets-repository";
import type { NotificationsUseCase } from "domain/use-cases/notifications";

export class WalletsUseCase {
  constructor(
    private readonly repository: WalletsRepository,
    private readonly notificationsUseCase: NotificationsUseCase,
  ) {}

  async getState(): Promise<WalletsState> {
    return this.repository.getState();
  }

  async addWallet(wallet: Wallet): Promise<WalletsState> {
    try {
      if (!this.validateWalletAddress(wallet.address)) {
        throw new Error("Invalid wallet address");
      }

      await this.repository.add(wallet);
      await this.notificationsUseCase.showSuccess("Wallet Added", "Wallet has been successfully added");
      return this.repository.getState();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      await this.notificationsUseCase.showError("Failed to Add Wallet", message);
      throw error;
    }
  }

  async removeWallet(address: Address): Promise<WalletsState> {
    return new Promise((resolve, reject) => {
      Alert.alert("Delete Wallet", "Are you sure you want to delete this wallet? This action cannot be undone.", [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => reject(new Error("User cancelled deletion")),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await this.repository.remove(address);
              const state = await this.repository.getState();
              resolve(state);
            } catch (error) {
              reject(error);
            }
          },
        },
      ]);
    });
  }

  async setActiveWallet(address: Address | undefined): Promise<WalletsState> {
    await this.repository.setActive(address);
    return this.repository.getState();
  }

  async updateWallet(oldAddress: Address, newWallet: Wallet): Promise<WalletsState> {
    try {
      if (!this.validateWalletAddress(newWallet.address)) {
        throw new Error("Invalid wallet address");
      }

      await this.repository.updateWallet(oldAddress, newWallet);
      await this.notificationsUseCase.showSuccess("Wallet Updated", "Wallet has been successfully updated");
      return this.repository.getState();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      await this.notificationsUseCase.showError("Failed to Update Wallet", message);
      throw error;
    }
  }

  private validateWalletAddress(address: string): boolean {
    return isAddress(address);
  }
}