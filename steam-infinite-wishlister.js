// ==UserScript==
// @name         Steam Infinite Wishlister
// @namespace    http://tampermonkey.net/
// @version      2.4.0
// @description  Steam Discovery Queue automation with robust filters, controls, counters, age bypass and update checker.
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
// @connect      raw.githubusercontent.com
// @connect      github.com
// @license      MIT
// @run-at       document-idle
// ==/UserScript==

// === Begin: src/config.js ===
// ==== Configurações ====

const CONFIG = {
  VERSION: "2.4.0",

  TIMING: {
    LOOP_MIN: 700,
    LOOP_MAX: 1200,
    ACTION_DELAY: 1800,
    QUEUE_GEN_DELAY: 1500,
    UPDATE_CHECK_COOLDOWN_MS: 24 * 60 * 60 * 1000,
    UPDATE_REQUEST_TIMEOUT_MS: 10000,
  },

  URLS: {
    VERSION_JSON:
      "https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/version.json",
    RELEASES:
      "https://github.com/bernardopg/steam-infinite-wishlister/releases/latest",
  },

  SELECTORS: {
    // Botões de fila
    queueButtons: [
      "#discovery_queue_start_link",
      "#refresh_queue_btn > span",
      "#refresh_queue_btn",
      ".discovery_queue_overlay",
    ],
    queueStartLinks: 'a[href*="/app/"][href*="queue="]',

    // Wishlist
    wishlistArea: [
      "#add_to_wishlist_area",
      "#add_to_wishlist_area_success",
      ".queue_wishlist_ctn",
    ],
    wishlistButton: [
      ".add_to_wishlist",
      ".queue_wishlist_button",
      'a[href*="AddToWishlist"]',
    ],
    wishlistSuccess: [
      "#add_to_wishlist_area_success",
      ".queue_btn_active",
      ".btn_wishlist_active",
    ],

    // Navegação
    nextButton: [
      ".btn_next_in_queue_trigger",
      ".btn_next_in_queue",
      "#nextInDiscoveryQueue [role='button']",
    ],

    // Informações do jogo
    tradingCards: [
      'a[href*="category2=29"]',
      'a[href*="/tradingcards/"]',
      '.category_icon[src*="ico_cards"]',
    ],
    owned: [".game_area_already_owned", ".already_in_library"],
    title: [".apphub_AppName", ".queue_item_title", "h1[itemprop='name']"],
    nonGameDlc: [
      ".game_area_dlc_bubble",
      ".game_area_dlc_section",
      'a[href*="/dlc/"]',
    ],
    nonGameDemo: [
      ".demo_above_purchase",
      ".demo_sub_text",
      'a[href*="/demo/"]',
      'a[href*="InstallDemo"]',
    ],
    nonGameSoundtrack: [
      'a[href*="soundtrack"]',
      ".soundtrack_purchase_section",
    ],
    nonGameVideo: [
      'a[href*="/video/"]',
      '.game_area_details_specs_ctn a[href*="movies"]',
    ],
    nonGameSoftware: [
      'a[href*="/software/"]',
      "#category_block a[href*='category1=994']",
    ],

    // Fila vazia
    queueEmpty: [
      ".discover_queue_empty",
      "#refresh_queue_btn",
      ".queue_generation_wrapper",
    ],

    // Concluir lista (último item da fila)
    finishQueue: [".finish_queue_text", ".btn_finish_queue"],

    // Age Gate (verificação de idade)
    ageGate: [
      "#age_gate",
      ".age_gate_ctn",
      "[class*='agegate']",
      "form[action*='agecheck']",
    ],
    ageConfirmYear: [
      "#ageYear",
      "#age_year",
      "#ageGateYear",
      "select[name='ageYear']",
      "select[name='age_year']",
      "input[name='age_year']",
      "input[name='ageYear']",
    ],
    ageConfirmMonth: [
      "#ageMonth",
      "select[name='ageMonth']",
      "select[name='age_month']",
    ],
    ageConfirmDay: [
      "#ageDay",
      "select[name='ageDay']",
      "select[name='age_day']",
    ],
    ageConfirmBtn: [
      ".btn_continue",
      "#age_gate_btn",
      "button[type='submit'][class*='continue']",
      "form[action*='agecheck'] button[type='submit']",
    ],
  },

  TEXTS: {
    queueStart: [
      "Clique aqui para começar",
      "Começar a explorar a sua lista",
      "Start exploring your queue",
      "Start your discovery queue",
      "Iniciar outra lista",
      "Start another queue",
    ],
    queueNext: [
      "Próximo da lista",
      "Proximo da lista",
      "Próximo",
      "Proximo",
      "Next in queue",
      "Next",
    ],
    queueFinish: ["Concluir lista", "Finalizar lista", "Finish queue", "Done"],
    queueEmpty: ["Iniciar outra lista", "Start another queue"],
    wishlistAdded: [
      "Na lista de desejos",
      "On your wishlist",
      "In your wishlist",
      "Ja na wishlist",
      "Já na wishlist",
    ],
  },

  STORAGE: {
    AUTO_START: "wl_auto_start",
    AUTO_RESTART: "wl_auto_restart",
    REQUIRE_CARDS: "wl_require_cards",
    SKIP_OWNED: "wl_skip_owned",
    SKIP_NON_GAMES: "wl_skip_non_games",
    // Legado: mantido para migração de usuários antigos
    SKIP_DLC: "wl_skip_dlc",
    AGE_SKIP: "wl_age_skip",
    STATS_WISHLISTED: "wl_stats_wishlisted",
    STATS_SKIPPED: "wl_stats_skipped",
    UPDATE_LAST_CHECK: "wl_update_last_check",
    UPDATE_LATEST_VERSION: "wl_update_latest_version",
    UPDATE_URL: "wl_update_url",
  },
};
CONFIG;
// === End: src/config.js ===

// === Begin: src/utils.js ===
// ==== Utilitários Básicos ====

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const visible = (el) => !!(el && el.offsetParent !== null);

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    return [value];
  }
  return [];
};

const pick = (sel) =>
  sel?.startsWith("/")
    ? document.evaluate(
        sel,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue
    : document.querySelector(sel);

const pickAny = (selectors) => {
  for (const selector of toArray(selectors)) {
    const element = pick(selector);
    if (element) {
      return element;
    }
  }
  return null;
};

const pickVisibleAny = (selectors) => {
  for (const selector of toArray(selectors)) {
    const element = pick(selector);
    if (visible(element)) {
      return element;
    }
  }
  return null;
};

const normalizeText = (value) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const byText = (txt, root = document) => {
  const nodes = root.querySelectorAll("span, a, button, div");
  const target = normalizeText(txt);
  return Array.from(nodes).find((el) =>
    normalizeText(el.textContent).includes(target),
  );
};

const byAnyText = (texts, root = document) => {
  for (const text of toArray(texts)) {
    const element = byText(text, root);
    if (element) {
      return element;
    }
  }
  return null;
};

const compareVersions = (current, target) => {
  const left = String(current || "0")
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
  const right = String(target || "0")
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);

  const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i++) {
    const a = left[i] || 0;
    const b = right[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
};

const randomBetween = (min, max) =>
  min + Math.floor(Math.random() * (max - min + 1));

const safeClick = (el) => {
  if (!el) return false;
  try {
    el.click();
    return true;
  } catch {
    return false;
  }
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
  paused: false,
  processing: false,

  // Settings vazios — serão inicializados no init() para evitar
  // acesso a GM_* APIs antes do script estar pronto
  settings: {
    autoStart: false,
    autoRestart: true,
    requireCards: true,
    skipOwned: true,
    skipNonGames: true,
    ageSkip: true,
  },

  stats: {
    wishlisted: 0,
    skipped: 0,
  },

  update: {
    available: false,
    latestVersion: null,
    url: null,
  },

  ui: {},
};

const parseIntSafe = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBool = (value, fallback = false) => {
  if (value === true || value === false) {
    return value;
  }
  return fallback;
};

/**
 * Inicializa os settings a partir do GM_*. Deve ser chamado durante o init,
 * não no top-level do módulo, para garantir que as GM_ APIs estão disponíveis.
 */
function initSettings() {
  State.settings.autoStart = parseBool(
    GM_getValue(CONFIG.STORAGE.AUTO_START, false),
    false,
  );
  State.settings.autoRestart = parseBool(
    GM_getValue(CONFIG.STORAGE.AUTO_RESTART, true),
    true,
  );
  State.settings.requireCards = parseBool(
    GM_getValue(CONFIG.STORAGE.REQUIRE_CARDS, true),
    true,
  );
  State.settings.skipOwned = parseBool(
    GM_getValue(CONFIG.STORAGE.SKIP_OWNED, true),
    true,
  );

  const skipNonGames = GM_getValue(CONFIG.STORAGE.SKIP_NON_GAMES, null);
  if (skipNonGames === null || typeof skipNonGames === "undefined") {
    // Migração: reutiliza configuração antiga (SKIP_DLC) para manter comportamento esperado.
    State.settings.skipNonGames = parseBool(
      GM_getValue(CONFIG.STORAGE.SKIP_DLC, true),
      true,
    );
  } else {
    State.settings.skipNonGames = parseBool(skipNonGames, true);
  }

  State.settings.ageSkip = parseBool(
    GM_getValue(CONFIG.STORAGE.AGE_SKIP, true),
    true,
  );

  State.stats.wishlisted = parseIntSafe(
    GM_getValue(CONFIG.STORAGE.STATS_WISHLISTED, "0"),
    0,
  );
  State.stats.skipped = parseIntSafe(
    GM_getValue(CONFIG.STORAGE.STATS_SKIPPED, "0"),
    0,
  );

  const latestVersion = GM_getValue(CONFIG.STORAGE.UPDATE_LATEST_VERSION, "");
  const updateUrl = GM_getValue(CONFIG.STORAGE.UPDATE_URL, "");
  State.update.latestVersion = latestVersion || null;
  State.update.url = updateUrl || null;
}

/**
 * Salva os contadores de estatísticas no armazenamento persistente.
 */
function saveStats() {
  GM_setValue(CONFIG.STORAGE.STATS_WISHLISTED, String(State.stats.wishlisted));
  GM_setValue(CONFIG.STORAGE.STATS_SKIPPED, String(State.stats.skipped));
}
// === End: src/state.js ===

// === Begin: src/game.js ===
// ==== Detecção de Jogos ====


const NON_GAME_MARKERS = [
  {
    type: "DLC",
    terms: ["dlc", "downloadable content", "conteudo para download"],
  },
  {
    type: "Demo",
    terms: ["demo", "demonstracao", "demonstration"],
  },
  {
    type: "Soundtrack",
    terms: ["soundtrack", "trilha sonora"],
  },
];

const hasAnyTerm = (text, terms) => terms.some((term) => text.includes(term));

const Game = {
  hasCards: () => {
    if (pickAny(CONFIG.SELECTORS.tradingCards)) return true;

    const labels = Array.from(
      document.querySelectorAll(".game_area_details_specs_ctn .label"),
    );
    const hasLabel = labels.some((el) => {
      const text = normalizeText(el.textContent);
      return text.includes("trading cards") || text.includes("cartas");
    });
    if (hasLabel) return true;

    return false;
  },

  isOwned: () => {
    const indicator = pickVisibleAny(CONFIG.SELECTORS.owned);
    if (indicator && visible(indicator)) return true;

    const maybeOwned = byAnyText([
      "In library",
      "Already in your Steam library",
      "Ja esta na sua biblioteca",
      "Já está na sua biblioteca",
    ]);

    return !!(maybeOwned && visible(maybeOwned));
  },

  detectNonGameType: () => {
    if (pickVisibleAny(CONFIG.SELECTORS.nonGameDlc)) return "DLC";
    if (pickVisibleAny(CONFIG.SELECTORS.nonGameDemo)) return "Demo";
    if (pickVisibleAny(CONFIG.SELECTORS.nonGameSoundtrack)) return "Soundtrack";
    if (pickVisibleAny(CONFIG.SELECTORS.nonGameVideo)) return "Video";
    if (pickVisibleAny(CONFIG.SELECTORS.nonGameSoftware)) return "Software";

    const typeSources = [
      ".breadcrumbs",
      "#genresAndManufacturer",
      ".game_description_snippet",
      ".game_page_autocollapse_ctn",
      ".game_area_purchase_game",
    ];
    const sample = normalizeText(
      typeSources
        .map((selector) => document.querySelector(selector)?.textContent || "")
        .join(" "),
    );

    for (const marker of NON_GAME_MARKERS) {
      if (hasAnyTerm(sample, marker.terms)) {
        return marker.type;
      }
    }

    return null;
  },

  getTitle: () => {
    const title = pickAny(CONFIG.SELECTORS.title);
    return title?.textContent?.trim() || "Jogo Atual";
  },

  shouldSkip: (settings) => {
    if (settings.skipOwned && Game.isOwned()) {
      return "Já possui";
    }

    if (settings.skipNonGames) {
      const type = Game.detectNonGameType();
      if (type) {
        return `Não-jogo (${type})`;
      }
    }

    if (settings.requireCards && !Game.hasCards()) {
      return "Sem cartas";
    }

    return null;
  },
};
Game;
// === End: src/game.js ===

// === Begin: src/wishlist.js ===
// ==== Gerenciamento de Wishlist ====


const findWishlistButton = (area) => {
  if (area) {
    for (const selector of CONFIG.SELECTORS.wishlistButton) {
      const button = area.querySelector(selector);
      if (button) return button;
    }
  }
  return pickAny(CONFIG.SELECTORS.wishlistButton);
};

const Wishlist = {
  /**
   * Verifica se o jogo já está na wishlist
   * Verifica múltiplos sinais: área de sucesso, botão ativo, ou botão de adicionar ausente
   * @returns {boolean}
   */
  isAlreadyAdded: () => {
    const successArea = pickVisibleAny(CONFIG.SELECTORS.wishlistSuccess);
    if (successArea && visible(successArea)) return true;

    const area = pickAny(CONFIG.SELECTORS.wishlistArea);
    if (area) {
      const btn = findWishlistButton(area);
      if (
        btn &&
        (btn.classList.contains("queue_btn_active") ||
          btn.classList.contains("btn_wishlist_active") ||
          btn.getAttribute("aria-pressed") === "true")
      ) {
        return true;
      }

      if (!btn) {
        const success = area.querySelector("#add_to_wishlist_area_success");
        if (success && visible(success)) return true;
      }

      const btnText = normalizeText(btn?.textContent);
      if (
        btnText &&
        CONFIG.TEXTS.wishlistAdded.some((value) =>
          btnText.includes(normalizeText(value)),
        )
      ) {
        return true;
      }
    }

    const activeBtn = pickVisibleAny(CONFIG.SELECTORS.wishlistSuccess);
    if (activeBtn) return true;

    const byText = byAnyText(CONFIG.TEXTS.wishlistAdded);
    if (byText && visible(byText)) return true;

    return false;
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
    if (Wishlist.isAlreadyAdded()) {
      log("Já está na wishlist");
      return true;
    }

    // Tenta adicionar com retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const area = pickAny(CONFIG.SELECTORS.wishlistArea);
        if (!area) {
          log("Área de wishlist não encontrada", 1);
          return false;
        }

        const btn = findWishlistButton(area);
        if (!btn || !visible(btn)) {
          log("Botão de wishlist não encontrado", 1);
          return false;
        }

        if (attempt > 1) {
          log(`Tentativa ${attempt}/${maxRetries} para adicionar à wishlist`);
          await wait(CONFIG.TIMING.ACTION_DELAY);
        }

        if (!safeClick(btn)) {
          log(`Falha de clique na tentativa ${attempt}`, 1);
          continue;
        }

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
Wishlist;
// === End: src/wishlist.js ===

// === Begin: src/queue.js ===
// ==== Gerenciamento de Fila ====


const Queue = {
  openFirstQueueItem: () => {
    const links = document.querySelectorAll(CONFIG.SELECTORS.queueStartLinks);
    for (const link of links) {
      if (visible(link) && safeClick(link)) {
        log("Cliquei no primeiro item da fila");
        return true;
      }
    }
    return false;
  },

  tryStart: () => {
    const button = pickVisibleAny(CONFIG.SELECTORS.queueButtons);
    if (button && safeClick(button)) {
      log("Cliquei no botão de início/reinício da fila");
      return true;
    }

    if (Queue.openFirstQueueItem()) {
      return true;
    }

    const byTextButton = byAnyText(CONFIG.TEXTS.queueStart);
    if (byTextButton && visible(byTextButton) && safeClick(byTextButton)) {
      log("Cliquei por texto para iniciar/reiniciar a fila");
      return true;
    }

    return false;
  },

  clickNext: () => {
    const btn = pickVisibleAny(CONFIG.SELECTORS.nextButton);
    if (btn && safeClick(btn)) {
      log("Cliquei em: Próximo");
      return true;
    }

    const byTextButton = byAnyText(CONFIG.TEXTS.queueNext);
    if (byTextButton && visible(byTextButton) && safeClick(byTextButton)) {
      log("Cliquei em Próximo por fallback textual");
      return true;
    }

    return false;
  },

  isEmpty: () => {
    const empty = pickVisibleAny(CONFIG.SELECTORS.queueEmpty);
    if (empty) return true;

    const byText = byAnyText(CONFIG.TEXTS.queueEmpty);
    return !!(byText && visible(byText));
  },

  clickFinish: () => {
    const btn = pickVisibleAny(CONFIG.SELECTORS.finishQueue);
    if (btn && safeClick(btn)) {
      log("Cliquei em: Concluir lista");
      return true;
    }

    const byTextButton = byAnyText(CONFIG.TEXTS.queueFinish);
    if (byTextButton && visible(byTextButton) && safeClick(byTextButton)) {
      log("Cliquei em Concluir lista por fallback textual");
      return true;
    }

    return false;
  },

  advance: async () => {
    if (Queue.clickNext()) {
      await wait(CONFIG.TIMING.ACTION_DELAY);
      return true;
    }

    log("Falha ao avançar: nenhum botão de próximo encontrado", 1);
    return false;
  },
};
Queue;
// === End: src/queue.js ===

// === Begin: src/ageSkip.js ===
// ==== Age Gate Bypass ====


const setFieldValue = (field, value) => {
  if (!field) return;
  field.focus();
  field.value = String(value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
};

const AgeSkip = {
  /**
   * Verifica se há um age gate visível na página
   * @returns {boolean}
   */
  isActive: () => {
    const ageGate = pickVisibleAny(CONFIG.SELECTORS.ageGate);
    if (ageGate && visible(ageGate)) return true;

    return window.location.pathname.includes("/agecheck");
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

    const yearInput = pickAny(CONFIG.SELECTORS.ageConfirmYear);
    const monthInput = pickAny(CONFIG.SELECTORS.ageConfirmMonth);
    const dayInput = pickAny(CONFIG.SELECTORS.ageConfirmDay);

    if (yearInput) {
      setFieldValue(yearInput, "1990");
    }
    if (monthInput) setFieldValue(monthInput, "1");
    if (dayInput) setFieldValue(dayInput, "1");

    await wait(200);

    const confirmBtn = pickVisibleAny(CONFIG.SELECTORS.ageConfirmBtn);
    if (confirmBtn && safeClick(confirmBtn)) {
      log("Age gate bypass - clique no botão de confirmação");
      await wait(800);
      return true;
    }

    const textButton = byAnyText([
      "Ver página",
      "View Page",
      "Continue",
      "Entrar",
      "Acessar",
    ]);
    if (textButton && visible(textButton) && safeClick(textButton)) {
      log("Age gate bypass - fallback textual");
      await wait(800);
      return true;
    }

    const form =
      yearInput?.form ||
      document.querySelector("form[action*='agecheck']") ||
      document.querySelector("form");

    if (form) {
      if (typeof form.submit === "function") {
        form.submit();
      } else {
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
      }
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
    const initialPath = window.location.pathname;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const pathChanged = window.location.pathname !== initialPath;
      if (!AgeSkip.isActive() || pathChanged) {
        return true;
      }
      await wait(100);
    }
    log("Age gate não desapareceu após bypass", 1);
    return false;
  },
};
AgeSkip;
// === End: src/ageSkip.js ===

// === Begin: src/ui.js ===
// ==== Interface do Usuário ====


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
UI;
// === End: src/ui.js ===

// === Begin: src/loop.js ===
// ==== Loop Principal ====








const Loop = {
  start: () => {
    if (State.running) return;

    State.running = true;
    State.paused = false;
    UI.setLoopState("running");
    UI.updateStatus("Executando...", "#66c0f4");
    log("Loop iniciado");

    void Loop.run();
  },

  pause: () => {
    if (!State.running) return;

    State.running = false;
    State.paused = true;
    UI.setLoopState("paused");
    UI.updateStatus("Pausado", "#e4d00a");
    log("Loop pausado");
  },

  stop: () => {
    State.running = false;
    State.paused = false;
    UI.setLoopState("stopped");
    UI.updateStatus("Parado");
    log("Loop parado");
  },

  processOnce: async () => {
    if (State.running || State.processing) {
      return false;
    }

    UI.updateStatus("Processando item único...", "#66c0f4");
    const processed = await Loop.step({ manual: true });

    if (!State.running) {
      UI.setLoopState(State.paused ? "paused" : "stopped");
    }

    return processed;
  },

  skipCurrent: async () => {
    if (State.processing) {
      return false;
    }

    UI.updateStatus("Pulando item manualmente...", "#aaa");
    UI.incrementSkipped();
    saveStats();

    const advanced = await Queue.advance();
    UI.updateStatus(advanced ? "Item pulado" : "Falha ao pular", advanced ? "#aaa" : "#ff7a7a");
    return advanced;
  },

  run: async () => {
    while (State.running) {
      await Loop.step();

      if (!State.running) {
        break;
      }

      // Delay variável
      const jitter = randomBetween(CONFIG.TIMING.LOOP_MIN, CONFIG.TIMING.LOOP_MAX);
      await wait(jitter);
    }
  },

  ensureQueueContext: async () => {
    if (Queue.openFirstQueueItem()) {
      await wait(CONFIG.TIMING.QUEUE_GEN_DELAY * 2);
      return true;
    }

    if (Queue.tryStart()) {
      await wait(CONFIG.TIMING.QUEUE_GEN_DELAY);
      return true;
    }

    return false;
  },

  step: async ({ manual = false } = {}) => {
    if (State.processing) return;
    State.processing = true;

    try {
      // 0. Verificar e bypass age gate (deve ocorrer antes da heurística de contexto)
      if (State.settings.ageSkip && AgeSkip.isActive()) {
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
          saveStats();
          await Queue.advance();
        }
        return true;
      }

      if (!State.settings.ageSkip && AgeSkip.isActive()) {
        UI.updateStatus("Age gate ativo. Habilite Age Skip ou confirme manualmente.", "#ff7a7a");
        return false;
      }

      // 1. Verificar se estamos em página com item de jogo ativo da fila
      if (!pickAny(CONFIG.SELECTORS.title)) {
        log("Sem jogo ativo detectado; tentando abrir/gerar fila...", 1);
        UI.updateStatus("Iniciando fila...", "#e4d00a");

        const started = await Loop.ensureQueueContext();
        if (!started && !manual && State.running) {
          UI.updateStatus("Abra /explore e clique em iniciar", "#ff7a7a");
          Loop.pause();
        }
        return false;
      }

      // 2. Verificar se a fila está vazia
      if (Queue.isEmpty()) {
        if (!State.settings.autoRestart) {
          UI.updateStatus("Fila vazia (auto-restart desativado)", "#e4d00a");
          if (!manual && State.running) {
            Loop.pause();
          }
          return false;
        }

        if (Queue.clickFinish()) {
          UI.updateStatus("Concluindo lista...", "#a1dd4a");
          await wait(CONFIG.TIMING.QUEUE_GEN_DELAY);
        }

        UI.updateStatus("Fila vazia, reiniciando...", "#e4d00a");
        if (Queue.tryStart()) {
          await wait(CONFIG.TIMING.QUEUE_GEN_DELAY);
          return false;
        }

        UI.updateStatus("Falha ao reiniciar fila", "#ff7a7a");
        return false;
      }

      // 3. Processar jogo atual
      const title = Game.getTitle();
      UI.updateStatus(`Verificando: ${title}`, "#66c0f4");

      const skipReason = Game.shouldSkip(State.settings);

      if (skipReason) {
        log(`Pulando: ${title} (${skipReason})`);
        UI.updateStatus(`Pulado: ${skipReason}`, "#aaa");
        UI.incrementSkipped();
        saveStats();
      } else {
        // 3. Adicionar à wishlist com confirmação
        const added = await Wishlist.add();
        if (added) {
          log(`Adicionado: ${title}`);
          UI.updateStatus("Adicionado!", "#a1dd4a");
          UI.incrementWishlisted();
          saveStats();
        } else {
          log(`Falha ao adicionar ${title} à wishlist`, 1);
          UI.updateStatus("Falha ao adicionar", "#ff7a7a");
        }
      }

      // 4. Avançar para o próximo
      await Queue.advance();
      return true;
    } catch (e) {
      log(`Erro no loop: ${e.message}`);
      UI.updateStatus(`Erro: ${e.message}`, "#ff7a7a");
      return false;
    } finally {
      State.processing = false;
    }
  },
};
Loop;
// === End: src/loop.js ===

// === Begin: src/update.js ===
// ==== Update Checker ====




const readStoredTimestamp = () => {
  const raw = GM_getValue(CONFIG.STORAGE.UPDATE_LAST_CHECK, "0");
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const persistUpdateInfo = (version, url) => {
  GM_setValue(CONFIG.STORAGE.UPDATE_LATEST_VERSION, version || "");
  GM_setValue(CONFIG.STORAGE.UPDATE_URL, url || CONFIG.URLS.RELEASES);
};

const applyLatestInfo = (version, url) => {
  State.update.latestVersion = version;
  State.update.url = url || CONFIG.URLS.RELEASES;
};

const UpdateChecker = {
  restoreCached: () => {
    const latestVersion = GM_getValue(CONFIG.STORAGE.UPDATE_LATEST_VERSION, "");
    const updateUrl = GM_getValue(CONFIG.STORAGE.UPDATE_URL, CONFIG.URLS.RELEASES);

    if (latestVersion && compareVersions(CONFIG.VERSION, latestVersion) < 0) {
      applyLatestInfo(latestVersion, updateUrl);
      State.update.available = true;
      UI.showUpdateAvailable(latestVersion, updateUrl);
      log(`Update pendente em cache: v${latestVersion}`, 1);
      return;
    }

    State.update.available = false;
    UI.showCurrentVersion();
  },

  maybeCheck: () => {
    const lastCheck = readStoredTimestamp();
    const now = Date.now();
    if (now - lastCheck < CONFIG.TIMING.UPDATE_CHECK_COOLDOWN_MS) {
      log("Verificação de update em cooldown", 2);
      return Promise.resolve(false);
    }

    return UpdateChecker.check();
  },

  check: () =>
    new Promise((resolve) => {
      if (typeof GM_xmlhttpRequest !== "function") {
        log("GM_xmlhttpRequest indisponível; update checker ignorado", 1);
        resolve(false);
        return;
      }

      const url = `${CONFIG.URLS.VERSION_JSON}?_=${Date.now()}`;
      log(`Verificando atualização em ${url}`, 1);

      GM_xmlhttpRequest({
        method: "GET",
        url,
        timeout: CONFIG.TIMING.UPDATE_REQUEST_TIMEOUT_MS,
        onload: (response) => {
          GM_setValue(CONFIG.STORAGE.UPDATE_LAST_CHECK, String(Date.now()));

          if (response.status < 200 || response.status >= 300) {
            log(`Falha ao checar atualização: HTTP ${response.status}`, 1);
            resolve(false);
            return;
          }

          try {
            const data = JSON.parse(response.responseText || "{}");
            const latestVersion = String(data.version || "").trim();
            const updateUrl = String(data.updateUrl || CONFIG.URLS.RELEASES).trim();

            if (!latestVersion) {
              log("version.json sem campo version", 1);
              resolve(false);
              return;
            }

            applyLatestInfo(latestVersion, updateUrl);

            if (compareVersions(CONFIG.VERSION, latestVersion) < 0) {
              State.update.available = true;
              persistUpdateInfo(latestVersion, updateUrl);
              UI.showUpdateAvailable(latestVersion, updateUrl);
              log(`Update disponível: v${latestVersion}`);
            } else {
              State.update.available = false;
              persistUpdateInfo("", updateUrl);
              UI.showCurrentVersion();
              log("Nenhum update disponível", 1);
            }

            resolve(true);
          } catch (error) {
            log(`Erro ao parsear version.json: ${error.message}`, 1);
            resolve(false);
          }
        },
        ontimeout: () => {
          log("Timeout ao verificar atualização", 1);
          resolve(false);
        },
        onerror: () => {
          log("Erro de rede ao verificar atualização", 1);
          resolve(false);
        },
      });
    }),
};
UpdateChecker;
// === End: src/update.js ===

// === Begin: src/main.js (body) ===
const applySetting = (stateKey, storageKey, value, checkbox) => {
  State.settings[stateKey] = value;
  GM_setValue(storageKey, value);
  if (checkbox) {
    checkbox.checked = value;
  }
};

const toggleSetting = (stateKey, storageKey, checkbox) => {
  applySetting(stateKey, storageKey, !State.settings[stateKey], checkbox);
};

(function () {
  "use strict";

  // Inicializar settings (usa GM_getValue que só está disponível após o @grant)
  initSettings();

  log("Inicializando Steam Infinite Wishlister v" + CONFIG.VERSION + "...");

  // Criar interface
  UI.create();
  UI.showCurrentVersion();

  // Conectar botões
  State.ui.startBtn.addEventListener("click", Loop.start);
  State.ui.pauseBtn.addEventListener("click", Loop.pause);
  State.ui.stopBtn.addEventListener("click", Loop.stop);
  State.ui.onceBtn.addEventListener("click", () => {
    void Loop.processOnce();
  });
  State.ui.skipBtn.addEventListener("click", () => {
    void Loop.skipCurrent();
  });

  // Atalhos de teclado
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyS") {
      e.preventDefault();
      Loop.start();
    }
    if (e.ctrlKey && e.shiftKey && e.code === "KeyP") {
      e.preventDefault();
      Loop.pause();
    }
    if (e.ctrlKey && e.shiftKey && e.code === "KeyX") {
      e.preventDefault();
      Loop.stop();
    }
    if (e.ctrlKey && e.shiftKey && e.code === "KeyO") {
      e.preventDefault();
      void Loop.processOnce();
    }
    if (e.ctrlKey && e.shiftKey && e.code === "KeyN") {
      e.preventDefault();
      void Loop.skipCurrent();
    }
    if (e.code === "Escape") {
      Loop.stop();
    }
  });

  // Registrar comandos de menu (acesso rápido via ícone do Tampermonkey)
  GM_registerMenuCommand("Start", () => {
    Loop.start();
  });

  GM_registerMenuCommand("Pause", () => {
    Loop.pause();
  });

  GM_registerMenuCommand("Stop", () => {
    Loop.stop();
  });

  GM_registerMenuCommand("Process Once", () => {
    void Loop.processOnce();
  });

  GM_registerMenuCommand("Skip Item", () => {
    void Loop.skipCurrent();
  });

  GM_registerMenuCommand("Toggle Auto-Start", () => {
    toggleSetting("autoStart", CONFIG.STORAGE.AUTO_START, State.ui.autoCheck);
    log("Auto-Start: " + (State.settings.autoStart ? "ON" : "OFF"));
  });

  GM_registerMenuCommand("Toggle Auto-Restart", () => {
    toggleSetting(
      "autoRestart",
      CONFIG.STORAGE.AUTO_RESTART,
      State.ui.restartCheck
    );
    log("Auto-Restart: " + (State.settings.autoRestart ? "ON" : "OFF"));
  });

  GM_registerMenuCommand("Toggle Require Cards", () => {
    toggleSetting(
      "requireCards",
      CONFIG.STORAGE.REQUIRE_CARDS,
      State.ui.cardsCheck
    );
    log("Require Cards: " + (State.settings.requireCards ? "ON" : "OFF"));
  });

  GM_registerMenuCommand("Toggle Skip Owned", () => {
    toggleSetting("skipOwned", CONFIG.STORAGE.SKIP_OWNED, State.ui.ownedCheck);
    log("Skip Owned: " + (State.settings.skipOwned ? "ON" : "OFF"));
  });

  GM_registerMenuCommand("Toggle Skip Non-Games", () => {
    const value = !State.settings.skipNonGames;
    applySetting(
      "skipNonGames",
      CONFIG.STORAGE.SKIP_NON_GAMES,
      value,
      State.ui.nonGamesCheck
    );
    // Migração legada
    GM_setValue(CONFIG.STORAGE.SKIP_DLC, value);
    log("Skip Non-Games: " + (State.settings.skipNonGames ? "ON" : "OFF"));
  });

  GM_registerMenuCommand("Toggle Age Skip", () => {
    toggleSetting("ageSkip", CONFIG.STORAGE.AGE_SKIP, State.ui.ageSkipCheck);
    log("Age Skip: " + (State.settings.ageSkip ? "ON" : "OFF"));
  });

  GM_registerMenuCommand("Check Updates Now", () => {
    void UpdateChecker.check();
  });

  // Update checker
  UpdateChecker.restoreCached();
  void UpdateChecker.maybeCheck();

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
