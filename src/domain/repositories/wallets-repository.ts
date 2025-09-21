import { Address } from "viem";

import type { WalletsState, Wallet } from "domain/entities/wallets";

export interface WalletsRepository {
  getState(): Promise<WalletsState>;
  setState(next: WalletsState): Promise<void>;

  add(wallet: Wallet): Promise<void>;
  remove(address: Address): Promise<void>;
  updateWallet(oldAddress: Address, newWallet: Wallet): Promise<void>;
  setActive(address: Address | undefined): Promise<void>;
}
