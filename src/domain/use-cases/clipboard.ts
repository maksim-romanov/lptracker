import { Address, isAddress } from "viem";

import { ClipboardContentDto } from "domain/dto/clipboard.dto";
import type { ClipboardData, AddWalletSuggestion } from "domain/entities/clipboard";
import type { ClipboardRepository } from "domain/repositories/clipboard-repository";

import { BaseUseCase } from "./base-use-case";

export class ClipboardUseCase extends BaseUseCase {
  constructor(private readonly repository: ClipboardRepository) {
    super();
  }

  async getClipboardText(): Promise<string> {
    return this.execute(async () => {
      return this.repository.getClipboardContent();
    });
  }

  async getClipboardAddress(): Promise<Address | null> {
    return this.execute(async () => {
      const content = await this.repository.getClipboardContent();
      const trimmedContent = content.trim();

      // Use viem's more reliable address validation
      if (isAddress(trimmedContent)) {
        return trimmedContent as Address;
      }

      return null;
    });
  }

  async checkForValidAddress(): Promise<ClipboardData | null> {
    return this.execute(async () => {
      const content = await this.repository.getClipboardContent();
      const trimmedContent = content.trim();

      // Use viem's more reliable address validation
      const isValid = isAddress(trimmedContent);

      return {
        content: trimmedContent,
        isValidAddress: isValid,
        timestamp: Date.now(),
      };
    });
  }

  async shouldShowAddWalletSuggestion(): Promise<AddWalletSuggestion> {
    return this.execute(async () => {
      const address = await this.getClipboardAddress();

      return {
        show: !!address,
        address: address || undefined,
      };
    });
  }
}
