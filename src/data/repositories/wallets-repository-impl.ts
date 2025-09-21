import { Address } from "viem";

import { appStorage, STORAGE_KEYS } from "data/mmkv/storage";
import type { WalletsState, Wallet, WalletsData } from "domain/entities/wallets";
import type { WalletsRepository } from "domain/repositories/wallets-repository";

const DEFAULT_STATE: WalletsState = { wallets: [], activeWallet: undefined };

function safeParse(json: string | undefined): WalletsState {
  if (!json) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(json) as WalletsData;
    if (!parsed || !Array.isArray(parsed.wallets)) return DEFAULT_STATE;

    return {
      wallets: parsed.wallets,
      activeWallet: parsed.activeWallet,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function createWalletsData(state: WalletsState): WalletsData {
  return {
    version: 1,
    wallets: state.wallets,
    activeWallet: state.activeWallet,
  };
}

export class WalletsRepositoryImpl implements WalletsRepository {
  async getState(): Promise<WalletsState> {
    const raw = appStorage.getString(STORAGE_KEYS.wallets);
    return safeParse(raw);
  }

  async setState(next: WalletsState): Promise<void> {
    const data = createWalletsData(next);
    appStorage.set(STORAGE_KEYS.wallets, JSON.stringify(data));
  }

  async add(wallet: Wallet): Promise<void> {
    const state = await this.getState();
    const normalized = wallet.address;
    const exists = state.wallets.some((w) => w.address === normalized);
    if (exists) return;

    const next: WalletsState = {
      wallets: [...state.wallets, { address: normalized, name: wallet.name }],
      activeWallet: state.activeWallet ?? normalized,
    };
    await this.setState(next);
  }

  async remove(address: Address): Promise<void> {
    const state = await this.getState();
    const filtered = state.wallets.filter((w) => w.address !== address);
    const next: WalletsState = {
      wallets: filtered,
      activeWallet: state.activeWallet === address ? filtered[0]?.address : state.activeWallet,
    };
    await this.setState(next);
  }

  async updateWallet(oldAddress: Address, newWallet: Wallet): Promise<void> {
    const state = await this.getState();
    const updatedWallets = state.wallets.map((wallet) =>
      wallet.address === oldAddress ? { address: newWallet.address, name: newWallet.name } : wallet,
    );

    const next: WalletsState = {
      wallets: updatedWallets,
      activeWallet: state.activeWallet === oldAddress ? newWallet.address : state.activeWallet,
    };
    await this.setState(next);
  }

  async setActive(address: Address | undefined): Promise<void> {
    const state = await this.getState();
    if (address && !state.wallets.some((w) => w.address === address)) return;
    await this.setState({ ...state, activeWallet: address });
  }
}