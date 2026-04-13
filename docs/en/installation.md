# Installation Guide

## Requirements

- Browser with userscript support (Chrome, Edge, Firefox, Opera).
- Tampermonkey (recommended).

## Install

### Option A: One-click install

[Install from raw URL](https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js)

### Option B: Manual install

1. Open Tampermonkey dashboard.
2. Create a new script.
3. Paste `SteamInfiniteWishlister.user.js` content.
4. Save.

## First Run Checklist

1. Open [Steam Discovery Queue](https://store.steampowered.com/explore/).
2. Confirm floating panel appears in bottom-right corner.
3. Choose your settings:
	- Auto-Start
	- Auto-Restart Queue
	- Require Cards
	- Skip Owned
	- Skip Non-Games
	- Age Skip
4. Click `Start`.

## Supported URLs

| Scope | Pattern |
|---|---|
| Steam app pages | `*://store.steampowered.com/app/*` |
| Discovery queue | `*://store.steampowered.com/explore*` |
| Curator pages | `*://store.steampowered.com/curator/*` |
| Steam community | `*://steamcommunity.com/*` |

## Required Permissions

| Permission | Usage |
|---|---|
| `GM_addStyle` | Panel styling |
| `GM_registerMenuCommand` | Tampermonkey quick actions |
| `GM_getValue` / `GM_setValue` | Settings + counters persistence |
| `GM_xmlhttpRequest` | Version check (`version.json`) |

## Common Troubleshooting

### Panel does not appear

1. Refresh page.
2. Check if script is enabled in Tampermonkey.
3. Confirm URL matches one of supported patterns.

### Queue does not move

1. Ensure Steam queue is actually open.
2. Keep tab active while validating first run.
3. Disable conflicting scripts/extensions temporarily.

### Age gate blocked

1. Keep `Age Skip` enabled.
2. If Steam changes layout, manually click once and continue.

---

[Back to Docs](../README.md) | [User Guide](user-guide.md)