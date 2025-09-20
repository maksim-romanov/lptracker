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

  async removeAddress(address: string): Promise<AddressesState> {
    await this.repository.remove(address);
    return this.repository.getState();
  }

  async setActiveAddress(address: string | undefined): Promise<AddressesState> {
    await this.repository.setActive(address);
    return this.repository.getState();
  }
}
