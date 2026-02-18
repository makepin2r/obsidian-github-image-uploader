/**
 * Image event handler for paste and drop operations
 */

import { Editor, MarkdownView, Notice } from 'obsidian';
import type { PublicGitHubStorage } from '../storage/publicGitHubStorage';

export class ImageHandler {
  private storage: PublicGitHubStorage;

  constructor(storage: PublicGitHubStorage) {
    this.storage = storage;
  }

  /**
   * Handle paste event
   */
  async handlePaste(evt: ClipboardEvent, editor: Editor): Promise<boolean> {
    const items = evt.clipboardData?.items;
    if (!items) {
      return false;
    }

    // Look for image in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        evt.preventDefault();

        const file = item.getAsFile();
        if (!file) {
          continue;
        }

        await this.handleImageUpload(file, editor);
        return true;
      }
    }

    return false;
  }

  /**
   * Handle drop event
   */
  async handleDrop(evt: DragEvent, editor: Editor, view: MarkdownView): Promise<boolean> {
    const files = evt.dataTransfer?.files;
    if (!files || files.length === 0) {
      return false;
    }

    // Check if any file is an image
    let hasImage = false;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        hasImage = true;
        evt.preventDefault();
        await this.handleImageUpload(file, editor, file.name);
      }
    }

    return hasImage;
  }

  /**
   * Handle image upload and markdown injection
   */
  private async handleImageUpload(
    file: File,
    editor: Editor,
    originalFilename?: string
  ): Promise<void> {
    try {
      // Validate file size (GitHub limit is 100MB, but we'll use a more reasonable limit)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        new Notice(
          `Image too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${maxSize / 1024 / 1024}MB.`,
          5000
        );
        return;
      }

      // Show progress notice for larger files
      let progressNotice: Notice | null = null;
      if (file.size > 2 * 1024 * 1024) {
        progressNotice = new Notice('Uploading image...', 0);
      }

      // Upload image
      const result = await this.storage.uploadImage(file, originalFilename || file.name);

      // Dismiss progress notice
      if (progressNotice) {
        progressNotice.hide();
      }

      // Inject markdown at cursor position
      if (result.url) {
        const markdownLink = `![](${result.url})`;
        editor.replaceSelection(markdownLink);
      } else {
        throw new Error('Upload succeeded but no URL was returned');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      // Error notice already shown by storage layer
    }
  }

  /**
   * Update storage instance (when settings change)
   */
  updateStorage(storage: PublicGitHubStorage): void {
    this.storage = storage;
  }
}
