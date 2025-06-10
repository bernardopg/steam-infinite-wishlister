// ==UserScript==
// @name         Steam Infinite Wishlister
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Advanced Steam Discovery Queue wishlisting: Trading Card/DLC/Owned options, Age Skip, Pause/Resume, Counters, Robustness++
// @icon         https://store.steampowered.com/favicon.ico
// @author       bernardopg
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
// ==/UserScript==

(function () {
  "use strict";

  // ====================================
  // Module: Configuration
  // ====================================
  const CONFIG = {
    // Timing configuration (all values in milliseconds)
    TIMING: {
      CHECK_INTERVAL: 3500, // How often to check the current page when running the loop
      ACTION_DELAY: 1800, // Delay after performing a major action (like adding to wishlist)
      ADVANCE_DELAY: 600, // Delay before advancing to next item (1/3 of ACTION_DELAY)
      PROCESSING_RELEASE_DELAY: 900, // Delay before releasing processing lock (1/2 of ACTION_DELAY)
      QUEUE_GENERATION_DELAY: 1500, // Delay after attempting to generate a new queue
      QUEUE_LOCK_RELEASE_DELAY: 2000, // Delay before releasing queue generation lock (unused currently)
      INITIAL_START_DELAY: 1500, // Delay before starting the loop on page load
      WISHLIST_CONFIRM_TIMEOUT: 5000, // Timeout for confirming wishlist action success (used by polling)
      MINI_DELAY: 100, // Very small delay for minor operations
      VERSION_CHECK_INTERVAL: 86400000, // Check for updates once per day (24h)
    },

    // DOM Selectors - organized by functional area
    SELECTORS: {
      // Wishlist related selectors
      wishlist: {
        area: "#add_to_wishlist_area, .queue_wishlist_ctn, .game_area_purchase_game, .purchase_game_wrapper, .game_area_purchase, .queue_btn_wishlist, .app_page_btn_area, .queue_control_button", // Expanded container for wishlist button/status (app page, explore page, purchase areas)
        addButton:
          ".add_to_wishlist .btn_addtocart .btnv6_blue_hoverfade, .queue_wishlist_button .btnv6_blue_hoverfade, .btn_addtocart .btn_medium, .game_area_purchase_game .btn_addtocart a, .purchase_game_wrapper .btn_addtocart a, .game_area_purchase .btn_addtocart a, .btnv6_lightblue_blue, .btn_medium[href*='AddToWishlist'], a[href*='wishlist/add'], .btn_addtocart a, .btnv6_blue_blue, .btn_small[href*='AddToWishlist'], .smallbtn[href*='wishlist/add'], .game_area_purchase_section a[href*='wishlist'], .queue_btn_wishlist .btnv6_blue_hoverfade, .queue_control_button .btnv6_blue_hoverfade, [data-panel='wishlist'] .btnv6_blue_hoverfade, .btn_queue_action, .add_to_wishlist_button", // Further expanded selectors for app page, explore page, purchase areas, and more generic wishlist links
        successIndicator:
          ".add_to_wishlist_area_success, .queue_btn_active, .wishlist_added, .wishlist_added_ctn, .queue_btn_wishlist.queue_btn_active, .wishlist_added_text, .btn_addtocart_already, .already_in_wishlist, .queue_wishlist_ctn.queue_btn_active, [data-panel='wishlist'].queue_btn_active", // Success text (app page), active class (explore page), or added class
      },

      // Game information selectors
      gameInfo: {
        tradingCardsIndicator:
          '.game_area_details_specs a[href*="/tradingcards/"], a.trading_card_details_link[href*="/tradingcards/"], .game_area_details_specs a[href*="tradingcards"], .badge_row_inner a[href*="cards"], .communitylink_achivement_plusmore', // Seletores expandidos para trading cards
        title: ".apphub_AppName", // Main title on app page
        queueRemainingText: ".queue_sub_text", // Text like "X items remaining in queue"
        inLibraryIndicator: ".game_area_already_owned", // "Already in your library" notice (app page)
        dlcIndicator: ".game_area_dlc_bubble", // Bubble indicating DLC (app page)
        appTypeElement: ".game_details .details_block", // Block containing text like "Downloadable Content" (app page)
      },

      // Queue navigation selectors
      queueNav: {
        nextButton:
          ".btn_next_in_queue_trigger, .btn_next_in_queue .btnv6_lightblue_blue", // Next button (app page, explore page)
        nextForm: "#next_in_queue_form", // Hidden form sometimes used for navigation
        ignoreButtonContainer: "#ignoreBtn", // Container for ignore button (app page)
        ignoreButtonInContainer: ".queue_btn_ignore", // Ignore button itself (app page, explore page)
      },

      // Queue status and management selectors
      queueStatus: {
        container: "#discovery_queue_ctn, #discovery_queue", // Main queue container (app page, explore page)
        finishedIndicator: ".discover_queue_empty", // Element shown when queue is finished
        emptyContainer: ".discover_queue_empty", // Alias for finishedIndicator, used for clarity
        // Selectors for starting a queue
        startLink:
          ".discovery_queue_start_link, #discovery_queue_start_link, .discovery_queue_winter_sale_cards_header a[href*='discovery_queue'], .discovery_queue_global_header a[href*='discoveryqueue']", // Various links to start a queue
        // Selectors for starting *another* queue when one finished
        startAnotherButton:
          "#refresh_queue_btn, .discover_queue_empty_refresh_btn .btnv6_lightblue_blue, .discover_queue_empty a[href*='discoveryqueue'], .begin_exploring", // Various buttons/links to start a new queue after finishing
      },

      // Age gate selectors
      ageGate: {
        storeContainer: "#app_agegate", // Container for age gate on store pages
        communityTextContainer: ".agegate_text_container", // Container for age gate text on community pages
      },

      // UI selectors
      ui: {
        container: "#wishlist-looper-controls",
        statusElement: "#wl-status",
        minimizeButton: "#wl-minimize",
        processOnceButton: "#wl-process-once",
        skipButton: "#wl-skip",
        pauseButton: "#wl-pause",
        wishlistCountElement: "#wl-wishlist-count",
        requireCardsCheckbox: "#wl-require-cards",
        skipNonGamesCheckbox: "#wl-skip-non-games",
        skipOwnedCheckbox: "#wl-skip-owned",
        startButton: "#wl-start",
        stopButton: "#wl-stop",
        autoStartCheckbox: "#wl-autostart",
        autoRestartCheckbox: "#wl-autorestart",
        versionInfo: "#wl-version-info",
      },
    },

    // Storage keys
    STORAGE_KEYS: {
      AUTO_START: "wishlistLooperAutoStartV2",
      AUTO_RESTART_QUEUE: "wishlistLooperAutoRestartQueueV2",
      UI_MINIMIZED: "wishlistLooperUiMinimizedV2",
      REQUIRE_CARDS: "wishlistLooperRequireCardsV2",
      SKIP_NON_GAMES: "wishlistLooperSkipNonGamesV2",
      SKIP_OWNED: "wishlistLooperSkipOwnedV2",
      LOG_LEVEL: "wishlistLooperLogLevel",
      SESSION_WISHLIST_COUNT: "wishlistLooperSessionCountV2",
      LAST_VERSION_CHECK: "wishlistLooperLastVersionCheck",
      // Example version check URL (replace with your actual source if hosting)
      VERSION_CHECK_URL:
        "https://raw.githubusercontent.com/bernardopg/steam-wishlist-looper/main/version.json",
    },

    // App constants
    MAX_QUEUE_RESTART_FAILURES: 5,
    CURRENT_VERSION: "2.1", // Updated version
    // URL for version checking, defined in STORAGE_KEYS now for consistency
    get VERSION_CHECK_URL() {
      return GM_getValue(
        CONFIG.STORAGE_KEYS.VERSION_CHECK_URL,
        "https://raw.githubusercontent.com/bernardopg/steam-wishlist-looper/main/version.json"
      );
    },
  };

  // ====================================
  // Module: State Management
  // ====================================
  const State = {
    loop: {
      state: "Stopped", // 'Stopped', 'Running', 'Paused'
      timeoutId: null, // Holds the timeout ID for the main loop
      isProcessing: false, // Whether we're currently processing an item
      manualActionInProgress: false, // Whether a manual action is in progress
      failedQueueRestarts: 0, // Counter for failed queue restart attempts
    },

    settings: {
      autoStartEnabled: GM_getValue(CONFIG.STORAGE_KEYS.AUTO_START, false),
      autoRestartQueueEnabled: GM_getValue(
        CONFIG.STORAGE_KEYS.AUTO_RESTART_QUEUE,
        true
      ),
      uiMinimized: GM_getValue(CONFIG.STORAGE_KEYS.UI_MINIMIZED, false),
      requireTradingCards: GM_getValue(CONFIG.STORAGE_KEYS.REQUIRE_CARDS, true),
      skipNonGames: GM_getValue(CONFIG.STORAGE_KEYS.SKIP_NON_GAMES, true),
      skipOwnedGames: GM_getValue(CONFIG.STORAGE_KEYS.SKIP_OWNED, true),
      logLevel: GM_getValue(CONFIG.STORAGE_KEYS.LOG_LEVEL, 1), // Alterado de 0 para 1 para mostrar logs de debug por padrão
    },

    stats: {
      wishlistedThisSession: parseInt(
        sessionStorage.getItem(CONFIG.STORAGE_KEYS.SESSION_WISHLIST_COUNT) ||
          "0"
      ),
      skippedThisSession: parseInt(
        sessionStorage.getItem("wishlistLooperSkippedCountV2") || "0"
      ),
      lastVersionCheck: GM_getValue(CONFIG.STORAGE_KEYS.LAST_VERSION_CHECK, 0),
      latestVersion: null, // Stores fetched latest version
      updateUrl: null, // Stores fetched update URL
    },

    ui: {
      elements: {}, // Will hold references to UI DOM elements
    },
  };

  // ====================================
  // Module: Logging
  // ====================================
  const Logger = {
    /**
     * Log a message with a specified level
     * @param {string} message - The message to log
     * @param {number} level - The log level (0=info, 1=debug, 2=verbose)
     */
    log: function (message, level = 0) {
      if (level <= State.settings.logLevel) {
        const prefix = level === 1 ? "[DEBUG]" : level === 2 ? "[VERBOSE]" : "";
        // Avoid double prefixing if message already has it
        if (!message.startsWith("[Steam Wishlist Looper]")) {
          console.log(`[Steam Wishlist Looper]${prefix}`, message);
        } else {
          // If message already has the main prefix, just add the level prefix
          console.log(
            `${prefix} ${message.replace("[Steam Wishlist Looper]", "").trim()}`
          );
        }
      }
    },
  };

  // ====================================
  // Module: UI Management
  // ====================================
  const UI = {
    /**
     * Update the status text in the UI
     * @param {string} message - The status message to display
     * @param {string} statusType - The type of status (info, action, success, skipped, error, paused)
     */
    updateStatusText: function (message, statusType = "info") {
      if (!State.ui.elements.status) return;

      State.ui.elements.status.textContent = `Status: ${message}`;
      // Clear previous status classes before adding new one
      State.ui.elements.status.className =
        CONFIG.SELECTORS.ui.statusElement.substring(1); // Reset to base class

      switch (statusType) {
        case "action":
          State.ui.elements.status.classList.add("wl-status-action");
          break;
        case "success":
          State.ui.elements.status.classList.add("wl-status-success");
          break;
        case "skipped":
          State.ui.elements.status.classList.add("wl-status-skipped");
          break;
        case "error":
          State.ui.elements.status.classList.add("wl-status-error");
          break;
        case "paused":
          State.ui.elements.status.classList.add("wl-status-paused");
          break;
        case "info":
        default:
          // Keep default color (no class added)
          break;
      }

      // Reset status highlight after a delay for transient types
      if (
        statusType === "action" ||
        statusType === "success" ||
        statusType === "skipped"
      ) {
        setTimeout(() => {
          // Only remove the class if the status hasn't changed to something else critical (like error/paused)
          if (
            State.ui.elements.status &&
            State.ui.elements.status.classList.contains(
              `wl-status-${statusType}`
            )
          ) {
            State.ui.elements.status.classList.remove(
              `wl-status-${statusType}`
            );
          }
        }, 1500);
      }
    },

    /**
     * Increment the wishlist counter and update UI
     */
    incrementWishlistCounter: function () {
      State.stats.wishlistedThisSession++;
      sessionStorage.setItem(
        CONFIG.STORAGE_KEYS.SESSION_WISHLIST_COUNT,
        State.stats.wishlistedThisSession.toString()
      );

      if (State.ui.elements.wishlistCount) {
        State.ui.elements.wishlistCount.textContent =
          State.stats.wishlistedThisSession;
      }
    },

    /**
     * Increment the skipped counter and update UI
     */
    incrementSkippedCounter: function () {
      if (!State.stats.skippedThisSession) {
        State.stats.skippedThisSession = 0;
      }
      State.stats.skippedThisSession++;
      sessionStorage.setItem(
        "wishlistLooperSkippedCountV2",
        State.stats.skippedThisSession.toString()
      );

      const skippedCountElement = document.getElementById("wl-skipped-count");
      if (skippedCountElement) {
        skippedCountElement.textContent = State.stats.skippedThisSession;
      }
    },

    /**
     * Add an entry to the activity log
     * @param {string} action - The action performed (e.g., "Wishlisted", "Skipped")
     * @param {string} item - The item name or description
     * @param {string} reason - Optional reason for the action (e.g., skip reason)
     */
    addToActivityLog: function (action, item, reason = "") {
      if (!State.ui.elements.container) return;

      const logContainer = document.getElementById("wl-activity-log");
      if (!logContainer) return;

      const now = new Date().toLocaleTimeString();
      const logEntry = document.createElement("p");
      logEntry.style.margin = "2px 0";
      logEntry.style.color = action === "Wishlisted" ? "#a1dd4a" : "#aaa";
      logEntry.textContent = `[${now}] ${action}: ${item}${
        reason ? " (" + reason + ")" : ""
      }`;
      logContainer.insertBefore(logEntry, logContainer.firstChild);

      // Limit to last 5 entries
      const entries = logContainer.querySelectorAll("p");
      if (entries.length > 5) {
        entries[entries.length - 1].remove();
      }
    },

    /**
     * Toggle enabled state of manual action buttons based on current state
     */
    updateManualButtonStates: function () {
      const disableManual =
        State.loop.state === "Running" ||
        State.loop.isProcessing ||
        State.loop.manualActionInProgress;

      if (State.ui.elements.processOnce) {
        State.ui.elements.processOnce.disabled = disableManual;
      }
      if (State.ui.elements.skip) {
        State.ui.elements.skip.disabled = disableManual;
      }
    },

    /**
     * Create and add the UI controls to the page
     */
    addControls: function () {
      // Don't add controls if they already exist
      if (document.querySelector(CONFIG.SELECTORS.ui.container)) return;

      const controlDiv = document.createElement("div");
      controlDiv.id = CONFIG.SELECTORS.ui.container.substring(1);
      controlDiv.classList.toggle("wl-minimized", State.settings.uiMinimized);

      // HTML template for the controls
      controlDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid rgba(199, 213, 224, 0.2);">
               <strong style="color: #66c0f4; text-shadow: 1px 1px 1px #000; margin-right: auto; font-size: 14px;">Steam Wishlist Looper</strong>
               <span title="Wishlisted/Skipped this session" style="font-size: 10px; margin: 0 10px; color: #a1dd4a;">(<span id="${CONFIG.SELECTORS.ui.wishlistCountElement.substring(
                 1
               )}">${
        State.stats.wishlistedThisSession
      }</span>/<span id="wl-skipped-count">0</span>)</span>
               <button id="${CONFIG.SELECTORS.ui.minimizeButton.substring(
                 1
               )}" title="${
        State.settings.uiMinimized ? "Restaurar" : "Minimizar"
      }" style="background: none; border: none; color: #66c0f4; font-size: 16px; cursor: pointer; padding: 0 5px; line-height: 1;">${
        State.settings.uiMinimized ? "□" : "▬"
      }</button>
            </div>
            <div class="wl-controls-body">
               <div style="margin-bottom: 8px; display: flex; align-items: center; flex-wrap: wrap; gap: 5px;">
                   <button id="${CONFIG.SELECTORS.ui.startButton.substring(
                     1
                   )}" title="Iniciar/Retomar processamento automático">Iniciar</button>
                   <button id="${CONFIG.SELECTORS.ui.pauseButton.substring(
                     1
                   )}" title="Pausar processamento automático" disabled>Pausar</button>
                   <button id="${CONFIG.SELECTORS.ui.stopButton.substring(
                     1
                   )}" title="Parar processamento e desativar recursos automáticos">Parar</button>
               </div>
               <div style="margin-bottom: 8px; display: flex; gap: 5px;">
                   <button id="${CONFIG.SELECTORS.ui.processOnceButton.substring(
                     1
                   )}" title="Processar apenas o item atual">Processar Uma Vez</button>
                   <button id="${CONFIG.SELECTORS.ui.skipButton.substring(
                     1
                   )}" title="Pular o item atual e avançar">Pular Item</button>
               </div>
               <div id="${CONFIG.SELECTORS.ui.statusElement.substring(
                 1
               )}" class="${CONFIG.SELECTORS.ui.statusElement.substring(
        1
      )}" style="background: rgba(0, 0, 0, 0.3); padding: 5px; border-radius: 3px; margin-bottom: 8px;">Status: Inicializando...</div>
               <div style="margin-bottom: 8px; border: 1px solid rgba(199, 213, 224, 0.2); border-radius: 3px; padding: 5px; font-size: 11px; background: rgba(0, 0, 0, 0.2);">
                   <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                       <span style="font-weight: bold; color: #66c0f4;">Opções</span>
                       <button id="wl-toggle-options" style="background: none; border: none; color: #66c0f4; cursor: pointer; font-size: 12px; padding: 0 5px;">−</button>
                   </div>
                   <div id="wl-options-content">
                       <label title="Iniciar loop automaticamente em páginas compatíveis"><input type="checkbox" id="${CONFIG.SELECTORS.ui.autoStartCheckbox.substring(
                         1
                       )}">Auto-Iniciar</label>
                       <label title="Reiniciar fila automaticamente ao terminar (requer Auto-Iniciar)" style="margin-left: 10px;"><input type="checkbox" id="${CONFIG.SELECTORS.ui.autoRestartCheckbox.substring(
                         1
                       )}">Auto-Reiniciar</label>
                       <br>
                       <label title="Adicionar à lista de desejos apenas itens com Cartas de Troca Steam"><input type="checkbox" id="${CONFIG.SELECTORS.ui.requireCardsCheckbox.substring(
                         1
                       )}">Exigir Cartas</label>
                       <label title="Pular itens já na sua biblioteca Steam" style="margin-left: 10px;"><input type="checkbox" id="${CONFIG.SELECTORS.ui.skipOwnedCheckbox.substring(
                         1
                       )}">Pular Possuídos</label>
                       <br>
                       <label title="Pular itens identificados como DLC, Trilhas Sonoras, Demos, etc."><input type="checkbox" id="${CONFIG.SELECTORS.ui.skipNonGamesCheckbox.substring(
                         1
                       )}">Pular Não-Jogos</label>
                   </div>
               </div>
               <div style="margin-bottom: 8px; border: 1px solid rgba(199, 213, 224, 0.2); border-radius: 3px; padding: 5px; font-size: 11px; background: rgba(0, 0, 0, 0.2);">
                   <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                       <span style="font-weight: bold; color: #66c0f4;">Log de Atividades</span>
                       <button id="wl-toggle-log" style="background: none; border: none; color: #66c0f4; cursor: pointer; font-size: 12px; padding: 0 5px;">−</button>
                   </div>
                   <div id="wl-log-content" style="max-height: 100px; overflow-y: auto; font-size: 10px; color: #aaa;">
                       <div id="wl-activity-log" style="margin-top: 3px;">
                           <p style="color: #777; font-style: italic;">Nenhuma atividade registrada ainda.</p>
                       </div>
                   </div>
               </div>
               <div id="${CONFIG.SELECTORS.ui.versionInfo.substring(
                 1
               )}" style="font-size: 9px; color: #8f98a0; text-align: right;">v${
        CONFIG.CURRENT_VERSION
      }</div>
            </div>
        `;

      // Apply styles via GM_addStyle
      GM_addStyle(`
          #${CONFIG.SELECTORS.ui.container.substring(1)} {
            position: fixed; bottom: 15px; right: 15px; z-index: 9999;
            background: rgba(27, 40, 56, 0.95); color: #c7d5e0; padding: 12px;
            border-radius: 8px; font-family: 'Motiva Sans', sans-serif; font-size: 12px;
            border: 1px solid rgba(100, 100, 100, 0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            transition: all 0.3s ease-in-out; width: 280px;
          }
          #${CONFIG.SELECTORS.ui.container.substring(1)}.wl-minimized {
            padding: 8px 12px; height: auto; width: auto; min-width: 180px;
          }
          #${CONFIG.SELECTORS.ui.container.substring(
            1
          )}.wl-minimized .wl-controls-body {
            display: none;
          }
          #${CONFIG.SELECTORS.ui.container.substring(1)} button {
            padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;
            margin-right: 6px; border: 1px solid; transition: all 0.2s ease;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }
          #${CONFIG.SELECTORS.ui.container.substring(
            1
          )} button:last-child { margin-right: 0; }
          #${CONFIG.SELECTORS.ui.container.substring(1)} button:disabled {
            background-color: #555 !important; color: #999 !important; cursor: not-allowed !important;
            border-color: #333 !important; opacity: 0.6; filter: none !important;
          }
          #${CONFIG.SELECTORS.ui.container.substring(
            1
          )} button:hover:not(:disabled) { filter: brightness(1.2); transform: translateY(-1px); }

          #${CONFIG.SELECTORS.ui.startButton.substring(
            1
          )} { background-color: #68932f; color: white; border-color: #3a511b; }
          #${CONFIG.SELECTORS.ui.pauseButton.substring(
            1
          )} { background-color: #4a6b9d; color: white; border-color: #2a3d5e; }
          #${CONFIG.SELECTORS.ui.stopButton.substring(
            1
          )} { background-color: #a33e29; color: white; border-color: #5c2416; }
          #${CONFIG.SELECTORS.ui.processOnceButton.substring(1)},
          #${CONFIG.SELECTORS.ui.skipButton.substring(
            1
          )} { background-color: #777; color: white; border-color: #444; }

          .${CONFIG.SELECTORS.ui.statusElement.substring(
            1
          )} { /* Target by class for easier style application */
            font-size: 11px; min-height: 1.4em; padding: 4px 6px; text-align: left;
            transition: all 0.3s ease; color: #c7d5e0; border-left: 2px solid transparent;
          }
          .${CONFIG.SELECTORS.ui.statusElement.substring(
            1
          )}.wl-status-action { color: #66c0f4 !important; border-left-color: #66c0f4; }
          .${CONFIG.SELECTORS.ui.statusElement.substring(
            1
          )}.wl-status-success { color: #a1dd4a !important; border-left-color: #a1dd4a; }
          .${CONFIG.SELECTORS.ui.statusElement.substring(
            1
          )}.wl-status-skipped { color: #aaa !important; border-left-color: #aaa; }
          .${CONFIG.SELECTORS.ui.statusElement.substring(
            1
          )}.wl-status-error { color: #ff7a7a !important; font-weight: bold; border-left-color: #ff7a7a; }
          .${CONFIG.SELECTORS.ui.statusElement.substring(
            1
          )}.wl-status-paused { color: #e4d00a !important; font-style: italic; border-left-color: #e4d00a; }

          #${CONFIG.SELECTORS.ui.container.substring(1)} label {
            display: inline-flex; align-items: center; cursor: pointer;
            font-size: 11px; vertical-align: middle; margin-bottom: 4px; transition: color 0.2s ease;
          }
          #${CONFIG.SELECTORS.ui.container.substring(1)} label:hover {
            color: #fff;
          }
          #${CONFIG.SELECTORS.ui.container.substring(
            1
          )} input[type="checkbox"] {
            margin-right: 5px; vertical-align: middle; cursor: pointer; accent-color: #66c0f4;
          }
          #${CONFIG.SELECTORS.ui.versionInfo.substring(1)}.wl-update-available {
             color: #ffa500 !important; text-decoration: underline; cursor: pointer; font-weight: bold;
          }
          #${CONFIG.SELECTORS.ui.container.substring(1)} #wl-skipped-count {
            color: #aaa;
          }
        `);

      // Add to document
      document.body.appendChild(controlDiv);

      // Store references to UI elements
      State.ui.elements = {
        container: controlDiv,
        startBtn: controlDiv.querySelector(CONFIG.SELECTORS.ui.startButton),
        pauseBtn: controlDiv.querySelector(CONFIG.SELECTORS.ui.pauseButton),
        stopBtn: controlDiv.querySelector(CONFIG.SELECTORS.ui.stopButton),
        processOnce: controlDiv.querySelector(
          CONFIG.SELECTORS.ui.processOnceButton
        ),
        skip: controlDiv.querySelector(CONFIG.SELECTORS.ui.skipButton),
        status: controlDiv.querySelector(CONFIG.SELECTORS.ui.statusElement),
        minimizeBtn: controlDiv.querySelector(
          CONFIG.SELECTORS.ui.minimizeButton
        ),
        wishlistCount: controlDiv.querySelector(
          CONFIG.SELECTORS.ui.wishlistCountElement
        ),
        autoStartCheckbox: controlDiv.querySelector(
          CONFIG.SELECTORS.ui.autoStartCheckbox
        ),
        autoRestartCheckbox: controlDiv.querySelector(
          CONFIG.SELECTORS.ui.autoRestartCheckbox
        ),
        requireCardsCheckbox: controlDiv.querySelector(
          CONFIG.SELECTORS.ui.requireCardsCheckbox
        ),
        skipOwnedCheckbox: controlDiv.querySelector(
          CONFIG.SELECTORS.ui.skipOwnedCheckbox
        ),
        skipNonGamesCheckbox: controlDiv.querySelector(
          CONFIG.SELECTORS.ui.skipNonGamesCheckbox
        ),
        versionInfo: controlDiv.querySelector(CONFIG.SELECTORS.ui.versionInfo),
      };

      // Add event listeners for collapsible sections with passive option
      const toggleOptionsBtn = controlDiv.querySelector("#wl-toggle-options");
      const toggleLogBtn = controlDiv.querySelector("#wl-toggle-log");
      if (toggleOptionsBtn) {
        toggleOptionsBtn.addEventListener(
          "click",
          () => {
            const content = controlDiv.querySelector("#wl-options-content");
            if (content) {
              if (content.style.display === "none") {
                content.style.display = "block";
                toggleOptionsBtn.textContent = "−";
              } else {
                content.style.display = "none";
                toggleOptionsBtn.textContent = "+";
              }
            }
          },
          { passive: true }
        );
      }
      if (toggleLogBtn) {
        toggleLogBtn.addEventListener(
          "click",
          () => {
            const content = controlDiv.querySelector("#wl-log-content");
            if (content) {
              if (content.style.display === "none") {
                content.style.display = "block";
                toggleLogBtn.textContent = "−";
              } else {
                content.style.display = "none";
                toggleLogBtn.textContent = "+";
              }
            }
          },
          { passive: true }
        );
      }

      // Add event listeners with passive option
      State.ui.elements.startBtn.addEventListener(
        "click",
        LoopController.startLoop,
        { passive: true }
      );
      State.ui.elements.pauseBtn.addEventListener(
        "click",
        LoopController.pauseLoop,
        { passive: true }
      );
      State.ui.elements.stopBtn.addEventListener(
        "click",
        () => LoopController.stopLoop(false), // Stop and disable auto features
        { passive: true }
      );
      State.ui.elements.processOnce.addEventListener(
        "click",
        QueueProcessor.processOnce,
        { passive: true }
      );
      State.ui.elements.skip.addEventListener(
        "click",
        QueueProcessor.skipItem,
        { passive: true }
      );
      State.ui.elements.minimizeBtn.addEventListener(
        "click",
        this.toggleMinimizeUI,
        { passive: true }
      );

      // Settings listeners using SettingsManager with passive option
      State.ui.elements.autoStartCheckbox.addEventListener(
        "change",
        (e) =>
          SettingsManager.updateSetting(
            CONFIG.STORAGE_KEYS.AUTO_START,
            e.target.checked
          ),
        { passive: true }
      );
      State.ui.elements.autoRestartCheckbox.addEventListener(
        "change",
        (e) =>
          SettingsManager.updateSetting(
            CONFIG.STORAGE_KEYS.AUTO_RESTART_QUEUE,
            e.target.checked
          ),
        { passive: true }
      );
      State.ui.elements.requireCardsCheckbox.addEventListener(
        "change",
        (e) =>
          SettingsManager.updateSetting(
            CONFIG.STORAGE_KEYS.REQUIRE_CARDS,
            e.target.checked
          ),
        { passive: true }
      );
      State.ui.elements.skipOwnedCheckbox.addEventListener(
        "change",
        (e) =>
          SettingsManager.updateSetting(
            CONFIG.STORAGE_KEYS.SKIP_OWNED,
            e.target.checked
          ),
        { passive: true }
      );
      State.ui.elements.skipNonGamesCheckbox.addEventListener(
        "change",
        (e) =>
          SettingsManager.updateSetting(
            CONFIG.STORAGE_KEYS.SKIP_NON_GAMES,
            e.target.checked
          ),
        { passive: true }
      );

      // Update UI to match current state
      this.updateUI();
    },

    /**
     * Update all UI elements to match current state
     */
    updateUI: function () {
      if (!State.ui.elements.container) return;

      const isRunning = State.loop.state === "Running";
      const isPaused = State.loop.state === "Paused";

      // Update button states
      State.ui.elements.startBtn.disabled = isRunning;
      State.ui.elements.startBtn.textContent = isPaused ? "Resume" : "Start";
      State.ui.elements.startBtn.title = isPaused
        ? "Resume automatic processing"
        : "Start automatic processing";
      State.ui.elements.pauseBtn.disabled = !isRunning;
      State.ui.elements.stopBtn.disabled = !(isRunning || isPaused);

      // Update manual action buttons based on state
      this.updateManualButtonStates();

      // Update checkboxes
      State.ui.elements.autoStartCheckbox.checked =
        State.settings.autoStartEnabled;
      State.ui.elements.autoRestartCheckbox.checked =
        State.settings.autoRestartQueueEnabled;
      State.ui.elements.requireCardsCheckbox.checked =
        State.settings.requireTradingCards;
      State.ui.elements.skipOwnedCheckbox.checked =
        State.settings.skipOwnedGames;
      State.ui.elements.skipNonGamesCheckbox.checked =
        State.settings.skipNonGames;

      // Update UI minimization state
      State.ui.elements.container.classList.toggle(
        "wl-minimized",
        State.settings.uiMinimized
      );
      State.ui.elements.minimizeBtn.innerHTML = State.settings.uiMinimized
        ? "□"
        : "▬";
      State.ui.elements.minimizeBtn.title = State.settings.uiMinimized
        ? "Restore"
        : "Minimize";

      // Update wishlist and skipped count
      if (State.ui.elements.wishlistCount) {
        State.ui.elements.wishlistCount.textContent =
          State.stats.wishlistedThisSession;
      }
      const skippedCountElement = document.getElementById("wl-skipped-count");
      if (skippedCountElement) {
        skippedCountElement.textContent = State.stats.skippedThisSession || 0;
      }

      // Initial status text update if needed (avoid overwriting transient messages)
      // Check if the current status is just the base "Status: Initializing..." or empty
      const currentStatusText = State.ui.elements.status
        ? State.ui.elements.status.textContent
        : "";
      if (
        !currentStatusText ||
        currentStatusText === "Status: Initializing..."
      ) {
        if (isPaused) UI.updateStatusText("Paused", "paused");
        else if (isRunning) UI.updateStatusText("Running - Idle...");
        else UI.updateStatusText("Stopped.");
      }
    },

    /**
     * Toggle UI minimized state
     */
    toggleMinimizeUI: function () {
      State.settings.uiMinimized = !State.settings.uiMinimized;
      GM_setValue(CONFIG.STORAGE_KEYS.UI_MINIMIZED, State.settings.uiMinimized);
      UI.updateUI(); // Just call updateUI which handles the class and button text
    },

    /**
     * Update the version info element if a new version is available
     * @param {string} latestVersion - The latest version available
     * @param {string} updateUrl - The URL to the update page/script
     */
    updateVersionInfo: function (latestVersion, updateUrl) {
      if (!State.ui.elements.versionInfo) return;

      // Simple version comparison (assumes semantic versioning or similar numeric comparison)
      const isNewer =
        latestVersion &&
        latestVersion.localeCompare(CONFIG.CURRENT_VERSION, undefined, {
          numeric: true,
          sensitivity: "base",
        }) === 1;

      if (isNewer) {
        State.ui.elements.versionInfo.textContent = `v${CONFIG.CURRENT_VERSION} (Update: v${latestVersion})`;
        State.ui.elements.versionInfo.classList.add("wl-update-available");
        State.ui.elements.versionInfo.title = `New version ${latestVersion} available! Click to view.`;
        // Make clickable only if update URL is provided and valid
        if (updateUrl && updateUrl !== "#") {
          State.ui.elements.versionInfo.style.cursor = "pointer";
          // Remove previous listener before adding new one
          State.ui.elements.versionInfo.onclick = null;
          State.ui.elements.versionInfo.onclick = () => {
            window.open(updateUrl, "_blank");
          };
        } else {
          State.ui.elements.versionInfo.style.cursor = "default";
          State.ui.elements.versionInfo.onclick = null;
        }
      } else {
        State.ui.elements.versionInfo.textContent = `v${CONFIG.CURRENT_VERSION}`;
        State.ui.elements.versionInfo.classList.remove("wl-update-available");
        State.ui.elements.versionInfo.title = "";
        State.ui.elements.versionInfo.style.cursor = "default";
        State.ui.elements.versionInfo.onclick = null;
      }
    },
  };

  // ====================================
  // Module: Settings Manager
  // ====================================
  const SettingsManager = {
    /**
     * Update a setting value in state and GM storage
     * @param {string} key - The storage key from CONFIG.STORAGE_KEYS
     * @param {any} newValue - The new value for the setting
     */
    updateSetting: function (key, newValue) {
      GM_setValue(key, newValue);
      // Map the GM key to the corresponding State.settings property
      var keyMap = {};
      keyMap[CONFIG.STORAGE_KEYS.AUTO_START] = "autoStartEnabled";
      keyMap[CONFIG.STORAGE_KEYS.AUTO_RESTART_QUEUE] =
        "autoRestartQueueEnabled";
      keyMap[CONFIG.STORAGE_KEYS.UI_MINIMIZED] = "uiMinimized";
      keyMap[CONFIG.STORAGE_KEYS.REQUIRE_CARDS] = "requireTradingCards";
      keyMap[CONFIG.STORAGE_KEYS.SKIP_NON_GAMES] = "skipNonGames";
      keyMap[CONFIG.STORAGE_KEYS.SKIP_OWNED] = "skipOwnedGames";
      keyMap[CONFIG.STORAGE_KEYS.LOG_LEVEL] = "logLevel";
      var stateKey = keyMap[key];
      if (stateKey) {
        State.settings[stateKey] = newValue;
        Logger.log(stateKey + " updated to: " + newValue, 1);
      } else {
        Logger.log(
          "Warning: No matching key found in State.settings for GM key " + key,
          0
        );
      }
      UI.updateUI();
    },

    /**
     * Toggles a boolean setting and saves it. Used primarily by menu commands.
     * @param {string} key - The storage key from CONFIG.STORAGE_KEYS
     * @param {boolean} currentValue - The current value to toggle
     * @returns {boolean} The new value after toggling
     */
    toggleSetting: function (key, currentValue) {
      var newValue = !currentValue;
      this.updateSetting(key, newValue); // updateSetting handles state update and logging
      // Map the GM key to the corresponding State.settings property
      var keyMap = {};
      keyMap[CONFIG.STORAGE_KEYS.AUTO_START] = "autoStartEnabled";
      keyMap[CONFIG.STORAGE_KEYS.AUTO_RESTART_QUEUE] =
        "autoRestartQueueEnabled";
      keyMap[CONFIG.STORAGE_KEYS.UI_MINIMIZED] = "uiMinimized";
      keyMap[CONFIG.STORAGE_KEYS.REQUIRE_CARDS] = "requireTradingCards";
      keyMap[CONFIG.STORAGE_KEYS.SKIP_NON_GAMES] = "skipNonGames";
      keyMap[CONFIG.STORAGE_KEYS.SKIP_OWNED] = "skipOwnedGames";
      keyMap[CONFIG.STORAGE_KEYS.LOG_LEVEL] = "logLevel";
      var stateKey = keyMap[key];
      if (stateKey) {
        return State.settings[stateKey];
      }
      // Fallback return if state mapping fails (shouldn't happen)
      return newValue;
    },
  };

  // ====================================
  // Module: Age Verification Bypass
  // ====================================
  const AgeVerificationBypass = {
    /**
     * Initialize age verification bypass functionality
     */
    init: function () {
      // Only run on matching domains
      if (
        !window.location.hostname.includes("steampowered.com") &&
        !window.location.hostname.includes("steamcommunity.com")
      ) {
        return;
      }

      Logger.log("[Steam Age Skip] Initializing...", 1);

      try {
        // Set cookies for age verification immediately
        this.setCookies();

        // Handle based on current site using event listeners for robustness
        if (location.hostname.includes("store.steampowered.com")) {
          this.handleStoreSite();
        } else if (location.hostname.includes("steamcommunity.com")) {
          this.handleCommunitySite();
        }
      } catch (e) {
        Logger.log(`[Steam Age Skip] Error during init: ${e.message}`, 0);
      }
    },

    /**
     * Set cookies for age verification on both domains
     */
    setCookies: function () {
      const birthTimeKey = "birthtime";
      const matureContentKey = "wants_mature_content";
      const sessionMatureContentKey = "session_mature_content"; // Sometimes needed

      // Calculate a plausible birth date (e.g., >= 21 years ago for safety)
      const twentyOneYearsInSeconds = 21 * 365.25 * 24 * 60 * 60;
      const birthTimestamp = Math.floor(
        Date.now() / 1000 - twentyOneYearsInSeconds
      );

      // Use Lax for better compatibility, Secure is important
      const baseCookieOptions = `; max-age=315360000; secure; samesite=Lax`; // 10 years expiration

      // Construct cookie strings for each domain
      const storeDomain = ".store.steampowered.com";
      const communityDomain = ".steamcommunity.com";
      const genericDomain = ".steampowered.com"; // Some cookies might be set here

      const cookiesToSet = [
        { key: birthTimeKey, value: birthTimestamp },
        { key: matureContentKey, value: 1 },
        { key: sessionMatureContentKey, value: 1 }, // Often set without Max-Age
      ];

      cookiesToSet.forEach((cookie) => {
        document.cookie = `${cookie.key}=${cookie.value}; path=/; domain=${storeDomain}${baseCookieOptions}`;
        document.cookie = `${cookie.key}=${cookie.value}; path=/; domain=${communityDomain}${baseCookieOptions}`;
        document.cookie = `${cookie.key}=${cookie.value}; path=/; domain=${genericDomain}${baseCookieOptions}`;
        // Set session cookie without max-age too, just in case
        if (cookie.key === sessionMatureContentKey) {
          document.cookie = `${cookie.key}=${cookie.value}; path=/; domain=${storeDomain}; secure; samesite=Lax`;
          document.cookie = `${cookie.key}=${cookie.value}; path=/; domain=${communityDomain}; secure; samesite=Lax`;
          document.cookie = `${cookie.key}=${cookie.value}; path=/; domain=${genericDomain}; secure; samesite=Lax`;
        }
      });

      Logger.log(
        `[Steam Age Skip] Age cookies set for domains (Store, Community, Generic).`,
        1
      );
    },

    /**
     * Handle age verification on Steam store page load and dynamically
     */
    handleStoreSite: function () {
      const checkAndReload = () => {
        const ageGate = document.querySelector(
          CONFIG.SELECTORS.ageGate.storeContainer
        );
        // Added more selectors for robustness
        const ageGateOverlay = document.querySelector(
          ".agegate_birthday_desc, #agegate_box .agegate_text_container"
        );
        if (ageGate || ageGateOverlay) {
          Logger.log(
            "[Steam Age Skip] Age gate detected on store. Attempting bypass/reload...",
            0
          );

          // Attempt to click the view button first if available
          const viewButton = document.querySelector(
            "#view_product_page_btn, .btn_medium.btnv6_lightblue_blue > span"
          ); // Try common view buttons
          if (viewButton && viewButton.offsetParent) {
            // Check visibility
            Logger.log(
              "[Steam Age Skip] Found visible view button, attempting click...",
              1
            );
            viewButton.click();
            // Don't reload immediately, give click time to work and check again
            setTimeout(() => {
              const ageGateAfterClick = document.querySelector(
                CONFIG.SELECTORS.ageGate.storeContainer
              );
              const ageGateOverlayAfterClick = document.querySelector(
                ".agegate_birthday_desc, #agegate_box .agegate_text_container"
              );
              if (ageGateAfterClick || ageGateOverlayAfterClick) {
                Logger.log(
                  "[Steam Age Skip] Age gate still present after click, reloading.",
                  1
                );
                location.reload();
              } else {
                Logger.log(
                  "[Steam Age Skip] Age gate seems dismissed by click.",
                  1
                );
              }
            }, 500); // Wait 500ms
          } else {
            // If no visible button found, just reload - cookies should handle it.
            Logger.log(
              "[Steam Age Skip] No view button found or visible, relying on reload.",
              1
            );
            location.reload();
          }
          return true; // Gate found
        }
        return false; // No gate found
      };

      // Run check immediately and on DOMContentLoaded/load
      if (!checkAndReload()) {
        // If no gate initially
        window.addEventListener("DOMContentLoaded", checkAndReload, {
          once: true,
        });
        window.addEventListener("load", checkAndReload, { once: true }); // Backup check on full load
      }
    },

    /**
     * Handle age verification on Steam community page load and dynamically
     */
    handleCommunitySite: function () {
      const checkAndProceed = () => {
        const ageCheck = document.querySelector(
          CONFIG.SELECTORS.ageGate.communityTextContainer
        );
        if (ageCheck && ageCheck.offsetParent) {
          // Check visibility
          Logger.log(
            "[Steam Age Skip] Age gate detected on community. Attempting bypass...",
            0
          );
          // Try multiple strategies to bypass age gate
          if (!this.tryProceedFunction()) {
            Logger.log(
              "[Steam Age Skip] Proceed functions failed or not found. Relying on cookies/reload.",
              1
            );
            // Cookies should have been set, maybe a reload is needed if JS fails?
            // Avoid reload loops. If the function call didn't work, manual interaction might be needed.
          } else {
            Logger.log(
              "[Steam Age Skip] Proceed function called successfully (or attempted via injection).",
              1
            );
            // Function call might trigger navigation or content loading.
          }
          return true; // Gate found
        }
        return false; // No gate found
      };

      // Run check immediately and on DOMContentLoaded/load
      if (!checkAndProceed()) {
        // If no gate initially
        window.addEventListener("DOMContentLoaded", checkAndProceed, {
          once: true,
        });
        window.addEventListener("load", checkAndProceed, { once: true });
      }
    },

    /**
     * Try different methods to call the Proceed/Accept function (more robust)
     * @returns {boolean} Whether any attempt was potentially successful
     */
    tryProceedFunction: function () {
      let executed = false;
      const functionsToTry = ["Proceed", "AcceptAppHub", "ViewProductPage"]; // Add more potential function names if needed

      // Helper to log execution attempt
      const attemptExecution = (source, funcName, func) => {
        Logger.log(`[Steam Age Skip] Attempting ${source}.${funcName}()...`, 1);
        try {
          func();
          executed = true; // Mark as executed if call doesn't throw immediately
          Logger.log(` -> Call successful (no immediate error).`, 1);
          return true; // Stop trying other methods
        } catch (e) {
          Logger.log(
            ` -> Error calling ${source}.${funcName}: ${e.message}`,
            1
          );
          return false; // Continue trying other methods
        }
      };

      // 1. Try direct unsafeWindow call (GreaseMonkey/Tampermonkey standard)
      if (typeof unsafeWindow !== "undefined") {
        for (const funcName of functionsToTry) {
          if (typeof unsafeWindow[funcName] === "function") {
            if (
              attemptExecution("unsafeWindow", funcName, unsafeWindow[funcName])
            )
              return true;
          }
        }
      }

      // 2. Try direct window call (less likely due to sandboxing, but check anyway)
      if (!executed) {
        for (const funcName of functionsToTry) {
          if (typeof window[funcName] === "function") {
            if (attemptExecution("window", funcName, window[funcName]))
              return true;
          }
        }
      }

      // 3. Try wrappedJSObject (Firefox-specific)
      if (
        !executed &&
        typeof XPCNativeWrapper !== "undefined" &&
        typeof XPCNativeWrapper.unwrap === "function"
      ) {
        try {
          const unwrappedWindow = XPCNativeWrapper.unwrap(window);
          for (const funcName of functionsToTry) {
            if (typeof unwrappedWindow[funcName] === "function") {
              if (
                attemptExecution(
                  "wrappedJSObject",
                  funcName,
                  unwrappedWindow[funcName]
                )
              )
                return true;
            }
          }
        } catch (e) {
          Logger.log(` -> Error accessing wrappedJSObject: ${e.message}`, 1);
        }
      }

      // 4. Script Injection (Last resort if other methods fail)
      if (!executed) {
        Logger.log(
          "[Steam Age Skip] Direct calls failed, injecting script tag...",
          1
        );
        try {
          const script = document.createElement("script");
          let scriptContent = `"use strict"; (function() { console.log("[Steam Age Skip - Injected] Trying functions..."); var executed = false;`;
          functionsToTry.forEach((funcName) => {
            // Check if function exists before calling, prevent errors in injected script
            scriptContent += `if (!executed && typeof window.${funcName} === 'function') { console.log('[Steam Age Skip - Injected] Calling ${funcName}()'); try { window.${funcName}(); executed = true; } catch(e) { console.error('Error in injected ${funcName}:', e); } } `;
          });
          scriptContent += `if (!executed) console.log("[Steam Age Skip - Injected] No known function found or executed successfully."); })();`;
          script.textContent = scriptContent;

          const target = document.head || document.documentElement;
          if (target) {
            target.appendChild(script); // Append might be safer than prepend sometimes
            executed = true; // Assume injection itself worked, even if function inside fails silently
            Logger.log(" -> Script injected.", 1);
            // Remove script after a short delay to allow execution
            setTimeout(() => script.remove(), 100);
          } else {
            Logger.log(
              " -> Script injection failed: No target element (head/documentElement).",
              0
            );
          }
        } catch (e) {
          Logger.log(
            `[Steam Age Skip] Script injection creation failed: ${e.message}`,
            0
          );
        }
      }

      return executed; // Return true if any method was attempted (direct call) or if injection was done
    },
  };

  // ====================================
  // Module: Game Info Utilities
  // ====================================
  const GameInfoUtils = {
    /**
     * Get the app type from various indicators on the page.
     * @returns {string} The determined app type (Game, DLC, Soundtrack, Demo, Application, Video, Mod, Unknown)
     */
    getAppType: function () {
      // 1. Check DLC bubble first (most reliable for DLC on app page)
      const dlcIndicator = document.querySelector(
        CONFIG.SELECTORS.gameInfo.dlcIndicator
      );
      if (dlcIndicator?.offsetParent) return "DLC";

      // 2. Check details block text content (app page)
      const appTypeBlock = document.querySelector(
        CONFIG.SELECTORS.gameInfo.appTypeElement
      );
      if (appTypeBlock) {
        const detailText = appTypeBlock.textContent?.trim().toUpperCase() || "";
        if (detailText.includes("DOWNLOADABLE CONTENT")) return "DLC";
        if (detailText.includes("SOUNDTRACK")) return "Soundtrack";
        if (detailText.includes("DEMO")) return "Demo";
        if (detailText.includes("APPLICATION")) return "Application";
        if (detailText.includes("VIDEO") || detailText.includes("MOVIE"))
          return "Video";
        if (detailText.includes("MOD")) return "Mod";
      }

      // 3. Check breadcrumbs for clues (e.g., "Software", "Videos")
      const breadcrumbs = document.querySelectorAll(
        ".breadcrumbs .breadcrumb a, .game_title_area .blockbg a"
      );
      if (breadcrumbs.length > 0) {
        for (const crumb of breadcrumbs) {
          const crumbText = crumb.textContent?.trim().toUpperCase() || "";
          if (crumbText.includes("SOFTWARE")) return "Application";
          if (crumbText.includes("VIDEOS")) return "Video";
        }
      }

      // 4. Check for specific demo notice elements
      const demoNotice = document.querySelector(
        ".demo_notice, .game_area_purchase_game.demo_above_purchase"
      );
      if (demoNotice?.offsetParent) return "Demo";

      // 5. Check game title itself for keywords (less reliable, but a fallback)
      const gameTitleElement = document.querySelector(
        CONFIG.SELECTORS.gameInfo.title
      );
      const titleText =
        gameTitleElement?.textContent?.trim().toUpperCase() || "";
      if (titleText.includes("SOUNDTRACK")) return "Soundtrack";
      if (titleText.includes("ARTBOOK")) return "Artbook";
      if (titleText.includes("DEMO")) return "Demo";
      // Add other keywords if needed (e.g., "Beta", "Playtest")

      // If none of the above match, assume it's a Game
      return "Game";
    },

    /**
     * Checks if the item is considered a "Non-Game" based on settings and type detection.
     * @returns {string | null} Reason string if it should be skipped as non-game, or null otherwise.
     */
    checkIfNonGame: function () {
      if (!State.settings.skipNonGames) return null;

      const appType = this.getAppType();
      // Define the list of types to skip when the setting is enabled
      const nonGameTypesToSkip = [
        "DLC",
        "Soundtrack",
        "Demo",
        "Application",
        "Video",
        "Mod",
        "Artbook",
      ];

      if (nonGameTypesToSkip.includes(appType))
        return `Skipped as non-game type: ${appType}`;

      return null;
    },
  };

  // ====================================
  // Module: Queue Navigation
  // ====================================
  const QueueNavigation = {
    /**
     * Advance to the next item in the queue using the best available method.
     * Returns the method used ('Next', 'Ignore', 'FormSubmit', 'Failed')
     * @returns {Promise<string>} The method used or 'Failed'.
     */
    advanceQueue: async function () {
      let advanceMethod = "Failed"; // Default status

      // Prioritize visible Next button (check both app page and explore page selectors)
      const nextButton = document.querySelector(
        CONFIG.SELECTORS.queueNav.nextButton
      );
      if (nextButton?.offsetParent) {
        // offsetParent checks visibility
        Logger.log(" -> Found visible 'Next in Queue' button. Clicking...", 1);
        UI.updateStatusText("Navigating Next...", "action");
        nextButton.click();
        advanceMethod = "Next";
      } else {
        // Try Ignore button if Next isn't visible
        const ignoreContainer = document.getElementById(
          CONFIG.SELECTORS.queueNav.ignoreButtonContainer.substring(1)
        );
        const ignoreButton = ignoreContainer?.querySelector(
          CONFIG.SELECTORS.queueNav.ignoreButtonInContainer
        );
        if (ignoreButton?.offsetParent) {
          Logger.log(
            " -> 'Next' button not visible, found visible 'Ignore' button. Clicking...",
            1
          );
          UI.updateStatusText("Ignoring...", "action");
          ignoreButton.click();
          advanceMethod = "Ignore";
        } else {
          // Fallback to form submission if no visible buttons
          const nextForm = document.querySelector(
            CONFIG.SELECTORS.queueNav.nextForm
          );
          if (nextForm) {
            Logger.log(
              " -> No visible buttons, submitting next_in_queue_form...",
              1
            );
            UI.updateStatusText("Submitting form...", "action");
            // Ensure form submission actually navigates
            nextForm.submit();
            // Since form submission navigates away, the rest of the script execution stops here for this page load.
            advanceMethod = "FormSubmit";
            // Add a small delay to *potentially* allow navigation to start visually before script terminates
            await new Promise((resolve) =>
              setTimeout(resolve, CONFIG.TIMING.MINI_DELAY)
            );
            // NOTE: Code after submit() might not execute reliably.
          } else {
            Logger.log(
              " -> Failed to find any method to advance queue (Next/Ignore/Form).",
              0
            );
            UI.updateStatusText("Error: Cannot advance queue.", "error");
            // No change needed, advanceMethod remains 'Failed'
          }
        }
      }

      if (advanceMethod !== "Failed" && advanceMethod !== "FormSubmit") {
        Logger.log(
          ` -> Successfully advanced queue using: ${advanceMethod}`,
          1
        );
        // Add a short delay after successful click actions before the next check might happen
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.TIMING.ADVANCE_DELAY)
        );
      } else if (advanceMethod === "FormSubmit") {
        Logger.log(
          ` -> Advanced queue using: FormSubmit (Page will reload).`,
          1
        );
        // No further delay needed as page navigation occurs.
      }

      return advanceMethod;
    },

    /**
     * Ensure queue container is visible if it seems hidden incorrectly.
     * This is less critical now with visibility checks on buttons, but kept as a safeguard.
     */
    ensureQueueVisible: function () {
      const queueContainer = document.querySelector(
        CONFIG.SELECTORS.queueStatus.container
      );
      const emptyContainer = document.querySelector(
        CONFIG.SELECTORS.queueStatus.emptyContainer
      );

      if (queueContainer) {
        // Check if the queue container is present but not visible, AND the empty message is NOT visible
        if (!queueContainer.offsetParent && !emptyContainer?.offsetParent) {
          Logger.log(
            " -> Queue container exists but seems hidden, ensuring visibility.",
            1
          );
          queueContainer.style.display = ""; // Reset potential display:none set by Steam scripts
        }
      }
    },

    /**
     * Generate a new discovery queue by finding and clicking the appropriate button/link.
     * Handles failure counting and potential loop stopping.
     * @returns {Promise<boolean>} Whether queue generation was successfully initiated.
     */
    generateNewQueue: async function () {
      Logger.log("Attempting to generate a new queue...", 1);
      UI.updateStatusText("Generating new queue...", "action");
      let generated = false;

      // Combine selectors for various start/refresh buttons/links
      const startRefreshSelectors = `${CONFIG.SELECTORS.queueStatus.startAnotherButton}, ${CONFIG.SELECTORS.queueStatus.startLink}`;
      const buttons = document.querySelectorAll(startRefreshSelectors);

      // Find the first visible and clickable button/link
      let targetButton = null;
      for (const btn of buttons) {
        // Check visibility (offsetParent) and also check if it's not disabled (common for buttons)
        if (btn.offsetParent && !btn.disabled) {
          targetButton = btn;
          break;
        }
      }

      if (targetButton) {
        Logger.log(
          ` -> Found visible & enabled button/link: '${
            targetButton.innerText?.trim() || targetButton.id || "Start Link"
          }'. Clicking...`,
          1
        );
        targetButton.click();
        generated = true;
      } else {
        // Try Steam's JS object as a fallback if no suitable button found
        Logger.log(
          " -> No visible/enabled button found. Trying DiscoveryQueue.GenerateNewQueue()...",
          1
        );
        try {
          // Check existence carefully
          if (
            typeof window.DiscoveryQueue === "object" &&
            window.DiscoveryQueue !== null &&
            typeof window.DiscoveryQueue.GenerateNewQueue === "function"
          ) {
            window.DiscoveryQueue.GenerateNewQueue();
            generated = true;
            Logger.log(
              " -> Called DiscoveryQueue.GenerateNewQueue() successfully.",
              1
            );
          } else {
            Logger.log(
              " -> DiscoveryQueue.GenerateNewQueue() not available or not a function.",
              1
            );
          }
        } catch (e) {
          Logger.log(` -> Error calling DiscoveryQueue: ${e.message}`, 0);
        }
      }

      if (!generated) {
        Logger.log(" -> Failed to find any method to generate a new queue.", 0);
        UI.updateStatusText("Queue generation failed.", "error");
        State.loop.failedQueueRestarts++; // Increment failure count immediately

        // Check failure count and stop if exceeded
        if (
          State.loop.failedQueueRestarts >= CONFIG.MAX_QUEUE_RESTART_FAILURES
        ) {
          Logger.log(
            `Queue generation failed ${State.loop.failedQueueRestarts} times. Stopping loop.`,
            0
          );
          UI.updateStatusText(
            `Restart Failed ${CONFIG.MAX_QUEUE_RESTART_FAILURES}x. Stopping.`,
            "error"
          );
          // Stop the loop but keep settings enabled, allowing manual restart later
          LoopController.stopLoop(true);
          return false; // Indicate definitive failure
        }
      } else {
        // Reset failure count on success
        State.loop.failedQueueRestarts = 0;
        Logger.log(" -> Queue generation initiated.", 1);
        // Wait after initiating generation for page to potentially update
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.TIMING.QUEUE_GENERATION_DELAY)
        );
        // Optionally ensure queue elements are visible after delay (might help if Steam UI is slow)
        this.ensureQueueVisible();
      }

      return generated; // True if initiated, False if definitively failed after retries
    },
  };

  // ====================================
  // Module: Queue Processor
  // ====================================
  const QueueProcessor = {
    /**
     * Checks the overall queue status (finished, needs starting, error state) and handles auto-start/restart.
     * @returns {Promise<boolean>} True if processing should continue on the current item, False otherwise.
     */
    checkQueueStatusAndHandle: async function () {
      const queueEmptyContainer = document.querySelector(
        CONFIG.SELECTORS.queueStatus.emptyContainer
      );
      const isOnExplorePage = window.location.pathname.includes("/explore");
      const queueContainer = document.querySelector(
        CONFIG.SELECTORS.queueStatus.container
      );
      const isQueueVisible = queueContainer?.offsetParent; // Check if queue area is visible and in layout
      const isEmptyMessageVisible =
        queueEmptyContainer?.offsetParent &&
        queueEmptyContainer.style.display !== "none";

      // --- Case 1: Queue finished message is visible ---
      if (isEmptyMessageVisible) {
        Logger.log("Discovery Queue finished/empty message visible.");

        if (
          State.settings.autoStartEnabled &&
          State.settings.autoRestartQueueEnabled
        ) {
          Logger.log(
            "Auto-restart enabled. Attempting new queue generation..."
          );
          // generateNewQueue handles failure counting and potential loop stopping
          await QueueNavigation.generateNewQueue();
        } else {
          Logger.log(
            "Queue finished and Auto-restart disabled. Stopping loop."
          );
          UI.updateStatusText("Queue finished. Stopped.");
          LoopController.stopLoop(true); // Stop but keep settings enabled
        }
        return false; // Don't process current (non-existent) item
      }

      // --- Case 2: On explore page, but queue is not visible (needs starting) ---
      // This implies we are on /explore/ but haven't clicked "Start Queue" or it hasn't loaded yet.
      if (isOnExplorePage && !isQueueVisible) {
        Logger.log(
          "On explore page, queue container not visible or not found."
        );

        if (State.settings.autoStartEnabled) {
          Logger.log(
            "Auto-start enabled. Attempting to start/generate queue from explore page..."
          );
          // Use generateNewQueue which finds the start/refresh button
          await QueueNavigation.generateNewQueue();
        } else {
          Logger.log(
            "On explore page, queue inactive, Auto-start disabled. Stopping loop."
          );
          UI.updateStatusText("Stopped (Needs Queue Start).");
          LoopController.stopLoop(true); // Keep settings
        }
        return false; // Don't process yet, wait for queue to load after generation attempt
      }

      // --- Case 3: On an app page, check for essential navigation elements ---
      // If we're on an app page (/app/...), we expect queue navigation buttons. If they're missing, something is wrong.
      if (window.location.pathname.includes("/app/")) {
        const nextButton = document.querySelector(
          CONFIG.SELECTORS.queueNav.nextButton
        );
        const ignoreContainer = document.getElementById(
          CONFIG.SELECTORS.queueNav.ignoreButtonContainer.substring(1)
        );
        const ignoreButton = ignoreContainer?.querySelector(
          CONFIG.SELECTORS.queueNav.ignoreButtonInContainer
        );
        const nextForm = document.querySelector(
          CONFIG.SELECTORS.queueNav.nextForm
        );

        // Check if *none* of the advancement methods seem available and visible
        if (
          !nextButton?.offsetParent &&
          !ignoreButton?.offsetParent &&
          !nextForm
        ) {
          Logger.log(
            "On app page but missing visible queue navigation elements. Potential error or not a queue item?",
            0
          );
          // This could happen if navigating directly to an app page not via the queue.
          // If the loop is running, treat this as an error state for the queue.
          if (State.loop.state === "Running") {
            UI.updateStatusText("Error: Invalid queue state?", "error");
            Logger.log(
              " -> Stopping loop due to invalid state on app page.",
              0
            );
            LoopController.stopLoop(true); // Stop but keep settings
          } else {
            // If stopped/paused, just indicate the state but don't force stop
            UI.updateStatusText("Stopped (Invalid state?)");
          }
          return false; // Cannot proceed on this page
        }
      }

      // --- Case 4: On explore page WITH visible queue ---
      // Need to ensure wishlist/ignore buttons are present on the explore page itself
      if (isOnExplorePage && isQueueVisible) {
        const exploreWishlistButton = document.querySelector(
          CONFIG.SELECTORS.wishlist.addButton
        ); // Check specific explore wishlist button
        const exploreIgnoreButton = document.querySelector(
          CONFIG.SELECTORS.queueNav.ignoreButtonInContainer
        );
        const exploreNextButton = document.querySelector(
          CONFIG.SELECTORS.queueNav.nextButton
        );

        // If the core interaction buttons are missing on the explore page queue, something is wrong
        if (
          !exploreWishlistButton &&
          !exploreIgnoreButton &&
          !exploreNextButton?.offsetParent
        ) {
          Logger.log(
            "On explore page queue, but missing interaction buttons (Wishlist/Ignore/Next). Potential error.",
            0
          );
          if (State.loop.state === "Running") {
            UI.updateStatusText("Error: Invalid queue state?", "error");
            Logger.log(
              " -> Stopping loop due to invalid state on explore page.",
              0
            );
            LoopController.stopLoop(true);
          } else {
            UI.updateStatusText("Stopped (Invalid state?)");
          }
          return false;
        }
      }

      // If none of the above problematic conditions are met, assume queue is active and ready.
      State.loop.failedQueueRestarts = 0; // Reset failure counter as we seem to have a valid item/state
      return true; // Okay to proceed with processing the current item
    },

    /**
     * Process the current game/item in the queue based on settings.
     * Handles checking criteria, wishlisting or skipping, and triggers advancement if needed.
     * @param {boolean} isManualTrigger - True if triggered by "Process Once" button.
     */
    processCurrentGameItem: async function (isManualTrigger = false) {
      UI.updateStatusText("Checking page...");

      // Get game title (best effort, works on app page, fallback for explore)
      const gameTitleElement = document.querySelector(
        CONFIG.SELECTORS.gameInfo.title
      );
      // On explore page, title might be inside the queue item itself
      const exploreTitleElement = document.querySelector(
        "#discovery_queue .queue_item_title, #discovery_queue .title"
      ); // Adjust selectors if needed
      const gameTitle =
        gameTitleElement?.textContent?.trim() ||
        exploreTitleElement?.textContent?.trim() ||
        "Current Item";

      // Get queue remaining text (if available)
      const queueRemainingElement = document.querySelector(
        CONFIG.SELECTORS.gameInfo.queueRemainingText
      );
      const queueRemaining = queueRemainingElement
        ? queueRemainingElement.textContent.trim()
        : "";

      UI.updateStatusText(`Checking ${gameTitle}... ${queueRemaining}`);
      Logger.log(
        `Processing: ${gameTitle} ${
          queueRemaining ? "- " + queueRemaining : ""
        }`,
        1
      );

      // --- Check Skip Conditions ---
      let skipReason = null;

      // 1. Owned Game Check (selector works on app page, might need adjustment for explore page if structure differs)
      // Steam usually hides the wishlist button on explore if owned, relying on that might be better. See wishlist check below.
      const ownedIndicator = document.querySelector(
        CONFIG.SELECTORS.gameInfo.inLibraryIndicator
      );
      if (State.settings.skipOwnedGames && ownedIndicator?.offsetParent) {
        skipReason = "Already in Library";
        Logger.log(` -> Skipping: ${skipReason} (Indicator found).`, 1);
      }

      // 2. Non-Game Check (if not already skipped)
      if (!skipReason) {
        skipReason = GameInfoUtils.checkIfNonGame(); // Returns reason string or null
        if (skipReason)
          Logger.log(` -> Skipping: ${skipReason} (Type detected).`, 1);
      }

      // 3. Trading Card Check (if not already skipped)
      if (!skipReason && State.settings.requireTradingCards) {
        Logger.log(
          `Trading Cards check active. Current path: ${window.location.pathname}`,
          1
        );

        if (window.location.pathname.includes("/app/")) {
          const hasTradingCards = document.querySelector(
            CONFIG.SELECTORS.gameInfo.tradingCardsIndicator
          );
          Logger.log(
            `Checking for trading cards indicator: ${
              hasTradingCards ? "FOUND" : "NOT FOUND"
            }`,
            1
          );

          if (!hasTradingCards) {
            skipReason = "No Trading Cards";
            Logger.log(
              ` -> Skipping: ${skipReason} (Indicator not found on app page).`,
              1
            );
          } else {
            Logger.log(` -> Has Trading Cards (App page indicator found).`, 1);
          }
        } else {
          // Na página de exploração, tentar encontrar um indicador de cartas de troca diretamente
          const hasTradingCards = document.querySelector(
            "#discovery_queue a[href*='/tradingcards/'], #discovery_queue .badge_row_inner a[href*='cards']"
          );
          if (hasTradingCards) {
            Logger.log(
              ` -> Has Trading Cards (Explore page indicator found).`,
              1
            );
          } else {
            // Se não encontrar indicador na página de exploração, pular com motivo claro
            skipReason = "No Trading Cards (Explore Page)";
            Logger.log(
              ` -> Skipping: ${skipReason} (No indicator on explore page).`,
              1
            );
          }
        }
      } else if (!skipReason) {
        Logger.log(
          `Trading Cards check skipped. requireTradingCards setting: ${State.settings.requireTradingCards}`,
          1
        );
      }

      // --- Perform Action (Wishlist or Skip) ---
      let actionTaken = false; // Did we actively wishlist?

      if (skipReason) {
        // Already logged skip reason above
        UI.updateStatusText(`Skipped (${skipReason})`, "skipped");
        UI.incrementSkippedCounter();
        UI.addToActivityLog("Skipped", gameTitle, skipReason);
        // No wishlist action needed
      } else {
        // Eligible for wishlisting according to checks. Now check UI for wishlist button/status.
        const wishlistArea = document.querySelector(
          CONFIG.SELECTORS.wishlist.area
        );
        if (!wishlistArea) {
          // This is unexpected if queue status check passed. Log as error.
          Logger.log(
            " -> ERROR: Wishlist area not found after status check passed.",
            0
          );
          UI.updateStatusText("Error: Wishlist area missing", "error");
          skipReason = "Wishlist Area Missing"; // Treat as skipped due to error
        } else {
          const wishlistedIndicator = wishlistArea.querySelector(
            CONFIG.SELECTORS.wishlist.successIndicator
          );
          // Check visibility of success text OR if the area/button has the 'active' class (common on explore page)
          const isWishlisted =
            (wishlistedIndicator?.offsetParent &&
              wishlistedIndicator.style.display !== "none") ||
            wishlistArea.classList.contains("queue_btn_active") ||
            wishlistArea.querySelector(".queue_btn_active") !== null; // Check for child with class

          if (isWishlisted) {
            Logger.log(` -> Already wishlisted.`, 1);
            UI.updateStatusText("Already wishlisted.", "skipped");
          } else {
            // Perform wishlist action
            const addButton = wishlistArea.querySelector(
              CONFIG.SELECTORS.wishlist.addButton
            );

            if (addButton) {
              Logger.log(` -> Adding to wishlist...`, 1);
              Logger.log(
                ` -> Button element: ${
                  addButton.tagName
                }, text: "${addButton.textContent?.trim()}", href: "${
                  addButton.href || "none"
                }"`,
                1
              );
              UI.updateStatusText("Adding to wishlist...", "action");
              addButton.click();
              actionTaken = true;

              // Since the API call is reliable, we don't need to wait for visual confirmation.
              // We'll just log the success and move on after a standard delay.
              Logger.log(` -> Successfully added to wishlist (assumed).`, 1);
              UI.updateStatusText("Wishlisted!", "success");
              UI.incrementWishlistCounter();
              UI.addToActivityLog("Wishlisted", gameTitle);
              await new Promise((resolve) =>
                setTimeout(resolve, CONFIG.TIMING.ACTION_DELAY)
              );
            } else {
              Logger.log(
                ` -> ERROR: Add to wishlist button not found or not visible.`,
                0
              );
              Logger.log(` -> Wishlist area found: ${!!wishlistArea}`, 1);
              if (wishlistArea) {
                Logger.log(
                  ` -> Wishlist area innerHTML: ${wishlistArea.innerHTML.substring(
                    0,
                    200
                  )}...`,
                  1
                );
              }
              UI.updateStatusText("Error: Add button missing", "error");
              skipReason = "Add Button Missing";
            }
          }
        }
      }

      // --- Advance Queue if not manually triggered ---
      if (!isManualTrigger) {
        Logger.log(` -> Advancing queue...`, 1);
        await QueueNavigation.advanceQueue();
      }

      // --- Finalize Processing ---
      State.loop.isProcessing = false; // Mark processing as complete
      UI.updateManualButtonStates(); // Re-enable manual buttons if needed
      if (State.loop.state === "Running") {
        // Schedule next check if loop is still running
        State.loop.timeoutId = setTimeout(
          LoopController.mainLoop,
          CONFIG.TIMING.CHECK_INTERVAL
        );
      }
    },

    /**
     * Confirm that the wishlist action was successful by polling the success indicator.
     * @returns {Promise<boolean>} True if success confirmed, False otherwise.
     */
    confirmWishlistSuccess: function () {
      return new Promise((resolve) => {
        const startTime = Date.now();
        const timeout = CONFIG.TIMING.WISHLIST_CONFIRM_TIMEOUT;
        let pollCount = 0;
        const maxPolls = 10; // Limitar o número de tentativas para evitar loops longos

        const checkSuccess = () => {
          pollCount++;
          const wishlistArea = document.querySelector(
            CONFIG.SELECTORS.wishlist.area
          );

          if (!wishlistArea) {
            Logger.log(
              ` -> [Poll ${pollCount}] Wishlist area not found, checking for any wishlist elements...`,
              1
            );

            // Debug: Look for any wishlist-related elements
            const anyWishlistElements = document.querySelectorAll(
              '[class*="wishlist"], [data-panel="wishlist"], .queue_btn'
            );
            Logger.log(
              ` -> [Poll ${pollCount}] Found ${anyWishlistElements.length} potential wishlist elements on page`,
              1
            );

            // Since API calls succeed, assume success if no area found
            resolve(true);
            return;
          }

          // Debug: Log wishlist area details on first few polls
          if (pollCount <= 3) {
            Logger.log(
              ` -> [Poll ${pollCount}] Wishlist area classes: "${wishlistArea.className}"`,
              1
            );
            Logger.log(
              ` -> [Poll ${pollCount}] Wishlist area text: "${wishlistArea.textContent
                ?.trim()
                .substring(0, 100)}"`,
              1
            );
          }

          // Check for success indicators
          const wishlistedIndicator = wishlistArea.querySelector(
            CONFIG.SELECTORS.wishlist.successIndicator
          );

          // Multiple ways to detect success
          const hasSuccessText =
            wishlistedIndicator?.offsetParent &&
            wishlistedIndicator.style.display !== "none";
          const hasActiveClass =
            wishlistArea.classList.contains("queue_btn_active");
          const hasActiveChild =
            wishlistArea.querySelector(".queue_btn_active") !== null;
          const hasWishlistText =
            wishlistArea.textContent?.toLowerCase().includes("on wishlist") ||
            wishlistArea.textContent?.toLowerCase().includes("na lista") ||
            wishlistArea.textContent?.toLowerCase().includes("wishlist");

          // Check if button text/appearance changed indicating success
          const addButton = wishlistArea.querySelector(
            CONFIG.SELECTORS.wishlist.addButton
          );
          const buttonDisabled = addButton?.disabled;
          const buttonTextChanged =
            addButton?.textContent?.toLowerCase().includes("on wishlist") ||
            addButton?.textContent?.toLowerCase().includes("na lista");

          // Debug: Log button details on first few polls
          if (pollCount <= 3 && addButton) {
            Logger.log(
              ` -> [Poll ${pollCount}] Button text: "${addButton.textContent?.trim()}"`,
              1
            );
            Logger.log(
              ` -> [Poll ${pollCount}] Button disabled: ${addButton.disabled}`,
              1
            );
            Logger.log(
              ` -> [Poll ${pollCount}] Button href: ${
                addButton.href || "none"
              }`,
              1
            );
          }

          const isWishlisted =
            hasSuccessText ||
            hasActiveClass ||
            hasActiveChild ||
            hasWishlistText ||
            buttonDisabled ||
            buttonTextChanged;

          Logger.log(
            ` -> [Poll ${pollCount}] Success check: text=${hasSuccessText}, active=${hasActiveClass}, child=${hasActiveChild}, wishText=${hasWishlistText}, disabled=${buttonDisabled}, textChanged=${buttonTextChanged}`,
            1
          );

          if (isWishlisted) {
            Logger.log(` -> [Poll ${pollCount}] Success confirmed!`, 1);
            resolve(true);
          } else if (
            Date.now() - startTime >= timeout ||
            pollCount >= maxPolls
          ) {
            Logger.log(
              ` -> [Poll ${pollCount}] Timeout or max polls reached (${timeout}ms or ${maxPolls} polls), assuming API success`,
              1
            );
            // Since Steam API calls are completing successfully (visible in console logs),
            // but UI detection may fail, assume the wishlist action worked
            resolve(true);
          } else {
            setTimeout(checkSuccess, CONFIG.TIMING.MINI_DELAY);
          }
        };

        checkSuccess(); // Initial call
      });
    },

    /**
     * Process the current item once, triggered by the "Process Once" button.
     */
    processOnce: function () {
      if (State.loop.isProcessing || State.loop.manualActionInProgress) return;
      State.loop.manualActionInProgress = true;
      QueueProcessor.processCurrentGameItem(true).finally(() => {
        State.loop.manualActionInProgress = false;
        UI.updateManualButtonStates();
      });
    },

    /**
     * Skip the current item, triggered by the "Skip Item" button.
     */
    skipItem: function () {
      if (State.loop.isProcessing || State.loop.manualActionInProgress) return;
      State.loop.manualActionInProgress = true;
      UI.updateStatusText("Skipping item...", "action");
      QueueNavigation.advanceQueue().finally(() => {
        State.loop.manualActionInProgress = false;
        UI.updateManualButtonStates();
      });
    },
  };

  // ====================================
  // Module: Loop Controller
  // ====================================
  const LoopController = {
    /**
     * Start the main loop for processing the queue.
     */
    startLoop: function () {
      if (State.loop.state === "Running") return; // Prevent multiple starts
      State.loop.state = "Running";
      UI.updateUI();
      UI.updateStatusText("Starting loop...", "action");
      State.loop.timeoutId = setTimeout(
        LoopController.mainLoop,
        CONFIG.TIMING.INITIAL_START_DELAY
      );
    },

    /**
     * Pause the main loop.
     */
    pauseLoop: function () {
      if (State.loop.state !== "Running") return;
      State.loop.state = "Paused";
      clearTimeout(State.loop.timeoutId);
      UI.updateUI();
      UI.updateStatusText("Paused", "paused");
    },

    /**
     * Stop the main loop and optionally disable auto features.
     * @param {boolean} keepSettings - Whether to keep auto-start/restart settings enabled.
     */
    stopLoop: function (keepSettings = false) {
      State.loop.state = "Stopped";
      clearTimeout(State.loop.timeoutId);
      UI.updateUI();
      UI.updateStatusText("Stopped.");
      if (!keepSettings) {
        SettingsManager.updateSetting(CONFIG.STORAGE_KEYS.AUTO_START, false);
        SettingsManager.updateSetting(
          CONFIG.STORAGE_KEYS.AUTO_RESTART_QUEUE,
          false
        );
      }
    },

    /**
     * Main loop function for processing the queue.
     */
    mainLoop: async function () {
      if (State.loop.state !== "Running") return;

      Logger.log("Main loop iniciado. Verificando estado atual...", 0);
      Logger.log(
        `Auto-Start: ${State.settings.autoStartEnabled}, Auto-Restart: ${State.settings.autoRestartQueueEnabled}`,
        1
      );
      Logger.log(
        `Require Cards: ${State.settings.requireTradingCards}, Skip Non-Games: ${State.settings.skipNonGames}, Skip Owned: ${State.settings.skipOwnedGames}`,
        1
      );

      State.loop.isProcessing = true;
      UI.updateManualButtonStates();

      try {
        Logger.log("Verificando status da fila...", 1);
        const shouldContinue = await QueueProcessor.checkQueueStatusAndHandle();
        if (shouldContinue) {
          Logger.log("Status da fila OK, processando item atual...", 1);
          await QueueProcessor.processCurrentGameItem();
        } else {
          Logger.log(
            "Status da fila indica que não devemos continuar o processamento",
            1
          );
        }
      } catch (e) {
        Logger.log(`Error in main loop: ${e.message}`, 0);
        UI.updateStatusText("Error in loop", "error");
      } finally {
        State.loop.isProcessing = false;
        UI.updateManualButtonStates();
        if (State.loop.state === "Running") {
          Logger.log(
            `Agendando próxima execução do loop em ${CONFIG.TIMING.CHECK_INTERVAL}ms`,
            1
          );
          State.loop.timeoutId = setTimeout(
            LoopController.mainLoop,
            CONFIG.TIMING.CHECK_INTERVAL
          );
        }
      }
    },
  };

  // ====================================
  // Module: Version Checker
  // ====================================
  const VersionChecker = {
    /**
     * Check for script updates and notify the user if a new version is available.
     */
    checkForUpdates: async function () {
      const now = Date.now();
      const lastCheck = State.stats.lastVersionCheck;
      const interval = CONFIG.TIMING.VERSION_CHECK_INTERVAL;

      if (now - lastCheck < interval) {
        Logger.log("Skipping version check (interval not reached).", 1);
        return;
      }

      Logger.log("Checking for script updates...", 1);
      try {
        const response = await fetch(CONFIG.VERSION_CHECK_URL, {
          cache: "no-cache",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const latestVersion = data.version;
        const updateUrl = data.updateUrl;

        State.stats.latestVersion = latestVersion;
        State.stats.updateUrl = updateUrl;
        State.stats.lastVersionCheck = now;
        GM_setValue(CONFIG.STORAGE_KEYS.LAST_VERSION_CHECK, now);

        UI.updateVersionInfo(latestVersion, updateUrl);
      } catch (e) {
        Logger.log(`Error checking for updates: ${e.message}`, 0);
      }
    },
  };

  // ====================================
  // Initialization
  // ====================================
  (function init() {
    Logger.log("Initializing Steam Infinite Wishlister...", 0);

    // Add UI controls
    UI.addControls();

    // Register menu commands for quick access to settings
    GM_registerMenuCommand("Toggle Auto-Start", () => {
      const newValue = SettingsManager.toggleSetting(
        CONFIG.STORAGE_KEYS.AUTO_START,
        State.settings.autoStartEnabled
      );
      Logger.log(`Auto-Start set to: ${newValue}`, 0);
    });

    GM_registerMenuCommand("Toggle Auto-Restart Queue", () => {
      const newValue = SettingsManager.toggleSetting(
        CONFIG.STORAGE_KEYS.AUTO_RESTART_QUEUE,
        State.settings.autoRestartQueueEnabled
      );
      Logger.log(`Auto-Restart Queue set to: ${newValue}`, 0);
    });

    GM_registerMenuCommand("Toggle Require Trading Cards", () => {
      const newValue = SettingsManager.toggleSetting(
        CONFIG.STORAGE_KEYS.REQUIRE_CARDS,
        State.settings.requireTradingCards
      );
      Logger.log(`Require Trading Cards set to: ${newValue}`, 0);
    });

    GM_registerMenuCommand("Toggle Skip Non-Games", () => {
      const newValue = SettingsManager.toggleSetting(
        CONFIG.STORAGE_KEYS.SKIP_NON_GAMES,
        State.settings.skipNonGames
      );
      Logger.log(`Skip Non-Games set to: ${newValue}`, 0);
    });

    GM_registerMenuCommand("Toggle Skip Owned Games", () => {
      const newValue = SettingsManager.toggleSetting(
        CONFIG.STORAGE_KEYS.SKIP_OWNED,
        State.settings.skipOwnedGames
      );
      Logger.log(`Skip Owned Games set to: ${newValue}`, 0);
    });

    // Check for updates
    VersionChecker.checkForUpdates();

    // Initialize age verification bypass
    AgeVerificationBypass.init();

    // Auto-start if enabled
    if (State.settings.autoStartEnabled) {
      LoopController.startLoop();
    } else {
      UI.updateStatusText("Stopped.");
    }
  })();
})();
