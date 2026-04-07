// ==UserScript==
// @name         Steam Infinite Wishlister
// @namespace    http://tampermonkey.net/
// @version      2.2.0
// @description  Advanced Steam Discovery Queue wishlisting: Trading Card/DLC/Owned options, Age Skip, Pause/Resume, Counters, Robustness++
// @icon         https://store.steampowered.com/favicon.ico
// @author       bernardopg
// @homepageURL  https://github.com/bernardopg/steam-infinite-wishlister
// @supportURL   https://github.com/bernardopg/steam-infinite-wishlister/issues
// @updateURL    https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/steam-infinite-wishlister.js
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

import CONFIG from "./config.js";
import { State, initSettings } from "./state.js";
import UI from "./ui.js";
import Loop from "./loop.js";
import { log } from "./utils.js";

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
