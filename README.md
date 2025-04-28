# Steam Infinite Wishlister v2.0

Advanced Steam Discovery Queue wishlisting with powerful filtering, automation, age gate bypass, and enhanced controls.

![Steam Logo](https://store.steampowered.com/favicon.ico)

## Features

- **Auto-Wishlist**: Adds items from the Steam Discovery Queue to your wishlist based on your criteria.
- **Powerful Filtering**:
  - ✅ **Require Trading Cards**: Only wishlist items that have Steam Trading Cards.
  - ✅ **Skip Owned Games**: Automatically skips items already in your Steam library.
  - ✅ **Skip Non-Games**: Automatically skips DLC, Soundtracks, Demos, Videos, Applications, etc.
- **Queue Automation**:
  - Automatically advances to the next item in the queue.
  - Automatically generates and starts a new queue when the current one finishes (optional).
- **Age Gate Bypass**: Automatically handles Steam's age verification prompts for mature content.
- **Enhanced UI Control Panel**:
  - **Start / Pause / Resume / Stop** controls for the automation loop.
  - **Manual Controls**: "Process Once" (wishlist/skip current item based on rules) and "Skip Item" buttons for when the loop is paused/stopped.
  - **Session Counter**: Tracks how many items have been wishlisted in the current browser session.
  - **Minimize Button**: Collapse the UI panel.
  - **Detailed Status Display**: Shows current state (Running, Paused, Stopped, Adding, Skipped, Error, Idle...).
  - **Configuration Checkboxes**: Easily toggle all filtering and automation options directly from the panel.
  - **Version Display**: Shows the current script version and notifies if an update is available.
- **Robustness**: Improved selectors and logic for better reliability across different Steam page layouts and scenarios.
- **Tampermonkey Integration**: Access all controls and settings toggles via the Tampermonkey extension menu.

## Installation

1. **Install [Tampermonkey](https://www.tampermonkey.net/)** (or a compatible userscript manager like Violentmonkey or Greasemonkey) for your browser (Chrome, Firefox, Edge, Opera, etc.).
2. **[Click here to install the script](https://raw.githubusercontent.com/bernardopg/steam-wishlist-looper/main/SteamInfiniteWishlister.user.js)** (Or copy the code from the `.user.js` file and paste it into a new Tampermonkey script).
3. Visit the [Steam Store](https://store.steampowered.com/), especially the [Discovery Queue](https://store.steampowered.com/explore/) or any game page (`/app/...`), to see the script's UI panel.

## Usage

- **Control Panel**: A floating panel appears in the bottom-right corner on supported Steam pages.
  - **Start/Resume**: Begins or resumes the automation loop.
  - **Pause**: Pauses the automation loop. The current item processing will finish first.
  - **Stop**: Halts the script and disables Auto-Start/Auto-Restart by default (can be stopped while keeping settings via Tampermonkey Menu).
  - **Process Once**: Manually evaluates the _current_ item against your rules (wishlist/skip) without starting the loop (requires loop to be Paused/Stopped).
  - **Skip Item**: Manually advances to the next item without evaluation (requires loop to be Paused/Stopped).
  - **Checkboxes (Options)**: Toggle filters (Require Cards, Skip Owned, Skip Non-Games) and automation (Auto-Start, Auto-Restart) on the fly. Settings are saved instantly.
  - **(X Added)**: Shows items wishlisted this session.
  - **Status:**: Displays the script's current activity.
  - **▬ / □ Button**: Minimizes or restores the control panel.
  - **vX.X**: Shows script version, may indicate if an update is available.
- **Tampermonkey Menu**: Click the Tampermonkey icon in your browser toolbar. You'll find commands to Start/Pause/Stop the script and toggle all settings. This is useful if the UI panel conflicts with something or if you prefer menu access.

## How It Works

1. The script activates on supported Steam store and community pages.
2. It automatically attempts to bypass **age verification** gates using cookies and script execution methods.
3. When on a Discovery Queue page (or app page within a queue context):
   - If **Auto-Start** is enabled, the loop begins.
   - The script checks the current item.
   - **Filtering**: It checks if the item should be skipped based on your settings (Owned? Non-Game? Missing Cards?).
   - It checks if the item is already on your wishlist.
   - If the item passes all filters and isn't already wishlisted, it clicks the **Add to Wishlist** button and increments the session counter.
   - If the loop is running, it automatically clicks **Next in Queue** (or ignores, or submits the form if necessary).
   - If the queue finishes and **Auto-Restart** is enabled, it attempts to generate and start a new queue.

## Configuration

All configuration is done via the checkboxes in the UI Panel or the toggles in the Tampermonkey Menu:

- **Automation**: `Auto-Start`, `Auto-Restart Queue`
- **Filtering**: `Require Cards`, `Skip Owned`, `Skip Non-Games`
- **UI**: Minimize toggle

Settings are saved automatically when changed.

## Supported Pages

The script is designed to run on:

- Steam game/app pages (`store.steampowered.com/app/*`)
- Steam Discovery Queue pages (`store.steampowered.com/explore*`)
- Steam Curator pages (`store.steampowered.com/curator/*`) (for navigating through lists that might contain queue items)
- Steam Community pages (`steamcommunity.com/*`) (primarily for the age gate bypass functionality)

## Permissions

This script requires the following Tampermonkey permissions (`@grant` directives):

- `GM_addStyle`: To inject CSS for the UI panel.
- `GM_registerMenuCommand`: To add controls to the Tampermonkey menu.
- `GM_setValue`: To save your settings.
- `GM_getValue`: To load your settings.
- `GM_xmlhttpRequest`: To check for script updates.

## License

[MIT License](./LICENSE)

## Credits

- Script by [bernardopg](https://github.com/bernardopg)
- Inspired by the Steam community, discovery queue automation needs, and card collectors!

---

**Note:** This script interacts with the Steam website programmatically. While designed to mimic user actions, use it responsibly. It is not affiliated with or endorsed by Valve or Steam. Use at your own risk. Changes to the Steam website may break script functionality.
