/**
 * GitHub Image Uploader Plugin - Main Entry Point
 */

import { Plugin, MarkdownView, Notice } from "obsidian";
import { GitHubImageUploaderSettings, DEFAULT_SETTINGS } from "./settings";
import { PublicGitHubStorage } from "./storage/publicGitHubStorage";
import { ImageCacheManager } from "./images/imageCache";
import { ImageHandler } from "./images/imageHandler";
import { GitHubImageUploaderSettingTab } from "./ui/settingsTab";

export default class GitHubImageUploaderPlugin extends Plugin {
	settings: GitHubImageUploaderSettings;
	storage: PublicGitHubStorage | null = null;
	cache: ImageCacheManager;
	imageHandler: ImageHandler | null = null;

	async onload() {
		console.log("Loading GitHub Image Uploader plugin");

		// Load settings and cache
		await this.loadSettings();
		await this.loadCache();

		// Initialize storage and handlers
		this.initializeStorage();

		// Register event handlers
		this.registerEventHandlers();

		// Add settings tab
		this.addSettingTab(new GitHubImageUploaderSettingTab(this.app, this));

		// Add command for manual test
		this.addCommand({
			id: "test-github-connection",
			name: "Test GitHub Connection",
			callback: async () => {
				await this.testConnection();
			},
		});
	}

	onunload() {
		console.log("Unloading GitHub Image Uploader plugin");
	}

	/**
	 * Initialize storage with current settings
	 */
	initializeStorage(): void {
		if (!this.cache) {
			this.cache = new ImageCacheManager();
		}

		this.storage = new PublicGitHubStorage(this.settings, this.cache);
		this.imageHandler = new ImageHandler(this.storage);
	}

	/**
	 * Register paste and drop event handlers
	 */
	registerEventHandlers(): void {
		// Register paste handler
		this.registerEvent(
			this.app.workspace.on(
				"editor-paste",
				async (evt: ClipboardEvent, editor, view) => {
					if (this.imageHandler) {
						const handled = await this.imageHandler.handlePaste(
							evt,
							editor
						);
						// Event is prevented in handler if image was found
					}
				}
			)
		);

		// Register drop handler
		this.registerEvent(
			this.app.workspace.on(
				"editor-drop",
				async (evt: DragEvent, editor, view) => {
					if (this.imageHandler && view instanceof MarkdownView) {
						const handled = await this.imageHandler.handleDrop(
							evt,
							editor,
							view
						);
						// Event is prevented in handler if image was found
					}
				}
			)
		);
	}

	/**
	 * Test GitHub connection
	 */
	async testConnection(): Promise<boolean> {
		if (!this.settings.githubToken) {
			new Notice("Please configure GitHub token in settings", 3000);
			return false;
		}

		if (!this.settings.repoOwner || !this.settings.repoName) {
			new Notice(
				"Please configure repository owner and name in settings",
				3000
			);
			return false;
		}

		if (!this.storage) {
			new Notice("Storage not initialized", 3000);
			return false;
		}

		const client = this.storage.getGitHubClient();
		return await client.testConnection(
			this.settings.repoOwner,
			this.settings.repoName,
			this.settings.githubToken
		);
	}

	/**
	 * Load settings from disk
	 */
	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	/**
	 * Save settings to disk
	 */
	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);

		// Reinitialize storage with new settings
		if (this.storage) {
			this.storage.updateSettings(this.settings);
		}
		if (this.imageHandler && this.storage) {
			this.imageHandler.updateStorage(this.storage);
		}
	}

	/**
	 * Load cache from disk
	 */
	async loadCache(): Promise<void> {
		this.cache = new ImageCacheManager();

		const cacheData = await this.loadData();
		if (cacheData && cacheData.imageCache) {
			this.cache.load(cacheData.imageCache);
			console.debug(`Loaded ${this.cache.size()} cached images`);
		}
	}

	/**
	 * Save cache to disk
	 */
	async saveCache(): Promise<void> {
		const currentData = await this.loadData();
		const cacheData = this.cache.export();

		await this.saveData({
			...currentData,
			imageCache: cacheData,
		});
	}

	/**
	 * Override saveData to include cache
	 */
	async saveData(data: any): Promise<void> {
		// Always include current cache when saving
		if (this.cache) {
			data.imageCache = this.cache.export();
		}
		await super.saveData(data);
	}
}
