import { IsArray, IsIn, ArrayMinSize } from "class-validator";
import { injectable } from "tsyringe";

import { AVAILABLE_CHAIN_IDS } from "../../constants/blockchain";
import { LogErrors, ValidateParams } from "../decorators";
import { BaseUseCase } from "./base-use-case";
import type { BlockchainSettings, ChainId } from "../entities/blockchain";
import type { BlockchainRepository } from "../repositories/blockchain-repository";

export class SetActiveChainsDto {
  @IsArray()
  @ArrayMinSize(1, { message: "At least one chain must be active" })
  @IsIn(AVAILABLE_CHAIN_IDS, { each: true, message: "Invalid chain ID" })
  chainIds!: ChainId[];
}

@injectable()
export class BlockchainManagementUseCase extends BaseUseCase<void, void> {
  constructor(private readonly repository: BlockchainRepository) {
    super();
  }

  execute(): Promise<void> {
    throw new Error("This use case doesn't implement the abstract execute method");
  }

  @LogErrors()
  async getSettings(): Promise<BlockchainSettings> {
    return this.repository.getSettings();
  }

  @LogErrors()
  @ValidateParams(SetActiveChainsDto)
  async setActiveChains(chainIds: ChainId[]): Promise<BlockchainSettings> {
    // Validate that all chain IDs are supported
    const invalidChainIds = chainIds.filter((id) => !AVAILABLE_CHAIN_IDS.includes(id));
    if (invalidChainIds.length > 0) {
      throw new Error(`Unsupported chain IDs: ${invalidChainIds.join(", ")}`);
    }

    // Ensure at least one chain is active
    if (chainIds.length === 0) {
      throw new Error("At least one chain must be active");
    }

    // Remove duplicates
    const uniqueChainIds = [...new Set(chainIds)];

    await this.repository.setActiveChains(uniqueChainIds);
    return this.repository.getSettings();
  }

  @LogErrors()
  async enableChain(chainId: ChainId, currentActiveChains: ChainId[]): Promise<BlockchainSettings> {
    if (!AVAILABLE_CHAIN_IDS.includes(chainId)) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    if (currentActiveChains.includes(chainId)) {
      return { activeChainIds: currentActiveChains };
    }

    const newChainIds = [...currentActiveChains, chainId];
    return this.setActiveChains(newChainIds);
  }

  @LogErrors()
  async disableChain(chainId: ChainId, currentActiveChains: ChainId[]): Promise<BlockchainSettings> {
    const newChainIds = currentActiveChains.filter((id) => id !== chainId);

    if (newChainIds.length === 0) {
      throw new Error("Cannot disable last active chain. At least one chain must remain active.");
    }

    return this.setActiveChains(newChainIds);
  }

  isChainSupported(chainId: number): chainId is ChainId {
    return AVAILABLE_CHAIN_IDS.includes(chainId as ChainId);
  }

  validateChainCompatibility(chainIds: ChainId[], supportedChainIds: number[]): ChainId[] {
    return chainIds.filter((chainId) => supportedChainIds.includes(chainId));
  }
}
