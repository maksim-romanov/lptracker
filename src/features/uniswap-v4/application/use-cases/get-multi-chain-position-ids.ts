import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import { GetPositionIdsUseCase } from "./get-position-ids";
import { LogErrors, ValidateParams } from "../../../../domain/decorators";
import { BaseUseCase } from "../../../../domain/use-cases/base-use-case";
import type { SupportedChainId } from "../../configs";
import { GetMultiChainPositionIdsDto } from "../../domain/dto/position.dto";

interface GetMultiChainPositionIdsParams {
  owner: Address;
  chainIds: SupportedChainId[];
}

interface ChainPositionResult {
  chainId: SupportedChainId;
  positions: bigint[];
  error?: Error;
}

interface PositionWithChainId {
  positionId: bigint;
  chainId: SupportedChainId;
}

interface MultiChainPositionIdsResult {
  allPositions: bigint[];
  chainResults: ChainPositionResult[];
  positionsWithChain: PositionWithChainId[];
  totalCount: number;
  successfulChains: SupportedChainId[];
  failedChains: SupportedChainId[];
}

@injectable()
export class GetMultiChainPositionIdsUseCase extends BaseUseCase<
  GetMultiChainPositionIdsParams,
  MultiChainPositionIdsResult
> {
  constructor(@inject("GetPositionIdsUseCase") private getPositionIdsUseCase: GetPositionIdsUseCase) {
    super();
  }

  @LogErrors()
  @ValidateParams(GetMultiChainPositionIdsDto)
  async execute(params: GetMultiChainPositionIdsParams): Promise<MultiChainPositionIdsResult> {
    // Fetch positions from all chains in parallel
    const chainPromises = params.chainIds.map(async (chainId): Promise<ChainPositionResult> => {
      try {
        const positions = await this.getPositionIdsUseCase.execute({ owner: params.owner, chainId });
        return { chainId, positions };
      } catch (error) {
        return {
          chainId,
          positions: [],
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    });

    const chainResults = await Promise.all(chainPromises);

    // Aggregate results
    const allPositions = chainResults.flatMap((result) => result.positions);
    const positionsWithChain = chainResults.flatMap((result) =>
      result.positions.map((positionId) => ({ positionId, chainId: result.chainId })),
    );
    const successfulChains = chainResults.filter((result) => !result.error).map((result) => result.chainId);
    const failedChains = chainResults.filter((result) => result.error).map((result) => result.chainId);

    return {
      allPositions,
      chainResults,
      positionsWithChain,
      totalCount: allPositions.length,
      successfulChains,
      failedChains,
    };
  }
}
