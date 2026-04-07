# User Guide

## Control Panel Overview

The floating control panel appears in the bottom-right corner of supported Steam pages:

### Status Display

| Element | Description |
|---------|-------------|
| **Status Text** | Current script state (Running, Paused, Adding, etc.) |
| **Session Counter** | Items wishlisted this session (X Added) |
| **Version** | Script version with update indicator |

### Buttons

| Button | Action |
|--------|--------|
| **▶️ Start** | Begin or resume automation loop |
| **⏸️ Pause** | Pause after current item finishes |
| **⏹️ Stop** | Stop completely, disable Auto-Start |
| **🖱️ Process Once** | Evaluate current item without starting loop |
| **⏭️ Skip Item** | Skip current item without evaluation |
| **▬ Minimize** | Collapse the panel to save space |

### Settings Checkboxes

| Setting | Description |
|---------|-------------|
| **Auto-Start** | Start processing automatically when page loads |
| **Auto-Restart Queue** | Generate new queue when current ends |
| **Require Cards** | Only add games with Steam Trading Cards |
| **Skip Owned** | Skip games already in your library |
| **Skip Non-Games** | Skip DLCs, demos, soundtracks, videos |

## How It Works

### Automation Flow

```
1. Script activates on supported pages
   ↓
2. Bypasses age verification automatically
   ↓
3. On Discovery Queue pages:
   ↓
4. If Auto-Start enabled → begins loop
   ↓
5. Checks current item against filters
   ↓
6. If passes filters → Adds to Wishlist
   ↓
7. If loop active → Clicks "Next in Queue"
   ↓
8. If queue empty & Auto-Restart → Generates new queue
   ↓
9. Repeats until stopped
```

### Item Processing Logic

For each item in the queue:

1. **Get game information**
   - Title
   - Remaining queue count

2. **Check skip conditions:**
   - ✅ Already owned? (if `Skip Owned` enabled)
   - ✅ Non-game type? (if `Skip Non-Games` enabled)
   - ✅ No trading cards? (if `Require Cards` enabled)

3. **Take action:**
   - If skip: Increment skip counter, log reason
   - If pass: Click "Add to Wishlist", wait for confirmation

4. **Advance queue** (if not manual action)

## Tampermonkey Menu Commands

Right-click the Tampermonkey icon for quick access:

| Command | Description |
|---------|-------------|
| **▶️ Start** | Begin automation |
| **⏸️ Pause** | Pause automation |
| **⏹️ Stop** | Stop automation |
| **⚙️ Toggle Auto-Start** | Enable/disable Auto-Start |
| **⚙️ Toggle Auto-Restart** | Enable/disable Auto-Restart |
| **⚙️ Toggle Cards Filter** | Enable/disable Cards requirement |
| **⚙️ Toggle Skip Owned** | Enable/disable Skip Owned |
| **⚙️ Toggle Skip Non-Games** | Enable/disable Skip Non-Games |

## Status Messages

| Status | Meaning |
|--------|---------|
| **Ready** | Waiting for user action |
| **Running** | Processing queue items |
| **Paused** | Automation paused |
| **Stopped** | Automation stopped |
| **Adding** | Adding item to wishlist |
| **Added** | Successfully added to wishlist |
| **Skipping** | Skipping current item |
| **Skipped** | Item was skipped |
| **Advancing** | Moving to next item |
| **Checking** | Analyzing current item |
| **Error** | An error occurred |
| **Queue Empty** | No items remaining |
| **Generating** | Creating new queue |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Alt+S** | Start/Resume |
| **Alt+P** | Pause |
| **Alt+X** | Stop |

> ⚠️ Shortcuts may conflict with Steam's own shortcuts. If conflicts occur, use the UI buttons instead.

## Tips & Best Practices

### For Card Collectors

1. ✅ Enable **Require Cards** filter
2. ✅ Enable **Skip Owned** to avoid duplicates
3. ✅ Set Auto-Start for hands-free processing

### For Wishlist Building

1. ✅ Disable **Require Cards** for all games
2. ✅ Enable **Skip Owned** and **Skip Non-Games**
3. ✅ Use manual mode for selective adding

### For Speed

- Lower delays in `CONFIG.TIMING` (advanced users only)
- Avoid using browser while script runs
- Keep queue page visible in tab

### For Reliability

- Keep Steam Store logged in
- Don't navigate away during processing
- Update script regularly for Steam layout changes

## Update Notifications

The script checks for updates every 24 hours:

| Indicator | Meaning |
|-----------|---------|
| **v2.1** | Up to date |
| **v2.1 🆕** | Update available! |

Click the version number to visit the update page.

## Common Questions

**Q: Can I use this on multiple accounts?**
A: Yes, settings are stored per-domain and work with any Steam account.

**Q: Does this work on the new Steam UI?**
A: The script is updated regularly for Steam UI changes. Keep it updated.

**Q: Can I customize the filters?**
A: Use the checkboxes in the panel for real-time filter changes.

**Q: What happens if Steam changes their layout?**
A: The script includes fallback selectors. If something breaks, check for updates.

---

[← Back to Documentation Hub](../README.md) | [Architecture →](architecture.md)