import { Address } from "viem";

export interface Wallet {
  address: Address;
  name?: string;
}

export interface WalletsState {
  wallets: Wallet[];
  activeWallet?: Address;
}

export interface WalletsData {
  version: number;
  wallets: Wallet[];
  activeWallet?: Address;
}
