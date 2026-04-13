import test from "node:test";
import assert from "node:assert/strict";
import { cleanupDom, setupDom, setupGM } from "./helpers/test-env.js";

test("Queue.tryStart clica no botão de início da fila", async () => {
  const dom = setupDom(`
    <html><body>
      <a id="discovery_queue_start_link">Start</a>
    </body></html>
  `);
  setupGM();

  const { default: Queue } = await import("../src/queue.js");

  let clicked = false;
  document
    .querySelector("#discovery_queue_start_link")
    .addEventListener("click", () => {
      clicked = true;
    });

  const started = Queue.tryStart();
  assert.equal(started, true);
  assert.equal(clicked, true);

  cleanupDom(dom);
});

test("Queue.advance usa fallback textual para avançar", async () => {
  const dom = setupDom(`
    <html><body>
      <button>Next</button>
    </body></html>
  `);
  setupGM();

  const { default: CONFIG } = await import("../src/config.js");
  const { default: Queue } = await import("../src/queue.js");

  CONFIG.TIMING.ACTION_DELAY = 1;

  let clicked = false;
  document.querySelector("button").addEventListener("click", () => {
    clicked = true;
  });

  const advanced = await Queue.advance();
  assert.equal(advanced, true);
  assert.equal(clicked, true);

  cleanupDom(dom);
});
