export interface ERC20Address {
  address: string; // 0x-prefixed checksummed address
  name?: string;
}

export interface AddressesState {
  items: ERC20Address[];
  activeAddress?: string;
}
