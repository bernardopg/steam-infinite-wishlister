// ==== Interface do Usuário ====

import CONFIG from "./config.js";
import State from "./state.js";

const UI = {
  create: () => {
    const panel = document.createElement("div");
    panel.id = "wl-panel";
    panel.innerHTML = `
      <div id="wl-title">Steam Wishlist Looper</div>
      <div id="wl-stats">
        Adicionados: <span id="wl-count">${State.stats.wishlisted}</span> |
        Pulados: <span id="wl-skipped">${State.stats.skipped}</span>
      </div>
      <div id="wl-controls">
        <button id="wl-start">Start</button>
        <button id="wl-stop" disabled>Stop</button>
      </div>
      <div id="wl-status">Status: Parado</div>
      <div id="wl-options">
        <label><input type="checkbox" id="wl-auto">Auto-Iniciar</label><br>
        <label><input type="checkbox" id="wl-cards">Exigir Cartas</label><br>
        <label><input type="checkbox" id="wl-owned">Pular Possuídos</label><br>
        <label><input type="checkbox" id="wl-dlc">Pular DLC</label>
      </div>
      <div id="wl-version">v${CONFIG.VERSION}</div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #wl-panel {
        position: fixed; right: 14px; bottom: 14px; z-index: 999999;
        background: rgba(27, 40, 56, 0.95); color: #c7d5e0;
        border-radius: 8px; padding: 10px; font-family: system-ui, sans-serif;
        border: 1px solid rgba(100, 100, 100, 0.3);
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        min-width: 220px; font-size: 12px;
      }
      #wl-title { font-weight: 700; margin-bottom: 8px; color: #66c0f4; }
      #wl-stats { margin-bottom: 8px; font-size: 11px; }
      #wl-controls { margin-bottom: 8px; }
      #wl-controls button {
        cursor: pointer; border: 0; border-radius: 6px;
        padding: 6px 12px; margin-right: 6px; font-weight: 600;
      }
      #wl-start { background: #68932f; color: white; }
      #wl-stop { background: #a33e29; color: white; }
      #wl-controls button:disabled {
        background: #555 !important; color: #999 !important;
        cursor: not-allowed !important; opacity: 0.6;
      }
      #wl-status {
        background: rgba(0,0,0,0.3); padding: 5px;
        border-radius: 4px; margin-bottom: 8px; font-size: 11px;
      }
      #wl-options { font-size: 11px; margin-bottom: 6px; }
      #wl-options label { display: block; margin: 3px 0; cursor: pointer; }
      #wl-options input { margin-right: 5px; accent-color: #66c0f4; }
      #wl-version { font-size: 9px; color: #8f98a0; text-align: right; }
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
      stopBtn: panel.querySelector("#wl-stop"),
      autoCheck: panel.querySelector("#wl-auto"),
      cardsCheck: panel.querySelector("#wl-cards"),
      ownedCheck: panel.querySelector("#wl-owned"),
      dlcCheck: panel.querySelector("#wl-dlc"),
    };

    // Sincronizar checkboxes com settings
    State.ui.autoCheck.checked = State.settings.autoStart;
    State.ui.cardsCheck.checked = State.settings.requireCards;
    State.ui.ownedCheck.checked = State.settings.skipOwned;
    State.ui.dlcCheck.checked = State.settings.skipDLC;

    // Event listeners para settings
    State.ui.autoCheck.addEventListener("change", (e) => {
      State.settings.autoStart = e.target.checked;
      GM_setValue(CONFIG.STORAGE.AUTO_START, e.target.checked);
    });

    State.ui.cardsCheck.addEventListener("change", (e) => {
      State.settings.requireCards = e.target.checked;
      GM_setValue(CONFIG.STORAGE.REQUIRE_CARDS, e.target.checked);
    });

    State.ui.ownedCheck.addEventListener("change", (e) => {
      State.settings.skipOwned = e.target.checked;
      GM_setValue(CONFIG.STORAGE.SKIP_OWNED, e.target.checked);
    });

    State.ui.dlcCheck.addEventListener("change", (e) => {
      State.settings.skipDLC = e.target.checked;
      GM_setValue(CONFIG.STORAGE.SKIP_DLC, e.target.checked);
    });
  },

  updateStatus: (msg, color = null) => {
    if (State.ui.status) {
      State.ui.status.textContent = `Status: ${msg}`;
      if (color) State.ui.status.style.color = color;
    }
  },

  incrementWishlisted: () => {
    State.stats.wishlisted++;
    sessionStorage.setItem(CONFIG.STORAGE.WISHLIST_COUNT, State.stats.wishlisted);
    if (State.ui.count) State.ui.count.textContent = State.stats.wishlisted;
  },

  incrementSkipped: () => {
    State.stats.skipped++;
    if (State.ui.skipped) State.ui.skipped.textContent = State.stats.skipped;
  },

  setRunning: (running) => {
    if (State.ui.startBtn) State.ui.startBtn.disabled = running;
    if (State.ui.stopBtn) State.ui.stopBtn.disabled = !running;
  },
};

export default UI;
