// ==UserScript==
// @name         Steam Infinite Wishlister
// @namespace    http://tampermonkey.net/
// @version      2.2.0
// @description  Advanced Steam Discovery Queue wishlisting: Trading Card/DLC/Owned options, Age Skip, Pause/Resume, Counters, Robustness++
// @icon         https://store.steampowered.com/favicon.ico
// @author       bernardopg
// @homepageURL  https://github.com/bernardopg/steam-infinite-wishlister
// @supportURL   https://github.com/bernardopg/steam-infinite-wishlister/issues
// @updateURL    https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js
// @downloadURL  https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js
// @match        *://store.steampowered.com/app/*
// @match        *://store.steampowered.com/explore*
// @match        *://store.steampowered.com/explore/
// @match        *://store.steampowered.com/curator/*
// @match        *://steamcommunity.com/*
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @license      MIT
// @run-at       document-idle
// ==/UserScript==

// === Begin: src/config.js ===
// ==== Configurações ====

const CONFIG = {
  VERSION: "2.2",

  TIMING: {
    LOOP_MIN: 700,
    LOOP_MAX: 1200,
    ACTION_DELAY: 1800,
    QUEUE_GEN_DELAY: 1500,
  },

  SELECTORS: {
    // Botões de fila
    queueButtons: [
      "#refresh_queue_btn > span",
      "#refresh_queue_btn",
      "#discovery_queue_start_link",
    ],

    // Wishlist
    wishlistArea: "#add_to_wishlist_area, .queue_wishlist_ctn",
    wishlistButton: ".add_to_wishlist .btn_addtocart, .queue_wishlist_button",
    wishlistSuccess: ".add_to_wishlist_area_success, .queue_btn_active",

    // Navegação
    nextButton: ".btn_next_in_queue_trigger, .btn_next_in_queue",

    // Informações do jogo
    tradingCards: 'a[href*="/tradingcards/"]',
    owned: ".game_area_already_owned",
    dlc: ".game_area_dlc_bubble",
    title: ".apphub_AppName, .queue_item_title",

    // Fila vazia
    queueEmpty: ".discover_queue_empty",

    // Age Gate (verificação de idade)
    ageGate: "#age_gate, .age_gate_ctn, [class*='agegate']",
    ageConfirm: "#age_year, #ageGateYear, input[name='age_year'], input[name='ageYear']",
    ageConfirmBtn: ".btn_continue, #age_gate_btn, button[type='submit'][class*='continue']",
  },

  STORAGE: {
    AUTO_START: "wl_auto_start",
    REQUIRE_CARDS: "wl_require_cards",
    SKIP_OWNED: "wl_skip_owned",
    SKIP_DLC: "wl_skip_dlc",
    WISHLIST_COUNT: "wl_session_count",
    AGE_SKIP: "wl_age_skip",
  },
};


// === End: src/config.js ===

// === Begin: src/utils.js ===
// ==== Utilitários Básicos ====

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const visible = (el) => !!(el && el.offsetParent !== null);

const pick = (sel) =>
  sel?.startsWith("/")
    ? document.evaluate(
        sel,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue
    : document.querySelector(sel);

const byText = (txt, root = document) => {
  const nodes = root.querySelectorAll("span, a, button, div");
  return Array.from(nodes).find((el) =>
    (el.textContent || "").replace(/\s+/g, " ").trim().includes(txt)
  );
};

/**
 * Logger com níveis configuráveis
 * @param {string} msg - Mensagem para log
 * @param {number} level - Nível: 0=info (sempre visível), 1=debug, 2=verbose
 */
const log = (msg, level = 0) => {
  // Por padrão mostra tudo (pode ser controlado via configuração futura)
  const prefix = level === 1 ? "[DEBUG]" : level === 2 ? "[VERBOSE]" : "";
  console.log(`[Steam Wishlist]${prefix} ${msg}`);
};


// === End: src/utils.js ===

// === Begin: src/state.js ===
// ==== Estado da Aplicação ====


const State = {
  running: false,
  processing: false,

  // Settings vazios — serão inicializados no init() para evitar
  // acesso a GM_* APIs antes do script estar pronto
  settings: {
    autoStart: false,
    requireCards: false,
    skipOwned: false,
    skipDLC: false,
  },

  stats: {
    wishlisted: 0,
    skipped: 0,
  },

  ui: {},
};

/**
 * Inicializa os settings a partir do GM_*. Deve ser chamado durante o init,
 * não no top-level do módulo, para garantir que as GM_ APIs estão disponíveis.
 */
function initSettings() {
  State.settings.autoStart = GM_getValue(CONFIG.STORAGE.AUTO_START, false);
  State.settings.requireCards = GM_getValue(CONFIG.STORAGE.REQUIRE_CARDS, true);
  State.settings.skipOwned = GM_getValue(CONFIG.STORAGE.SKIP_OWNED, true);
  State.settings.skipDLC = GM_getValue(CONFIG.STORAGE.SKIP_DLC, true);
  State.stats.wishlisted = parseInt(
    sessionStorage.getItem(CONFIG.STORAGE.WISHLIST_COUNT) || "0"
  );
}


// === End: src/state.js ===

// === Begin: src/game.js ===
// ==== Detecção de Jogos ====


const Game = {
  hasCards: () => {
    const indicator = pick(CONFIG.SELECTORS.tradingCards);
    return indicator && visible(indicator);
  },

  isOwned: () => {
    const indicator = pick(CONFIG.SELECTORS.owned);
    return indicator && visible(indicator);
  },

  isDLC: () => {
    const indicator = pick(CONFIG.SELECTORS.dlc);
    return indicator && visible(indicator);
  },

  getTitle: () => {
    const title = pick(CONFIG.SELECTORS.title);
    return title?.textContent?.trim() || "Jogo Atual";
  },

  shouldSkip: (settings) => {
    if (settings.skipOwned && Game.isOwned()) {
      return "Já possui";
    }

    if (settings.skipDLC && Game.isDLC()) {
      return "É DLC";
    }

    if (settings.requireCards && !Game.hasCards()) {
      return "Sem cartas";
    }

    return null;
  },
};


// === End: src/game.js ===

// === Begin: src/wishlist.js ===
// ==== Gerenciamento de Wishlist ====


const Wishlist = {
  /**
   * Verifica se o jogo já está na wishlist
   * @returns {boolean}
   */
  isAlreadyAdded: () => {
    const area = pick(CONFIG.SELECTORS.wishlistArea);
    if (!area) return false;

    const success = area.querySelector(CONFIG.SELECTORS.wishlistSuccess);
    return (success && visible(success)) || area.classList.contains("queue_btn_active");
  },

  /**
   * Aguarda confirmação visual de que o item foi adicionado à wishlist
   * Usa polling para verificar mudança de estado
   * @param {number} maxWait - Tempo máximo de espera em ms
   * @returns {Promise<boolean>} true se confirmado
   */
  waitForConfirmation: async (maxWait = 3000) => {
    const start = Date.now();
    const pollInterval = 200;

    while (Date.now() - start < maxWait) {
      if (Wishlist.isAlreadyAdded()) {
        return true;
      }
      await wait(pollInterval);
    }

    return false;
  },

  /**
   * Tenta adicionar o jogo à wishlist com confirmação e retry
   * @param {number} maxRetries - Número máximo de tentativas
   * @returns {Promise<boolean>} true se adicionado com sucesso
   */
  add: async (maxRetries = 2) => {
    const area = pick(CONFIG.SELECTORS.wishlistArea);
    if (!area) {
      log("Área de wishlist não encontrada");
      return false;
    }

    if (Wishlist.isAlreadyAdded()) {
      log("Já está na wishlist");
      return true;
    }

    const btn = area.querySelector(CONFIG.SELECTORS.wishlistButton);
    if (!btn || !visible(btn)) {
      log("Botão de wishlist não encontrado");
      return false;
    }

    // Tenta adicionar com retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          log(`Tentativa ${attempt}/${maxRetries} para adicionar à wishlist`);
          await wait(CONFIG.TIMING.ACTION_DELAY);
        }

        btn.click();

        // Aguarda confirmação visual
        const confirmed = await Wishlist.waitForConfirmation();

        if (confirmed) {
          log(`Adicionado à wishlist com sucesso (tentativa ${attempt})`);
          return true;
        }

        log(`Confirmação falhou na tentativa ${attempt}`, 1);
      } catch (e) {
        log(`Erro na tentativa ${attempt}: ${e.message}`, 1);
      }
    }

    log(`Falha ao adicionar à wishlist após ${maxRetries} tentativas`, 1);
    return false;
  },
};


// === End: src/wishlist.js ===

// === Begin: src/queue.js ===
// ==== Gerenciamento de Fila ====


const Queue = {
  tryStart: () => {
    // Tenta botões específicos
    for (const selector of CONFIG.SELECTORS.queueButtons) {
      const btn = pick(selector);
      if (btn && visible(btn)) {
        btn.click();
        log(`Cliquei em: ${selector}`);
        return true;
      }
    }

    // Tenta busca por texto
    const textTargets = ["Iniciar outra lista", "Clique aqui para começar"];
    for (const txt of textTargets) {
      const el = byText(txt);
      if (el && visible(el)) {
        el.click();
        log(`Cliquei em: "${txt}"`);
        return true;
      }
    }

    return false;
  },

  clickNext: () => {
    const btn = pick(CONFIG.SELECTORS.nextButton);
    if (btn && visible(btn)) {
      btn.click();
      log("Cliquei em: Próximo");
      return true;
    }
    return false;
  },

  isEmpty: () => {
    const empty = pick(CONFIG.SELECTORS.queueEmpty);
    return empty && visible(empty);
  },

  advance: async () => {
    if (Queue.clickNext()) {
      await wait(600);
      return true;
    }
    return false;
  },
};


// === End: src/queue.js ===

// === Begin: src/ageSkip.js ===
// ==== Age Gate Bypass ====


const AgeSkip = {
  /**
   * Verifica se há um age gate visível na página
   * @returns {boolean}
   */
  isActive: () => {
    const ageGate = pick(CONFIG.SELECTORS.ageGate);
    return ageGate && visible(ageGate);
  },

  /**
   * Tenta preencher o ano de nascimento e confirmar para pular o age gate
   * Define o ano para 1990 (usuário com 35+ anos)
   * @returns {Promise<boolean>} true se conseguiu bypass
   */
  bypass: async () => {
    if (!AgeSkip.isActive()) {
      return false;
    }

    log("Age gate detectado, tentando bypass...");

    // Tenta encontrar o campo de ano
    const yearInput = pick(CONFIG.SELECTORS.ageConfirm);

    if (yearInput) {
      // Preenche o campo de ano com 1990
      yearInput.focus();
      yearInput.value = "1990";
      yearInput.dispatchEvent(new Event("input", { bubbles: true }));
      yearInput.dispatchEvent(new Event("change", { bubbles: true }));
      await wait(200);
    }

    // Tenta encontrar e clicar no botão de confirmação
    const confirmBtn = pick(CONFIG.SELECTORS.ageConfirmBtn);

    if (confirmBtn && visible(confirmBtn)) {
      confirmBtn.click();
      log("Age gate bypass - clique no botão de confirmação");
      await wait(800);
      return true;
    }

    // Fallback: tenta submeter o formulário diretamente
    const form = document.querySelector("form");
    if (form) {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      log("Age gate bypass - submit do formulário");
      await wait(800);
      return true;
    }

    log("Não foi possível fazer bypass do age gate", 1);
    return false;
  },

  /**
   * Aguarda o age gate desaparecer após o bypass
   * @param {number} timeout - Tempo máximo de espera em ms
   * @returns {Promise<boolean>}
   */
  waitForDismiss: async (timeout = 3000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (!AgeSkip.isActive()) {
        return true;
      }
      await wait(100);
    }
    log("Age gate não desapareceu após bypass", 1);
    return false;
  },
};

// === End: src/ageSkip.js ===

// === Begin: src/ui.js ===
// ==== Interface do Usuário ====


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


// === End: src/ui.js ===

// === Begin: src/loop.js ===
// ==== Loop Principal ====


const Loop = {
  start: async () => {
    if (State.running) return;

    State.running = true;
    UI.setRunning(true);
    UI.updateStatus("Iniciando...", "#66c0f4");
    log("Loop iniciado");

    Loop.run();
  },

  stop: () => {
    State.running = false;
    UI.setRunning(false);
    UI.updateStatus("Parado");
    log("Loop parado");
  },

  run: async () => {
    while (State.running) {
      await Loop.step();

      // Delay variável
      const jitter =
        CONFIG.TIMING.LOOP_MIN +
        Math.floor(Math.random() * (CONFIG.TIMING.LOOP_MAX - CONFIG.TIMING.LOOP_MIN + 1));
      await wait(jitter);
    }
  },

  step: async () => {
    if (State.processing) return;
    State.processing = true;

    try {
      // 0. Verificar e bypass age gate
      if (AgeSkip.isActive()) {
        log("Age gate detectado, tentando bypass...");
        UI.updateStatus("Bypass age gate...", "#e4d00a");
        const bypassed = await AgeSkip.bypass();
        if (bypassed) {
          await AgeSkip.waitForDismiss();
          log("Age gate bypass com sucesso");
        } else {
          log("Falha no age gate bypass, pulando jogo", 1);
          UI.updateStatus("Age gate falhou, pulando", "#ff7a7a");
          UI.incrementSkipped();
          await Queue.advance();
        }
        State.processing = false;
        return;
      }

      // 1. Verificar se a fila está vazia e gerar nova fila
      if (Queue.isEmpty()) {
        UI.updateStatus("Fila vazia, reiniciando...", "#e4d00a");
        if (Queue.tryStart()) {
          await wait(CONFIG.TIMING.QUEUE_GEN_DELAY);
        }
        State.processing = false;
        return;
      }

      // 2. Processar jogo atual
      const title = Game.getTitle();
      UI.updateStatus(`Verificando: ${title}`, "#66c0f4");

      const skipReason = Game.shouldSkip(State.settings);

      if (skipReason) {
        log(`Pulando: ${title} (${skipReason})`);
        UI.updateStatus(`Pulado: ${skipReason}`, "#aaa");
        UI.incrementSkipped();
      } else {
        // 3. Adicionar à wishlist com confirmação
        const added = await Wishlist.add();
        if (added) {
          log(`Adicionado: ${title}`);
          UI.updateStatus("Adicionado!", "#a1dd4a");
          UI.incrementWishlisted();
        } else {
          log(`Falha ao adicionar ${title} à wishlist`, 1);
          UI.updateStatus("Falha ao adicionar", "#ff7a7a");
        }
      }

      // 4. Avançar para o próximo
      await Queue.advance();
    } catch (e) {
      log(`Erro no loop: ${e.message}`);
      UI.updateStatus(`Erro: ${e.message}`, "#ff7a7a");
    } finally {
      State.processing = false;
    }
  },
};


// === End: src/loop.js ===

// === Begin: src/main.js (body) ===

(function () {
  "use strict";

  // Inicializar settings (usa GM_getValue que só está disponível após o @grant)
  initSettings();

  log("Inicializando Steam Infinite Wishlister v" + CONFIG.VERSION + "...");

  // Criar interface
  UI.create();

  // Conectar botões
  State.ui.startBtn.addEventListener("click", Loop.start);
  State.ui.stopBtn.addEventListener("click", Loop.stop);

  // Atalhos de teclado
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyS") {
      e.preventDefault();
      Loop.start();
    }
    if (e.ctrlKey && e.shiftKey && e.code === "KeyX") {
      e.preventDefault();
      Loop.stop();
    }
    if (e.code === "Escape") {
      Loop.stop();
    }
  });

  // Registrar comandos de menu (acesso rápido via ícone do Tampermonkey)
  GM_registerMenuCommand("Toggle Auto-Iniciar", () => {
    const newVal = !State.settings.autoStart;
    State.settings.autoStart = newVal;
    GM_setValue(CONFIG.STORAGE.AUTO_START, newVal);
    log("Auto-Iniciar: " + (newVal ? "ON" : "OFF"));
  });

  GM_registerMenuCommand("Toggle Exigir Cartas", () => {
    const newVal = !State.settings.requireCards;
    State.settings.requireCards = newVal;
    GM_setValue(CONFIG.STORAGE.REQUIRE_CARDS, newVal);
    log("Exigir Cartas: " + (newVal ? "ON" : "OFF"));
  });

  GM_registerMenuCommand("Toggle Pular Possuídos", () => {
    const newVal = !State.settings.skipOwned;
    State.settings.skipOwned = newVal;
    GM_setValue(CONFIG.STORAGE.SKIP_OWNED, newVal);
    log("Pular Possuídos: " + (newVal ? "ON" : "OFF"));
  });

  // Auto-start se habilitado
  if (State.settings.autoStart) {
    log("Auto-start habilitado, iniciando em 1.5s...");
    setTimeout(() => Loop.start(), 1500);
  } else {
    log("Modo manual. Clique Start para iniciar.");
  }

  log("Inicialização completa!");
})();
// === End: src/main.js ===
