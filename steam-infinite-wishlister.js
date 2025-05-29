// ==UserScript==
// @name         Steam Infinite Wishlister
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Automatização avançada para adicionar jogos à lista de desejos na fila de descoberta do Steam: opções de cartas colecionáveis/DLC/já possuídos, bypass de idade, pausar/retomar, contadores e robustez aprimorada
// @icon         https://store.steampowered.com/favicon.ico
// @author       bernardopg (otimizado por Cline)
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

  function checkGMApi(fnName) {
    if (typeof window[fnName] !== "function" && typeof unsafeWindow?.[fnName] !== "function") {
      console.error(`[Steam Wishlist Looper] API ${fnName} não está disponível. O script pode não funcionar corretamente nesta versão do Tampermonkey/Greasemonkey.`);
      return false;
    }
    return true;
  }
  const GM_APIS = ["GM_setValue", "GM_getValue", "GM_addStyle", "GM_registerMenuCommand", "GM_xmlhttpRequest"];
  for (const fn of GM_APIS) checkGMApi(fn);

  const CONFIG = {
    TIMING: {
      CHECK_INTERVAL: 3000,
      ACTION_DELAY: 1500,
      ADVANCE_DELAY: 500,
      PROCESSING_RELEASE_DELAY: 750,
      QUEUE_GENERATION_DELAY: 1200,
      QUEUE_LOCK_RELEASE_DELAY: 1800,
      INITIAL_START_DELAY: 1200,
      WISHLIST_CONFIRM_TIMEOUT: 1300,
      MINI_DELAY: 80,
      VERSION_CHECK_INTERVAL: 86400000,
    },

    SELECTORS: {
      wishlist: {
        area: "#add_to_wishlist_area, .queue_wishlist_ctn, .ds_wishlist_ctn",
        addButton:
          ".add_to_wishlist .btn_addtocart .btnv6_blue_hoverfade, .queue_wishlist_button .btnv6_blue_hoverfade, .ds_wishlist_button .btnv6_blue_hoverfade",
        successIndicator: ".add_to_wishlist_area_success, .queue_btn_active, .ds_wishlist_button.ds_wishlist_added",
      },

      gameInfo: {
        tradingCardsIndicator:
          '.game_area_details_specs a[href*="/tradingcards/"], a.trading_card_details_link[href*="/tradingcards/"], .icon.ico_cards',
        title: ".apphub_AppName, .game_title_area .pageheader, .appHubAppName",
        queueRemainingText: ".queue_sub_text, .discovery_queue_overlay_bg .subtext",
        inLibraryIndicator: ".game_area_already_owned, .ds_owned_flag, .ds_flag.ds_owned_flag",
        dlcIndicator: ".game_area_dlc_bubble, .ds_flag.ds_dlc_flag",
        appTypeElement: ".game_details .details_block, .glance_details .details_block, .game_area_purchase_game_wrapper .game_area_purchase_game",
      },

      queueNav: {
        nextButton:
          ".btn_next_in_queue_trigger, .btn_next_in_queue .btnv6_lightblue_blue, .ds_options .btnv6_blue_hoverfade[href*='next']",
        nextForm: "#next_in_queue_form",
        ignoreButtonContainer: "#ignoreBtn, .queue_btn_ignore_ctn",
        ignoreButtonInContainer: ".queue_btn_ignore, .ds_options .btnv6_blue_hoverfade[onclick*='ignore']",
      },

      queueStatus: {
        container: "#discovery_queue_ctn, #discovery_queue, .discovery_queue_winter_sale_daily_card, .discovery_queue_apps",
        finishedIndicator: ".discover_queue_empty",
        emptyContainer: ".discover_queue_empty, .discovery_queue_empty_refresh_btn",

        startLink:
          ".discovery_queue_start_link, #discovery_queue_start_link, .discovery_queue_winter_sale_cards_header a[href*='discovery_queue'], .discovery_queue_global_header a[href*='discoveryqueue'], .btnv6_green_white_innerfade[href*='discoveryqueue']",

        startAnotherButton:
          "#refresh_queue_btn, .discover_queue_empty_refresh_btn .btnv6_lightblue_blue, .discover_queue_empty a[href*='discoveryqueue'], .begin_exploring, .btnv6_green_white_innerfade[href*='discoveryqueue']",
      },

      ageGate: {
        storeContainer: "#app_agegate, #agecheck_form, .agegate_birthday_selector",
        communityTextContainer: ".agegate_text_container, .agegate_text",
      },

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

    STORAGE_KEYS: {
      AUTO_START: "wishlistLooperAutoStartV3",
      AUTO_RESTART_QUEUE: "wishlistLooperAutoRestartQueueV3",
      UI_MINIMIZED: "wishlistLooperUiMinimizedV3",
      REQUIRE_CARDS: "wishlistLooperRequireCardsV3",
      SKIP_NON_GAMES: "wishlistLooperSkipNonGamesV3",
      SKIP_OWNED: "wishlistLooperSkipOwnedV3",
      LOG_LEVEL: "wishlistLooperLogLevel",
      SESSION_WISHLIST_COUNT: "wishlistLooperSessionCountV3",
      LAST_VERSION_CHECK: "wishlistLooperLastVersionCheck",

      VERSION_CHECK_URL:
        "https://raw.githubusercontent.com/bernardopg/steam-wishlist-looper/main/version.json",
    },

    MAX_QUEUE_RESTART_FAILURES: 5,
    CURRENT_VERSION: "2.1",
    get VERSION_CHECK_URL() {
      return GM_getValue(
        CONFIG.STORAGE_KEYS.VERSION_CHECK_URL,
        "https://raw.githubusercontent.com/bernardopg/steam-wishlist-looper/main/version.json"
      );
    },
  };

  const State = {
    loop: {
      state: "Stopped",
      timeoutId: null,
      isProcessing: false,
      manualActionInProgress: false,
      failedQueueRestarts: 0,
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
      logLevel: GM_getValue(CONFIG.STORAGE_KEYS.LOG_LEVEL, 0),
    },

    stats: {
      wishlistedThisSession: parseInt(
        sessionStorage.getItem(CONFIG.STORAGE_KEYS.SESSION_WISHLIST_COUNT) ||
        "0"
      ),
      lastVersionCheck: GM_getValue(CONFIG.STORAGE_KEYS.LAST_VERSION_CHECK, 0),
      latestVersion: null,
      updateUrl: null,
    },

    ui: {
      elements: {},
    },
  };

  const Logger = {
    log: function (message, level = 0) {
      if (level <= State.settings.logLevel) {
        const prefix = level === 1 ? "[DEBUG]" : level === 2 ? "[VERBOSE]" : "";

        if (!message.startsWith("[Steam Wishlist Looper]")) {
          console.log(`[Steam Wishlist Looper]${prefix}`, message);
        } else {
          console.log(`${prefix} ${message}`);
        }
      }
    },
  };

  const UI = {
    updateStatusText: function (message, statusType = "info") {
      if (!State.ui.elements.status) {
        const fallback = document.querySelector('#wl-status');
        if (fallback) fallback.textContent = `Status: ${message}`;
        return;
      }

      State.ui.elements.status.textContent = `Status: ${message}`;
      State.ui.elements.status.className =
        CONFIG.SELECTORS.ui.statusElement.substring(1);

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
          break;
      }

      if (
        statusType === "action" ||
        statusType === "success" ||
        statusType === "skipped"
      ) {
        setTimeout(() => {
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

    addControls: function () {
      const isCompatiblePage = () => {
        const url = window.location.href;
        return (
          url.includes('/app/') ||
          url.includes('/explore') ||
          url.includes('/curator/') ||
          url.includes('steamcommunity.com')
        );
      };

      if (!isCompatiblePage()) return;
      if (document.querySelector(CONFIG.SELECTORS.ui.container)) return;

      const controlDiv = document.createElement('div');
      controlDiv.id = CONFIG.SELECTORS.ui.container.substring(1);
      controlDiv.classList.toggle('wl-minimized', State.settings.uiMinimized);
      controlDiv.setAttribute('role', 'region');
      controlDiv.setAttribute('aria-label', 'Steam Wishlist Looper Controls');
      controlDiv.tabIndex = 0;

      controlDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid rgba(199, 213, 224, 0.1);">
          <strong style="color: #66c0f4; text-shadow: 1px 1px 1px #000; margin-right: auto;">Wishlist Looper</strong>
          <span title="Wishlisted this session" style="font-size: 10px; margin: 0 10px; color: #a1dd4a;">(<span id="${CONFIG.SELECTORS.ui.wishlistCountElement.substring(1)}">${State.stats.wishlistedThisSession}</span> Added)</span>
          <button id="${CONFIG.SELECTORS.ui.minimizeButton.substring(1)}" title="${State.settings.uiMinimized ? "Restore" : "Minimize"}" style="background: none; border: none; color: #66c0f4; font-size: 14px; cursor: pointer; padding: 0 5px; line-height: 1;" tabindex="0" aria-label="${State.settings.uiMinimized ? "Restaurar UI" : "Minimizar UI"}">${State.settings.uiMinimized ? "□" : "▬"}</button>
        </div>
        <div class="wl-controls-body">
          <div style="margin-bottom: 5px; display: flex; align-items: center;">
            <button id="${CONFIG.SELECTORS.ui.startButton.substring(1)}" title="Start/Resume automatic processing" tabindex="0" aria-label="Iniciar ou retomar processamento automático">Start</button>
            <button id="${CONFIG.SELECTORS.ui.pauseButton.substring(1)}" title="Pause automatic processing" disabled tabindex="0" aria-label="Pausar processamento automático">Pause</button>
            <button id="${CONFIG.SELECTORS.ui.stopButton.substring(1)}" title="Stop processing and disable Auto features" tabindex="0" aria-label="Parar processamento e desabilitar auto">Stop</button>
          </div>
          <div style="margin-bottom: 5px;">
            <button id="${CONFIG.SELECTORS.ui.processOnceButton.substring(1)}" title="Process only the current item" tabindex="0" aria-label="Processar apenas o item atual">Process Once</button>
            <button id="${CONFIG.SELECTORS.ui.skipButton.substring(1)}" title="Skip the current item and advance" tabindex="0" aria-label="Pular item atual">Skip Item</button>
          </div>
          <div id="${CONFIG.SELECTORS.ui.statusElement.substring(1)}" class="${CONFIG.SELECTORS.ui.statusElement.substring(1)}">Status: Initializing...</div>
          <div style="margin-top: 8px; border-top: 1px solid rgba(199, 213, 224, 0.2); padding-top: 8px; font-size: 11px;">
            <span style="display: block; margin-bottom: 4px; font-weight: bold; color: #66c0f4;">Options:</span>
            <label title="Automatically start loop on compatible pages"><input type="checkbox" id="${CONFIG.SELECTORS.ui.autoStartCheckbox.substring(1)}" tabindex="0">Auto-Start</label>
            <label title="Automatically restart queue when finished (requires Auto-Start)" style="margin-left: 10px;"><input type="checkbox" id="${CONFIG.SELECTORS.ui.autoRestartCheckbox.substring(1)}" tabindex="0">Auto-Restart</label>
            <br>
            <label title="Only wishlist items that have Steam Trading Cards"><input type="checkbox" id="${CONFIG.SELECTORS.ui.requireCardsCheckbox.substring(1)}" tabindex="0">Require Cards</label>
            <label title="Skip items already in your Steam library" style="margin-left: 10px;"><input type="checkbox" id="${CONFIG.SELECTORS.ui.skipOwnedCheckbox.substring(1)}" tabindex="0">Skip Owned</label>
            <br>
            <label title="Skip items identified as DLC, Soundtracks, Demos, etc."><input type="checkbox" id="${CONFIG.SELECTORS.ui.skipNonGamesCheckbox.substring(1)}" tabindex="0">Skip Non-Games</label>
          </div>
          <div id="${CONFIG.SELECTORS.ui.versionInfo.substring(1)}" style="font-size: 9px; color: #8f98a0; margin-top: 8px; text-align: right;">v${CONFIG.CURRENT_VERSION}</div>
        </div>
      `;

      setTimeout(() => {
        if (!State.ui.elements.startBtn || !State.ui.elements.pauseBtn) {
          controlDiv.innerHTML += '<div style="color:#ff7a7a;font-size:11px;">Erro ao carregar UI. Recarregue a página.</div>';
        }
      }, 1000);

      GM_addStyle(`
        #${CONFIG.SELECTORS.ui.container.substring(1)} {
          position: fixed; bottom: 10px; right: 10px; z-index: 9999;
          background: rgba(27, 40, 56, 0.9); color: #c7d5e0; padding: 10px;
          border-radius: 5px; font-family: 'Motiva Sans', sans-serif; font-size: 12px;
          border: 1px solid #000; box-shadow: 0 0 10px rgba(0,0,0,0.7);
          backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
          transition: all 0.3s ease-in-out; width: 250px;
        }
        #${CONFIG.SELECTORS.ui.container.substring(1)}.wl-minimized {
          padding: 5px 10px; height: auto; width: auto; min-width: 150px;
        }
        #${CONFIG.SELECTORS.ui.container.substring(
        1
      )}.wl-minimized .wl-controls-body {
          display: none;
        }
        #${CONFIG.SELECTORS.ui.container.substring(1)} button {
          padding: 4px 8px; border-radius: 2px; cursor: pointer; font-size: 11px;
          margin-right: 5px; border: 1px solid; transition: filter 0.15s ease;
        }
        #${CONFIG.SELECTORS.ui.container.substring(
        1
      )} button:last-child { margin-right: 0; }
        #${CONFIG.SELECTORS.ui.container.substring(1)} button:disabled {
          background-color: #555 !important; color: #999 !important; cursor: not-allowed !important;
          border-color: #333 !important; opacity: 0.7; filter: none !important;
        }
        #${CONFIG.SELECTORS.ui.container.substring(
        1
      )} button:hover:not(:disabled) { filter: brightness(1.15); }

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
      )} {
          font-size: 11px; min-height: 1.2em; padding: 4px 0; text-align: left;
          transition: color 0.3s ease, font-weight 0.3s ease; color: #c7d5e0;
        }
        .${CONFIG.SELECTORS.ui.statusElement.substring(
        1
      )}.wl-status-action { color: #66c0f4 !important; }
        .${CONFIG.SELECTORS.ui.statusElement.substring(
        1
      )}.wl-status-success { color: #a1dd4a !important; }
        .${CONFIG.SELECTORS.ui.statusElement.substring(
        1
      )}.wl-status-skipped { color: #aaa !important; }
        .${CONFIG.SELECTORS.ui.statusElement.substring(
        1
      )}.wl-status-error { color: #ff7a7a !important; font-weight: bold; }
        .${CONFIG.SELECTORS.ui.statusElement.substring(
        1
      )}.wl-status-paused { color: #e4d00a !important; font-style: italic; }

        #${CONFIG.SELECTORS.ui.container.substring(1)} label {
          display: inline-flex; align-items: center; cursor: pointer;
          font-size: 11px; vertical-align: middle; margin-bottom: 3px;
        }
        #${CONFIG.SELECTORS.ui.container.substring(
        1
      )} input[type="checkbox"] {
          margin-right: 4px; vertical-align: middle; cursor: pointer; accent-color: #66c0f4;
        }
        #${CONFIG.SELECTORS.ui.versionInfo.substring(1)}.wl-update-available {
           color: #ffa500 !important; text-decoration: underline; cursor: pointer; font-weight: bold;
        }
      `);

      document.body.appendChild(controlDiv);

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

      State.ui.elements.startBtn.addEventListener(
        "click",
        LoopController.startLoop
      );
      State.ui.elements.pauseBtn.addEventListener(
        "click",
        LoopController.pauseLoop
      );
      State.ui.elements.stopBtn.addEventListener(
        "click",
        () => LoopController.stopLoop(false)
      );
      State.ui.elements.processOnce.addEventListener(
        "click",
        QueueProcessor.processOnce
      );
      State.ui.elements.skip.addEventListener("click", QueueProcessor.skipItem);
      State.ui.elements.minimizeBtn.addEventListener(
        "click",
        this.toggleMinimizeUI
      );

      State.ui.elements.autoStartCheckbox.addEventListener("change", (e) =>
        SettingsManager.updateSetting(
          CONFIG.STORAGE_KEYS.AUTO_START,
          e.target.checked
        )
      );
      State.ui.elements.autoRestartCheckbox.addEventListener("change", (e) =>
        SettingsManager.updateSetting(
          CONFIG.STORAGE_KEYS.AUTO_RESTART_QUEUE,
          e.target.checked
        )
      );
      State.ui.elements.requireCardsCheckbox.addEventListener("change", (e) =>
        SettingsManager.updateSetting(
          CONFIG.STORAGE_KEYS.REQUIRE_CARDS,
          e.target.checked
        )
      );
      State.ui.elements.skipOwnedCheckbox.addEventListener("change", (e) =>
        SettingsManager.updateSetting(
          CONFIG.STORAGE_KEYS.SKIP_OWNED,
          e.target.checked
        )
      );
      State.ui.elements.skipNonGamesCheckbox.addEventListener("change", (e) =>
        SettingsManager.updateSetting(
          CONFIG.STORAGE_KEYS.SKIP_NON_GAMES,
          e.target.checked
        )
      );

      this.updateUI();
    },

    updateUI: function () {
      if (!State.ui.elements.container) return;

      const isRunning = State.loop.state === "Running";
      const isPaused = State.loop.state === "Paused";

      State.ui.elements.startBtn.disabled = isRunning;
      State.ui.elements.startBtn.textContent = isPaused ? "Resume" : "Start";
      State.ui.elements.startBtn.title = isPaused
        ? "Resume automatic processing"
        : "Start automatic processing";
      State.ui.elements.pauseBtn.disabled = !isRunning;
      State.ui.elements.stopBtn.disabled = !(isRunning || isPaused);

      this.updateManualButtonStates();

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

      if (State.ui.elements.wishlistCount) {
        State.ui.elements.wishlistCount.textContent =
          State.stats.wishlistedThisSession;
      }

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

    toggleMinimizeUI: function () {
      State.settings.uiMinimized = !State.settings.uiMinimized;
      GM_setValue(CONFIG.STORAGE_KEYS.UI_MINIMIZED, State.settings.uiMinimized);
      UI.updateUI();
    },

    updateVersionInfo: function (latestVersion, updateUrl) {
      if (!State.ui.elements.versionInfo) return;

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
        if (updateUrl && updateUrl !== "#") {
          State.ui.elements.versionInfo.style.cursor = "pointer";
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

  const SettingsManager = {
    updateSetting: function (key, newValue) {
      GM_setValue(key, newValue);

      const stateKeyEntry = Object.entries(CONFIG.STORAGE_KEYS).find(
        ([stateName, gmKey]) => gmKey === key
      );

      if (stateKeyEntry) {
        const camelCaseKey = stateKeyEntry[0]
          .toLowerCase()
          .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        if (camelCaseKey in State.settings) {
          State.settings[camelCaseKey] = newValue;
          Logger.log(`${camelCaseKey} updated to: ${newValue}`, 1);
        } else {
          Logger.log(
            `Warning: No matching key found in State.settings for ${camelCaseKey} (derived from ${key})`,
            0
          );
        }
      } else {
        Logger.log(
          `Warning: No CONFIG.STORAGE_KEYS entry found matching GM key ${key}`,
          0
        );
      }

      UI.updateUI();
    },

    toggleSetting: function (key, currentValue) {
      const newValue = !currentValue;
      this.updateSetting(key, newValue);
      const stateKeyEntry = Object.entries(CONFIG.STORAGE_KEYS).find(
        ([stateName, gmKey]) => gmKey === key
      );
      if (stateKeyEntry) {
        const camelCaseKey = stateKeyEntry[0]
          .toLowerCase()
          .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        if (camelCaseKey in State.settings) {
          return State.settings[camelCaseKey];
        }
      }
      return newValue;
    },
  };

  const AgeVerificationBypass = {
    init: function () {
      if (
        !window.location.hostname.includes("steampowered.com") &&
        !window.location.hostname.includes("steamcommunity.com")
      ) {
        return;
      }

      Logger.log("[Steam Age Skip] Initializing...", 1);

      try {
        this.setCookies();

        if (location.hostname.includes("store.steampowered.com")) {
          this.handleStoreSite();
        } else if (location.hostname.includes("steamcommunity.com")) {
          this.handleCommunitySite();
        }
      } catch (e) {
        Logger.log(`[Steam Age Skip] Error during init: ${e.message}`, 0);
      }
    },

    setCookies: function () {
      const birthTimeKey = "birthtime";
      const matureContentKey = "wants_mature_content";
      const sessionMatureContentKey = "session_mature_content"; // Sometimes needed

      const twentyOneYearsInSeconds = 21 * 365.25 * 24 * 60 * 60;
      const birthTimestamp = Math.floor(
        Date.now() / 1000 - twentyOneYearsInSeconds
      );

      const baseCookieOptions = `; max-age=315360000; secure; samesite=Lax`;
      const domains = [
        ".store.steampowered.com",
        ".steamcommunity.com",
        ".steampowered.com",
        "store.steampowered.com",
        "steamcommunity.com",
        "steampowered.com"
      ];

      const cookiesToSet = [
        { key: birthTimeKey, value: birthTimestamp },
        { key: matureContentKey, value: 1 },
        { key: sessionMatureContentKey, value: 1 }, // Frequentemente sem max-age
      ];

      let erro = false;
      cookiesToSet.forEach((cookie) => {
        domains.forEach((domain) => {
          try {
            document.cookie = `${cookie.key}=${cookie.value}; path=/; domain=${domain}${baseCookieOptions}`;
            if (cookie.key === sessionMatureContentKey) {
              document.cookie = `${cookie.key}=${cookie.value}; path=/; domain=${domain}; secure; samesite=Lax`;
            }
          } catch (e) {
            erro = true;
            Logger.log(`[Steam Age Skip] Erro ao definir cookie ${cookie.key} para domínio ${domain}: ${e.message}`, 0);
          }
        });
      });

      if (erro) {
        Logger.log(`[Steam Age Skip] Um ou mais cookies não puderam ser definidos corretamente.`, 0);
      } else {
        Logger.log(
          `[Steam Age Skip] Cookies de idade definidos para múltiplos domínios.`,
          1
        );
      }
    },

    handleStoreSite: function () {
      const checkAndReload = () => {
        const ageGate = document.querySelector(
          CONFIG.SELECTORS.ageGate.storeContainer
        );
        const ageGateOverlay = document.querySelector(
          ".agegate_birthday_desc, #agegate_box .agegate_text_container"
        );
        if (ageGate || ageGateOverlay) {
          Logger.log(
            "[Steam Age Skip] Age gate detected on store. Attempting bypass/reload...",
            0
          );

          const viewButton = document.querySelector(
            "#view_product_page_btn, .btn_medium.btnv6_lightblue_blue > span"
          );
          if (viewButton && viewButton.offsetParent) {
            Logger.log(
              "[Steam Age Skip] Found visible view button, attempting click...",
              1
            );
            viewButton.click();
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
            }, 500);
          } else {
            Logger.log(
              "[Steam Age Skip] No view button found or visible, relying on reload.",
              1
            );
            location.reload();
          }
          return true;
        }
        return false;
      };

      if (!checkAndReload()) {
        window.addEventListener("DOMContentLoaded", checkAndReload, {
          once: true,
        });
        window.addEventListener("load", checkAndReload, { once: true });
      }
    },

    handleCommunitySite: function () {
      const checkAndProceed = () => {
        const ageCheck = document.querySelector(
          CONFIG.SELECTORS.ageGate.communityTextContainer
        );
        if (ageCheck && ageCheck.offsetParent) {
          Logger.log(
            "[Steam Age Skip] Age gate detected on community. Attempting bypass...",
            0
          );
          if (!this.tryProceedFunction()) {
            Logger.log(
              "[Steam Age Skip] Proceed functions failed or not found. Relying on cookies/reload.",
              1
            );
          } else {
            Logger.log(
              "[Steam Age Skip] Proceed function called successfully (or attempted via injection).",
              1
            );
          }
          return true;
        }
        return false;
      };

      if (!checkAndProceed()) {
        window.addEventListener("DOMContentLoaded", checkAndProceed, {
          once: true,
        });
        window.addEventListener("load", checkAndProceed, { once: true });
      }
    },

    tryProceedFunction: function () {
      let executed = false;
      const functionsToTry = ["Proceed", "AcceptAppHub", "ViewProductPage"];

      const attemptExecution = (source, funcName, func) => {
        Logger.log(`[Steam Age Skip] Attempting ${source}.${funcName}()...`, 1);
        try {
          func();
          executed = true;
          Logger.log(` -> Call successful (no immediate error).`, 1);
          return true;
        } catch (e) {
          Logger.log(
            ` -> Error calling ${source}.${funcName}: ${e.message}`,
            1
          );
          return false;
        }
      };

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

      if (!executed) {
        for (const funcName of functionsToTry) {
          if (typeof window[funcName] === "function") {
            if (attemptExecution("window", funcName, window[funcName]))
              return true;
          }
        }
      }

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

      if (!executed) {
        Logger.log(
          "[Steam Age Skip] Direct calls failed, injecting script tag...",
          1
        );
        try {
          const script = document.createElement("script");
          let scriptContent = `"use strict"; (function() { console.log("[Steam Age Skip - Injected] Trying functions..."); var executed = false;`;
          functionsToTry.forEach((funcName) => {
            scriptContent += `if (!executed && typeof window.${funcName} === 'function') { console.log('[Steam Age Skip - Injected] Calling ${funcName}()'); try { window.${funcName}(); executed = true; } catch(e) { console.error('Error in injected ${funcName}:', e); } } `;
          });
          scriptContent += `if (!executed) console.log("[Steam Age Skip - Injected] No known function found or executed successfully."); })();`;
          script.textContent = scriptContent;

          const target = document.head || document.documentElement;
          if (target) {
            target.appendChild(script);
            executed = true;
            Logger.log(" -> Script injected.", 1);
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

      return executed;
    },
  };

  const GameInfoUtils = {
    getAppType: function () {
      const dlcIndicator = document.querySelector(
        CONFIG.SELECTORS.gameInfo.dlcIndicator
      );
      if (dlcIndicator?.offsetParent) return "DLC";

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

      const breadcrumbs = document.querySelectorAll(
        ".breadcrumbs .breadcrumb a, .game_title_area .blockbg a"
      );
      if (breadcrumbs.length > 0) {
        for (const crumb of breadcrumbs) {
          const crumbText = crumb.textContent?.trim().toUpperCase();
          if (crumbText === "SOFTWARE") return "Application";
          if (crumbText === "VIDEOS" || crumbText === "VIDEO") return "Video";
          if (crumbText === "SOUNDTRACKS" || crumbText === "SOUNDTRACK")
            return "Soundtrack";
          if (crumbText === "DEMOS" || crumbText === "DEMO") return "Demo";
          if (crumbText === "MODS") return "Mod";
        }
      }

      const demoNotice = document.querySelector(
        ".demo_notice, .game_area_purchase_game.demo_above_purchase"
      );
      if (demoNotice?.offsetParent) return "Demo";

      return "Game";
    },

    checkIfNonGame: function () {
      if (!State.settings.skipNonGames) {
        return null;
      }

      const appType = this.getAppType();
      const nonGameTypesToSkip = [
        "DLC",
        "Soundtrack",
        "Demo",
        "Application",
        "Video",
        "Mod",
      ];

      if (nonGameTypesToSkip.includes(appType)) {
        return `Type: ${appType}`;
      }

      return null;
    },
  };

  const QueueNavigation = {
    advanceQueue: async function () {
      let advanceMethod = "Failed";

      const nextButton = document.querySelector(
        CONFIG.SELECTORS.queueNav.nextButton
      );
      if (nextButton?.offsetParent) {
        Logger.log(" -> Found visible 'Next in Queue' button. Clicking...", 1);
        UI.updateStatusText("Navigating Next...", "action");
        nextButton.click();
        advanceMethod = "Next";
      } else {
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
          const nextForm = document.querySelector(
            CONFIG.SELECTORS.queueNav.nextForm
          );
          if (nextForm) {
            Logger.log(
              " -> No visible buttons, submitting next_in_queue_form...",
              1
            );
            UI.updateStatusText("Submitting form...", "action");
            nextForm.submit();
            advanceMethod = "FormSubmit";
            await new Promise((resolve) =>
              setTimeout(resolve, CONFIG.TIMING.MINI_DELAY)
            );
          } else {
            Logger.log(
              " -> Failed to find any method to advance queue (Next/Ignore/Form).",
              0
            );
            UI.updateStatusText("Error: Cannot advance queue.", "error");
          }
        }
      }

      if (advanceMethod !== "Failed" && advanceMethod !== "FormSubmit") {
        Logger.log(
          ` -> Successfully advanced queue using: ${advanceMethod}`,
          1
        );
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.TIMING.ADVANCE_DELAY)
        );
      } else if (advanceMethod === "FormSubmit") {
        Logger.log(
          ` -> Advanced queue using: FormSubmit (Page will reload).`,
          1
        );
      }

      return advanceMethod;
    },

    ensureQueueVisible: function () {
      const queueContainer = document.querySelector(
        CONFIG.SELECTORS.queueStatus.container
      );
      const emptyContainer = document.querySelector(
        CONFIG.SELECTORS.queueStatus.emptyContainer
      );

      if (queueContainer) {
        if (!queueContainer.offsetParent && !emptyContainer?.offsetParent) {
          Logger.log(
            " -> Queue container exists but seems hidden, ensuring visibility.",
            1
          );
          queueContainer.style.display = "";
        }
      }
    },

    generateNewQueue: async function () {
      Logger.log("Attempting to generate a new queue...", 1);
      UI.updateStatusText("Generating new queue...", "action");
      let generated = false;

      const startRefreshSelectors = `${CONFIG.SELECTORS.queueStatus.startAnotherButton}, ${CONFIG.SELECTORS.queueStatus.startLink}`;
      const buttons = document.querySelectorAll(startRefreshSelectors);

      let targetButton = null;
      for (const btn of buttons) {
        if (btn.offsetParent && !btn.disabled) {
          targetButton = btn;
          break;
        }
      }

      if (targetButton) {
        Logger.log(
          ` -> Found visible & enabled button/link: '${targetButton.innerText?.trim() || targetButton.id || "Start Link"
          }'. Clicking...`,
          1
        );
        targetButton.click();
        generated = true;
      } else {
        Logger.log(
          " -> No visible/enabled button found. Trying DiscoveryQueue.GenerateNewQueue()...",
          1
        );
        try {
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
        State.loop.failedQueueRestarts++;

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
          LoopController.stopLoop(true);
          return false;
        }
      } else {
        State.loop.failedQueueRestarts = 0;
        Logger.log(" -> Queue generation initiated.", 1);
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.TIMING.QUEUE_GENERATION_DELAY)
        );
        this.ensureQueueVisible();
      }

      return generated;
    },
  };

  const QueueProcessor = {
    checkQueueStatusAndHandle: async function () {
      const queueEmptyContainer = document.querySelector(
        CONFIG.SELECTORS.queueStatus.emptyContainer
      );
      const isOnExplorePage = window.location.pathname.includes("/explore");
      const queueContainer = document.querySelector(
        CONFIG.SELECTORS.queueStatus.container
      );
      const isQueueVisible = queueContainer?.offsetParent;
      const isEmptyMessageVisible =
        queueEmptyContainer?.offsetParent &&
        queueEmptyContainer.style.display !== "none";

      if (isEmptyMessageVisible) {
        Logger.log("Discovery Queue finished/empty message visible.");

        if (
          State.settings.autoStartEnabled &&
          State.settings.autoRestartQueueEnabled
        ) {
          Logger.log(
            "Auto-restart enabled. Attempting new queue generation..."
          );
          await QueueNavigation.generateNewQueue();
        } else {
          Logger.log(
            "Queue finished and Auto-restart disabled. Stopping loop."
          );
          UI.updateStatusText("Queue finished. Stopped.");
          LoopController.stopLoop(true);
        }
        return false;
      }

      if (isOnExplorePage && !isQueueVisible) {
        Logger.log(
          "On explore page, queue container not visible or not found."
        );

        if (State.settings.autoStartEnabled) {
          Logger.log(
            "Auto-start enabled. Attempting to start/generate queue from explore page..."
          );
          await QueueNavigation.generateNewQueue();
        } else {
          Logger.log(
            "On explore page, queue inactive, Auto-start disabled. Stopping loop."
          );
          UI.updateStatusText("Stopped (Needs Queue Start).");
          LoopController.stopLoop(true);
        }
        return false;
      }

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

        if (
          !nextButton?.offsetParent &&
          !ignoreButton?.offsetParent &&
          !nextForm
        ) {
          Logger.log(
            "On app page but missing visible queue navigation elements. Potential error or not a queue item?",
            0
          );
          if (State.loop.state === "Running") {
            UI.updateStatusText("Error: Invalid queue state?", "error");
            Logger.log(
              " -> Stopping loop due to invalid state on app page.",
              0
            );
            LoopController.stopLoop(true);
          } else {
            UI.updateStatusText("Stopped (Invalid state?)");
          }
          return false;
        }
      }

      if (isOnExplorePage && isQueueVisible) {
        const exploreWishlistButton = document.querySelector(
          CONFIG.SELECTORS.wishlist.addButton
        );
        const exploreIgnoreButton = document.querySelector(
          CONFIG.SELECTORS.queueNav.ignoreButtonInContainer
        );
        const exploreNextButton = document.querySelector(
          CONFIG.SELECTORS.queueNav.nextButton
        );

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

      State.loop.failedQueueRestarts = 0;
      return true;
    },

    processCurrentGameItem: async function (isManualTrigger = false) {
      UI.updateStatusText("Checking page...");

      const gameTitleElement = document.querySelector(
        CONFIG.SELECTORS.gameInfo.title
      );
      const exploreTitleElement = document.querySelector(
        "#discovery_queue .queue_item_title, #discovery_queue .title"
      );
      const gameTitle =
        gameTitleElement?.textContent?.trim() ||
        exploreTitleElement?.textContent?.trim() ||
        "Current Item";

      const queueRemainingElement = document.querySelector(
        CONFIG.SELECTORS.gameInfo.queueRemainingText
      );
      const queueRemaining = queueRemainingElement
        ? queueRemainingElement.textContent.trim()
        : "";

      UI.updateStatusText(`Checking ${gameTitle}... ${queueRemaining}`);
      Logger.log(
        `Processing: ${gameTitle} ${queueRemaining ? "- " + queueRemaining : ""
        }`,
        1
      );

      let skipReason = null;

      const ownedIndicator = document.querySelector(
        CONFIG.SELECTORS.gameInfo.inLibraryIndicator
      );
      if (State.settings.skipOwnedGames && ownedIndicator?.offsetParent) {
        skipReason = "Already in Library";
        Logger.log(` -> Skipping: ${skipReason} (Indicator found).`, 1);
      }

      if (!skipReason) {
        skipReason = GameInfoUtils.checkIfNonGame();
        if (skipReason)
          Logger.log(` -> Skipping: ${skipReason} (Type detected).`, 1);
      }

      if (
        !skipReason &&
        State.settings.requireTradingCards &&
        window.location.pathname.includes("/app/")
      ) {
        const hasTradingCards = document.querySelector(
          CONFIG.SELECTORS.gameInfo.tradingCardsIndicator
        );
        if (!hasTradingCards) {
          skipReason = "No Trading Cards";
          Logger.log(
            ` -> Skipping: ${skipReason} (Indicator not found on app page).`,
            1
          );
        } else {
          Logger.log(` -> Has Trading Cards (App page indicator found).`, 2);
        }
      } else if (
        !skipReason &&
        State.settings.requireTradingCards &&
        !window.location.pathname.includes("/app/")
      ) {
        Logger.log(` -> Trading card check skipped (not on app page).`, 2);
      }

      let actionTaken = false;

      if (skipReason) {
        UI.updateStatusText(`Skipped (${skipReason})`, "skipped");
      } else {
        const wishlistArea = document.querySelector(
          CONFIG.SELECTORS.wishlist.area
        );
        if (!wishlistArea) {
          Logger.log(
            " -> ERROR: Wishlist area not found after status check passed.",
            0
          );
          UI.updateStatusText("Error: Wishlist area missing", "error");
          skipReason = "Wishlist Area Missing";
        } else {
          const wishlistedIndicator = wishlistArea.querySelector(
            CONFIG.SELECTORS.wishlist.successIndicator
          );
          const isWishlisted =
            (wishlistedIndicator?.offsetParent &&
              wishlistedIndicator.style.display !== "none") ||
            wishlistArea.classList.contains("queue_btn_active") ||
            wishlistArea.querySelector(".queue_btn_active") !== null;

          const addButton = wishlistArea.querySelector(
            CONFIG.SELECTORS.wishlist.addButton
          );
          const isAddButtonVisible =
            addButton?.offsetParent && !addButton.disabled;

          if (
            State.settings.skipOwnedGames &&
            !isAddButtonVisible &&
            !isWishlisted
          ) {
            skipReason = "Owned/Ineligible";
            Logger.log(
              ` -> Skipping: ${skipReason} (Wishlist button absent/disabled).`,
              1
            );
            UI.updateStatusText(`Skipped (${skipReason})`, "skipped");
          } else if (isWishlisted) {
            Logger.log(` -> Already on wishlist.`);
            UI.updateStatusText(`On Wishlist`, "info");
          } else if (isAddButtonVisible) {
            Logger.log(` -> Adding to wishlist...`);
            UI.updateStatusText(`Adding ${gameTitle}...`, "action");
            addButton.click();
            actionTaken = true;

            const confirmed = await this.checkWishlistSuccessAfterAction(
              wishlistArea
            );

            if (confirmed) {
              UI.updateStatusText(`Added ${gameTitle}!`, "success");
              UI.incrementWishlistCounter();
            } else {
              Logger.log(
                " -> Wishlist add confirmation failed/timed out (UI didn't update). May have worked.",
                0
              );
              UI.updateStatusText(`Add Confirm Failed? ${gameTitle}`, "error");
              actionTaken = false;
            }
            await new Promise((resolve) =>
              setTimeout(resolve, CONFIG.TIMING.ACTION_DELAY * 0.7)
            );
          } else {
            Logger.log(
              ` -> Cannot add: Wishlist button not found or not visible/enabled.`
            );
            UI.updateStatusText("Wishlist button missing?", "error");
            skipReason = "Add Button Missing";
          }
        }
      }

      if (!isManualTrigger) {
        Logger.log(" -> Triggering advance to next item...", 1);
        const advanceResult = await QueueNavigation.advanceQueue();
        if (advanceResult === "Failed") {
          Logger.log(" -> Advancing failed, stopping loop.", 0);
          LoopController.stopLoop(true);
        }
        if (advanceResult !== "FormSubmit") {
          await new Promise((resolve) =>
            setTimeout(resolve, CONFIG.TIMING.MINI_DELAY)
          );
        }
      } else {
        Logger.log(
          " -> Manual trigger ('Process Once'), automatic advance skipped.",
          1
        );
      }
    },

    checkWishlistSuccessAfterAction: async function (wishlistAreaElement) {
      await new Promise((resolve) =>
        setTimeout(resolve, CONFIG.TIMING.ACTION_DELAY * 0.3)
      );

      let attempts = 0;
      const maxAttempts = 8;
      const intervalTime =
        (CONFIG.TIMING.WISHLIST_CONFIRM_TIMEOUT * 0.7) / maxAttempts;

      return new Promise((resolve) => {
        const intervalId = setInterval(() => {
          const successIndicator = wishlistAreaElement.querySelector(
            CONFIG.SELECTORS.wishlist.successIndicator
          );
          const isActive =
            wishlistAreaElement.classList.contains("queue_btn_active") ||
            wishlistAreaElement.querySelector(".queue_btn_active") !== null;

          if (
            (successIndicator?.offsetParent &&
              successIndicator.style.display !== "none") ||
            isActive
          ) {
            Logger.log(" -> Wishlist success confirmed by UI.", 1);
            clearInterval(intervalId);
            resolve(true);
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              Logger.log(" -> Wishlist success confirmation timed out.", 1);
              clearInterval(intervalId);
              resolve(false);
            }
          }
        }, intervalTime);
      });
    },

    processQueueCycle: async function (isManualTrigger = false) {
      if (State.loop.isProcessing && !isManualTrigger) {
        Logger.log("Cycle skipped, already processing.", 2);
        return;
      }
      if (State.loop.state === "Paused" && !isManualTrigger) {
        Logger.log("Cycle skipped, loop paused.", 2);
        return;
      }
      if (State.loop.manualActionInProgress && isManualTrigger) {
        Logger.log("Manual action already in progress.", 1);
        return;
      }

      State.loop.isProcessing = true;
      if (isManualTrigger) {
        State.loop.manualActionInProgress = true;
        UI.updateManualButtonStates();
      }

      try {
        const shouldProcessItem = await this.checkQueueStatusAndHandle();

        if (
          shouldProcessItem &&
          (State.loop.state === "Running" || isManualTrigger)
        ) {
          if (State.loop.state === "Running" || isManualTrigger) {
            await this.processCurrentGameItem(isManualTrigger);
          } else {
            Logger.log(
              ` -> Loop state changed to '${State.loop.state}' during status check, skipping item processing.`,
              1
            );
          }
        } else if (!shouldProcessItem) {
          Logger.log(
            " -> Queue status check indicated no item to process or action was taken (like restart).",
            1
          );
        } else {
          Logger.log(
            ` -> Loop state is '${State.loop.state}', skipping item processing.`,
            1
          );
        }
      } catch (error) {
        Logger.log(`ERROR during processQueueCycle: ${error.message}`, 0);
        console.error(
          "[Steam Wishlist Looper] Error details:",
          error.stack || error
        );
        UI.updateStatusText("Runtime Error!", "error");
      } finally {
        setTimeout(() => {
          State.loop.isProcessing = false;
          if (isManualTrigger) {
            State.loop.manualActionInProgress = false;
          }
          UI.updateManualButtonStates();

          if (State.loop.state === "Running") {
            const currentStatus = State.ui.elements.status?.textContent || "";
            if (
              !currentStatus.includes("Added") &&
              !currentStatus.includes("Skipped") &&
              !currentStatus.includes("Error")
            ) {
              UI.updateStatusText("Idle...");
            }
          } else if (State.loop.state === "Paused") {
            UI.updateStatusText("Paused", "paused");
          } else {
            UI.updateStatusText("Stopped.");
          }
        }, CONFIG.TIMING.PROCESSING_RELEASE_DELAY);
      }
    },

    processOnce: function () {
      if (State.loop.state === "Running") {
        Logger.log(
          "Cannot 'Process Once' while loop is running. Pause or Stop first.",
          0
        );
        UI.updateStatusText("Pause/Stop to Process Once", "info");
        return;
      }
      if (State.loop.isProcessing || State.loop.manualActionInProgress) {
        Logger.log("Cannot 'Process Once', action already in progress.", 1);
        return;
      }

      Logger.log("Manual trigger: Processing current item once...");
      UI.updateStatusText("Processing (Manual)...", "action");
      QueueProcessor.processQueueCycle(true);
    },

    skipItem: async function () {
      if (State.loop.state === "Running") {
        Logger.log(
          "Cannot 'Skip Item' while loop is running. Pause or Stop first.",
          0
        );
        UI.updateStatusText("Pause/Stop to Skip Item", "info");
        return;
      }
      if (State.loop.isProcessing || State.loop.manualActionInProgress) {
        Logger.log("Cannot 'Skip Item', action already in progress.", 1);
        return;
      }

      Logger.log("Manual trigger: Skipping current item...");
      UI.updateStatusText("Skipping (Manual)...", "action");
      State.loop.isProcessing = true;
      State.loop.manualActionInProgress = true;
      UI.updateManualButtonStates();

      try {
        const advanceResult = await QueueNavigation.advanceQueue();
        if (advanceResult === "Failed") {
          UI.updateStatusText("Skip failed: Cannot advance.", "error");
        } else {
          UI.updateStatusText("Skipped (Manual)", "skipped");
        }
      } catch (error) {
        Logger.log(`Error during manual skip: ${error.message}`, 0);
        UI.updateStatusText("Error during skip!", "error");
      } finally {
        setTimeout(() => {
          State.loop.isProcessing = false;
          State.loop.manualActionInProgress = false;
          UI.updateManualButtonStates();
          if (State.loop.state === "Paused") {
            UI.updateStatusText("Paused", "paused");
          } else {
            UI.updateStatusText("Stopped.");
          }
        }, CONFIG.TIMING.ADVANCE_DELAY);
      }
    },
  };

  const LoopController = {
    mainLoop: function () {
      if (State.loop.state !== "Running" || !State.loop.timeoutId) {
        Logger.log(
          `Main loop called but state is '${State.loop.state}' or timeoutId is invalid. Exiting loop.`,
          1
        );
        if (State.loop.timeoutId) {
          clearTimeout(State.loop.timeoutId);
          State.loop.timeoutId = null;
        }
        return;
      }

      const currentTimeoutId = State.loop.timeoutId;

      QueueProcessor.processQueueCycle(false) // false indica ciclo automático
        .then(() => {
          if (
            State.loop.state === "Running" &&
            State.loop.timeoutId === currentTimeoutId
          ) {
            clearTimeout(State.loop.timeoutId);
            State.loop.timeoutId = setTimeout(
              LoopController.mainLoop,
              CONFIG.TIMING.CHECK_INTERVAL
            );
            Logger.log(
              `Prócheca agendada em ${CONFIG.TIMING.CHECK_INTERVAL / 1000
              }s.`,
              2
            );
          } else {
            Logger.log(
              `O estado do loop mudou para '${State.loop.state}' ou o timeoutId não coincide (atual: ${State.loop.timeoutId}, esperado: ${currentTimeoutId}) durante o processamento. Próxima verificação cancelada.`,
              1
            );
            if (
              State.loop.timeoutId &&
              State.loop.timeoutId !== currentTimeoutId
            ) {
              clearTimeout(State.loop.timeoutId);
            }
            State.loop.timeoutId = null;
          }
        })
        .catch((error) => {
          Logger.log(
            `Unhandled error in mainLoop promise chain: ${error.message}`,
            0
          );
          console.error(
            "[Steam Wishlist Looper] mainLoop promise error:",
            error.stack || error
          );
          UI.updateStatusText("Critical Error in Loop!", "error");

          if (
            State.loop.state === "Running" &&
            State.loop.timeoutId === currentTimeoutId
          ) {
            Logger.log(" -> Stopping loop due to critical error.", 0);
            LoopController.stopLoop(true);
          } else {
            if (State.loop.timeoutId) clearTimeout(State.loop.timeoutId);
            State.loop.timeoutId = null;
          }
        });
    },

    startLoop: function () {
      if (State.loop.state === "Running") {
        Logger.log("Loop already running.", 1);
        return;
      }

      if (State.loop.state === "Paused") {
        LoopController.resumeLoop();
        return;
      }

      Logger.log("Starting loop...");
      UI.updateStatusText("Starting...");
      State.loop.state = "Running";
      State.loop.isProcessing = false;
      State.loop.manualActionInProgress = false;
      State.loop.failedQueueRestarts = 0;
      UI.updateUI();

      if (State.loop.timeoutId) clearTimeout(State.loop.timeoutId);

      State.loop.timeoutId = setTimeout(
        LoopController.mainLoop,
        CONFIG.TIMING.MINI_DELAY
      );
      setTimeout(() => {
        if (State.loop.state === "Running")
          UI.updateStatusText("Running - Initializing cycle...");
      }, CONFIG.TIMING.MINI_DELAY + 10);
    },

    pauseLoop: function () {
      if (State.loop.state !== "Running") {
        Logger.log(`Loop is '${State.loop.state}', cannot pause.`, 1);
        return;
      }

      Logger.log("Pausing loop...");
      State.loop.state = "Paused";

      if (State.loop.timeoutId) {
        clearTimeout(State.loop.timeoutId);
        State.loop.timeoutId = null;
        Logger.log(" -> Next cycle cancelled.", 1);
      }

      UI.updateUI();
      UI.updateStatusText("Paused", "paused");
    },

    resumeLoop: function () {
      if (State.loop.state !== "Paused") {
        Logger.log(`Loop is '${State.loop.state}', cannot resume.`, 1);
        return;
      }

      Logger.log("Resuming loop...");
      State.loop.state = "Running";

      State.loop.isProcessing = false;
      State.loop.manualActionInProgress = false;

      UI.updateUI();
      UI.updateStatusText("Resuming...");

      if (State.loop.timeoutId) clearTimeout(State.loop.timeoutId);

      State.loop.timeoutId = setTimeout(
        LoopController.mainLoop,
        CONFIG.TIMING.MINI_DELAY
      );
      setTimeout(() => {
        if (State.loop.state === "Running")
          UI.updateStatusText("Running - Resuming cycle...");
      }, CONFIG.TIMING.MINI_DELAY + 10);
    },

    stopLoop: function (keepSettings = false) {
      if (State.loop.state === "Stopped") {
        Logger.log("Loop already stopped.", 1);
        UI.updateUI();
        UI.updateStatusText("Stopped.");
        return;
      }

      Logger.log("Stopping loop...");
      const wasRunning = State.loop.state === "Running";
      State.loop.state = "Stopped";

      if (State.loop.timeoutId) {
        clearTimeout(State.loop.timeoutId);
        State.loop.timeoutId = null;
        Logger.log(" -> Next cycle cancelled.", 1);
      }

      State.loop.isProcessing = false;
      State.loop.manualActionInProgress = false;

      if (!keepSettings) {
        Logger.log("-> Disabling Auto-Start & Auto-Restart Queue settings.", 1);
        SettingsManager.updateSetting(CONFIG.STORAGE_KEYS.AUTO_START, false);
        SettingsManager.updateSetting(
          CONFIG.STORAGE_KEYS.AUTO_RESTART_QUEUE,
          false
        );
      } else {
        Logger.log("-> Keeping Auto-Start/Restart settings enabled.", 1);
      }

      setTimeout(() => {
        UI.updateUI();
        UI.updateStatusText("Stopped.");
      }, CONFIG.TIMING.MINI_DELAY);
    },
  };

  const VersionChecker = {
    checkForUpdates: function () {
      const currentTime = Date.now();
      const lastCheck = State.stats.lastVersionCheck;
      const checkInterval = CONFIG.TIMING.VERSION_CHECK_INTERVAL;

      if (currentTime - lastCheck < checkInterval) {
        Logger.log(
          `Skipping version check, last checked ${Math.round(
            (currentTime - lastCheck) / 3600000
          )} hours ago.`,
          2
        );
        this.updateUIAfterCheck();
        return;
      }

      Logger.log("Checking for updates...", 1);
      const checkUrl = CONFIG.VERSION_CHECK_URL;

      if (!checkUrl || !checkUrl.startsWith("http")) {
        Logger.log(
          "Version check URL is invalid or not configured. Skipping check.",
          0
        );
        GM_setValue(CONFIG.STORAGE_KEYS.LAST_VERSION_CHECK, currentTime);
        State.stats.lastVersionCheck = currentTime;
        return;
      }

      GM_xmlhttpRequest({
        method: "GET",
        url: checkUrl + `?ts=${currentTime}`,
        timeout: 10000,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        onload: (response) => {
          GM_setValue(CONFIG.STORAGE_KEYS.LAST_VERSION_CHECK, currentTime);
          State.stats.lastVersionCheck = currentTime;

          if (response.status === 200) {
            try {
              const data = JSON.parse(response.responseText);
              if (data && typeof data.version === "string") {
                Logger.log(
                  `Latest version fetched: ${data.version}, Current: ${CONFIG.CURRENT_VERSION}`,
                  1
                );
                State.stats.latestVersion = data.version;
                State.stats.updateUrl =
                  typeof data.updateUrl === "string" ? data.updateUrl : null;
              } else {
                Logger.log(
                  "Version check response missing 'version' field or invalid format.",
                  0
                );
                State.stats.latestVersion = null;
                State.stats.updateUrl = null;
              }
            } catch (e) {
              Logger.log(`Error parsing version data: ${e.message}`, 0);
              State.stats.latestVersion = null;
              State.stats.updateUrl = null;
            }
          } else {
            Logger.log(
              `Version check failed: HTTP Status ${response.status}`,
              0
            );
            State.stats.latestVersion = null;
            State.stats.updateUrl = null;
          }
          this.updateUIAfterCheck();
        },
        onerror: (error) => {
          GM_setValue(CONFIG.STORAGE_KEYS.LAST_VERSION_CHECK, currentTime);
          State.stats.lastVersionCheck = currentTime;
          Logger.log(
            `Error during version check request: ${error.statusText || "Network Error"
            }`,
            0
          );
          State.stats.latestVersion = null;
          State.stats.updateUrl = null;
          this.updateUIAfterCheck();
        },
        ontimeout: () => {
          GM_setValue(CONFIG.STORAGE_KEYS.LAST_VERSION_CHECK, currentTime);
          State.stats.lastVersionCheck = currentTime;
          Logger.log("Version check timed out.", 0);
          State.stats.latestVersion = null;
          State.stats.updateUrl = null;
          this.updateUIAfterCheck();
        },
      });
    },

    updateUIAfterCheck: function () {
      if (State.ui.elements.versionInfo) {
        UI.updateVersionInfo(State.stats.latestVersion, State.stats.updateUrl);
      } else {
        Logger.log("Version UI element not ready, skipping update display.", 2);
      }
    },
  };

  const Initialization = {
    init: function () {
      AgeVerificationBypass.init();

      if (window.top !== window.self) {
        Logger.log(
          "Wishlist Looper running in iframe, main features skipped.",
          1
        );
        return;
      }

      const url = window.location.href;
      const isCompatiblePage =
        url.includes('/app/') ||
        url.includes('/explore') ||
        url.includes('/curator/') ||
        url.includes('steamcommunity.com');
      if (!isCompatiblePage) {
        Logger.log("Página não compatível. Script não será inicializado.", 1);
        return;
      }

      Logger.log(
        `Steam Infinite Wishlister v${CONFIG.CURRENT_VERSION} Initializing (Top Window)...`,
        0
      );

      const initializeMainComponents = () => {
        try {
          Logger.log("DOM ready, initializing main components.", 1);

          UI.addControls();

          this.handleInitialPageState();

          VersionChecker.checkForUpdates();

          this.registerMenuCommands();

          Logger.log("Initialization complete.", 0);

          if (State.loop.state === "Stopped" && State.ui.elements.status) {
            if (State.ui.elements.status.textContent.includes("Initializing")) {
              UI.updateStatusText("Stopped.");
            }
          }
        } catch (e) {
          Logger.log(`[Init] Erro durante inicialização: ${e.message}`, 0);
          if (State.ui.elements.status) {
            UI.updateStatusText("Erro na inicialização!", "error");
          }
        }
      };

      if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
      ) {
        setTimeout(initializeMainComponents, 0);
      } else {
        window.addEventListener("DOMContentLoaded", initializeMainComponents, {
          once: true,
        });
      }
    },

    handleInitialPageState: function () {
      const isOnAppPage = window.location.pathname.includes("/app/");
      const isOnExplorePage = window.location.pathname.includes("/explore");

      const queueContainer = document.querySelector(
        CONFIG.SELECTORS.queueStatus.container
      );
      const queueEmptyContainer = document.querySelector(
        CONFIG.SELECTORS.queueStatus.emptyContainer
      );
      const isQueueVisible = !!queueContainer?.offsetParent;
      const isEmptyMessageVisible = !!queueEmptyContainer?.offsetParent;

      Logger.log(
        `Initial Page State: App=${isOnAppPage}, Explore=${isOnExplorePage}, QueueVisible=${isQueueVisible}, EmptyMsgVisible=${isEmptyMessageVisible}, AutoStart=${State.settings.autoStartEnabled}, AutoRestart=${State.settings.autoRestartQueueEnabled}`,
        1
      );

      if (
        State.settings.autoStartEnabled &&
        State.settings.autoRestartQueueEnabled &&
        isEmptyMessageVisible
      ) {
        Logger.log(
          "Initial state: Queue finished/empty. Auto-restarting queue...",
          0
        );
        UI.updateStatusText("Queue empty, auto-restarting...", "action");
        setTimeout(() => {
          QueueNavigation.generateNewQueue().then((success) => {
            if (success && State.loop.state === "Stopped") {
              setTimeout(() => {
                if (State.loop.state === "Stopped") {
                  Logger.log("Queue generation initiated, starting loop.", 1);
                  LoopController.startLoop();
                }
              }, CONFIG.TIMING.QUEUE_GENERATION_DELAY + 500);
            } else if (!success) {
              Logger.log("Auto-restart failed to initiate generation.", 0);
            }
          });
        }, CONFIG.TIMING.INITIAL_START_DELAY / 2);
      } else if (
        State.settings.autoStartEnabled &&
        isOnExplorePage &&
        !isQueueVisible &&
        !isEmptyMessageVisible
      ) {
        Logger.log(
          "Initial state: On explore page, queue needs starting. Auto-starting queue generation...",
          0
        );
        UI.updateStatusText("On explore, auto-starting queue...", "action");
        setTimeout(() => {
          QueueNavigation.generateNewQueue().then((success) => {
            if (success && State.loop.state === "Stopped") {
              setTimeout(() => {
                if (State.loop.state === "Stopped") {
                  Logger.log("Queue generation initiated, starting loop.", 1);
                  LoopController.startLoop();
                }
              }, CONFIG.TIMING.QUEUE_GENERATION_DELAY + 500);
            } else if (!success) {
              Logger.log(
                "Auto-start failed to initiate generation from explore.",
                0
              );
            }
          });
        }, CONFIG.TIMING.INITIAL_START_DELAY / 2);
      } else if (
        State.settings.autoStartEnabled &&
        (isOnAppPage || (isOnExplorePage && isQueueVisible))
      ) {
        const canInteract =
          document.querySelector(CONFIG.SELECTORS.wishlist.addButton) ||
          document.querySelector(CONFIG.SELECTORS.queueNav.nextButton)
            ?.offsetParent ||
          document.querySelector(
            CONFIG.SELECTORS.queueNav.ignoreButtonInContainer
          );
        if (canInteract) {
          Logger.log(
            "Initial state: On valid & active queue page. Auto-starting loop...",
            0
          );
          setTimeout(
            LoopController.startLoop,
            CONFIG.TIMING.INITIAL_START_DELAY
          );
        } else {
          Logger.log(
            "Initial state: On potential queue page, but interaction elements missing. Auto-start aborted.",
            1
          );
          UI.updateStatusText("Stopped (Invalid state?).");
        }
      } else {
        if (!State.settings.autoStartEnabled) {
          Logger.log("Initial state: Auto-start disabled.", 1);
        } else {
          if (!isOnAppPage && !isOnExplorePage) {
            Logger.log(
              `Initial state: Not on a recognised auto-start page (Path: ${window.location.pathname}).`,
              1
            );
          } else if (
            isOnExplorePage &&
            !isQueueVisible &&
            isEmptyMessageVisible
          ) {
            Logger.log(
              `Initial state: On explore page, queue empty, auto-restart disabled or failed.`,
              1
            );
          } else {
            Logger.log(
              `Initial state: Conditions for auto-start not met (Explore=${isOnExplorePage}, QueueVisible=${isQueueVisible}, Empty=${isEmptyMessageVisible}).`,
              1
            );
          }
        }
        if (
          State.loop.state === "Stopped" &&
          State.ui.elements.status &&
          State.ui.elements.status.textContent.includes("Initializing")
        ) {
          UI.updateStatusText("Stopped.");
        }
      }
    },

    registerMenuCommands: function () {
      GM_registerMenuCommand(
        "[Wishlister] Start / Resume Loop",
        LoopController.startLoop,
        "r"
      );
      GM_registerMenuCommand(
        "[Wishlister] Pause Loop",
        LoopController.pauseLoop,
        "p"
      );
      GM_registerMenuCommand(
        "[Wishlister] Stop Loop (Keep Auto Settings)",
        () => LoopController.stopLoop(true),
        "k"
      );
      GM_registerMenuCommand(
        "[Wishlister] Stop Loop & Disable Auto",
        () => LoopController.stopLoop(false),
        "s"
      );
      GM_registerMenuCommand(
        "[Wishlister] Process Current Item Once",
        QueueProcessor.processOnce,
        "o"
      );
      GM_registerMenuCommand(
        "[Wishlister] Skip Current Item",
        QueueProcessor.skipItem,
        "i"
      );

      GM_registerMenuCommand("--- Wishlister Settings ---", () => { });

      GM_registerMenuCommand(
        `[Wishlister] ${State.settings.autoStartEnabled ? "✅ Disable" : "⬜ Enable"
        } Auto-Start`,
        () => {
          SettingsManager.toggleSetting(
            CONFIG.STORAGE_KEYS.AUTO_START,
            State.settings.autoStartEnabled
          );
          this.registerMenuCommands();
        }
      );
      GM_registerMenuCommand(
        `[Wishlister] ${State.settings.autoRestartQueueEnabled ? "✅ Disable" : "⬜ Enable"
        } Auto-Restart Queue`,
        () => {
          SettingsManager.toggleSetting(
            CONFIG.STORAGE_KEYS.AUTO_RESTART_QUEUE,
            State.settings.autoRestartQueueEnabled
          );
          this.registerMenuCommands();
        }
      );
      GM_registerMenuCommand(
        `[Wishlister] ${State.settings.requireTradingCards ? "✅ Disable" : "⬜ Enable"
        } Require Trading Cards`,
        () => {
          SettingsManager.toggleSetting(
            CONFIG.STORAGE_KEYS.REQUIRE_CARDS,
            State.settings.requireTradingCards
          );
          this.registerMenuCommands();
        }
      );
      GM_registerMenuCommand(
        `[Wishlister] ${State.settings.skipOwnedGames ? "✅ Disable" : "⬜ Enable"
        } Skip Owned Games`,
        () => {
          SettingsManager.toggleSetting(
            CONFIG.STORAGE_KEYS.SKIP_OWNED,
            State.settings.skipOwnedGames
          );
          this.registerMenuCommands();
        }
      );
      GM_registerMenuCommand(
        `[Wishlister] ${State.settings.skipNonGames ? "✅ Disable" : "⬜ Enable"
        } Skip Non-Games (DLC, etc.)`,
        () => {
          SettingsManager.toggleSetting(
            CONFIG.STORAGE_KEYS.SKIP_NON_GAMES,
            State.settings.skipNonGames
          );
          this.registerMenuCommands();
        }
      );
      GM_registerMenuCommand(
        `[Wishlister] ${State.settings.uiMinimized ? " R" : "➖ M"
        }estore/Minimize UI Panel`,
        () => {
          UI.toggleMinimizeUI();
          this.registerMenuCommands();
        },
        "m"
      );

      GM_registerMenuCommand("--- Wishlister Info ---", () => { });

      GM_registerMenuCommand(
        "[Wishlister] Check for Updates Now",
        () => {
          GM_setValue(CONFIG.STORAGE_KEYS.LAST_VERSION_CHECK, 0);
          State.stats.lastVersionCheck = 0;
          VersionChecker.checkForUpdates();
          if (State.ui.elements.status)
            UI.updateStatusText("Checking for updates...", "action");
        },
        "u"
      );

      Logger.log("Menu commands registered/updated.", 1);
    },
  };

  Initialization.init();
})();
