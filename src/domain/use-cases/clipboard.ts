import { isAddress, Address } from "viem";

import type { ClipboardData, AddWalletSuggestion } from "domain/entities/clipboard";
import type { ClipboardRepository } from "domain/repositories/clipboard-repository";

export class ClipboardUseCase {
  constructor(private readonly repository: ClipboardRepository) {}

  async getClipboardText(): Promise<string> {
    return this.repository.getClipboardContent();
  }

  async getClipboardAddress(): Promise<Address | null> {
    try {
      const content = await this.repository.getClipboardContent();
      const trimmedContent = content.trim();

      if (isAddress(trimmedContent)) {
        return trimmedContent as Address;
      }

      return null;
    } catch (error) {
      console.error("Failed to get clipboard address:", error);
      return null;
    }
  }

  async checkForValidAddress(): Promise<ClipboardData | null> {
    try {
      const content = await this.repository.getClipboardContent();
      const trimmedContent = content.trim();
      const isValid = isAddress(trimmedContent);

      return {
        content: trimmedContent,
        isValidAddress: isValid,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Failed to check clipboard for valid address:", error);
      return null;
    }
  }

  async shouldShowAddWalletSuggestion(): Promise<AddWalletSuggestion> {
    const address = await this.getClipboardAddress();

    return {
      show: !!address,
      address: address || undefined,
    };
  }
}