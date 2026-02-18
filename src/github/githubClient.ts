/**
 * GitHub REST API client for uploading files
 */

import type { RateLimitInfo } from '../types';
import { RateLimitHandler } from './rateLimitHandler';
import { Notice } from 'obsidian';

export interface GitHubUploadOptions {
  owner: string;
  repo: string;
  path: string;
  content: string;  // Base64 encoded
  message: string;
  branch: string;
  token: string;
}

export interface GitHubUploadResponse {
  content: {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    download_url: string;
  };
}

export class GitHubClient {
  private rateLimitHandler: RateLimitHandler;
  private baseUrl = 'https://api.github.com';

  constructor(rateLimitWarningThreshold: number = 50) {
    this.rateLimitHandler = new RateLimitHandler(rateLimitWarningThreshold);
  }

  /**
   * Upload a file to GitHub repository
   */
  async uploadFile(options: GitHubUploadOptions): Promise<GitHubUploadResponse> {
    // Check rate limit before upload
    if (!this.rateLimitHandler.canUpload()) {
      throw new Error('GitHub API rate limit exceeded. Please wait until the limit resets.');
    }

    const url = `${this.baseUrl}/repos/${options.owner}/${options.repo}/contents/${options.path}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${options.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: options.message,
          content: options.content,
          branch: options.branch,
        }),
      });

      // Update rate limit info from headers
      this.rateLimitHandler.updateFromHeaders(response.headers);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to upload to GitHub: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Test connection to GitHub with current credentials
   */
  async testConnection(owner: string, repo: string, token: string): Promise<boolean> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      // Update rate limit info
      this.rateLimitHandler.updateFromHeaders(response.headers);

      if (response.ok) {
        new Notice('GitHub connection successful!', 3000);
        return true;
      } else {
        await this.handleErrorResponse(response);
        return false;
      }
    } catch (error) {
      if (error instanceof Error) {
        new Notice(`Failed to connect to GitHub: ${error.message}`, 5000);
      }
      return false;
    }
  }

  /**
   * Handle error responses from GitHub API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;
    let errorMessage = 'Unknown error';

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }

    switch (status) {
      case 401:
        throw new Error('GitHub token is invalid or expired. Please check your settings.');
      case 403:
        if (errorMessage.toLowerCase().includes('rate limit')) {
          throw new Error('GitHub API rate limit exceeded.');
        }
        throw new Error('Token lacks required permissions. Ensure it has "Contents: Write" permission.');
      case 404:
        throw new Error('Repository not found. Check owner and repo name in settings.');
      case 422:
        throw new Error(`Invalid request: ${errorMessage}`);
      case 500:
      case 502:
      case 503:
        throw new Error('GitHub API is temporarily unavailable. Please try again later.');
      default:
        throw new Error(`GitHub API error (${status}): ${errorMessage}`);
    }
  }

  /**
   * Get current rate limit info
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitHandler.getCurrentLimit();
  }

  /**
   * Update rate limit warning threshold
   */
  setRateLimitThreshold(threshold: number): void {
    this.rateLimitHandler.setWarningThreshold(threshold);
  }

  /**
   * Convert Blob to Base64 string for GitHub upload
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix (e.g., "data:image/png;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
