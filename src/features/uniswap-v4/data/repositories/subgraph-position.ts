import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import type { SupportedChainId } from "../../configs";
import type { PositionRepository } from "../../domain/repositories";
import type { PositionDetails, StoredPositionInfo, FullPositionData } from "../../domain/types";
import { getPositionIds } from "../subgraph";
import { ViemPositionRepository } from "./viem-position";

@injectable()
export class SubgraphPositionRepository implements PositionRepository {
  constructor(@inject("ViemPositionRepository") private viemRepository: ViemPositionRepository) {}

  async getPositionIds(owner: Address, chainId: SupportedChainId): Promise<bigint[]> {
    return getPositionIds(owner, chainId);
  }

  async getPositionDetails(tokenId: bigint, chainId: SupportedChainId): Promise<PositionDetails> {
    return this.viemRepository.getPositionDetails(tokenId, chainId);
  }

  async getStoredPositionInfo(tokenId: bigint, chainId: SupportedChainId): Promise<StoredPositionInfo> {
    return this.viemRepository.getStoredPositionInfo(tokenId, chainId);
  }

  async getFullPositionData(tokenId: bigint, chainId: SupportedChainId): Promise<FullPositionData> {
    return this.viemRepository.getFullPositionData(tokenId, chainId);
  }
}
