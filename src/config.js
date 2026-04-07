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
    // O botão de wishlist É o próprio .add_to_wishlist (não há .btn_addtocart dentro)
    wishlistButton: ".add_to_wishlist, .queue_wishlist_button",
    wishlistSuccess: ".add_to_wishlist_area_success, .queue_btn_active",

    // Navegação
    nextButton: ".btn_next_in_queue_trigger, .btn_next_in_queue",

    // Informações do jogo
    // O link de cartas usa category2=29 (Trading Cards) no href
    tradingCards: 'a[href*="category2=29"], a[href*="/tradingcards/"]',
    owned: ".game_area_already_owned",
    dlc: ".game_area_dlc_bubble",
    title: ".apphub_AppName, .queue_item_title",

    // Fila vazia
    queueEmpty: ".discover_queue_empty",

    // Concluir lista (último item da fila)
    finishQueue: ".finish_queue_text, .btn_finish_queue",

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
    STATS_WISHLISTED: "wl_stats_wishlisted",
    STATS_SKIPPED: "wl_stats_skipped",
  },
};

export default CONFIG;
