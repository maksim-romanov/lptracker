import { makeAutoObservable, runInAction } from "mobx";

import { container } from "di/container";
import type { ERC20Address } from "domain/entities/addresses";
import {
  AddAddressUseCase,
  GetAddressesStateUseCase,
  RemoveAddressUseCase,
  SetActiveAddressUseCase,
} from "domain/use-cases/addresses";

export class AddressesStore {
  items: ERC20Address[] = [];
  activeAddress: string | undefined = undefined;
  loading = false;

  private readonly getState = container.resolve(GetAddressesStateUseCase);
  private readonly addAddress = container.resolve(AddAddressUseCase);
  private readonly removeAddress = container.resolve(RemoveAddressUseCase);
  private readonly setActiveUseCase = container.resolve(SetActiveAddressUseCase);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get active(): string | undefined {
    return this.activeAddress;
  }

  async hydrate(): Promise<void> {
    this.loading = true;
    try {
      const state = await this.getState.execute();

      runInAction(() => {
        this.items = state.items;
        this.activeAddress = state.activeAddress;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async add(address: ERC20Address): Promise<void> {
    await this.addAddress.execute(address);
    await this.hydrate();
  }

  async remove(address: string): Promise<void> {
    await this.removeAddress.execute(address);
    await this.hydrate();
  }

  async setActive(address: string | undefined): Promise<void> {
    await this.setActiveUseCase.execute(address);
    await this.hydrate();
  }
}

export const addressesStore = new AddressesStore();
