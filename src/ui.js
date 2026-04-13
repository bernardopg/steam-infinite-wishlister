// ==== Interface do Usuário ====

import CONFIG from "./config.js";
import { State } from "./state.js";

const syncCheckbox = (checkbox, value) => {
  if (checkbox) {
    checkbox.checked = !!value;
  }
};

const UI = {
  create: () => {
    const panel = document.createElement("div");
    panel.id = "wl-panel";
    panel.innerHTML = `
      <div id="wl-header">
        <div id="wl-title">Steam Infinite Wishlister</div>
        <button id="wl-min" type="button" title="Minimizar painel">_</button>
      </div>
      <div id="wl-body">
        <div id="wl-stats">
          Adicionados: <span id="wl-count">${State.stats.wishlisted}</span> |
          Pulados: <span id="wl-skipped">${State.stats.skipped}</span>
        </div>

        <div id="wl-controls-row-1" class="wl-controls-row">
          <button id="wl-start" type="button">Start</button>
          <button id="wl-pause" type="button" disabled>Pause</button>
          <button id="wl-stop" type="button" disabled>Stop</button>
        </div>
        <div id="wl-controls-row-2" class="wl-controls-row">
          <button id="wl-once" type="button">Process Once</button>
          <button id="wl-skip" type="button">Skip Item</button>
        </div>

        <div id="wl-status">Status: Parado</div>

        <div id="wl-options">
          <label><input type="checkbox" id="wl-auto">Auto-Start</label>
          <label><input type="checkbox" id="wl-restart">Auto-Restart Queue</label>
          <label><input type="checkbox" id="wl-cards">Require Cards</label>
          <label><input type="checkbox" id="wl-owned">Skip Owned</label>
          <label><input type="checkbox" id="wl-non-games">Skip Non-Games</label>
          <label><input type="checkbox" id="wl-age-skip">Age Skip</label>
        </div>

        <div id="wl-version" role="button" tabindex="0">v${CONFIG.VERSION}</div>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #wl-panel {
        position: fixed; right: 14px; bottom: 14px; z-index: 999999;
        background: rgba(27, 40, 56, 0.95); color: #c7d5e0;
        border-radius: 8px; padding: 10px; font-family: system-ui, sans-serif;
        border: 1px solid rgba(100, 100, 100, 0.3);
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        min-width: 240px; font-size: 12px;
      }
      #wl-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      #wl-title { font-weight: 700; color: #66c0f4; }
      #wl-min {
        cursor: pointer;
        border: 0;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.12);
        color: #c7d5e0;
        font-weight: 700;
        padding: 3px 8px;
        line-height: 1;
      }
      #wl-body { margin-top: 8px; }
      #wl-panel.wl-minimized #wl-body { display: none; }
      #wl-stats { margin-bottom: 8px; font-size: 11px; }
      .wl-controls-row {
        margin-bottom: 6px;
        display: flex;
        gap: 6px;
      }
      .wl-controls-row button {
        flex: 1;
        cursor: pointer; border: 0; border-radius: 6px;
        padding: 6px 8px; font-weight: 600;
        font-size: 11px;
      }
      #wl-start { background: #68932f; color: white; }
      #wl-pause { background: #9b7a18; color: white; }
      #wl-stop { background: #a33e29; color: white; }
      #wl-once { background: #2f6d93; color: white; }
      #wl-skip { background: #52697a; color: white; }
      .wl-controls-row button:disabled {
        background: #555 !important; color: #999 !important;
        cursor: not-allowed !important; opacity: 0.6;
      }
      #wl-status {
        background: rgba(0,0,0,0.3); padding: 5px;
        border-radius: 4px; margin-bottom: 8px; font-size: 11px;
      }
      #wl-options { font-size: 11px; margin-bottom: 8px; }
      #wl-options label { display: block; margin: 3px 0; cursor: pointer; }
      #wl-options input { margin-right: 5px; accent-color: #66c0f4; }
      #wl-version {
        font-size: 10px;
        color: #8f98a0;
        text-align: right;
        text-decoration: underline;
        cursor: pointer;
      }
      #wl-version.has-update {
        color: #a1dd4a;
        font-weight: 700;
      }
    `;

    document.documentElement.appendChild(style);
    document.documentElement.appendChild(panel);

    // Guardar referências
    State.ui = {
      panel,
      status: panel.querySelector("#wl-status"),
      count: panel.querySelector("#wl-count"),
      skipped: panel.querySelector("#wl-skipped"),
      startBtn: panel.querySelector("#wl-start"),
      pauseBtn: panel.querySelector("#wl-pause"),
      stopBtn: panel.querySelector("#wl-stop"),
      onceBtn: panel.querySelector("#wl-once"),
      skipBtn: panel.querySelector("#wl-skip"),
      minBtn: panel.querySelector("#wl-min"),
      autoCheck: panel.querySelector("#wl-auto"),
      restartCheck: panel.querySelector("#wl-restart"),
      cardsCheck: panel.querySelector("#wl-cards"),
      ownedCheck: panel.querySelector("#wl-owned"),
      nonGamesCheck: panel.querySelector("#wl-non-games"),
      ageSkipCheck: panel.querySelector("#wl-age-skip"),
      version: panel.querySelector("#wl-version"),
    };

    // Sincronizar checkboxes com settings
    syncCheckbox(State.ui.autoCheck, State.settings.autoStart);
    syncCheckbox(State.ui.restartCheck, State.settings.autoRestart);
    syncCheckbox(State.ui.cardsCheck, State.settings.requireCards);
    syncCheckbox(State.ui.ownedCheck, State.settings.skipOwned);
    syncCheckbox(State.ui.nonGamesCheck, State.settings.skipNonGames);
    syncCheckbox(State.ui.ageSkipCheck, State.settings.ageSkip);

    State.ui.version.addEventListener("click", () => {
      window.open(
        State.update.url || CONFIG.URLS.RELEASES,
        "_blank",
        "noopener,noreferrer",
      );
    });
    State.ui.version.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.open(
          State.update.url || CONFIG.URLS.RELEASES,
          "_blank",
          "noopener,noreferrer",
        );
      }
    });

    State.ui.minBtn.addEventListener("click", UI.toggleMinimized);

    // Event listeners para settings
    State.ui.autoCheck.addEventListener("change", (e) => {
      State.settings.autoStart = e.target.checked;
      GM_setValue(CONFIG.STORAGE.AUTO_START, e.target.checked);
    });

    State.ui.restartCheck.addEventListener("change", (e) => {
      State.settings.autoRestart = e.target.checked;
      GM_setValue(CONFIG.STORAGE.AUTO_RESTART, e.target.checked);
    });

    State.ui.cardsCheck.addEventListener("change", (e) => {
      State.settings.requireCards = e.target.checked;
      GM_setValue(CONFIG.STORAGE.REQUIRE_CARDS, e.target.checked);
    });

    State.ui.ownedCheck.addEventListener("change", (e) => {
      State.settings.skipOwned = e.target.checked;
      GM_setValue(CONFIG.STORAGE.SKIP_OWNED, e.target.checked);
    });

    State.ui.nonGamesCheck.addEventListener("change", (e) => {
      State.settings.skipNonGames = e.target.checked;
      GM_setValue(CONFIG.STORAGE.SKIP_NON_GAMES, e.target.checked);
      // Migração legada para não quebrar instalações antigas.
      GM_setValue(CONFIG.STORAGE.SKIP_DLC, e.target.checked);
    });

    State.ui.ageSkipCheck.addEventListener("change", (e) => {
      State.settings.ageSkip = e.target.checked;
      GM_setValue(CONFIG.STORAGE.AGE_SKIP, e.target.checked);
    });

    UI.setLoopState("stopped");
  },

  updateStatus: (msg, color = null) => {
    if (State.ui.status) {
      State.ui.status.textContent = `Status: ${msg}`;
      if (color) State.ui.status.style.color = color;
    }
  },

  incrementWishlisted: () => {
    State.stats.wishlisted++;
    if (State.ui.count) State.ui.count.textContent = State.stats.wishlisted;
  },

  incrementSkipped: () => {
    State.stats.skipped++;
    if (State.ui.skipped) State.ui.skipped.textContent = State.stats.skipped;
  },

  toggleMinimized: () => {
    if (!State.ui.panel) return;
    State.ui.panel.classList.toggle("wl-minimized");
  },

  setLoopState: (mode) => {
    const running = mode === "running";
    const paused = mode === "paused";

    if (State.ui.startBtn) {
      State.ui.startBtn.disabled = running;
      State.ui.startBtn.textContent = paused ? "Resume" : "Start";
    }
    if (State.ui.pauseBtn) State.ui.pauseBtn.disabled = !running;
    if (State.ui.stopBtn) State.ui.stopBtn.disabled = mode === "stopped";
    if (State.ui.onceBtn) State.ui.onceBtn.disabled = running;
    if (State.ui.skipBtn) State.ui.skipBtn.disabled = false;
  },

  showUpdateAvailable: (latestVersion, updateUrl) => {
    State.update.available = true;
    State.update.latestVersion = latestVersion;
    State.update.url = updateUrl || CONFIG.URLS.RELEASES;

    if (State.ui.version) {
      State.ui.version.classList.add("has-update");
      State.ui.version.textContent = `v${CONFIG.VERSION} -> update v${latestVersion}`;
    }

    UI.updateStatus(`Update disponível: v${latestVersion}`, "#a1dd4a");
  },

  showCurrentVersion: () => {
    if (!State.ui.version) return;
    State.ui.version.classList.remove("has-update");
    State.ui.version.textContent = `v${CONFIG.VERSION}`;
  },
};

export default UI;
