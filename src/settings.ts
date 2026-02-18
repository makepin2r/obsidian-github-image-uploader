/**
 * Settings schema and defaults for GitHub Image Uploader plugin
 */

export interface GitHubImageUploaderSettings {
  githubToken: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  uploadPath: string;
  filenameStrategy: 'preserve' | 'hash';
  rateLimitWarningThreshold: number;
  enableDuplicateDetection: boolean;
}

export const DEFAULT_SETTINGS: GitHubImageUploaderSettings = {
  githubToken: '',
  repoOwner: '',
  repoName: '',
  branch: 'main',
  uploadPath: 'images/{{filename}}',
  filenameStrategy: 'hash',
  rateLimitWarningThreshold: 50,
  enableDuplicateDetection: true,
};
