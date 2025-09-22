import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import type { SupportedChainId } from "../../configs";
import { isValidNonZeroAddress } from "../../constants/addresses";
import type { PositionRepository } from "../../domain/repositories";

@injectable()
export class GetPositionIdsUseCase {
  constructor(@inject("PositionRepository") private positionRepository: PositionRepository) {}

  async execute(owner: Address, chainId: SupportedChainId): Promise<bigint[]> {
    if (!isValidNonZeroAddress(owner)) {
      throw new Error("Invalid owner address");
    }

    return this.positionRepository.getPositionIds(owner, chainId);
  }
}

export async function getPositionIds(owner: Address, chainId: SupportedChainId): Promise<bigint[]> {
  const { getPositionIds: infraGetPositionIds } = await import("../../infrastructure/subgraph");
  return infraGetPositionIds(owner, chainId);
}
