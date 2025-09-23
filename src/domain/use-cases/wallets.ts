import { Address } from "viem";

import { AddressDto, UpdateWalletDto, WalletDto } from "domain/dto/wallet.dto";
import type { WalletsState, Wallet } from "domain/entities/wallets";
import type { WalletsRepository } from "domain/repositories/wallets-repository";
import type { AlertService } from "domain/services/alert-service";
import type { ToastService } from "domain/services/toast-service";

import { LogErrors, ValidateParams } from "../decorators";
import { BaseUseCase } from "./base-use-case";

export class WalletsUseCase extends BaseUseCase<void, void> {
  constructor(
    private readonly repository: WalletsRepository,
    private readonly toastService: ToastService,
    private readonly alertService: AlertService,
  ) {
    super();
  }

  execute(): Promise<void> {
    throw new Error("This use case doesn't implement the abstract execute method");
  }

  async getState(): Promise<WalletsState> {
    return this.repository.getState();
  }

  @LogErrors()
  @ValidateParams(WalletDto)
  async addWallet(wallet: Wallet): Promise<WalletsState> {
    await this.repository.add({
      address: wallet.address,
      name: wallet.name,
    });
    await this.toastService.showSuccess("Wallet Added", "Wallet has been successfully added");
    return this.repository.getState();
  }

  @ValidateParams(AddressDto)
  async removeWallet(addressData: { address: Address }): Promise<WalletsState> {
    const { address } = addressData;

    return new Promise((resolve, reject) => {
      this.alertService.show({
        title: "Delete Wallet",
        message: "Are you sure you want to delete this wallet? This action cannot be undone.",
        buttons: [
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
                reject(error instanceof Error ? error : new Error("Failed to delete wallet"));
              }
            },
          },
        ],
      });
    });
  }

  @LogErrors()
  async setActiveWallet(address: Address | undefined): Promise<WalletsState> {
    await this.repository.setActive(address);
    return this.repository.getState();
  }

  @LogErrors()
  @ValidateParams(UpdateWalletDto)
  async updateWallet(data: { oldAddress: Address; newAddress: Address; name?: string }): Promise<WalletsState> {
    await this.repository.updateWallet(data.oldAddress, {
      address: data.newAddress,
      name: data.name,
    });
    await this.toastService.showSuccess("Wallet Updated", "Wallet has been successfully updated");
    return this.repository.getState();
  }
}
