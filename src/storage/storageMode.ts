/**
 * Storage abstraction interface for future extensibility
 * MVP: PublicGitHubStorage
 * Future: PrivateGitHubStorage with Blob URL rendering
 */

import type { UploadResult, RenderTarget } from '../types';

export interface StorageMode {
  /**
   * Upload an image blob to storage
   * @param blob - Image blob to upload
   * @param filename - Original or generated filename
   * @returns Upload result with id, path, and url
   */
  uploadImage(blob: Blob, filename: string): Promise<UploadResult>;

  /**
   * Get the render target for displaying the image
   * @param id - Unique identifier (hash or path)
   * @returns Render target with type and value
   */
  getRenderTarget(id: string): Promise<RenderTarget>;
}
