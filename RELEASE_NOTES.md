# Steam Infinite Wishlister v2.4.0

## Highlights

- Completed P0/P1/P2 roadmap from `RELATORIO.md`.
- Unified versioning across package, userscript metadata, config, and `version.json`.
- Updated and synchronized full documentation in EN/PT-BR.

## Core Improvements

- New control panel actions:
  - `Start`, `Pause`, `Stop`
  - `Process Once`
  - `Skip Item`
  - `Minimize`
- Added `Auto-Restart Queue` runtime toggle.
- Added `Age Skip` runtime toggle.

## Filtering and Queue Robustness

- Formalized and implemented `Skip Non-Games` scope:
  - DLC, demo, soundtrack, video, software/tool
- Strengthened selector fallback paths for:
  - queue start/restart
  - next item navigation
  - queue empty detection
  - wishlist actions
- Reworked age-gate handling priority and bypass fallbacks.

## Update Checker

- Added functional update checker (`src/update.js`):
  - reads `version.json`
  - 24h cooldown
  - manual trigger via Tampermonkey menu
  - visual indicator in panel when update is available

## Quality and Tests

- Added smoke test suite with jsdom:
  - `tests/game.test.js`
  - `tests/queue.test.js`
  - `tests/loop.test.js`
  - `tests/update.test.js`
- Added scripts:
  - `npm run test`
  - `npm run verify`
- Validation passed:
  - `npm run check`
  - `npm run test`
  - `npm run verify`

## Documentation

Updated all major docs and hubs:

- Root `README.md`
- `docs/README.md`
- EN docs: installation, user guide, architecture, development, deployment
- PT-BR docs: instalacao, guia-usuario, arquitetura, contribuicao, deploy
- `GREASYFORK.md`
- `TODO.md`

## Artifacts

Generated with build pipeline:

- `SteamInfiniteWishlister.user.js`
- `steam-infinite-wishlister.js`
