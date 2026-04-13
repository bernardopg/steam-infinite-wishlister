# Deployment Guide

## Release Versioning

Project uses semantic versioning: `MAJOR.MINOR.PATCH`.

For this release line:

- Package version: `2.4.0`
- Userscript header `@version`: `2.4.0`
- `version.json`: `2.4.0`

## Release Checklist

1. Update version fields consistently:
   - `package.json`
   - `src/config.js`
   - `src/main.js` metadata
   - `version.json`
   - `README.md` badge
2. Run full validation:

```bash
npm install
npm run build
npm run check
npm run test
```

3. Confirm generated artifacts changed as expected:
   - `SteamInfiniteWishlister.user.js`
   - `steam-infinite-wishlister.js`
4. Commit and push to `main`.
5. Create Git tag `vX.Y.Z`.
6. Publish GitHub Release with changelog.

## Build/Sync Commands

```bash
npm run build
npm run check
```

`check` fails if output is out-of-sync with source files.

## GitHub Release Flow

```bash
git add -A
git commit -m "release: v2.4.0"
git push origin main
git tag v2.4.0
git push origin v2.4.0
```

If `gh` CLI is available/authenticated:

```bash
gh release create v2.4.0 \
  --title "Steam Infinite Wishlister v2.4.0" \
  --notes-file RELEASE_NOTES.md
```

## Update Checker Contract

`version.json` schema:

```json
{
  "version": "2.4.0",
  "updateUrl": "https://github.com/bernardopg/steam-infinite-wishlister/releases/latest"
}
```

The userscript polls this endpoint with 24h cooldown and can be manually triggered from Tampermonkey menu.

## Greasy Fork Publishing

1. Build latest script.
2. Copy content of `SteamInfiniteWishlister.user.js`.
3. Upload as new version on Greasy Fork.
4. Ensure version matches release tag.

---

[Back to Docs](../README.md) | [Architecture](architecture.md)
