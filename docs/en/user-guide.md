# User Guide

## Panel Overview

The floating panel appears on supported Steam pages and contains:

- Status text
- Persistent counters (`wishlisted` and `skipped`)
- Version/update indicator
- Manual controls
- Runtime settings

## Buttons

| Button | Behavior |
|---|---|
| `Start` | Starts or resumes the loop |
| `Pause` | Pauses loop execution |
| `Stop` | Stops loop execution |
| `Process Once` | Processes current item only once |
| `Skip Item` | Advances queue manually and increments skipped counter |
| `_` | Minimizes panel body |

## Settings

| Setting | Effect |
|---|---|
| `Auto-Start` | Start automatically after page load |
| `Auto-Restart Queue` | Restart queue when empty |
| `Require Cards` | Skip items without trading cards |
| `Skip Owned` | Skip games already in library |
| `Skip Non-Games` | Skip DLC, demo, soundtrack, video and software/tool |
| `Age Skip` | Try to bypass age gate automatically |

## Processing Flow

For each cycle, the script does:

1. Detect and bypass age gate (if enabled).
2. Ensure queue context is available.
3. Detect queue empty state.
4. Evaluate filters.
5. Add to wishlist (with retry + confirmation polling) or skip.
6. Advance to next queue item.

## Non-Game Scope

`Skip Non-Games` currently targets:

- DLC
- Demo
- Soundtrack
- Video
- Software/Tool

Detection uses selector-first strategy and text fallback in known page regions.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+S` | Start/Resume |
| `Ctrl+Shift+P` | Pause |
| `Ctrl+Shift+X` | Stop |
| `Ctrl+Shift+O` | Process Once |
| `Ctrl+Shift+N` | Skip Item |
| `Esc` | Stop |

## Tampermonkey Menu

Menu commands include:

- Start, Pause, Stop
- Process Once, Skip Item
- Toggle settings
- Check updates now

## Update Checker

- Uses `version.json` from repository.
- Applies cooldown of 24h (`UPDATE_CHECK_COOLDOWN_MS`).
- Can be forced manually from menu command.
- Version label becomes highlighted when newer version is available.

## Troubleshooting

### Queue not restarting

Check `Auto-Restart Queue` option.

### Script stuck on age gate

Keep `Age Skip` enabled, or confirm gate manually once.

### Wrong item type detection

Disable `Skip Non-Games` temporarily and report issue with page URL and screenshot.

---

[Back to Docs](../README.md) | [Architecture](architecture.md)