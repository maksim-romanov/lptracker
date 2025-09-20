import { Address } from "viem";

export interface ERC20Address {
  address: Address; // 0x-prefixed checksummed address
  name?: string;
}

export interface AddressesState {
  items: ERC20Address[];
  activeAddress?: Address;
}
