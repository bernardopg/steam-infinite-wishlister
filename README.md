# Steam Infinite Wishlister

Automatically adds games with Trading Cards from the Steam Discovery Queue to your wishlist if not already added.

![Steam Logo](https://store.steampowered.com/favicon.ico)

## Features

- **Auto-wishlist**: Adds games with Steam Trading Cards to your wishlist as you browse the Discovery Queue.
- **Queue Automation**: Automatically advances the queue and can auto-restart when finished.
- **Customizable**: Toggle auto-start and auto-restart features from an on-page control panel.
- **Manual Controls**: Start/stop the script at any time, or use Tampermonkey menu commands.
- **Status Display**: See current status and settings in a floating UI panel.

## Installation

1. **Install [Tampermonkey](https://www.tampermonkey.net/)** (or a compatible userscript manager) for your browser.
2. **[Click here to install the script](#)** (or copy the code from [Steam Infinite Wishlister](./SteamInfiniteWishlister.user.js) and paste it into a new Tampermonkey script).
3. Visit [Steam Discovery Queue](https://store.steampowered.com/explore/) or any Steam app page to see the script in action.

## Usage

- **Control Panel**: A floating panel appears in the bottom-right corner of the page.
  - **Start**: Begins the automation loop.
  - **Stop**: Halts the script.
  - **Auto-Start**: Automatically starts the script on page load.
  - **Auto-Restart Queue**: Automatically generates a new queue when the current one is finished.
  - **Status**: Shows whether the script is running or stopped.
- **Tampermonkey Menu**: You can also start/stop the script and toggle options from the Tampermonkey menu.

## How It Works

1. The script checks each game in your Discovery Queue.
2. If the game has Steam Trading Cards and is not already on your wishlist, it adds it.
3. The script then advances to the next game, repeating the process.
4. When the queue is finished, it can automatically generate a new queue (if enabled).

## Configuration

- **Auto-Start**: Enable to start the script automatically on page load.
- **Auto-Restart Queue**: Enable to automatically generate a new queue when finished.

Both options can be toggled from the control panel or Tampermonkey menu.

## Supported Pages

- Steam app pages (`/app/`)
- Discovery Queue (`/explore`)
- Curator pages (`/curator/`)

## Permissions

- The script uses Tampermonkey’s storage and menu APIs for settings and controls.

## License

[MIT License](./LICENSE)

## Credits

- Script by [bernardopg](https://github.com/bernardopg)
- Inspired by the Steam community and card collectors!

---

**Note:** This script is not affiliated with or endorsed by Valve or Steam. Use at your own risk.
