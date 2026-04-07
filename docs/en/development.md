# Development Guide

## Project Structure

```
steam-infinite-wishlister/
├── src/
│   ├── config.js      # Configuration and constants
│   ├── state.js       # Global state management
│   ├── logger.js      # Logging utilities (in utils.js)
│   ├── ui.js          # User interface
│   ├── game.js        # Game type detection
│   ├── wishlist.js    # Wishlist operations (in queue.js/processor)
│   ├── queue.js       # Queue navigation
│   ├── loop.js        # Main loop controller
│   ├── utils.js       # Utility functions
│   └── main.js        # Entry point (UserScript initialization)
├── scripts/
│   └── build-userscript.mjs  # Build script
├── SteamInfiniteWishlister.user.js  # Built userscript (output)
├── package.json       # Dependencies and scripts
├── LICENSE            # MIT License
├── README.md          # Project overview
└── docs/              # Documentation
    ├── README.md
    ├── en/
    └── pt-br/
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Tampermonkey extension (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/bernardopg/steam-infinite-wishlister.git
cd steam-infinite-wishlister

# Install dependencies
npm install
```

### Development Workflow

```bash
# Build the userscript from source modules
npm run build

# Watch mode (rebuild on changes)
npm run watch
```

### Manual Testing

1. Build the userscript: `npm run build`
2. Open Tampermonkey dashboard
3. Create new script
4. Copy contents of `SteamInfiniteWishlister.user.js`
5. Save and navigate to Steam Store
6. Verify the control panel appears

## Build System

The project uses a simple concatenation build process:

```
src/config.js
src/state.js
src/utils.js
src/game.js
src/wishlist.js
src/queue.js
src/ui.js
src/loop.js
src/main.js
      ↓ (concat)
SteamInfiniteWishlister.user.js
```

### Build Script

Located at `scripts/build-userscript.mjs`:

- Reads source files in order
- Concatenates with separators
- Outputs the final `.user.js` file
- Preserves Tampermonkey metadata header

## Module Development

### Creating a New Module

1. Create file in `src/`
2. Follow existing module patterns
3. Export as needed (for build clarity)
4. Add to build order in `package.json`

### Module Pattern

```javascript
// Module pattern used throughout the codebase
const MyModule = {
  // Private state
  _cache: new Map(),

  // Public methods
  init() {
    // Setup
  },

  async doSomething(param) {
    // Implementation
  },

  // Utilities
  _helperFunction(param) {
    // Private helper
  }
}
```

## Code Style

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Variables | camelCase | `gameTitle` |
| Functions | camelCase | `processItem()` |
| Classes | PascalCase | `QueueProcessor` |
| Private | leading underscore | `_cache` |

### Comments

```javascript
// Single line comments

/*
 * Multi-line for longer explanations
 * or code documentation blocks
 */

// Section dividers
// ─────────────────────────────
```

### Error Handling

```javascript
// Use ErrorHandler for user-facing errors
try {
  await doSomething()
} catch (error) {
  ErrorHandler.handleError(error, "doing something")
}

// Use safeAsync for wrapped operations
await ErrorHandler.safeAsync(async () => {
  // risky operation
}, "context description")
```

## Testing

### Manual Testing Checklist

- [ ] Control panel appears on supported pages
- [ ] All buttons respond correctly
- [ ] Settings persist between sessions
- [ ] Auto-Start works when enabled
- [ ] Auto-Restart works when queue is empty
- [ ] Filters (Cards, Owned, Non-Games) work
- [ ] Age verification bypass works
- [ ] Activity log updates correctly
- [ ] Session counter tracks properly
- [ ] Version update check works

### Edge Cases to Test

- Empty queue with Auto-Restart off
- Network errors during wishlist
- Steam layout changes (new selectors needed)
- Multiple tabs open simultaneously
- Rapid button clicking during processing

## Contributing

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with descriptive message
6. Push to your fork
7. Open a Pull Request

### Commit Message Format

```
type: short description

Longer description if needed

type: feat|fix|docs|style|refactor|test|chore
```

Examples:
- `feat: add pause between queue items`
- `fix: correct selector for wishlist button`
- `docs: update architecture diagram`

### Branch Naming

```
feature/add-new-filter
fix/queue-navigation-bug
docs/update-readme
refactor/settings-manager
```

## Common Tasks

### Adding a New Filter

1. Add setting key to `CONFIG.STORAGE_KEYS`
2. Initialize in `State.settings`
3. Add checkbox to `UI.addControls()`
4. Add logic to `QueueProcessor.processCurrentGameItem()`
5. Add menu command in `main.js`
6. Update this documentation

### Changing DOM Selectors

1. Edit `CONFIG.SELECTORS` in `config.js`
2. Test on both old and new Steam layouts
3. Add fallback selectors if needed
4. Update selector documentation

### Modifying Timing

1. Edit `CONFIG.TIMING` in `config.js`
2. Test with various values
3. Consider anti-detection implications
4. Document the change

## Debugging

### Enable Verbose Logging

```javascript
// In console or by modifying state
State.settings.logLevel = 2  // Verbose mode
```

### Common Issues

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Panel not appearing | Script not running | Check Tampermonkey enabled |
| Buttons not responding | DOM not ready | Increase initial delay |
| Wrong game detected | Selector outdated | Update CONFIG.SELECTORS |
| Queue not advancing | Button not found | Add new selectors to array |
| Settings not saving | Storage limit | Check GM_setValue permissions |

## Architecture Decisions

### Why Single File?

- Tampermonkey compatibility
- No build system dependency for users
- Simple to install and modify
- Easy to debug in browser

### Why Modules in src/?

- Clear separation of concerns
- Easier to maintain and review
- Better IDE support
- Prepared for future bundler integration

### Why No Framework?

- Minimal overhead
- Direct DOM manipulation is faster
- No dependency management
- Better for userscript constraints

---

[← Back to Documentation Hub](../README.md) | [Deployment →](deployment.md)