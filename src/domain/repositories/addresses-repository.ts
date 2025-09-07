import type { AddressesState, ERC20Address } from "domain/entities/addresses";

export interface AddressesRepository {
  getState(): Promise<AddressesState>;
  setState(next: AddressesState): Promise<void>;

  add(address: ERC20Address): Promise<void>;
  remove(id: string): Promise<void>;
  setActive(id: string | undefined): Promise<void>;
}


