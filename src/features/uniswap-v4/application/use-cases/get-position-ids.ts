import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import { LogErrors } from "../../../../domain/decorators";
import { BaseUseCase } from "../../../../domain/use-cases/base-use-case";
import type { SupportedChainId } from "../../configs";
import { GetPositionIdsDto } from "../../domain/dto/position.dto";
import type { PositionRepository } from "../../domain/repositories";

interface GetPositionIdsParams {
  owner: Address;
  chainId: SupportedChainId;
}

@injectable()
export class GetPositionIdsUseCase extends BaseUseCase<GetPositionIdsParams, bigint[]> {
  constructor(@inject("PositionRepository") private positionRepository: PositionRepository) {
    super();
  }

  @LogErrors()
  async execute(params: GetPositionIdsParams): Promise<bigint[]> {
    const dto = await this.validateDto(GetPositionIdsDto, params);

    return this.positionRepository.getPositionIds(dto.owner, dto.chainId as SupportedChainId);
  }
}

export async function getPositionIds(owner: Address, chainId: SupportedChainId): Promise<bigint[]> {
  const { getPositionIds: infraGetPositionIds } = await import("../../data/subgraph");
  return infraGetPositionIds(owner, chainId);
}
