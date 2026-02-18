# GitHub Image Uploader - Testing Progress

## ✅ Setup Phase

### Step 1: Create GitHub Test Repository
**Status:** ⏳ TODO

**Actions needed:**
1. Go to https://github.com
2. Create new repository:
   - Name: `obsidian-test-images`
   - Visibility: Public ✅
   - Click "Create repository"
3. Note: Repository Owner = `makepin2r`
4. Note: Repository Name = `obsidian-test-images`

**Verification:**
- [ ] Repository created and accessible
- [ ] Repository is public

---

### Step 2: Generate GitHub Personal Access Token
**Status:** ⏳ TODO

**Actions needed:**
1. Go to https://github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Configure:
   - Token name: `Obsidian Image Uploader Test`
   - Expiration: 90 days
   - Repository access: Only select repositories → `obsidian-test-images`
   - Permissions: Contents → Read and write ✅
4. Copy token (starts with `github_pat_...`)
5. Save token securely

**Verification:**
- [ ] Token generated successfully
- [ ] Token saved securely
- [ ] Token has correct permissions

---

### Step 3: Install Plugin in Obsidian
**Status:** ✅ COMPLETED

**Actions taken:**
```bash
VAULT_PATH='/Users/makepin2r/Library/Mobile Documents/iCloud~md~obsidian/Documents/test_plugin'
mkdir -p "$VAULT_PATH/.obsidian/plugins/github-image-uploader"
cp main.js manifest.json styles.css "$VAULT_PATH/.obsidian/plugins/github-image-uploader/"
```

**Verification:**
- [x] Plugin files copied to vault
- [x] main.js (15KB) present
- [x] manifest.json present
- [x] styles.css present

**Files location:**
`/Users/makepin2r/Library/Mobile Documents/iCloud~md~obsidian/Documents/test_plugin/.obsidian/plugins/github-image-uploader/`

---

### Step 4: Enable Plugin in Obsidian
**Status:** ⏳ TODO (Manual action required)

**Actions needed:**
1. Open Obsidian
2. Open Settings (⚙️ or Cmd+,)
3. Go to: Community plugins
4. Turn off "Restricted mode" (if enabled)
5. Find "GitHub Image Uploader" in list
6. Toggle ON ✅
7. Open Developer Console (Cmd+Shift+I)

**Verification:**
- [ ] Plugin appears in Community plugins list
- [ ] Plugin is enabled (toggle ON)
- [ ] Console shows: "Loading GitHub Image Uploader plugin"
- [ ] No red error messages in console

---

### Step 5: Configure Plugin Settings
**Status:** ⏳ TODO (Manual action required)

**Actions needed:**
1. Settings → Community plugins → GitHub Image Uploader → ⚙️
2. Enter configuration:
   - **GitHub Token**: [Paste token from Step 2]
   - **Repository Owner**: `makepin2r`
   - **Repository Name**: `obsidian-test-images`
   - **Branch**: `main`
   - **Upload Path Template**: `images/{{filename}}`
   - **Filename Strategy**: `SHA-1 Hash (recommended)`
   - **Enable Duplicate Detection**: ✅ Checked
   - **Rate Limit Warning Threshold**: `50`
3. Click "Test Connection" button

**Verification:**
- [ ] All settings entered correctly
- [ ] "Test Connection" shows success notification
- [ ] No errors in console

---

## 🧪 Basic Functionality Tests

### Test 1: Paste Image from Clipboard
**Status:** ⏳ TODO

**Actions:**
1. Take a screenshot (Cmd+Shift+4)
2. Create note: "Test Image Upload"
3. Paste image (Cmd+V)

**Expected:**
- Notification: "Image uploaded successfully"
- Markdown reference appears: `![](https://raw.githubusercontent.com/...)`
- Image renders in note

**Verification:**
- [ ] Image uploads successfully
- [ ] Markdown reference inserted
- [ ] Image renders in note
- [ ] Image visible on GitHub in `images/` folder
- [ ] Filename is SHA-1 hash with extension

**GitHub URL:** https://github.com/makepin2r/obsidian-test-images/tree/main/images

---

### Test 2: Drag and Drop Image
**Status:** ⏳ TODO

**Actions:**
1. Prepare a `.png` file
2. Drag file into Obsidian note
3. Drop it

**Expected:**
- Same as Test 1

**Verification:**
- [ ] Image uploads successfully
- [ ] Markdown reference inserted
- [ ] Image renders correctly

---

### Test 3: Duplicate Detection
**Status:** ⏳ TODO

**Actions:**
1. Paste the same image from Test 1 again
2. Paste in different location

**Expected:**
- Notification: "Image already uploaded (duplicate detected)"
- Upload faster (< 10ms)
- Same URL reused
- No duplicate file on GitHub

**Verification:**
- [ ] Duplicate detected
- [ ] Cache hit notification shown
- [ ] Same URL reused
- [ ] Settings shows: "Cached images: 1"
- [ ] No duplicate file on GitHub

---

## 🔧 Advanced Functionality Tests

### Test 4: Path Template Variables
**Status:** ⏳ TODO

**Actions:**
1. Settings → Upload Path Template
2. Change to: `images/{{year}}/{{month}}/{{filename}}`
3. Upload new image (different from previous)

**Expected:**
- Image uploaded to: `images/2024/02/[hash].png`

**Verification:**
- [ ] Path variables expanded correctly
- [ ] Folder structure created on GitHub
- [ ] Image in correct year/month folder

---

### Test 5: Preserve Original Filename
**Status:** ⏳ TODO

**Actions:**
1. Settings → Filename Strategy → "Preserve Original Filename"
2. Rename a file to `test-screenshot.png`
3. Drag and drop into Obsidian

**Expected:**
- Filename preserved: `test-screenshot.png`

**Verification:**
- [ ] Original filename preserved
- [ ] File visible on GitHub with original name

---

### Test 6: Large File Handling
**Status:** ⏳ TODO

**Actions:**
1. Upload 10MB image
2. Try 30MB image

**Expected:**
- 10MB: Progress notification, success
- 30MB: Error with size limit message

**Verification:**
- [ ] 10MB uploads successfully with progress notification
- [ ] 30MB rejected with clear error message

---

## 🐛 Error Handling Tests

### Test 7a: Invalid Token
**Status:** ⏳ TODO

**Actions:**
1. Settings → Enter invalid token
2. Try to upload image

**Expected:**
- Error: "GitHub token is invalid or expired. Please check your settings."

**Verification:**
- [ ] Clear error message shown
- [ ] Upload blocked

---

### Test 7b: Network Failure
**Status:** ⏳ TODO (Optional - requires disabling network)

**Actions:**
1. Disable internet connection
2. Try to upload image

**Expected:**
- Error: "Failed to connect to GitHub. Check your internet connection."

**Verification:**
- [ ] Clear error message shown

---

## ⚡ Performance Validation

### Test 8: Performance Metrics
**Status:** ⏳ TODO

**Actions:**
1. Open Developer Console (Cmd+Shift+I)
2. Upload 1MB image → Check console for "SHA-1 computed in Xms"
3. Upload 5MB image → Check console for "Upload completed in Xms"
4. Upload duplicate → Check for "Cache hit: reusing existing image"

**Expected:**
- 1MB hash: < 50ms
- 5MB upload: < 5000ms (5 seconds)
- Duplicate cache hit: < 10ms

**Verification:**
- [ ] Hash computation < 100ms
- [ ] Upload latency < 5s for 5MB
- [ ] Cache hit < 10ms
- [ ] No console errors

**Console Logs to Monitor:**
- ✅ "Loading GitHub Image Uploader plugin"
- ✅ "SHA-1 computed in Xms for XKB image"
- ✅ "Upload completed in Xms"
- ✅ "Cache hit: reusing existing image"

**Should NOT see:**
- ❌ Token values in logs
- ❌ Uncaught exceptions
- ❌ Memory warnings

---

## 💾 Persistence Test

### Test 9: Settings Persistence
**Status:** ⏳ TODO

**Actions:**
1. Verify all settings configured
2. Close Obsidian completely
3. Reopen Obsidian
4. Check settings

**Expected:**
- All settings preserved
- Token still present (encrypted)
- Cache still shows count

**Verification:**
- [ ] Settings persist after restart
- [ ] Token still present
- [ ] Cache count preserved

---

## 📊 Testing Summary

### Setup Phase (5 steps)
- [x] Plugin built successfully
- [x] Plugin installed in vault
- [ ] GitHub repository created
- [ ] GitHub token generated
- [ ] Plugin enabled in Obsidian
- [ ] Settings configured
- [ ] Test connection successful

### Basic Functionality (3 tests)
- [ ] Paste image works
- [ ] Drag & drop works
- [ ] Duplicate detection works

### Advanced Functionality (3 tests)
- [ ] Path template variables work
- [ ] Preserve original filename works
- [ ] Large file handling works

### Error Handling (2 tests)
- [ ] Invalid token error works
- [ ] Network failure error works

### Performance (1 test)
- [ ] Hash computation < 100ms
- [ ] Upload < 5s for 5MB
- [ ] Cache hit < 10ms

### Persistence (1 test)
- [ ] Settings persist after restart

---

## 🎯 Success Criteria

The plugin is ready for real-world use when:

- ✅ All setup steps completed
- ✅ All basic functionality tests pass (3/3)
- ✅ At least 20 images uploaded successfully
- ✅ Duplicate detection verified
- ✅ No console errors during normal operation
- ✅ Settings and cache persist
- ✅ Token security verified (not in logs)
- ✅ Performance targets met
- ✅ Error messages are clear

---

## 📝 Test Notes

### Test Session: [Date]

**Environment:**
- Obsidian version: [Check in Obsidian]
- macOS version: 24.6.0 (Darwin)
- Vault location: `/Users/makepin2r/Library/Mobile Documents/iCloud~md~obsidian/Documents/test_plugin`

**Issues Found:**
[Record any issues discovered during testing]

**Performance Metrics:**
[Record actual performance numbers]

---

## 🚀 Next Steps

After all tests pass:

1. ✅ Create a release in GitHub
2. ✅ Update README with release instructions
3. ✅ Consider adding to Obsidian Community Plugins
4. ✅ Document any known issues or limitations

---

## 📞 Quick Reference

**Vault Path:**
```
/Users/makepin2r/Library/Mobile Documents/iCloud~md~obsidian/Documents/test_plugin
```

**Plugin Path:**
```
/Users/makepin2r/Library/Mobile Documents/iCloud~md~obsidian/Documents/test_plugin/.obsidian/plugins/github-image-uploader
```

**GitHub Repository:**
- Owner: `makepin2r`
- Name: `obsidian-test-images`
- URL: https://github.com/makepin2r/obsidian-test-images

**Rebuild and Reload:**
```bash
# From project directory
npm run build

# Copy to vault
VAULT_PATH='/Users/makepin2r/Library/Mobile Documents/iCloud~md~obsidian/Documents/test_plugin'
cp main.js manifest.json styles.css "$VAULT_PATH/.obsidian/plugins/github-image-uploader/"

# In Obsidian: Cmd+P → "Reload app without saving"
```
