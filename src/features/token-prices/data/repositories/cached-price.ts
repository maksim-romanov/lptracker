import { injectable } from "tsyringe";
import type { Address } from "viem";

import type { PriceRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";
import { MemoryPriceCache } from "../cache/memory-cache";

@injectable()
export class CachedPriceRepository implements PriceRepository {
  private readonly cache: MemoryPriceCache;
  private readonly defaultTtlMs: number;

  constructor(
    private readonly wrappedRepository: PriceRepository,
    ttlMs = 60000, // 1 minute default
    maxCacheSize = 1000,
  ) {
    this.cache = new MemoryPriceCache(maxCacheSize);
    this.defaultTtlMs = ttlMs;
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    const cacheKey = this.cache.generateKey(tokenAddress, chainId);

    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry) {
      return cachedEntry.data;
    }

    try {
      const price = await this.wrappedRepository.getTokenPrice(tokenAddress, chainId);
      this.cache.set(cacheKey, price, this.defaultTtlMs);
      return price;
    } catch (error) {
      throw error;
    }
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size(),
      maxSize: 1000, // Could be made configurable
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  destroy(): void {
    this.cache.destroy();
  }
}
