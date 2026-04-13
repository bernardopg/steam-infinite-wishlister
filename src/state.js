// ==== Estado da Aplicação ====

import CONFIG from "./config.js";

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

export { State, initSettings, saveStats };
