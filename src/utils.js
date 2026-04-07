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

/**
 * Logger com níveis configuráveis
 * @param {string} msg - Mensagem para log
 * @param {number} level - Nível: 0=info (sempre visível), 1=debug, 2=verbose
 */
const log = (msg, level = 0) => {
  // Por padrão mostra tudo (pode ser controlado via configuração futura)
  const prefix = level === 1 ? "[DEBUG]" : level === 2 ? "[VERBOSE]" : "";
  console.log(`[Steam Wishlist]${prefix} ${msg}`);
};

export { wait, visible, pick, byText, log };
