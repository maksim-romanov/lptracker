import type { AddressesState, ERC20Address } from "domain/entities/addresses";
import type { AddressesRepository } from "domain/repositories/addresses-repository";

export class GetAddressesStateUseCase {
  constructor(private readonly repository: AddressesRepository) {}
  async execute(): Promise<AddressesState> {
    return this.repository.getState();
  }
}

export class AddAddressUseCase {
  constructor(private readonly repository: AddressesRepository) {}
  async execute(address: ERC20Address): Promise<void> {
    return this.repository.add(address);
  }
}

export class RemoveAddressUseCase {
  constructor(private readonly repository: AddressesRepository) {}
  async execute(address: string): Promise<void> {
    return this.repository.remove(address);
  }
}

export class SetActiveAddressUseCase {
  constructor(private readonly repository: AddressesRepository) {}
  async execute(address: string | undefined): Promise<void> {
    return this.repository.setActive(address);
  }
}


