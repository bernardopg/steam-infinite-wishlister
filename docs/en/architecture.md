# Architecture

## Overview

Steam Infinite Wishlister is organized into modular components that work together to automate Steam's Discovery Queue. The script is designed as a Tampermonkey userscript with clear separation of concerns.

## Module Structure

```
CONFIG (Configuration)
   ↓
State (Global State)
   ↓
Logger → UI → SettingsManager
   ↓              ↓
QueueNavigation ← QueueProcessor → GameInfoUtils
   ↓              ↓
LoopController ← ErrorHandler
```

## Modules

### CONFIG

Centralized configuration constants.

| Section | Purpose |
|---------|---------|
| `TIMING` | Delays and timeouts for automation |
| `SELECTORS` | CSS/DOM selectors for Steam elements |
| `STORAGE_KEYS` | localStorage key constants |
| `CURRENT_VERSION` | Script version string |

### State

Global application state management.

| Property | Type | Description |
|----------|------|-------------|
| `loop.state` | string | Current loop state: "Stopped", "Running", "Paused" |
| `loop.timeoutId` | number | setTimeout ID for cleanup |
| `loop.isProcessing` | boolean | Whether an item is being processed |
| `loop.failedQueueRestarts` | number | Consecutive queue restart failures |
| `settings.*` | boolean | User configuration values |
| `stats.*` | number | Session statistics counters |
| `ui.elements` | object | DOM element references |

### Logger

Logging system with configurable levels.

| Level | Value | Usage |
|-------|-------|-------|
| INFO | 0 | Important information (always shown) |
| DEBUG | 1 | Detailed debugging info |
| VERBOSE | 2 | Everything including trace |

### UI

Manages the floating control panel and user interactions.

| Function | Purpose |
|----------|---------|
| `updateStatusText(msg, type)` | Update status display |
| `incrementWishlistCounter()` | Increment wishlisted counter |
| `incrementSkippedCounter()` | Increment skipped counter |
| `addToActivityLog(action, item, reason)` | Add to activity log |
| `updateManualButtonStates()` | Update manual button states |
| `addControls()` | Create entire UI |
| `updateUI()` | Sync UI with State |
| `toggleMinimizeUI()` | Minimize/restore panel |
| `updateVersionInfo(latest, url)` | Update version display |

### SettingsManager

Persistent settings management.

| Function | Purpose |
|----------|---------|
| `updateSetting(key, value)` | Update a setting value |
| `toggleSetting(key, current)` | Toggle boolean setting |

### AgeVerificationBypass

Automatic age verification bypass for mature content pages.

| Method | Purpose |
|--------|---------|
| `init()` | Initialize all bypass mechanisms |
| `setCookies()` | Set age verification cookies |
| `handleStoreSite()` | Handle store pages |
| `handleCommunitySite()` | Handle community pages |

### DOMCache

Performance optimization through element caching.

| Method | Purpose |
|--------|---------|
| `get(key, selector)` | Get element with caching |
| `clear(key?)` | Clear cache (all or specific) |
| `cacheSelectors(map)` | Cache multiple elements |

### GameInfoUtils

Game type detection and analysis.

| Method | Return | Purpose |
|--------|--------|---------|
| `getAppType()` | string | Detect app type (Game, DLC, Demo, etc.) |
| `checkIfNonGame()` | string|null | Should skip as non-game? |
| `clearCache()` | void | Clear type detection cache |

### QueueNavigation

Discovery queue navigation controls.

| Method | Return | Purpose |
|--------|--------|---------|
| `advanceQueue()` | string | Advance to next item |
| `ensureQueueVisible()` | void | Ensure queue is rendered |
| `generateNewQueue()` | boolean | Generate fresh queue |

Advance strategy tries: Next button → Ignore button → Form submit → Fail

### ErrorHandler

Centralized error handling.

| Method | Purpose |
|--------|---------|
| `handleError(error, context, stopLoop)` | Handle and log errors |
| `safeAsync(operation, context)` | Safe async wrapper |
| `validateDOMState()` | Validate DOM is ready |

### QueueProcessor

Core item processing engine.

| Method | Return | Purpose |
|--------|--------|---------|
| `checkQueueStatusAndHandle()` | boolean | Check queue and react |
| `processCurrentGameItem(manual)` | void | Process current item |
| `confirmWishlistSuccess()` | Promise | Confirm wishlist addition |
| `processOnce()` | void | Manual single process |
| `skipItem()` | void | Manual skip |

### LoopController

Main automation loop controller.

| Method | Purpose |
|--------|---------|
| `startLoop()` | Begin automation |
| `pauseLoop()` | Pause automation |
| `stopLoop(keepSettings)` | Stop completely |

### VersionChecker

Update checking system.

| Method | Purpose |
|--------|---------|
| `checkForUpdates()` | Check and notify for updates |

## Execution Flow

### Initialization

```
1. Logger startup message
2. UI.createControls() - Build interface
3. GM_registerMenuCommand() - Register menu items
4. VersionChecker.checkForUpdates() - Check for updates
5. AgeVerificationBypass.init() - Setup bypass
6. If autoStart enabled → LoopController.startLoop()
```

### Main Loop

```
startLoop()
   ↓
mainLoop()
   ↓
checkQueueStatusAndHandle()
   ├─ Queue empty? → generateNewQueue()
   ├─ Queue hidden? → generateNewQueue()
   └─ OK? → continue
   ↓
processCurrentGameItem()
   ├─ Get game info
   ├─ Check skip conditions
   ├─ Wishlist or skip
   └─ advanceQueue()
   ↓
setTimeout(mainLoop, CHECK_INTERVAL)
   ↓
(repeats)
```

### Item Processing

```
processCurrentGameItem()
   ↓
1. Get title and info
   ↓
2. Check Skip Conditions:
   │
   ├─ Owned? ──YES──→ Skip
   │    NO
   │    ↓
   ├─ Non-game? ──YES──→ Skip
   │    NO
   │    ↓
   └─ No cards? ──YES──→ Skip
        NO
        ↓
3. Add to Wishlist
   ↓
4. advanceQueue()
```

## Module Dependencies

```
CONFIG (used by all)
   ↓
State (used by all)
   ↓
Logger (used by all)
   ↓
UI ←─────────────── SettingsManager
   ↓                       ↓
DOMCache ←─ GameInfoUtils  │
   ↓             ↓          │
QueueNavigation ←┘          │
   ↓                        │
ErrorHandler ←──────────────┘
   ↓
QueueProcessor (uses everything)
   ↓
LoopController
```

## Maintenance Guide

### Adding a New Selector

```javascript
// 1. Add to CONFIG.SELECTORS
CONFIG.SELECTORS.newGroup = {
  element: ".my-selector"
}

// 2. Use in code
const el = document.querySelector(CONFIG.SELECTORS.newGroup.element)
```

### Adding a New Setting

```javascript
// 1. Add key to CONFIG.STORAGE_KEYS
CONFIG.STORAGE_KEYS.NEW_SETTING = "myNewSetting"

// 2. Initialize in State.settings
settings: {
  myNewSetting: GM_getValue(CONFIG.STORAGE_KEYS.NEW_SETTING, defaultValue)
}

// 3. Add to SettingsManager keyMap
keyMap[CONFIG.STORAGE_KEYS.NEW_SETTING] = "myNewSetting"

// 4. Add checkbox to UI if needed
```

### Changing Timing

```javascript
// Edit CONFIG.TIMING only
CONFIG.TIMING.MY_NEW_DELAY = 2000

// Use in code
await new Promise(r => setTimeout(r, CONFIG.TIMING.MY_NEW_DELAY))
```

### Adding New Skip Condition

```javascript
// In QueueProcessor.processCurrentGameItem() or GameInfoUtils.checkIfNonGame()

if (myCondition) {
  skipReason = "My skip reason"
  Logger.log(` -> Skipping: ${skipReason}`, 1)
}
```

## Tips

1. **Always use Logger.log()** for debugging
2. **DOMCache** improves performance - use it!
3. **ErrorHandler.safeAsync()** for risky operations
4. **State** is the source of truth - consult it always
5. **UI.updateUI()** syncs everything - call after state changes
6. **CONFIG** centralizes everything - prefer constants

---

[← Back to Documentation Hub](../README.md) | [Development →](development.md)