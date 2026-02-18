/**
 * Filename generation strategies for uploaded images
 */

import { getFileExtension } from './hashUtils';

export type FilenameStrategy = 'preserve' | 'hash';

export interface FilenameOptions {
  strategy: FilenameStrategy;
  hash: string;
  originalName?: string;
  blob: Blob;
}

/**
 * Generate filename based on selected strategy
 */
export function generateFilename(options: FilenameOptions): string {
  const { strategy, hash, originalName, blob } = options;

  const extension = getFileExtension(blob, originalName);

  switch (strategy) {
    case 'preserve':
      // Use original filename if available, otherwise use hash
      if (originalName) {
        // Clean filename: remove path, keep only basename
        const basename = originalName.split('/').pop() || originalName;
        // Ensure extension is preserved
        if (!basename.toLowerCase().endsWith(`.${extension}`)) {
          const nameWithoutExt = basename.replace(/\.[^/.]+$/, '');
          return `${nameWithoutExt}.${extension}`;
        }
        return basename;
      }
      // Fallback to hash if no original name
      return `${hash}.${extension}`;

    case 'hash':
      return `${hash}.${extension}`;

    default:
      throw new Error(`Unknown filename strategy: ${strategy}`);
  }
}

/**
 * Expand path template with variables
 */
export function expandPathTemplate(
  template: string,
  filename: string
): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  let expanded = template;
  expanded = expanded.replace(/\{\{year\}\}/g, year);
  expanded = expanded.replace(/\{\{month\}\}/g, month);
  expanded = expanded.replace(/\{\{day\}\}/g, day);
  expanded = expanded.replace(/\{\{filename\}\}/g, filename);

  // Remove leading/trailing slashes
  expanded = expanded.replace(/^\/+|\/+$/g, '');

  return expanded;
}
