/**
 * Public GitHub repository storage implementation
 */

import type { StorageMode } from './storageMode';
import type { UploadResult, RenderTarget } from '../types';
import type { GitHubImageUploaderSettings } from '../settings';
import { GitHubClient } from '../github/githubClient';
import { computeSHA1 } from '../images/hashUtils';
import { generateFilename, expandPathTemplate } from '../images/filenameStrategies';
import { ImageCacheManager } from '../images/imageCache';
import { Notice } from 'obsidian';

export class PublicGitHubStorage implements StorageMode {
  private githubClient: GitHubClient;
  private settings: GitHubImageUploaderSettings;
  private cache: ImageCacheManager;

  constructor(settings: GitHubImageUploaderSettings, cache: ImageCacheManager) {
    this.settings = settings;
    this.cache = cache;
    this.githubClient = new GitHubClient(settings.rateLimitWarningThreshold);
  }

  /**
   * Upload image to public GitHub repository
   */
  async uploadImage(blob: Blob, originalFilename?: string): Promise<UploadResult> {
    const uploadStartTime = performance.now();

    try {
      // Step 1: Compute SHA-1 hash for deduplication
      const hash = await computeSHA1(blob);

      // Step 2: Check cache for duplicate
      if (this.settings.enableDuplicateDetection && this.cache.has(hash)) {
        const cached = this.cache.get(hash);
        if (cached) {
          console.debug(`Cache hit: reusing existing image (hash: ${hash})`);
          new Notice('Image already uploaded (duplicate detected)', 2000);

          const totalTime = performance.now() - uploadStartTime;
          console.debug(`Total time (cache hit): ${totalTime.toFixed(2)}ms`);

          return {
            id: hash,
            path: cached.path,
            url: cached.url,
          };
        }
      }

      // Step 3: Generate filename based on strategy
      const filename = generateFilename({
        strategy: this.settings.filenameStrategy,
        hash,
        originalName: originalFilename,
        blob,
      });

      // Step 4: Expand path template
      const path = expandPathTemplate(this.settings.uploadPath, filename);

      // Step 5: Convert blob to base64
      const base64Content = await this.githubClient.blobToBase64(blob);

      // Step 6: Upload to GitHub
      const uploadResponse = await this.githubClient.uploadFile({
        owner: this.settings.repoOwner,
        repo: this.settings.repoName,
        path,
        content: base64Content,
        message: `Upload image: ${filename}`,
        branch: this.settings.branch,
        token: this.settings.githubToken,
      });

      // Step 7: Construct public URL
      const url = uploadResponse.content.download_url;

      // Step 8: Update cache
      if (this.settings.enableDuplicateDetection) {
        this.cache.set(hash, url, path);
      }

      const totalTime = performance.now() - uploadStartTime;
      console.debug(`Upload completed in ${totalTime.toFixed(2)}ms`);
      new Notice('Image uploaded successfully', 2000);

      return {
        id: hash,
        path,
        url,
      };
    } catch (error) {
      const totalTime = performance.now() - uploadStartTime;
      console.error(`Upload failed after ${totalTime.toFixed(2)}ms:`, error);

      if (error instanceof Error) {
        new Notice(`Upload failed: ${error.message}`, 5000);
        throw error;
      }
      throw new Error('Upload failed with unknown error');
    }
  }

  /**
   * Get render target for public GitHub storage (always returns URL)
   */
  async getRenderTarget(id: string): Promise<RenderTarget> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached) {
      return {
        type: 'url',
        value: cached.url,
      };
    }

    // If not in cache, we can't retrieve it (shouldn't happen in normal flow)
    throw new Error(`Image not found in cache: ${id}`);
  }

  /**
   * Update settings (useful when settings change)
   */
  updateSettings(settings: GitHubImageUploaderSettings): void {
    this.settings = settings;
    this.githubClient.setRateLimitThreshold(settings.rateLimitWarningThreshold);
  }

  /**
   * Get GitHub client for testing connection
   */
  getGitHubClient(): GitHubClient {
    return this.githubClient;
  }
}
