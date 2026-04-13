import test from "node:test";
import assert from "node:assert/strict";
import { cleanupDom, setupDom, setupGM } from "./helpers/test-env.js";

test("Game.hasCards detecta cards por category2=29", async () => {
  const dom = setupDom(`
    <html><body>
      <h1 class="apphub_AppName">Game A</h1>
      <a href="https://store.steampowered.com/search/?category2=29">Trading Cards</a>
    </body></html>
  `);
  setupGM();

  const { default: Game } = await import("../src/game.js");
  assert.equal(Game.hasCards(), true);

  cleanupDom(dom);
});

test("Game.shouldSkip identifica non-game por seletor demo", async () => {
  const dom = setupDom(`
    <html><body>
      <h1 class="apphub_AppName">Demo XYZ</h1>
      <div class="demo_above_purchase">Download Demo</div>
    </body></html>
  `);
  setupGM();

  const { default: Game } = await import("../src/game.js");
  const reason = Game.shouldSkip({
    skipOwned: false,
    skipNonGames: true,
    requireCards: false,
  });

  assert.equal(reason, "Não-jogo (Demo)");

  cleanupDom(dom);
});

test("Game.shouldSkip retorna sem cartas quando filtro está ativo", async () => {
  const dom = setupDom(`
    <html><body>
      <h1 class="apphub_AppName">Game B</h1>
      <div class="game_area_details_specs_ctn"><span class="label">Single-player</span></div>
    </body></html>
  `);
  setupGM();

  const { default: Game } = await import("../src/game.js");
  const reason = Game.shouldSkip({
    skipOwned: false,
    skipNonGames: false,
    requireCards: true,
  });

  assert.equal(reason, "Sem cartas");

  cleanupDom(dom);
});
