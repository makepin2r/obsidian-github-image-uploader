/**
 * SHA-1 hash computation for image deduplication
 */

export async function computeSHA1(blob: Blob): Promise<string> {
  const startTime = performance.now();

  // Convert blob to ArrayBuffer
  const buffer = await blob.arrayBuffer();

  // Compute SHA-1 hash
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const duration = performance.now() - startTime;
  console.debug(`SHA-1 computed in ${duration.toFixed(2)}ms for ${(blob.size / 1024).toFixed(2)}KB image`);

  return hashHex;
}

/**
 * Get file extension from blob type or filename
 */
export function getFileExtension(blob: Blob, filename?: string): string {
  // Try to get extension from filename first
  if (filename && filename.includes('.')) {
    const ext = filename.split('.').pop();
    if (ext) {
      return ext.toLowerCase();
    }
  }

  // Fallback to blob MIME type
  const mimeType = blob.type;
  const mimeToExt: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
  };

  return mimeToExt[mimeType] || 'png';
}
