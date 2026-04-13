import test from "node:test";
import assert from "node:assert/strict";
import { cleanupDom, setupDom, setupGM } from "./helpers/test-env.js";

test("Loop.step pausa quando fila está vazia e auto-restart desligado", async () => {
  const dom = setupDom(`
    <html><body>
      <h1 class="apphub_AppName">Game C</h1>
      <span id="refresh_queue_btn">Iniciar outra lista</span>
    </body></html>
  `);
  setupGM();

  const { State } = await import("../src/state.js");
  const { default: Loop } = await import("../src/loop.js");

  State.running = true;
  State.paused = false;
  State.processing = false;
  State.settings.autoRestart = false;
  State.settings.ageSkip = true;

  await Loop.step();

  assert.equal(State.running, false);
  assert.equal(State.paused, true);

  cleanupDom(dom);
});

test("Loop.processOnce processa item, adiciona wishlist e avança", async () => {
  const dom = setupDom(`
    <html><body>
      <h1 class="apphub_AppName">Game D</h1>
      <div id="add_to_wishlist_area">
        <a class="add_to_wishlist">+ Lista de desejos</a>
      </div>
      <button class="btn_next_in_queue_trigger">Próximo da lista</button>
    </body></html>
  `);
  setupGM();

  const { default: CONFIG } = await import("../src/config.js");
  const { State } = await import("../src/state.js");
  const { default: Loop } = await import("../src/loop.js");

  CONFIG.TIMING.ACTION_DELAY = 1;

  State.running = false;
  State.paused = false;
  State.processing = false;
  State.stats.wishlisted = 0;
  State.stats.skipped = 0;
  State.settings.autoRestart = true;
  State.settings.requireCards = false;
  State.settings.skipOwned = false;
  State.settings.skipNonGames = false;
  State.settings.ageSkip = true;

  let nextClicked = false;
  document
    .querySelector(".btn_next_in_queue_trigger")
    .addEventListener("click", () => {
      nextClicked = true;
    });

  const area = document.querySelector("#add_to_wishlist_area");
  const wishlistButton = document.querySelector(".add_to_wishlist");
  wishlistButton.addEventListener("click", () => {
    area.id = "add_to_wishlist_area_success";
    wishlistButton.classList.add("queue_btn_active");
  });

  const processed = await Loop.processOnce();

  assert.equal(processed, true);
  assert.equal(State.stats.wishlisted, 1);
  assert.equal(nextClicked, true);

  cleanupDom(dom);
});
