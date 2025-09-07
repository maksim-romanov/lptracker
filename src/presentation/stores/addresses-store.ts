import { makeAutoObservable, runInAction } from "mobx";

import { container } from "di/container";
import type { ERC20Address } from "domain/entities/addresses";
import { AddAddressUseCase, GetAddressesStateUseCase, RemoveAddressUseCase, SetActiveAddressUseCase } from "domain/use-cases/addresses";

export class AddressesStore {
  items: ERC20Address[] = [];
  activeAddressId: string | undefined = undefined;
  loading = false;

  private readonly getState = container.resolve(GetAddressesStateUseCase);
  private readonly addAddress = container.resolve(AddAddressUseCase);
  private readonly removeAddress = container.resolve(RemoveAddressUseCase);
  private readonly setActiveUseCase = container.resolve(SetActiveAddressUseCase);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get activeAddress(): string | undefined {
    return this.items.find((it) => it.id === this.activeAddressId)?.address;
  }

  async hydrate(): Promise<void> {
    this.loading = true;
    try {
      const state = await this.getState.execute();
      runInAction(() => {
        this.items = state.items;
        this.activeAddressId = state.activeAddressId;
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

  async remove(id: string): Promise<void> {
    await this.removeAddress.execute(id);
    await this.hydrate();
  }

  async setActive(id: string | undefined): Promise<void> {
    await this.setActiveUseCase.execute(id);
    runInAction(() => {
      this.activeAddressId = id;
    });
  }
}

export const addressesStore = new AddressesStore();


