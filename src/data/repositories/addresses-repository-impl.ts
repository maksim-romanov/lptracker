import { Address } from "viem";

import { appStorage, STORAGE_KEYS } from "data/mmkv/storage";
import type { AddressesState, ERC20Address } from "domain/entities/addresses";
import type { AddressesRepository } from "domain/repositories/addresses-repository";

const DEFAULT_STATE: AddressesState = { items: [], activeAddress: undefined };

function safeParse(json: string | undefined): AddressesState {
  if (!json) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(json) as AddressesState;
    if (!parsed || !Array.isArray(parsed.items)) return DEFAULT_STATE;
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export class AddressesRepositoryImpl implements AddressesRepository {
  async getState(): Promise<AddressesState> {
    const raw = appStorage.getString(STORAGE_KEYS.addresses);
    return safeParse(raw);
  }

  async setState(next: AddressesState): Promise<void> {
    appStorage.set(STORAGE_KEYS.addresses, JSON.stringify(next));
  }

  async add(address: ERC20Address): Promise<void> {
    const state = await this.getState();
    const normalized = address.address;
    const exists = state.items.some((it) => it.address === normalized);
    if (exists) return;
    const next: AddressesState = {
      items: [...state.items, { address: normalized, name: address.name }],
      activeAddress: state.activeAddress ?? normalized,
    };
    await this.setState(next);
  }

  async remove(address: Address): Promise<void> {
    const state = await this.getState();
    const filtered = state.items.filter((it) => it.address !== address);
    const next: AddressesState = {
      items: filtered,
      activeAddress: state.activeAddress === address ? filtered[0]?.address : state.activeAddress,
    };
    await this.setState(next);
  }

  async setActive(address: Address): Promise<void> {
    const state = await this.getState();
    if (address && !state.items.some((it) => it.address === address)) return;
    await this.setState({ ...state, activeAddress: address });
  }
}
