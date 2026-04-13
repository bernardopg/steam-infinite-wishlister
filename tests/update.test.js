import test from "node:test";
import assert from "node:assert/strict";
import { cleanupDom, setupDom, setupGM } from "./helpers/test-env.js";

test("UpdateChecker.check detecta versão mais nova e marca update disponível", async () => {
  const dom = setupDom("<html><body></body></html>");
  const store = setupGM();

  global.GM_xmlhttpRequest = ({ onload }) => {
    onload({
      status: 200,
      responseText: JSON.stringify({
        version: "2.5.0",
        updateUrl: "https://example.com/release",
      }),
    });
  };

  const { State } = await import("../src/state.js");
  const { default: UpdateChecker } = await import("../src/update.js");

  const ok = await UpdateChecker.check();

  assert.equal(ok, true);
  assert.equal(State.update.available, true);
  assert.equal(State.update.latestVersion, "2.5.0");
  assert.equal(store.get("wl_update_latest_version"), "2.5.0");

  cleanupDom(dom);
});
