import { MMKV } from "react-native-mmkv";
import { injectable } from "tsyringe";

import type { StorageAdapter, StorageConfig } from "../../domain/ports/storage-adapter";

/**
 * MMKV implementation of StorageAdapter for React Native
 * Provides encrypted, high-performance key-value storage
 */
@injectable()
export class MmkvStorageAdapter implements StorageAdapter {
  private readonly mmkv: MMKV;

  constructor(config: StorageConfig) {
    this.mmkv = new MMKV({
      id: config.id,
      encryptionKey: config.encryptionKey,
    });
  }

  set(key: string, value: string): void {
    this.mmkv.set(key, value);
  }

  getString(key: string): string | undefined {
    return this.mmkv.getString(key);
  }

  delete(key: string): void {
    this.mmkv.delete(key);
  }

  getAllKeys(): string[] {
    return this.mmkv.getAllKeys();
  }

  clearAll(): void {
    this.mmkv.clearAll();
  }

  contains(key: string): boolean {
    return this.mmkv.contains(key);
  }
}
