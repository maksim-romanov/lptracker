import { Address } from "viem";

import type { AddressesState, ERC20Address } from "domain/entities/addresses";

export interface AddressesRepository {
  getState(): Promise<AddressesState>;
  setState(next: AddressesState): Promise<void>;

  add(address: ERC20Address): Promise<void>;
  remove(address: Address): Promise<void>;
  updateAddress(oldAddress: Address, newAddress: ERC20Address): Promise<void>;
  setActive(address: Address | undefined): Promise<void>;
}
