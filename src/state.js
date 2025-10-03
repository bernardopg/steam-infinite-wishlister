// ==== Estado da Aplicação ====

import CONFIG from "./config.js";

const State = {
  running: false,
  processing: false,

  settings: {
    autoStart: GM_getValue(CONFIG.STORAGE.AUTO_START, false),
    requireCards: GM_getValue(CONFIG.STORAGE.REQUIRE_CARDS, true),
    skipOwned: GM_getValue(CONFIG.STORAGE.SKIP_OWNED, true),
    skipDLC: GM_getValue(CONFIG.STORAGE.SKIP_DLC, true),
  },

  stats: {
    wishlisted: parseInt(
      sessionStorage.getItem(CONFIG.STORAGE.WISHLIST_COUNT) || "0"
    ),
    skipped: 0,
  },

  ui: {},
};

export default State;
