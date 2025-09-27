import { injectable } from "tsyringe";

import type { StorageAdapter, StorageConfig } from "../../domain/ports/storage-adapter";

/**
 * In-memory implementation of StorageAdapter for testing and development
 * Stores data in a Map that persists only for the lifetime of the instance
 */
@injectable()
export class InMemoryStorageAdapter implements StorageAdapter {
  private readonly storage = new Map<string, string>();
  private readonly config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  set(key: string, value: string): void {
    this.storage.set(key, value);
  }

  getString(key: string): string | undefined {
    return this.storage.get(key);
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  clearAll(): void {
    this.storage.clear();
  }

  contains(key: string): boolean {
    return this.storage.has(key);
  }

  /**
   * Helper method for testing - get the size of stored data
   */
  getSize(): number {
    return this.storage.size;
  }

  /**
   * Helper method for testing - get storage ID
   */
  getStorageId(): string {
    return this.config.id;
  }
}