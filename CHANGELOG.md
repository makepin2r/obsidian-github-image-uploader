# Changelog

All notable changes to the GitHub Image Uploader plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-18

### Initial Release

#### Features
- Automatic image upload on paste/drop events
- SHA-1-based duplicate detection to prevent redundant uploads
- Customizable upload paths with date template variables (`{{year}}`, `{{month}}`, `{{day}}`, `{{filename}}`)
- Multiple filename strategies (SHA-1 hash-based or preserve original filename)
- GitHub API rate limit monitoring and protection
- Secure encrypted token storage using Obsidian's API
- Public repository support with direct URL injection
- Progress notifications for long-running uploads
- Comprehensive settings UI with connection testing

#### Security
- Encrypted token storage via Obsidian's encrypted storage API
- Password-masked token input field
- Rate limit protection with configurable warning thresholds
- No token logging in console or error messages
- HTTPS-only communication with GitHub API

#### Performance
- Hash computation: < 100ms for 5MB images
- Upload latency: < 5s for 5MB images
- Cache lookup: < 10ms for duplicate detection
- LRU cache with 1,000 entry maximum

#### Documentation
- Comprehensive README with setup guide and examples
- Full testing guide (TESTING.md)
- Security best practices documented
- Architecture overview for contributors
- Project working rules (CLAUDE.md)

#### Limitations (MVP)
- Public repositories only (private repo support planned for future)
- No image compression
- 25MB file size limit
- Images uploaded one at a time (no batch uploads)

[1.0.0]: https://github.com/makepin2r/obsidian-github-image-uploader/releases/tag/1.0.0
