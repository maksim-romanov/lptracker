import { Address, isAddress } from "viem";

import { ClipboardContentDto } from "domain/dto/clipboard.dto";
import type { ClipboardData, AddWalletSuggestion } from "domain/entities/clipboard";
import type { ClipboardRepository } from "domain/repositories/clipboard-repository";

import { LogErrors } from "../decorators";
import { BaseUseCase } from "./base-use-case";

export class ClipboardUseCase extends BaseUseCase<void, void> {
  constructor(private readonly repository: ClipboardRepository) {
    super();
  }

  execute(): Promise<void> {
    throw new Error("This use case doesn't implement the abstract execute method");
  }

  @LogErrors()
  async getClipboardText(): Promise<string> {
    return this.repository.getClipboardContent();
  }

  @LogErrors()
  async getClipboardAddress(): Promise<Address | null> {
    const content = await this.repository.getClipboardContent();
    const trimmedContent = content.trim();

    // Use viem's more reliable address validation
    if (isAddress(trimmedContent)) {
      return trimmedContent as Address;
    }

    return null;
  }

  @LogErrors()
  async checkForValidAddress(): Promise<ClipboardData | null> {
    const content = await this.repository.getClipboardContent();
    const trimmedContent = content.trim();

    // Use viem's more reliable address validation
    const isValid = isAddress(trimmedContent);

    return {
      content: trimmedContent,
      isValidAddress: isValid,
      timestamp: Date.now(),
    };
  }

  @LogErrors()
  async shouldShowAddWalletSuggestion(): Promise<AddWalletSuggestion> {
    const address = await this.getClipboardAddress();

    return {
      show: !!address,
      address: address || undefined,
    };
  }
}
