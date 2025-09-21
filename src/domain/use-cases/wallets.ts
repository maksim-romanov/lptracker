import { Alert } from "react-native";
import { Address, isAddress } from "viem";

import type { WalletsState, Wallet } from "domain/entities/wallets";
import type { WalletsRepository } from "domain/repositories/wallets-repository";

export class WalletsUseCase {
  constructor(private readonly repository: WalletsRepository) {}

  async getState(): Promise<WalletsState> {
    return this.repository.getState();
  }

  async addWallet(wallet: Wallet): Promise<WalletsState> {
    if (!this.validateWalletAddress(wallet.address)) {
      throw new Error("Invalid wallet address");
    }

    await this.repository.add(wallet);
    return this.repository.getState();
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
    if (!this.validateWalletAddress(newWallet.address)) {
      throw new Error("Invalid wallet address");
    }

    await this.repository.updateWallet(oldAddress, newWallet);
    return this.repository.getState();
  }

  private validateWalletAddress(address: string): boolean {
    return isAddress(address);
  }
}