/**
 * Storage adapter interface for abstracting storage implementations
 * Allows easy testing and different storage backends
 */
export interface StorageAdapter {
  /**
   * Store a string value by key
   */
  set(key: string, value: string): void;

  /**
   * Retrieve a string value by key
   * Returns undefined if key doesn't exist
   */
  getString(key: string): string | undefined;

  /**
   * Delete a value by key
   */
  delete(key: string): void;

  /**
   * Get all keys in storage
   */
  getAllKeys(): string[];

  /**
   * Clear all data from storage
   */
  clearAll(): void;

  /**
   * Check if a key exists in storage
   */
  contains(key: string): boolean;
}

/**
 * Configuration for storage adapters
 */
export interface StorageConfig {
  id: string;
  encryptionKey?: string;
}