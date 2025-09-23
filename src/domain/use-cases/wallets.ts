import { Address } from "viem";

import { AddressDto, UpdateWalletDto, WalletDto } from "domain/dto/wallet.dto";
import type { WalletsState, Wallet } from "domain/entities/wallets";
import type { WalletsRepository } from "domain/repositories/wallets-repository";
import type { AlertService } from "domain/services/alert-service";
import type { ToastService } from "domain/services/toast-service";

import { LogErrors } from "../decorators";
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
  async addWallet(wallet: Wallet): Promise<WalletsState> {
    const validatedWallet = await this.validateDto(WalletDto, wallet);

    await this.repository.add({
      address: validatedWallet.address,
      name: validatedWallet.name,
    });
    await this.toastService.showSuccess("Wallet Added", "Wallet has been successfully added");
    return this.repository.getState();
  }

  async removeWallet(address: Address): Promise<WalletsState> {
    const validatedAddress = await this.validateDto(AddressDto, { address });

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
                await this.repository.remove(validatedAddress.address);
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
    if (address) {
      await this.validateDto(AddressDto, { address });
    }

    await this.repository.setActive(address);
    return this.repository.getState();
  }

  @LogErrors()
  async updateWallet(oldAddress: Address, newWallet: Wallet): Promise<WalletsState> {
    const validatedData = await this.validateDto(UpdateWalletDto, {
      oldAddress,
      newAddress: newWallet.address,
      name: newWallet.name,
    });

    await this.repository.updateWallet(validatedData.oldAddress, {
      address: validatedData.newAddress,
      name: validatedData.name,
    });
    await this.toastService.showSuccess("Wallet Updated", "Wallet has been successfully updated");
    return this.repository.getState();
  }
}
