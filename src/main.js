// ==UserScript==
// @name         Steam Wishlist Looper (Modular)
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Loop automático de Discovery Queue com wishlist - Versão modular e simplificada
// @author       bernardopg
// @match        *://store.steampowered.com/app/*
// @match        *://store.steampowered.com/explore*
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==

import UI from "./ui.js";
import Loop from "./loop.js";
import State from "./state.js";
import { log } from "./utils.js";

(function () {
  "use strict";

  log("Inicializando Steam Wishlist Looper (Modular)...");

  // Criar interface
  UI.create();

  // Conectar botões
  State.ui.startBtn.addEventListener("click", Loop.start);
  State.ui.stopBtn.addEventListener("click", Loop.stop);

  // Atalhos de teclado
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyS") Loop.start();
    if (e.ctrlKey && e.shiftKey && e.code === "KeyX") Loop.stop();
    if (e.code === "Escape") Loop.stop();
  });

  // Auto-start se habilitado
  if (State.settings.autoStart) {
    log("Auto-start habilitado, iniciando...");
    setTimeout(Loop.start, 1500);
  }

  log("Inicialização completa!");
})();
