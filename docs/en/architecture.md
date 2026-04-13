# Architecture

## Overview

The project is an ES module userscript architecture compiled into one final `.user.js` file.

Source of truth is `src/`. Build output files are generated artifacts.

## Runtime Modules

| Module | Responsibility |
|---|---|
| `config.js` | Version, timing, selectors, storage keys, static text maps |
| `state.js` | Global runtime state and settings initialization |
| `utils.js` | DOM helpers, text normalization, version compare, logging |
| `game.js` | Cards/owned/non-game detection and skip reason selection |
| `wishlist.js` | Add-to-wishlist with confirmation polling + retry |
| `queue.js` | Queue start/restart/advance/empty/finish handling |
| `ageSkip.js` | Age gate detection and bypass flow |
| `ui.js` | Floating panel, counters, settings controls, update indicator |
| `loop.js` | Start/pause/stop/process-once/skip-item orchestration |
| `update.js` | `version.json` check with cooldown + cache restore |
| `main.js` | Userscript metadata, init sequence, menu + shortcuts wiring |

## Build Pipeline

`scripts/build-userscript.mjs`:

1. Reads modules in fixed order.
2. Extracts userscript metadata from `src/main.js`.
3. Strips `import`/`export` lines.
4. Concatenates into `SteamInfiniteWishlister.user.js`.
5. Copies output to `steam-infinite-wishlister.js`.

## State Model

`State` keeps:

- Loop state: `running`, `paused`, `processing`
- Settings: `autoStart`, `autoRestart`, `requireCards`, `skipOwned`, `skipNonGames`, `ageSkip`
- Counters: `wishlisted`, `skipped`
- Update status: `available`, `latestVersion`, `url`
- UI element refs

## Execution Order (Loop)

`Loop.step()` runs in this order:

1. Age gate handling (if enabled).
2. Queue context validation/start.
3. Empty queue handling (restart if enabled).
4. Item filter evaluation.
5. Wishlist action or skip increment.
6. Queue advance.

## Non-Game Filter Scope

The filter includes:

- DLC
- Demo
- Soundtrack
- Video
- Software/Tool

Detection strategy is selector-first with text fallback on known page sections.

## Update Checker Design

- Source: `version.json` in repository.
- Cooldown: 24h (`UPDATE_CHECK_COOLDOWN_MS`).
- Cache: latest known version/url in GM storage.
- UI: version line highlights when update is available.

## Test Strategy

Automated smoke tests (`tests/*.test.js`) cover:

- Cards and non-game detection
- Queue start/advance fallback
- Loop pause on empty queue without restart
- Loop process-once path
- Update checker behavior

---

[Back to Docs](../README.md) | [Development](development.md)