/**
 * Image cache for duplicate detection
 */

import type { ImageCache } from '../types';

const MAX_CACHE_SIZE = 1000;

export class ImageCacheManager {
  private cache: Map<string, ImageCache>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Check if image hash exists in cache
   */
  has(hash: string): boolean {
    return this.cache.has(hash);
  }

  /**
   * Get cached image info by hash
   */
  get(hash: string): ImageCache | undefined {
    return this.cache.get(hash);
  }

  /**
   * Add image to cache
   */
  set(hash: string, url: string, path: string): void {
    // LRU eviction: if cache is full, remove oldest entry
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(hash, {
      hash,
      url,
      path,
      timestamp: Date.now(),
    });
  }

  /**
   * Load cache from persisted data
   */
  load(data: Record<string, ImageCache>): void {
    this.cache.clear();

    // Convert object to Map, sorted by timestamp (oldest first for LRU)
    const entries = Object.entries(data).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    for (const [hash, cacheEntry] of entries) {
      this.cache.set(hash, cacheEntry);
    }

    // Trim to max size if needed
    while (this.cache.size > MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Export cache for persistence
   */
  export(): Record<string, ImageCache> {
    const obj: Record<string, ImageCache> = {};
    for (const [hash, cacheEntry] of this.cache.entries()) {
      obj[hash] = cacheEntry;
    }
    return obj;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}
