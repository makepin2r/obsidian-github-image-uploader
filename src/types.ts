/**
 * Shared TypeScript interfaces for GitHub Image Uploader plugin
 */

export interface UploadResult {
  id: string;          // Unique identifier (hash)
  path: string;        // Storage path in repository
  url?: string;        // Public URL (MVP only)
}

export interface RenderTarget {
  type: 'url' | 'blob';  // MVP uses 'url', future: 'blob'
  value: string;
}

export interface RateLimitInfo {
  remaining: number;
  reset: number;        // Unix epoch timestamp
  limit: number;
}

export interface ImageCache {
  hash: string;
  url: string;
  path: string;
  timestamp: number;
}

export interface UploadMetrics {
  hashTime: number;
  uploadTime: number;
  totalTime: number;
}
