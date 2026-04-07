# Deployment Guide

## Build Process

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Building the Userscript

```bash
# Install dependencies (first time only)
npm install

# Build the userscript
npm run build
```

This concatenates all source files from `src/` into `SteamInfiniteWishlister.user.js` with the proper Tampermonkey metadata header.

## Publishing to GitHub

### Manual Release

1. Update version in `src/config.js`:
   ```javascript
   CURRENT_VERSION: "2.1"  // Update this
   ```

2. Build the userscript:
   ```bash
   npm run build
   ```

3. Commit changes:
   ```bash
   git add -A
   git commit -m "release: v2.1"
   git push
   ```

4. Create a GitHub Release:
   - Go to repository → Releases → Draft new release
   - Tag: `v2.1`
   - Title: `Steam Infinite Wishlister v2.1`
   - Attach `SteamInfiniteWishlister.user.js`
   - Write changelog
   - Publish

### Primary Sources

There are two main files:

| File | Purpose |
|------|---------|
| `steam-infinite-wishlister.js` | Source file (edit this) |
| `SteamInfiniteWishlister.user.js` | Built artifact (install this) |

### Raw URL for Direct Install

After pushing to `main` branch, the script is available at:

```
https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js
```

This URL is used for one-click installation.

### Sync Workflow

1. Edit `steam-infinite-wishlister.js`
2. Run `npm run build`
3. Commit source and built files
4. Push to `main`
5. Reinstall or update via Tampermonkey using the raw URL

## Publishing to Greasy Fork

### Preparation

1. Ensure the userscript has proper metadata:
   ```javascript
   // ==UserScript==
   // @name         Steam Infinite Wishlister
   // @namespace    https://github.com/bernardopg/steam-infinite-wishlister
   // @version      2.1
   // @description  Automate Steam Discovery Queue to add games to your wishlist
   // @author       bernardopg
   // @license      MIT
   // @match        https://store.steampowered.com/*
   // @match        https://steamcommunity.com/*
   // @grant        GM_addStyle
   // @grant        GM_registerMenuCommand
   // @grant        GM_setValue
   // @grant        GM_getValue
   // @grant        GM_xmlhttpRequest
   // @connect      raw.githubusercontent.com
   // ==/UserScript==
   ```

2. Build the final script:
   ```bash
   npm run build
   ```

### Steps

1. Go to [Greasy Fork](https://greasyfork.org/)
2. Sign in with your account
3. Click **"Publish a script"**
4. Fill in:
   - **Script name:** Steam Infinite Wishlister
   - **Script description:** Automates Steam Discovery Queue wishlist with filters
   - **Code:** Paste contents of `SteamInfiniteWishlister.user.js`
5. Configure additional info:
   - **Version:** Match `CURRENT_VERSION`
   - **License:** MIT
6. Click **"Submit script for review"**

### Updating on Greasy Fork

1. Go to your script page
2. Click **"Upload new version"**
3. Paste updated code
4. Update version number and changelog
5. Submit

## Version Management

### Version Scheme

Uses semantic versioning: `MAJOR.MINOR.PATCH`

| Type | When to Increment | Example |
|------|-------------------|---------|
| MAJOR | Breaking changes | 1.0 → 2.0 |
| MINOR | New features | 2.0 → 2.1 |
| PATCH | Bug fixes | 2.1.0 → 2.1.1 |

### Update Checker

The script checks for updates automatically:

- Fetches `version.json` from GitHub
- Compares with `CONFIG.CURRENT_VERSION`
- Shows notification if update available
- Updates every 24 hours to avoid spam

### Creating version.json

```json
{
  "version": "2.1.0",
  "download_url": "https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js",
  "changelog": "Bug fixes and improvements"
}
```

Store at repository root or GitHub Pages.

## CI/CD (Optional)

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build Userscript

on:
  push:
    branches: [ main ]
    paths:
      - 'src/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'chore: rebuild userscript'
          file_pattern: '*.user.js'
```

This automatically rebuilds the userscript when source files change.

## Testing Before Release

### Checklist

- [ ] Build succeeds without errors
- [ ] Script installs via raw URL
- [ ] Control panel appears on Steam pages
- [ ] All buttons function correctly
- [ ] Settings persist between sessions
- [ ] Auto-Start works
- [ ] Auto-Restart works
- [ ] All filters work
- [ ] Age bypass works
- [ ] Version number updated
- [ ] Changelog updated

### Browser Testing

Test on supported browsers:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)

### Tampermonkey Testing

- Verify menu commands work
- Check script is enabled for Steam domains
- Confirm metadata header is correct

## Troubleshooting

### Build Fails

```bash
# Check Node version
node --version  # Should be 18+

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Script Not Installing

- Check raw URL is correct
- Ensure Tampermonkey is enabled
- Verify no ad blockers interfering

### Greasy Fork Rejection

- Common reasons: Minified code, obfuscated code
- Solution: Submit unminified, readable code
- Check: Script is not a duplicate

### Version Not Updating

- Clear browser cache
- Force update via Tampermonkey → Check for updates
- Verify `version.json` is accessible

## Release Checklist

Before each release:

1. [ ] Update `CONFIG.CURRENT_VERSION` in `src/config.js`
2. [ ] Update `@version` in userscript header
3. [ ] Update changelog in README
4. [ ] Merge to `main` branch
5. [ ] Run `npm run build`
6. [ ] Verify `SteamInfiniteWishlister.user.js` is correct
7. [ ] Commit final changes
8. [ ] Push to GitHub
9. [ ] Create GitHub Release
10. [ ] Update on Greasy Fork
11. [ ] Update `version.json`
12. [ ] Tag issue/PR as resolved

---

[← Back to Documentation Hub](../README.md) | [← Architecture](architecture.md)