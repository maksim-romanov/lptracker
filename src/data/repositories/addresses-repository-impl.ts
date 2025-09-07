import { appStorage, STORAGE_KEYS } from "data/mmkv/storage";
import type { AddressesState, ERC20Address } from "domain/entities/addresses";
import type { AddressesRepository } from "domain/repositories/addresses-repository";

const DEFAULT_STATE: AddressesState = { items: [], activeAddressId: undefined };

function safeParse(json: string | undefined): AddressesState {
  if (!json) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(json) as AddressesState;
    if (!parsed.items) return DEFAULT_STATE;
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
    const exists = state.items.some((it) => it.id === address.id);
    if (exists) return;
    const next: AddressesState = {
      items: [...state.items, address],
      activeAddressId: state.activeAddressId ?? address.id,
    };
    await this.setState(next);
  }

  async remove(id: string): Promise<void> {
    const state = await this.getState();
    const filtered = state.items.filter((it) => it.id !== id);
    const next: AddressesState = {
      items: filtered,
      activeAddressId: state.activeAddressId === id ? filtered[0]?.id : state.activeAddressId,
    };
    await this.setState(next);
  }

  async setActive(id: string | undefined): Promise<void> {
    const state = await this.getState();
    if (id && !state.items.some((it) => it.id === id)) return;
    await this.setState({ ...state, activeAddressId: id });
  }
}
