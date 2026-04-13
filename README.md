# Steam Infinite Wishlister

[![Version](https://img.shields.io/badge/version-2.4.0-orange.svg)](https://github.com/bernardopg/steam-infinite-wishlister/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-4.15%2B-FF8039.svg)](https://www.tampermonkey.net/)

Automates Steam Discovery Queue navigation and builds your wishlist with configurable filters, fallback selectors, and resilient queue handling.

[Install Script](https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js) • [Documentation](docs/) • [Issues](https://github.com/bernardopg/steam-infinite-wishlister/issues)

## Languages

- [English](docs/en/)
- [Português (Brasil)](docs/pt-br/)

## Features

| Feature | Status | Notes |
|---|---|---|
| Auto wishlist from queue | ✅ | Processes one item at a time with retries |
| Require Trading Cards filter | ✅ | Detects by selector, icon and metadata links |
| Skip Owned filter | ✅ | Avoids games already in your library |
| Skip Non-Games filter | ✅ | Handles DLC, demo, soundtrack, video and software/tool signals |
| Auto-Restart queue | ✅ | Can be toggled ON/OFF |
| Age gate bypass | ✅ | Multi-selector bypass with form fallback |
| Persistent counters | ✅ | Wishlisted and skipped counters persist across sessions |
| Update checker | ✅ | 24h cooldown, manual check command, panel indicator |
| Start/Pause/Stop controls | ✅ | Dedicated loop controls |
| Process Once / Skip Item / Minimize | ✅ | Manual controls in floating panel |
| Smoke tests | ✅ | Node test suite with jsdom for core flow |

## Control Panel

- Start: starts or resumes automation.
- Pause: pauses after current operation.
- Stop: stops loop state.
- Process Once: processes only current item.
- Skip Item: manual queue advance and skipped count.
- Minimize: collapses panel body.

## Settings

- Auto-Start
- Auto-Restart Queue
- Require Cards
- Skip Owned
- Skip Non-Games
- Age Skip

All settings are persisted via `GM_setValue`.

## Keyboard Shortcuts

- `Ctrl+Shift+S`: Start/Resume
- `Ctrl+Shift+P`: Pause
- `Ctrl+Shift+X`: Stop
- `Ctrl+Shift+O`: Process Once
- `Ctrl+Shift+N`: Skip Item
- `Esc`: Stop

## Supported Pages

- `*://store.steampowered.com/app/*`
- `*://store.steampowered.com/explore*`
- `*://store.steampowered.com/curator/*`
- `*://steamcommunity.com/*`

## Build and Test

```bash
npm install
npm run build
npm run check
npm run test
```

`npm run verify` executes `check + test`.

## Repository Structure

```
src/
  config.js
  state.js
  utils.js
  ui.js
  game.js
  wishlist.js
  queue.js
  ageSkip.js
  loop.js
  update.js
  main.js
scripts/
  build-userscript.mjs
tests/
  *.test.js
```

## License

[MIT License](LICENSE)

## Disclaimer

This project is not affiliated with Valve/Steam. Steam layout changes may require selector updates.