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

export default CONFIG;
