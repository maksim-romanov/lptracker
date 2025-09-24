import { injectable } from "tsyringe";
import type { Address } from "viem";

import type { Logger, LoggerFactory } from "../../../../infrastructure/logging";
import type { MetadataRepository } from "../../domain/repositories";
import type { TokenMetadata } from "../../domain/types";
import { MemoryMetadataCache } from "../cache/memory-metadata-cache";

@injectable()
export class CachedMetadataRepository implements MetadataRepository {
  private readonly cache: MemoryMetadataCache;
  private readonly defaultTtlMs: number;
  private readonly logger: Logger;

  constructor(
    private readonly wrappedRepository: MetadataRepository,
    loggerFactory: LoggerFactory,
    ttlMs = 24 * 60 * 60 * 1000, // 24 hours default (metadata changes rarely)
    maxCacheSize = 1000,
  ) {
    this.logger = loggerFactory.createLogger("CachedMetadataRepository");
    this.cache = new MemoryMetadataCache(maxCacheSize);
    this.defaultTtlMs = ttlMs;
  }

  async getTokenMetadata(tokenAddress: Address, chainId: number): Promise<TokenMetadata> {
    const startTime = Date.now();
    const cacheKey = this.cache.generateKey(tokenAddress, chainId);

    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry) {
      const cacheHitTime = Date.now() - startTime;
      this.logger.debug(`Cache HIT for ${tokenAddress} on chain ${chainId} (${cacheHitTime}ms)`);
      return cachedEntry.data;
    }

    this.logger.debug(`Cache MISS for ${tokenAddress} on chain ${chainId}`);

    try {
      const metadata = await this.wrappedRepository.getTokenMetadata(tokenAddress, chainId);
      this.cache.set(cacheKey, metadata, this.defaultTtlMs);

      const totalTime = Date.now() - startTime;
      this.logger.debug(
        `Cache STORE for ${tokenAddress} (${metadata.symbol}) from ${metadata.source} (${totalTime}ms)`,
      );

      return metadata;
    } catch (error) {
      const errorTime = Date.now() - startTime;
      this.logger.error(`Cache ERROR for ${tokenAddress} on chain ${chainId} (${errorTime}ms):`, error);
      throw error;
    }
  }

  getCacheStats(): { size: number; maxSize: number } {
    const stats = {
      size: this.cache.size(),
      maxSize: 1000,
    };
    this.logger.debug(`Cache stats: ${stats.size}/${stats.maxSize} entries`);
    return stats;
  }

  clearCache(): void {
    const sizeBefore = this.cache.size();
    this.cache.clear();
    this.logger.info(`Cache cleared: ${sizeBefore} entries removed`);
  }

  destroy(): void {
    const sizeBefore = this.cache.size();
    this.cache.destroy();
    this.logger.info(`Cache destroyed: ${sizeBefore} entries`);
  }
}
