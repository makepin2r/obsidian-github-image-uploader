# GitVault Uploader — Project Working Rules (MVP)

## 1. Project Context

This project is an Obsidian plugin that automatically uploads inserted images to a GitHub repository and injects a renderable Markdown image reference into the note.

The MVP supports **public GitHub repositories only**, generating publicly accessible image URLs.  
The internal architecture must be designed to support a future **private repository + Blob URL rendering mode** without major refactoring.

---

## 2. Code Style & Architectural Rules

### Language & Module System

-   Use **TypeScript**.
-   Use **ES Modules** exclusively.
-   Prefer **named exports** over default exports.
-   Avoid CommonJS patterns (`require`, `module.exports`).

### Architectural Principles

-   Separate **business logic** from **Obsidian UI / event hooks**.
-   Image storage logic must be abstracted behind a `StorageMode` interface.
-   Do NOT hardcode assumptions that images are always public URLs.

### Storage Abstraction

All upload and render logic must go through a storage interface similar to:

-   `uploadImage(blob) -> { id, path }`
-   `getRenderTarget(id | path) -> { type: "url" | "blob", value: string }`

Current MVP implementation:

-   `PublicGitHubStorage`
    -   Uploads to a public repo
    -   Returns a public URL
    -   Injects `![](url)` into Markdown

Future extension (NOT implemented in MVP):

-   `PrivateGitHubStorage`
    -   Uploads to a private repo
    -   Resolves images via GitHub API → Blob URL at render time

### File Naming Rules

Support two mutually exclusive filename strategies:

1. Preserve original filename
2. SHA-1 hash based filename (derived from image content)

Rules:

-   Hash is computed from Blob → ArrayBuffer
-   Always preserve file extension
-   Hash-based filenames must produce deterministic results for identical images
-   Filename logic must be reusable across storage modes

### Formatting & Quality

-   Follow consistent formatting and naming conventions.
-   Avoid vague helpers or generic utility functions.
-   Explicit logic is preferred over “magic” abstractions.

---

## 3. Commands & Execution Assumptions

This is an Obsidian plugin project.

Typical expectations for the coding agent:

-   Build and test logic without assuming a runtime server
-   GitHub API interactions must be implemented via REST (`PUT /repos/{owner}/{repo}/contents/{path}`)
-   No background jobs, CI, or GitHub Actions are part of the MVP

Do NOT:

-   Introduce deployment pipelines
-   Assume automated publishing or release flows
-   Add non-requested build tooling

---

## 4. Project-Specific Warnings & Constraints

### GitHub API Constraints

-   Respect GitHub API rate limits.
-   Parse and monitor:
    -   `X-RateLimit-Remaining`
    -   `X-RateLimit-Reset`
-   Warn users when remaining requests are below a configurable threshold.
-   Block uploads and show clear errors when limits are exceeded.

### Authentication & Security

-   GitHub access tokens must be stored using Obsidian’s **encrypted storage**.
-   Never log tokens or expose them in plaintext.
-   Fine-grained tokens with **Contents: Read/Write** permission are recommended.
-   Token expiration or permission errors must be clearly surfaced to the user.

### Duplicate Upload Handling

-   Compute SHA-1 hashes to detect duplicate images.
-   Maintain a local cache mapping:
    -   hash → URL (public mode)
    -   hash → path / metadata (future private mode)
-   If a duplicate is detected:
    -   Skip GitHub upload
    -   Reuse existing render target

### File & Repo Assumptions

-   MVP targets **public repositories only**.
-   Branch defaults to `main`, but must be configurable.
-   Upload paths must support templates:
    -   Example: `/images/{{year}}/{{month}}/{{filename}}`

### Explicit Non-Goals (MVP)

Do NOT implement:

-   Private repo Blob rendering
-   Image resizing or compression
-   Multi-repo routing
-   Image deletion or editing
-   Upload history UI
-   GitHub Actions or mirroring workflows

These are future considerations and should only influence interface design, not behavior.

---

## Guiding Principle

Design for **clarity, determinism, and future extensibility**.  
MVP behavior must remain simple, predictable, and public-repo–centric,  
while the internal structure quietly prepares for private storage support later.
