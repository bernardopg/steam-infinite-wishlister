# Development Guide

## Project Structure

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
  game.test.js
  queue.test.js
  loop.test.js
  update.test.js
```

## Local Setup

```bash
git clone https://github.com/bernardopg/steam-infinite-wishlister.git
cd steam-infinite-wishlister
npm install
```

## Development Commands

```bash
npm run build
npm run check
npm run test
npm run verify
```

`verify` = `check + test`.

## Build Notes

- Build order is defined in `scripts/build-userscript.mjs` (`MODULE_ORDER`).
- `src/main.js` must stay as the last module because metadata is extracted there.
- Output files:
  - `SteamInfiniteWishlister.user.js`
  - `steam-infinite-wishlister.js`

## Test Notes

- Tests run with Node test runner and jsdom.
- `tests/helpers/test-env.js` mocks DOM and Tampermonkey APIs.
- Test concurrency is set to `1` to avoid global state collisions.

## Contribution Workflow

1. Create branch.
2. Implement feature/fix.
3. Run `npm run verify`.
4. Update docs if behavior changed.
5. Commit with clear message.

## Commit Convention

- `feat:` new feature
- `fix:` bug fix
- `test:` test updates
- `docs:` documentation updates
- `chore:` tooling/maintenance

## Practical Guidelines

- Keep selectors centralized in `config.js`.
- Add fallback selector/text paths for Steam layout changes.
- Persist user-facing state with `GM_getValue/GM_setValue`.
- Update both EN and PT-BR docs when behavior changes.

---

[Back to Docs](../README.md) | [Deployment](deployment.md)
