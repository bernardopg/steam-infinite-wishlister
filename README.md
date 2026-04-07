# Steam Infinite Wishlister

[![Version](https://img.shields.io/badge/version-2.2-orange.svg)](https://github.com/bernardopg/steam-infinite-wishlister/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-4.15%2B-FF8039.svg)](https://www.tampermonkey.net/)
[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-Available-670000.svg)](https://greasyfork.org/scripts/steam-infinite-wishlister)

> **Automate your Steam Discovery Queue. Build your wishlist effortlessly.**

A Tampermonkey userscript that automatically adds games to your Steam wishlist from the Discovery Queue, with powerful filters for trading cards, owned games, and non-games.

[Install Script](https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js) • [Documentation](docs/) • [Report Issues](https://github.com/bernardopg/steam-infinite-wishlister/issues)

---

## 🌐 Languages

- 🇺🇸 [English](docs/en/) — Installation, user guide, architecture
- 🇧🇷 [Português Brasil](docs/pt-br/) — Instalação, guia do usuário, arquitetura

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎮 **Auto-Wishlist** | Automatically adds games from Discovery Queue to your wishlist |
| 🎴 **Trading Cards Filter** | Only add games with Steam Trading Cards available |
| 🚫 **Skip Owned Games** | Automatically skip games already in your library |
| 🛠️ **Skip Non-Games** | Exclude DLCs, soundtracks, demos, and videos |
| ⏩ **Queue Automation** | Auto-advance through queue items and regenerate when empty |
| 🔞 **Age Gate Bypass** | Automatically handles mature content age verification |
| 📊 **Session Counter** | Track how many items were added or skipped |
| 🎛️ **Floating Panel** | Modern control panel with start/pause/stop controls |
| 💾 **Persistent Settings** | Configuration saved between sessions |
| 🔔 **Update Checker** | Notifies when new versions are available |

## 🖥️ Control Panel

The floating panel provides full control over the automation:

- **▶️ Start / ⏸️ Pause / ⏹️ Stop** — Full automation control
- **🖱️ Process Once** — Evaluate current item without starting loop
- **⏭️ Skip Item** — Skip current item manually
- **▬ Minimize** — Collapse panel when not needed
- **⚙️ Quick Settings** — Toggle filters on the fly

## 📦 Installation

### Requirements

- A modern browser (Chrome, Firefox, Edge, Opera)
- [Tampermonkey](https://www.tampermonkey.net/) or compatible userscript manager

### Quick Install

**[Click here to install](https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js)**

The script will automatically open in your userscript manager. Click "Install" to activate.

### Manual Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. [Click the install link](https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js)
3. Confirm installation in the Tampermonkey dialog
4. Visit [Steam Discovery Queue](https://store.steampowered.com/explore/) to start

### From Source

```bash
# Clone the repository
git clone https://github.com/bernardopg/steam-infinite-wishlister.git
cd steam-infinite-wishlister

# Install dependencies
npm install

# Build the userscript
npm run build
```

The output file `SteamInfiniteWishlister.user.js` is ready to install.

## ⚙️ Configuration

Configure options in the floating panel or Tampermonkey menu:

| Setting | Description | Recommended |
|---------|-------------|:-----------:|
| **Auto-Start** | Start processing when page loads | ✅ |
| **Auto-Restart Queue** | Generate new queue when empty | ✅ |
| **Require Cards** | Only games with trading cards | ✅ |
| **Skip Owned** | Skip games you already own | ✅ |
| **Skip Non-Games** | Skip DLCs, demos, soundtracks | ✅ |

## 📍 Supported Pages

- `store.steampowered.com/app/*` — Game pages
- `store.steampowered.com/explore*` — Discovery Queue
- `store.steampowered.com/curator/*` — Curator pages
- `steamcommunity.com/*` — Community pages (age bypass)

## 🔐 Permissions

| Permission | Purpose |
|------------|---------|
| `GM_addStyle` | Inject CSS for control panel |
| `GM_registerMenuCommand` | Add menu commands |
| `GM_setValue` / `GM_getValue` | Save user settings |
| `GM_xmlhttpRequest` | Check for updates |

## 📖 Documentation

Comprehensive documentation is available in the [docs/](docs/) folder:

- **[Installation Guide](docs/en/installation.md)** — Detailed setup instructions
- **[User Guide](docs/en/user-guide.md)** — Features, controls, tips
- **[Architecture](docs/en/architecture.md)** — Code structure and modules
- **[Development](docs/en/development.md)** — Contributing and building
- **[Deployment](docs/en/deployment.md)** — Publishing and releases

> 🇧🇷 Documentação em português disponível em [docs/pt-br/](docs/pt-br/)

## 🗺️ How It Works

```
1. Script activates on Steam pages
   ↓
2. Bypasses age verification automatically
   ↓
3. On Discovery Queue pages, loops through items:
   ↓
4. Check item against filters (Cards, Owned, Non-Game)
   ↓
5. If passes → Add to Wishlist
   ↓
6. Advance to next item → Repeat
   ↓
7. When queue empty → Generate new queue (if enabled)
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build userscript from source
npm run build

# Verify build is in sync
npm run check
```

### Source Structure

```
src/
├── config.js      # Configuration and constants
├── state.js       # Global state management
├── ui.js          # User interface
├── game.js        # Game type detection
├── queue.js       # Queue navigation
├── loop.js        # Main loop controller
├── utils.js       # Utility functions
└── main.js        # Entry point
```

## 📄 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions are welcome! See the [Contributing Guide](docs/en/development.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make and test your changes
4. Submit a pull request

## ⚠️ Disclaimer

This script interacts programmatically with the Steam website. While designed to mimic user actions, use it responsibly. It is not affiliated with or endorsed by Valve or Steam. Use at your own risk. Changes to the Steam website may affect script functionality.