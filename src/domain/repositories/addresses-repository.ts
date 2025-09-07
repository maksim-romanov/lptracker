import type { AddressesState, ERC20Address } from "domain/entities/addresses";

export interface AddressesRepository {
  getState(): Promise<AddressesState>;
  setState(next: AddressesState): Promise<void>;

  add(address: ERC20Address): Promise<void>;
  remove(address: string): Promise<void>;
  setActive(address: string | undefined): Promise<void>;
}
