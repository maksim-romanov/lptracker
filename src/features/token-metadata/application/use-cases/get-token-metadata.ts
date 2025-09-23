import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import { LogErrors } from "../../../../domain/decorators";
import { BaseUseCase } from "../../../../domain/use-cases/base-use-case";
import { GetTokenMetadataDto } from "../../domain/dto/get-token-metadata.dto";
import type { MetadataRepository } from "../../domain/repositories";
import type { TokenMetadata } from "../../domain/types";

interface GetTokenMetadataParams {
  tokenAddress: Address;
  chainId: number;
}

@injectable()
export class GetTokenMetadataUseCase extends BaseUseCase<GetTokenMetadataParams, TokenMetadata> {
  constructor(@inject("MetadataRepository") private metadataRepository: MetadataRepository) {
    super();
  }

  @LogErrors()
  async execute(params: GetTokenMetadataParams): Promise<TokenMetadata> {
    await this.validateDto(GetTokenMetadataDto, params);

    return this.metadataRepository.getTokenMetadata(params.tokenAddress, params.chainId);
  }
}
