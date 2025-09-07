export interface ERC20Address {
  id: string; // stable id (e.g., hash of address)
  address: string; // 0x-prefixed checksummed address
  name?: string;
}

export interface AddressesState {
  items: ERC20Address[];
  activeAddressId?: string;
}


