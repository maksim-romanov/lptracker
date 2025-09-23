import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import { LogErrors, ValidateParams } from "../../../../domain/decorators";
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
  @ValidateParams(GetPositionIdsDto)
  async execute(params: GetPositionIdsParams): Promise<bigint[]> {
    return this.positionRepository.getPositionIds(params.owner, params.chainId);
  }
}

export async function getPositionIds(owner: Address, chainId: SupportedChainId): Promise<bigint[]> {
  const { getPositionIds: infraGetPositionIds } = await import("../../data/subgraph");
  return infraGetPositionIds(owner, chainId);
}
