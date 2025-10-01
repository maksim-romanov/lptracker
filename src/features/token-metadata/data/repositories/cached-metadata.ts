import { injectable } from "tsyringe";
import type { Address } from "viem";

import type { MetadataRepository } from "../../domain/repositories";
import type { TokenMetadata } from "../../domain/types";
import { MemoryMetadataCache } from "../cache/memory-metadata-cache";

@injectable()
export class CachedMetadataRepository implements MetadataRepository {
  private readonly cache: MemoryMetadataCache;
  private readonly defaultTtlMs: number;

  constructor(
    private readonly wrappedRepository: MetadataRepository,
    ttlMs = 24 * 60 * 60 * 1000, // 24 hours default (metadata changes rarely)
    maxCacheSize = 1000,
  ) {
    this.cache = new MemoryMetadataCache(maxCacheSize);
    this.defaultTtlMs = ttlMs;
  }

  async getTokenMetadata(tokenAddress: Address, chainId: number): Promise<TokenMetadata> {
    const cacheKey = this.cache.generateKey(tokenAddress, chainId);

    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry) {
      return cachedEntry.data;
    }

    const metadata = await this.wrappedRepository.getTokenMetadata(tokenAddress, chainId);
    this.cache.set(cacheKey, metadata, this.defaultTtlMs);

    return metadata;
  }

  getCacheStats(): { size: number; maxSize: number } {
    const stats = {
      size: this.cache.size(),
      maxSize: 1000,
    };
    return stats;
  }

  clearCache(): void {
    this.cache.clear();
  }

  destroy(): void {
    this.cache.destroy();
  }
}
