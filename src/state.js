// ==== Estado da Aplicação ====

import CONFIG from "./config.js";

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

export { State, initSettings };
