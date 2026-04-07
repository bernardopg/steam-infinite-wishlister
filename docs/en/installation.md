# Installation Guide

## Prerequisites

- A supported browser (Chrome, Firefox, Edge, Opera, etc.)
- A userscript manager extension installed

## Step-by-Step Installation

### 1. Install a Userscript Manager

Choose one of the following:

| Manager | Chrome | Firefox | Edge |
|---------|--------|---------|------|
| [Tampermonkey](https://www.tampermonkey.net/) | ✅ | ✅ | ✅ |
| [Violentmonkey](https://violentmonkey.github.io/) | ✅ | ✅ | ✅ |
| [Greasemonkey](https://www.greasespot.net/) | ❌ | ✅ | ❌ |

**Recommended:** Tampermonkey for best compatibility.

### 2. Install the Script

**Option A: Direct Install (Recommended)**

[Click here to install directly](https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js)

Your userscript manager should automatically open and prompt you to install.

**Option B: Manual Install**

1. Copy the raw code from [`SteamInfiniteWishlister.user.js`](https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js)
2. Open your userscript manager dashboard
3. Create a new script
4. Paste the code
5. Save (Ctrl+S)

### 3. Verify Installation

1. Navigate to any [Steam Store page](https://store.steampowered.com/)
2. Go to the [Discovery Queue](https://store.steampowered.com/explore/)
3. Look for the floating control panel in the bottom-right corner

If the panel appears, installation was successful! ✅

## Configuration

### Initial Setup

When you first open the script, configure these options in the control panel:

| Setting | Description | Recommended |
|---------|-------------|:-----------:|
| **Auto-Start** | Automatically start processing when page loads | ✅ |
| **Auto-Restart Queue** | Generate new queue when current one ends | ✅ |
| **Require Trading Cards** | Only add games with Steam Trading Cards | ✅ |
| **Skip Owned Games** | Skip games you already own | ✅ |
| **Skip Non-Games** | Skip DLCs, demos, soundtracks, etc. | ✅ |

### Saving Settings

All settings are automatically saved between sessions. No need to reconfigure each time.

## Troubleshooting

### Panel Not Appearing

1. Refresh the page (F5)
2. Check if Tampermonkey is enabled
3. Verify the script is enabled for the Steam domain
4. Check browser console for errors (F12)

### Script Not Working

1. Ensure you're on a supported page
2. Check if the queue is loaded
3. Disable other conflicting scripts
4. Update to the latest version

### Age Verification Issues

The script automatically bypasses age checks. If this fails:
1. Manually click "View Page" on the age gate
2. The script should resume working on the next item

## Supported Pages

| Page Type | URL Pattern | Features |
|-----------|-------------|----------|
| Game Pages | `store.steampowered.com/app/*` | Wishlist, Queue |
| Discovery Queue | `store.steampowered.com/explore*` | Full Automation |
| Curators | `store.steampowered.com/curator/*` | Queue Navigation |
| Community | `steamcommunity.com/*` | Age Bypass |

## Permissions

The script requests these Tampermonkey permissions:

| Permission | Purpose |
|------------|---------|
| `GM_addStyle` | Inject CSS for the control panel |
| `GM_registerMenuCommand` | Add menu commands to Tampermonkey |
| `GM_setValue` / `GM_getValue` | Save and load user settings |
| `GM_xmlhttpRequest` | Check for script updates |

---

[← Back to Documentation Hub](../README.md) | [User Guide →](user-guide.md)