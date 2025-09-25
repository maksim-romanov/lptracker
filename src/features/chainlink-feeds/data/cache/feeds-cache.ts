import { injectable } from "tsyringe";
import type { FeedsCache, CacheEntry } from "../../domain/types";

@injectable()
export class MemoryFeedsCache implements FeedsCache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry as CacheEntry<T>;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    const now = new Date();
    const entry: CacheEntry<T> = {
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

    if (new Date() > entry.expiresAt) {
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
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  size(): number {
    return this.cache.size;
  }
}