import { validate } from "class-validator";
import { injectable } from "tsyringe";
import type { Address } from "viem";

import { BaseUseCase, ValidationException } from "../../../../domain/use-cases/base-use-case";
import { GetChainlinkPriceDto } from "../../domain/dto/chainlink-price.dto";
import type { FeedsMetadataRepository, BlockchainPriceRepository } from "../../domain/repositories";
import type { ChainlinkPrice } from "../../domain/types";

@injectable()
export class GetChainlinkPriceUseCase extends BaseUseCase<GetChainlinkPriceDto, ChainlinkPrice> {
  constructor(
    private readonly feedsMetadataRepository: FeedsMetadataRepository,
    private readonly blockchainPriceRepository: BlockchainPriceRepository,
  ) {
    super();
  }

  async execute(dto: GetChainlinkPriceDto): Promise<ChainlinkPrice> {
    // Validate the DTO
    const validationErrors = await validate(dto);
    if (validationErrors.length > 0) {
      throw new ValidationException(validationErrors);
    }

    return await this.getTokenPrice(dto.tokenAddress, dto.chainId);
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<ChainlinkPrice> {
    // Find the appropriate feed for this token and chain
    const feedLookup = await this.feedsMetadataRepository.findFeedByTokenAddress(tokenAddress, chainId);

    if (!feedLookup) {
      throw new Error(`No Chainlink feed found for token ${tokenAddress} on chain ${chainId}`);
    }

    console.log(`🔍 Attempting to get price from feed: ${feedLookup.feed.name} at ${feedLookup.feed.proxyAddress}`);

    // Get the latest price data using chainId instead of rpcUrl
    const priceData = await this.blockchainPriceRepository.getLatestPrice(feedLookup.feed.proxyAddress, chainId);

    // Convert bigint price to number (handling decimals)
    const price = Number(priceData.price) / Math.pow(10, priceData.decimals);

    return {
      tokenAddress,
      chainId,
      price,
      decimals: priceData.decimals,
      roundId: priceData.roundId,
      updatedAt: new Date(Number(priceData.updatedAt) * 1000),
      feedAddress: feedLookup.feed.proxyAddress,
      feedName: feedLookup.feed.name,
      source: "chainlink",
    };
  }

  async isChainlinkAvailable(): Promise<boolean> {
    try {
      // Check if we can fetch the feeds metadata
      await this.feedsMetadataRepository.getFeedsData();
      return true;
    } catch {
      return false;
    }
  }
}
