// ==== Utilitários Básicos ====

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

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

const byText = (txt, root = document) => {
  const nodes = root.querySelectorAll("span, a, button, div");
  return Array.from(nodes).find((el) =>
    (el.textContent || "").replace(/\s+/g, " ").trim().includes(txt)
  );
};

const log = (msg, level = 0) => {
  console.log(`[Steam Wishlist] ${msg}`);
};

export { wait, visible, pick, byText, log };
