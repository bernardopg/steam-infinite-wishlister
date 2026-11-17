# Steam Infinite Wishlister v2.4.1

## Maintenance

- Bumped dev dependency `jsdom` from 30.1.1 to 31.0.1.
- Resolved all `npm audit` advisories in the dev toolchain (`undici` updated to 8.12.4; `source-map-js` no longer in the dependency tree). Supersedes Dependabot PR #4.
- Added `engines.node` (`^22.22.2 || ^24.15.0 || >=26.0.0`) matching the jsdom 31 requirement.
- Added `.github/dependabot.yml` for weekly grouped npm and GitHub Actions version updates (previously only security updates were tracked).
- Synchronized version `2.4.1` across package, userscript header, `config.js`, `version.json` and docs.

No functional changes to the userscript.

---

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
