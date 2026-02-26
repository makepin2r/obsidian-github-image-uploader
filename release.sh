#!/bin/bash

# GitHub Release Creation Script for Obsidian GitHub Image Uploader
# Usage: ./release.sh [version]
# Example: ./release.sh 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from manifest.json if not provided
if [ -z "$1" ]; then
    VERSION=$(node -p "require('./manifest.json').version")
    echo -e "${YELLOW}No version specified. Using version from manifest.json: ${VERSION}${NC}"
else
    VERSION=$1
    echo -e "${GREEN}Using specified version: ${VERSION}${NC}"
fi

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Error: Invalid version format. Must be X.Y.Z (e.g., 1.0.0)${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo "  GitHub Release Creation"
echo "========================================="
echo "Version: ${VERSION}"
echo ""

# Check if required files exist
echo "📦 Checking required files..."
REQUIRED_FILES=("main.js" "manifest.json")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    else
        SIZE=$(ls -lh "$file" | awk '{print $5}')
        echo -e "  ${GREEN}✓${NC} $file (${SIZE})"
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}Error: Missing required files: ${MISSING_FILES[*]}${NC}"
    echo "Run 'npm run build' first to generate main.js"
    exit 1
fi

# Check if manifest.json version matches
MANIFEST_VERSION=$(node -p "require('./manifest.json').version")
if [ "$MANIFEST_VERSION" != "$VERSION" ]; then
    echo -e "${YELLOW}Warning: manifest.json version ($MANIFEST_VERSION) does not match release version ($VERSION)${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborted.${NC}"
        exit 1
    fi
fi

# Build the project
echo ""
echo "🔨 Building project..."
npm run build

# Check if git working directory is clean
echo ""
echo "📝 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Warning: Working directory is not clean${NC}"
    git status --short
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborted.${NC}"
        exit 1
    fi
fi

# Check if tag already exists
echo ""
echo "🏷️  Checking for existing tag..."
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo -e "${RED}Error: Tag $VERSION already exists${NC}"
    echo "To delete the existing tag, run:"
    echo "  git tag -d $VERSION"
    echo "  git push origin :refs/tags/$VERSION"
    exit 1
fi

# Create git tag
echo ""
echo "🏷️  Creating git tag: ${VERSION}"
git tag "$VERSION"

# Push tag to remote
echo "📤 Pushing tag to GitHub..."
git push origin "$VERSION"

# Create release notes
RELEASE_NOTES="## 🎉 Release ${VERSION}

GitHub Image Uploader for Obsidian - Automatically upload images to GitHub repositories.

### Features
- ✅ Automatic image upload on paste/drop
- ✅ Duplicate detection with SHA-1 hashing
- ✅ Customizable upload paths with date templates
- ✅ Multiple filename strategies
- ✅ Rate limit monitoring
- ✅ Secure token storage

### Installation
1. Download \`main.js\` and \`manifest.json\` from the assets below
2. Create folder: \`<vault>/.obsidian/plugins/github-image-uploader/\`
3. Copy the downloaded files to the folder
4. Reload Obsidian
5. Enable the plugin in Settings → Community plugins

### Setup
See the [README](https://github.com/makepin2r/obsidian-github-image-uploader/blob/main/README.md) for detailed setup instructions.

---
📚 [Documentation](https://github.com/makepin2r/obsidian-github-image-uploader#readme) | 🐛 [Report Issues](https://github.com/makepin2r/obsidian-github-image-uploader/issues) | 💬 [Discussions](https://github.com/makepin2r/obsidian-github-image-uploader/discussions)"

# Create GitHub release
echo ""
echo "🚀 Creating GitHub release..."
gh release create "$VERSION" \
    main.js \
    manifest.json \
    --title "$VERSION" \
    --notes "$RELEASE_NOTES"

# Success message
echo ""
echo "========================================="
echo -e "${GREEN}✅ Release created successfully!${NC}"
echo "========================================="
echo ""
echo "📦 Release: https://github.com/makepin2r/obsidian-github-image-uploader/releases/tag/${VERSION}"
echo ""
echo "Next steps:"
echo "1. Verify the release on GitHub"
echo "2. Test installation from the release assets"
echo "3. Submit to Obsidian Community Plugins (if first release)"
echo ""
