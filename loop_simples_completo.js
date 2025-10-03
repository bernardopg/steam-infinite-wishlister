// ==UserScript==
// @name         Steam Queue Helper (bernardopg) — auto loop com fallback robusto
// @namespace    https://store.steampowered.com/
// @version      1.4
// @description  Loop automático: queue/wishlist/next. Fallback “Ver a sua lista” com cooldown e detecção de navegação para não martelar.
// @author       bernardopg
// @match        https://store.steampowered.com/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  // ------------- utils -------------
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function waitFor(condFn, { timeout = 8000, interval = 200 } = {}) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      try {
        if (condFn()) return true;
      } catch {}
      await wait(interval);
    }
    return false;
  }

  const visible = (el) => !!(el && el.offsetParent !== null);

  const pick = (sel) =>
    sel?.startsWith("/")
      ? document.evaluate(
          sel,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue
      : document.querySelector(sel);

  const byText = (txt) => {
    const nodes = document.querySelectorAll("span, a, button, div");
    return Array.from(nodes).find((el) =>
      (el.textContent || "").replace(/\s+/g, " ").trim().includes(txt)
    );
  };

  const onExplore = () => location.pathname.startsWith("/explore");

  // ------------- alvos/ações -------------
  const tryQueueButtons = () => {
    const selectors = [
      "#refresh_queue_btn",
      "#refresh_queue_btn > span",
      "#discovery_queue_start_link",
    ];
    for (const s of selectors) {
      const el = pick(s);
      if (el && visible(el)) {
        el.click();
        console.log("[SQH] Cliquei em:", s);
        return true;
      }
    }
    const txtTargets = [
      "Iniciar outra lista",
      "Clique aqui para começar a explorar",
    ];
    for (const t of txtTargets) {
      const el = byText(t);
      if (el && visible(el)) {
        el.click();
        console.log(`[SQH] Cliquei no elemento com texto: "${t}"`);
        return true;
      }
    }
    return false;
  };

  const hasLabelCartas = () => {
    const labels = document.querySelectorAll(".label");
    return Array.from(labels).some((el) =>
      (el.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .includes("Cartas Colecionáveis Steam")
    );
  };

  const clickWishlist = () => {
    let btn = document.querySelector("#add_to_wishlist_area .add_to_wishlist");
    if (!btn) {
      btn = Array.from(document.querySelectorAll("a, button, div")).find((el) =>
        (el.textContent || "").includes("+ Lista de desejos")
      );
    }
    if (btn && visible(btn)) {
      btn.click();
      console.log("[SQH] Cliquei em: + Lista de desejos");
      return true;
    }
    return false;
  };

  const findNextBtn = () => {
    let btn = document.querySelector(
      ".btn_next_in_queue.btn_next_in_queue_trigger"
    );
    if (btn && visible(btn)) return btn;
    const candidates = document.querySelectorAll(
      'div[role="button"], a, button, .btn_next_in_queue'
    );
    btn = Array.from(candidates).find((el) => {
      const t = (el.textContent || "").replace(/\s+/g, " ").trim();
      return /Próximo da lista/i.test(t) && visible(el);
    });
    return btn || null;
  };

  const clickNext = () => {
    const btn = findNextBtn();
    if (btn) {
      btn.click();
      console.log("[SQH] Cliquei em: Próximo da lista");
      return true;
    }
    return false;
  };

  // ------------- fallback “Ver a sua lista” com cooldown e single-flight -------------
  const fallbackState = {
    lastClickAt: 0,
    cooldownMs: 5000,
    navigating: false,
  };

  const clickSeeYourList = async () => {
    // não clique se já estamos na página de explore, ou se está em cooldown, ou se já estamos “navegando”
    if (onExplore()) return false;
    const now = Date.now();
    if (fallbackState.navigating) return false;
    if (now - fallbackState.lastClickAt < fallbackState.cooldownMs)
      return false;

    // tente achar o botão certo
    let a = Array.from(document.querySelectorAll('a[href*="/explore"]')).find(
      (el) =>
        /store\.steampowered\.com\/explore/.test(el.href) &&
        /Ver a sua lista/i.test(el.textContent || "")
    );
    if (!a) {
      a = Array.from(document.querySelectorAll("a, button, div")).find((el) =>
        /Ver a sua lista/i.test(
          (el.textContent || "").replace(/\s+/g, " ").trim()
        )
      );
    }
    if (!a || !visible(a)) return false;

    fallbackState.navigating = true;
    fallbackState.lastClickAt = now;
    a.click();
    console.log("[SQH] Fallback: cliquei em 'Ver a sua lista'");

    // espera navegação ou elementos-chave aparecerem
    const oldHref = location.href;
    const ok = await waitFor(
      () =>
        location.href !== oldHref ||
        document.querySelector("#discovery_queue_start_link") ||
        document.querySelector("#refresh_queue_btn"),
      { timeout: 8000, interval: 250 }
    );

    // dá um pequeno respiro para o SPA montar
    await wait(500);

    fallbackState.navigating = false;
    return ok;
  };

  // ------------- loop com locks -------------
  let running = true;
  let stepping = false;

  async function stepOnce() {
    if (stepping) return; // evita sobreposição
    stepping = true;

    try {
      // tenta queue
      for (let i = 0; i < 3; i++) {
        if (tryQueueButtons()) {
          stepping = false;
          return;
        }
        await wait(300);
      }

      // tenta wishlist + próximo quando na página do app
      if (hasLabelCartas()) {
        const didWishlist = clickWishlist();
        if (didWishlist) await wait(600);
        if (clickNext()) {
          stepping = false;
          return;
        }
      }

      // tenta só “próximo”
      if (clickNext()) {
        stepping = false;
        return;
      }

      // fallback com cooldown
      const didFallback = await clickSeeYourList();
      if (!didFallback) {
        console.log("[SQH] Nada para clicar no momento.");
      }
    } catch (e) {
      console.warn("[SQH] Erro no passo:", e);
    } finally {
      stepping = false;
    }
  }

  async function runLoop() {
    const MIN_DELAY = 700;
    const MAX_DELAY = 1200;
    while (running) {
      await stepOnce();
      const jitter =
        MIN_DELAY + Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1));
      await wait(jitter);
    }
  }

  // ------------- UI mínima: só Stop -------------
  const panel = document.createElement("div");
  panel.id = "sqh_panel";
  panel.innerHTML = `
    <div id="sqh_title">Steam Queue Helper</div>
    <div id="sqh_controls"><button id="sqh_stop">Stop</button></div>
    <div id="sqh_status">Rodando...</div>
    <div id="sqh_hint">Ctrl+Shift+X para parar</div>
  `;
  const style = document.createElement("style");
  style.textContent = `
    #sqh_panel {
      position: fixed; right: 14px; bottom: 14px;
      z-index: 999999; background: rgba(20,20,25,0.92);
      color: #fff; font-family: system-ui, sans-serif;
      border-radius: 12px; padding: 10px 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.12); min-width: 180px; backdrop-filter: blur(2px);
    }
    #sqh_title { font-weight: 700; font-size: 13px; margin-bottom: 6px; opacity: 0.9; }
    #sqh_controls { margin-bottom: 6px; }
    #sqh_controls button {
      cursor: pointer; border: 0; border-radius: 10px; padding: 8px 10px; font-weight: 600;
      background: #e74c3c; color: #300;
    }
    #sqh_status { font-size: 12px; opacity: 0.9; }
    #sqh_hint { font-size: 11px; opacity: 0.6; margin-top: 6px; }
  `;
  document.documentElement.appendChild(style);
  document.documentElement.appendChild(panel);

  panel.querySelector("#sqh_stop").addEventListener("click", () => {
    running = false;
    panel.querySelector("#sqh_status").textContent = "Parado";
    console.log("[SQH] Loop parado");
  });

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyX") {
      running = false;
      panel.querySelector("#sqh_status").textContent = "Parado";
      console.log("[SQH] Loop parado via teclado");
    }
  });

  // começa sozinho
  runLoop();
})();
