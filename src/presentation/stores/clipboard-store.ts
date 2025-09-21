import { computed, makeAutoObservable, runInAction } from "mobx";
import { Address } from "viem";

import { container } from "di/container";
import type { ClipboardData, AddWalletSuggestion } from "domain/entities/clipboard";
import { ClipboardUseCase } from "domain/use-cases/clipboard";

export class ClipboardStore {
  currentData?: ClipboardData = undefined;
  loading = false;

  private readonly clipboardUseCase = container.resolve(ClipboardUseCase);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  @computed
  get hasValidAddress(): boolean {
    return this.currentData?.isValidAddress ?? false;
  }

  @computed
  get validAddress(): Address | null {
    if (this.hasValidAddress && this.currentData?.content) {
      return this.currentData.content as Address;
    }
    return null;
  }

  @computed
  get clipboardContent(): string | null {
    return this.currentData?.content ?? null;
  }

  async checkClipboard(): Promise<void> {
    this.loading = true;
    try {
      const data = await this.clipboardUseCase.checkForValidAddress();
      runInAction(() => {
        this.currentData = data ?? undefined;
      });
    } catch (error) {
      console.error("Failed to check clipboard:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async getClipboardText(): Promise<string> {
    try {
      return await this.clipboardUseCase.getClipboardText();
    } catch (error) {
      console.error("Failed to get clipboard text:", error);
      return "";
    }
  }

  async getClipboardAddress(): Promise<Address | null> {
    try {
      return await this.clipboardUseCase.getClipboardAddress();
    } catch (error) {
      console.error("Failed to get clipboard address:", error);
      return null;
    }
  }

  async shouldShowAddWalletSuggestion(): Promise<AddWalletSuggestion> {
    try {
      return await this.clipboardUseCase.shouldShowAddWalletSuggestion();
    } catch (error) {
      console.error("Failed to check add wallet suggestion:", error);
      return { show: false };
    }
  }
}

export const clipboardStore = new ClipboardStore();
