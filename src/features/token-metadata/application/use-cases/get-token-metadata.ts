import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import { LogErrors, ValidateParams } from "../../../../domain/decorators";
import { BaseUseCase } from "../../../../domain/use-cases/base-use-case";
import type { Logger, LoggerFactory } from "../../../../infrastructure/logging";
import { GetTokenMetadataDto } from "../../domain/dto/get-token-metadata.dto";
import type { MetadataRepository } from "../../domain/repositories";
import type { TokenMetadata } from "../../domain/types";

interface GetTokenMetadataParams {
  tokenAddress: Address;
  chainId: number;
}

@injectable()
export class GetTokenMetadataUseCase extends BaseUseCase<GetTokenMetadataParams, TokenMetadata> {
  private readonly logger: Logger;

  constructor(
    @inject("MetadataRepository") private metadataRepository: MetadataRepository,
    @inject("LoggerFactory") loggerFactory: LoggerFactory,
  ) {
    super();
    this.logger = loggerFactory.createLogger("GetTokenMetadata");
  }

  @LogErrors()
  @ValidateParams(GetTokenMetadataDto)
  async execute(params: GetTokenMetadataParams): Promise<TokenMetadata> {
    const startTime = Date.now();
    this.logger.debug(`Executing for ${params.tokenAddress} on chain ${params.chainId}`);

    try {
      const metadata = await this.metadataRepository.getTokenMetadata(params.tokenAddress, params.chainId);
      const executionTime = Date.now() - startTime;

      this.logger.info(`SUCCESS: ${metadata.symbol} (${metadata.name}) from ${metadata.source} (${executionTime}ms)`);
      return metadata;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(`ERROR for ${params.tokenAddress} (${executionTime}ms):`, error);
      throw error;
    }
  }
}
