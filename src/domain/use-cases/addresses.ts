import { Alert } from "react-native";
import { Address } from "viem";

import type { AddressesState, ERC20Address } from "domain/entities/addresses";
import type { AddressesRepository } from "domain/repositories/addresses-repository";

export class AddressesManagementUseCase {
  constructor(private readonly repository: AddressesRepository) {}

  async getState(): Promise<AddressesState> {
    return this.repository.getState();
  }

  async addAddress(address: ERC20Address): Promise<AddressesState> {
    await this.repository.add(address);
    return this.repository.getState();
  }

  async removeAddress(address: Address): Promise<AddressesState> {
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

  async setActiveAddress(address: Address | undefined): Promise<AddressesState> {
    await this.repository.setActive(address);
    return this.repository.getState();
  }

  async updateAddress(oldAddress: Address, newAddress: ERC20Address): Promise<AddressesState> {
    await this.repository.updateAddress(oldAddress, newAddress);
    return this.repository.getState();
  }
}
