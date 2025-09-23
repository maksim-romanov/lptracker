import type { Address } from "viem";

import type { MetadataCacheEntry, MetadataCache, TokenMetadata } from "../../domain/types";

export class MemoryMetadataCache implements MetadataCache {
  private cache = new Map<string, MetadataCacheEntry>();
  private readonly maxSize: number;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(maxSize = 1000, cleanupIntervalMs = 60000) {
    this.maxSize = maxSize;
    this.startCleanupInterval(cleanupIntervalMs);
  }

  generateKey(tokenAddress: Address, chainId: number): string {
    return `${tokenAddress.toLowerCase()}-${chainId}`;
  }

  get(key: string): MetadataCacheEntry | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return undefined;
    }

    return entry;
  }

  set(key: string, data: TokenMetadata, ttlMs: number): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const now = new Date();
    const entry: MetadataCacheEntry = {
      data,
      timestamp: now,
      expiresAt: new Date(now.getTime() + ttlMs),
    };

    this.cache.set(key, entry);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.clear();
  }

  private isExpired(entry: MetadataCacheEntry): boolean {
    return entry.expiresAt <= new Date();
  }

  private evictOldest(): void {
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private startCleanupInterval(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, intervalMs);
  }
}
