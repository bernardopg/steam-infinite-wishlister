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

import CONFIG from "./config.js";
import { State, initSettings } from "./state.js";
import UI from "./ui.js";
import Loop from "./loop.js";
import UpdateChecker from "./update.js";
import { log } from "./utils.js";

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
