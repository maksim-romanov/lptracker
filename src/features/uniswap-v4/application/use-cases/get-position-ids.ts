import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import { BaseUseCase } from "../../../../domain/use-cases/base-use-case";
import type { SupportedChainId } from "../../configs";
import { GetPositionIdsDto } from "../../domain/dto/position.dto";
import type { PositionRepository } from "../../domain/repositories";

@injectable()
export class GetPositionIdsUseCase extends BaseUseCase {
  constructor(@inject("PositionRepository") private positionRepository: PositionRepository) {
    super();
  }

  async execute(owner: Address, chainId: SupportedChainId): Promise<bigint[]> {
    return super.execute(async () => {
      const dto = await this.validateDto(GetPositionIdsDto, { owner, chainId });

      return this.positionRepository.getPositionIds(dto.owner, dto.chainId);
    });
  }
}

export async function getPositionIds(owner: Address, chainId: SupportedChainId): Promise<bigint[]> {
  const { getPositionIds: infraGetPositionIds } = await import("../../data/subgraph");
  return infraGetPositionIds(owner, chainId);
}
