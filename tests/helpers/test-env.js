import { JSDOM } from "jsdom";

export function setupDom(
  html = "<html><body></body></html>",
  url = "https://store.steampowered.com/app/10/?queue=1"
) {
  const dom = new JSDOM(html, { url });
  Object.defineProperty(dom.window.HTMLElement.prototype, "offsetParent", {
    configurable: true,
    get() {
      return this.hasAttribute("data-hidden") ? null : this.ownerDocument.body;
    },
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.Event = dom.window.Event;
  global.HTMLElement = dom.window.HTMLElement;
  global.XPathResult = dom.window.XPathResult;
  return dom;
}

export function setupGM(initial = {}) {
  const store = new Map(Object.entries(initial));

  global.GM_getValue = (key, fallback) =>
    store.has(key) ? store.get(key) : fallback;

  global.GM_setValue = (key, value) => {
    store.set(key, value);
    return value;
  };

  global.GM_registerMenuCommand = () => {};
  global.GM_addStyle = () => {};
  global.GM_xmlhttpRequest = () => {};

  return store;
}

export function cleanupDom(dom) {
  if (dom?.window) {
    dom.window.close();
  }

  delete global.window;
  delete global.document;
  delete global.Event;
  delete global.HTMLElement;
  delete global.XPathResult;
}
