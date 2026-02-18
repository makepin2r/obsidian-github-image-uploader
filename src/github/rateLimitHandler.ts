/**
 * GitHub API rate limit monitoring and enforcement
 */

import type { RateLimitInfo } from '../types';
import { Notice } from 'obsidian';

export class RateLimitHandler {
  private currentLimit: RateLimitInfo | null = null;
  private warningThreshold: number;

  constructor(warningThreshold: number = 50) {
    this.warningThreshold = warningThreshold;
  }

  /**
   * Update rate limit info from GitHub API response headers
   */
  updateFromHeaders(headers: Headers): void {
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    const limit = headers.get('X-RateLimit-Limit');

    if (remaining && reset && limit) {
      this.currentLimit = {
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
        limit: parseInt(limit, 10),
      };

      // Show warning if below threshold
      if (this.currentLimit.remaining <= this.warningThreshold && this.currentLimit.remaining > 0) {
        const resetDate = new Date(this.currentLimit.reset * 1000);
        new Notice(
          `GitHub API rate limit warning: ${this.currentLimit.remaining} requests remaining. Resets at ${resetDate.toLocaleTimeString()}.`,
          8000
        );
      }
    }
  }

  /**
   * Check if upload should be allowed based on current rate limit
   * @returns true if upload is allowed, false if blocked
   */
  canUpload(): boolean {
    if (!this.currentLimit) {
      return true; // No rate limit info yet, allow upload
    }

    if (this.currentLimit.remaining === 0) {
      const resetDate = new Date(this.currentLimit.reset * 1000);
      new Notice(
        `GitHub API rate limit exceeded. Uploads blocked until ${resetDate.toLocaleTimeString()}.`,
        10000
      );
      return false;
    }

    return true;
  }

  /**
   * Get current rate limit info
   */
  getCurrentLimit(): RateLimitInfo | null {
    return this.currentLimit;
  }

  /**
   * Update warning threshold
   */
  setWarningThreshold(threshold: number): void {
    this.warningThreshold = threshold;
  }
}
