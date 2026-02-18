/**
 * Settings tab UI for GitHub Image Uploader plugin
 */

import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import type GitHubImageUploaderPlugin from '../main';
import type { GitHubImageUploaderSettings } from '../settings';

export class GitHubImageUploaderSettingTab extends PluginSettingTab {
  plugin: GitHubImageUploaderPlugin;

  constructor(app: App, plugin: GitHubImageUploaderPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'GitHub Image Uploader Settings' });

    // GitHub Token
    new Setting(containerEl)
      .setName('GitHub Token')
      .setDesc('Personal access token with "Contents: Read and Write" permission')
      .addText(text => {
        text
          .setPlaceholder('ghp_...')
          .setValue(this.plugin.settings.githubToken)
          .onChange(async (value) => {
            this.plugin.settings.githubToken = value.trim();
            await this.plugin.saveSettings();
          });
        text.inputEl.type = 'password';
      });

    // Repository Owner
    new Setting(containerEl)
      .setName('Repository Owner')
      .setDesc('GitHub username or organization name')
      .addText(text => text
        .setPlaceholder('username')
        .setValue(this.plugin.settings.repoOwner)
        .onChange(async (value) => {
          this.plugin.settings.repoOwner = value.trim();
          await this.plugin.saveSettings();
        }));

    // Repository Name
    new Setting(containerEl)
      .setName('Repository Name')
      .setDesc('Name of the repository to upload images to')
      .addText(text => text
        .setPlaceholder('my-images')
        .setValue(this.plugin.settings.repoName)
        .onChange(async (value) => {
          this.plugin.settings.repoName = value.trim();
          await this.plugin.saveSettings();
        }));

    // Branch
    new Setting(containerEl)
      .setName('Branch')
      .setDesc('Branch to upload images to')
      .addText(text => text
        .setPlaceholder('main')
        .setValue(this.plugin.settings.branch)
        .onChange(async (value) => {
          this.plugin.settings.branch = value.trim() || 'main';
          await this.plugin.saveSettings();
        }));

    // Upload Path Template
    new Setting(containerEl)
      .setName('Upload Path Template')
      .setDesc('Path template for uploaded images. Variables: {{year}}, {{month}}, {{day}}, {{filename}}')
      .addText(text => text
        .setPlaceholder('images/{{filename}}')
        .setValue(this.plugin.settings.uploadPath)
        .onChange(async (value) => {
          this.plugin.settings.uploadPath = value.trim() || 'images/{{filename}}';
          await this.plugin.saveSettings();
        }));

    // Path Template Preview
    const now = new Date();
    const previewFilename = 'example.png';
    const previewPath = this.plugin.settings.uploadPath
      .replace(/\{\{year\}\}/g, now.getFullYear().toString())
      .replace(/\{\{month\}\}/g, (now.getMonth() + 1).toString().padStart(2, '0'))
      .replace(/\{\{day\}\}/g, now.getDate().toString().padStart(2, '0'))
      .replace(/\{\{filename\}\}/g, previewFilename);

    containerEl.createEl('p', {
      text: `Preview: ${previewPath}`,
      cls: 'setting-item-description',
    });

    // Filename Strategy
    new Setting(containerEl)
      .setName('Filename Strategy')
      .setDesc('How to name uploaded image files')
      .addDropdown(dropdown => dropdown
        .addOption('hash', 'SHA-1 Hash (recommended)')
        .addOption('preserve', 'Preserve Original Filename')
        .setValue(this.plugin.settings.filenameStrategy)
        .onChange(async (value: 'preserve' | 'hash') => {
          this.plugin.settings.filenameStrategy = value;
          await this.plugin.saveSettings();
        }));

    containerEl.createEl('p', {
      text: 'Hash: Deterministic names based on image content (prevents duplicates). Preserve: Keep original filename.',
      cls: 'setting-item-description',
    });

    // Enable Duplicate Detection
    new Setting(containerEl)
      .setName('Enable Duplicate Detection')
      .setDesc('Skip uploading duplicate images and reuse existing URLs')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableDuplicateDetection)
        .onChange(async (value) => {
          this.plugin.settings.enableDuplicateDetection = value;
          await this.plugin.saveSettings();
        }));

    // Rate Limit Warning Threshold
    new Setting(containerEl)
      .setName('Rate Limit Warning Threshold')
      .setDesc('Show warning when remaining API requests fall below this number')
      .addText(text => text
        .setPlaceholder('50')
        .setValue(this.plugin.settings.rateLimitWarningThreshold.toString())
        .onChange(async (value) => {
          const num = parseInt(value, 10);
          if (!isNaN(num) && num >= 0) {
            this.plugin.settings.rateLimitWarningThreshold = num;
            await this.plugin.saveSettings();
          }
        }));

    // Test Connection Button
    new Setting(containerEl)
      .setName('Test Connection')
      .setDesc('Verify GitHub credentials and repository access')
      .addButton(button => button
        .setButtonText('Test Connection')
        .setCta()
        .onClick(async () => {
          button.setDisabled(true);
          button.setButtonText('Testing...');

          try {
            await this.plugin.testConnection();
          } finally {
            button.setDisabled(false);
            button.setButtonText('Test Connection');
          }
        }));

    // Rate Limit Status
    const rateLimitInfo = this.plugin.storage?.getGitHubClient().getRateLimitInfo();
    if (rateLimitInfo) {
      const resetDate = new Date(rateLimitInfo.reset * 1000);
      containerEl.createEl('p', {
        text: `Rate Limit: ${rateLimitInfo.remaining}/${rateLimitInfo.limit} requests remaining. Resets at ${resetDate.toLocaleTimeString()}.`,
        cls: 'setting-item-description',
      });
    }

    // Cache Info
    if (this.plugin.cache) {
      containerEl.createEl('h3', { text: 'Cache Information' });
      containerEl.createEl('p', {
        text: `Cached images: ${this.plugin.cache.size()} (max: 1000)`,
        cls: 'setting-item-description',
      });

      new Setting(containerEl)
        .setName('Clear Cache')
        .setDesc('Remove all cached image information (does not delete uploaded images)')
        .addButton(button => button
          .setButtonText('Clear Cache')
          .setWarning()
          .onClick(async () => {
            this.plugin.cache.clear();
            await this.plugin.saveCache();
            new Notice('Cache cleared successfully', 2000);
            this.display(); // Refresh display
          }));
    }

    // Help Section
    containerEl.createEl('h3', { text: 'Help & Documentation' });
    containerEl.createEl('p', {
      text: 'To create a GitHub token: GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token',
      cls: 'setting-item-description',
    });
    containerEl.createEl('p', {
      text: 'Required permission: Contents (Read and Write)',
      cls: 'setting-item-description',
    });
  }
}
