# GitHub Image Uploader for Obsidian

Automatically uploads pasted and dropped images to a public GitHub repository and injects renderable Markdown image references into your notes.

## Features

- **Automatic Upload** - Paste or drop images directly into your notes, and they're automatically uploaded to GitHub
- **Duplicate Detection** - SHA-1 hashing prevents uploading the same image twice
- **Customizable Paths** - Configure upload paths with date templates (`{{year}}`, `{{month}}`, `{{day}}`, `{{filename}}`)
- **Multiple Filename Strategies** - Choose between preserving original filenames or using content-based hashes
- **Rate Limit Monitoring** - Tracks GitHub API rate limits and warns you before hitting limits
- **Secure Token Storage** - Uses Obsidian's encrypted storage for GitHub tokens
- **Public Repository Support** - MVP supports public repositories with direct URL injection

## Installation

### From GitHub Releases (Recommended)

1. Download the latest release from the [Releases page](https://github.com/makepin2r/obsidian-github-image-uploader/releases)
2. Extract the files to your Obsidian vault's plugins folder: `<vault>/.obsidian/plugins/github-image-uploader/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community plugins

### Manual Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's plugin folder: `<vault>/.obsidian/plugins/github-image-uploader/`
5. Reload Obsidian
6. Enable the plugin in Settings → Community plugins

## Setup

### 1. Create a GitHub Repository

Create a public GitHub repository to store your images. For example: `username/obsidian-images`

### 2. Generate a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → [Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Click "Generate new token"
3. Configure the token:
   - **Token name**: `Obsidian Image Uploader`
   - **Expiration**: Choose your preferred expiration (90 days recommended)
   - **Repository access**: Select "Only select repositories" and choose your image repository
   - **Permissions**: Grant `Contents: Read and Write` permission
4. Click "Generate token" and copy the token (starts with `github_pat_...`)

### 3. Configure the Plugin

1. Open Obsidian Settings → Community plugins → GitHub Image Uploader
2. Configure the following settings:
   - **GitHub Token**: Paste your token from step 2
   - **Repository Owner**: Your GitHub username or organization name
   - **Repository Name**: The repository name (e.g., `obsidian-images`)
   - **Branch**: The branch to upload to (default: `main`)
   - **Upload Path Template**: Path pattern for uploaded images (default: `images/{{filename}}`)
   - **Filename Strategy**: Choose between `SHA-1 Hash` (recommended) or `Preserve Original Filename`
   - **Enable Duplicate Detection**: Keep enabled to prevent redundant uploads
   - **Rate Limit Warning Threshold**: Get warnings when API requests remaining fall below this number (default: 50)

3. Click "Test Connection" to verify your settings

## Usage

### Paste Images

1. Copy an image to your clipboard (screenshot, copied from web, etc.)
2. Paste in your Obsidian note (Ctrl/Cmd + V)
3. The plugin automatically uploads the image and inserts the Markdown reference

### Drag & Drop Images

1. Drag an image file from your file explorer
2. Drop it into your Obsidian note
3. The plugin automatically uploads the image and inserts the Markdown reference

### Manual Test

Use the command palette (Ctrl/Cmd + P) and search for "Test GitHub Connection" to verify your setup.

## Configuration Options

### Upload Path Template

Customize where images are stored in your repository using template variables:

- `{{year}}` - Current year (e.g., `2024`)
- `{{month}}` - Current month (e.g., `01`)
- `{{day}}` - Current day (e.g., `15`)
- `{{filename}}` - Generated filename

**Examples:**

- `images/{{filename}}` → `images/a3f5d8c2e1b4.png`
- `images/{{year}}/{{month}}/{{filename}}` → `images/2024/01/a3f5d8c2e1b4.png`
- `attachments/{{year}}-{{month}}/{{filename}}` → `attachments/2024-01/a3f5d8c2e1b4.png`

### Filename Strategy

**SHA-1 Hash (Recommended):**
- Generates deterministic filenames based on image content
- Example: `a3f5d8c2e1b4f6a8.png`
- Benefits: Automatic duplicate detection, no name conflicts
- File extension is always preserved

**Preserve Original Filename:**
- Keeps the original filename from the clipboard or file
- Example: `screenshot.png`
- Benefits: Human-readable names
- Note: May cause conflicts if files with the same name exist

### Duplicate Detection

When enabled, the plugin computes a SHA-1 hash for every image before upload. If the hash matches a previously uploaded image, the upload is skipped and the cached URL is reused.

**Cache Information:**
- Maximum cache size: 1000 entries (LRU eviction)
- Cache persists across Obsidian restarts
- You can clear the cache in settings if needed

## Performance

The plugin is optimized for performance:

- **Hash computation**: < 100ms for 5MB images
- **Upload latency**: < 5s for 5MB images
- **Cache lookup**: < 10ms for duplicate detection
- **Progress notifications**: Shown for uploads that take > 2 seconds

## Limitations

### Current Version (MVP)

- **Public repositories only** - Private repositories are not supported in this version
- **No image compression** - Images are uploaded as-is
- **25MB file size limit** - Larger images are rejected (GitHub's limit is 100MB)
- **No batch uploads** - Images are uploaded one at a time

### GitHub API Rate Limits

- **Authenticated requests**: 5,000 requests per hour
- The plugin monitors rate limits and warns you when approaching the limit
- Uploads are blocked when the rate limit is exceeded

## Troubleshooting

### "GitHub token is invalid or expired"

- Verify your token is correct in settings
- Check if the token has expired (regenerate if needed)
- Ensure the token has `Contents: Read and Write` permission

### "Repository not found"

- Verify the repository owner and name are correct
- Ensure the repository is public
- Check that your token has access to the repository

### "GitHub API rate limit exceeded"

- Wait until the rate limit resets (shown in the error message)
- The limit resets every hour
- Consider reducing upload frequency

### Images not uploading

1. Check your internet connection
2. Run "Test GitHub Connection" from the command palette
3. Verify all settings are correct
4. Check the Obsidian console (Ctrl/Cmd + Shift + I) for error messages

## Security

- **Token Storage**: GitHub tokens are stored using Obsidian's encrypted storage
- **Token Transmission**: Tokens are only sent to GitHub's API over HTTPS
- **No Logging**: Tokens are never logged to the console or error messages
- **Permissions**: Use fine-grained tokens with minimal permissions (Contents: Read and Write only)

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Development build (with watch mode)
npm run dev

# Production build
npm run build

# Type checking only
tsc -noEmit -skipLibCheck
```

### Project Structure

```
src/
├── main.ts                      # Plugin lifecycle and initialization
├── settings.ts                  # Settings schema and defaults
├── types.ts                     # Shared TypeScript interfaces
├── storage/
│   ├── storageMode.ts          # Storage interface abstraction
│   └── publicGitHubStorage.ts  # Public GitHub storage implementation
├── github/
│   ├── githubClient.ts         # GitHub REST API wrapper
│   └── rateLimitHandler.ts     # Rate limit monitoring
├── images/
│   ├── imageHandler.ts         # Event listeners (paste/drop)
│   ├── hashUtils.ts            # SHA-1 computation
│   ├── filenameStrategies.ts   # Filename generation
│   └── imageCache.ts           # Duplicate detection cache
└── ui/
    └── settingsTab.ts          # Settings UI
```

### Architecture

The plugin is designed with a clean architecture that separates concerns and prepares for future extensibility:

- **Storage Abstraction**: All upload logic goes through a `StorageMode` interface, making it easy to add support for private repositories or other storage backends in the future
- **Named Exports**: All modules use named exports (no default exports) for better tree-shaking and refactoring
- **ES Modules**: Uses ES module syntax throughout for modern JavaScript compatibility
- **Type Safety**: Strict TypeScript with no `any` types

## Roadmap

Future enhancements being considered:

- **Private repository support** with Blob URL rendering
- **Image compression** before upload
- **Multiple repository routing**
- **Upload history UI**
- **Image deletion/editing**
- **Batch upload UI**
- **Custom domain support**

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - See LICENSE file for details

## Credits

Built with the [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)

## Support

- **Issues**: [GitHub Issues](https://github.com/makepin2r/obsidian-github-image-uploader/issues)
- **Discussions**: [GitHub Discussions](https://github.com/makepin2r/obsidian-github-image-uploader/discussions)
