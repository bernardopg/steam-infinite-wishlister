// ==== Utilitários Básicos ====

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const visible = (el) => !!(el && el.offsetParent !== null);

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    return [value];
  }
  return [];
};

const pick = (sel) =>
  sel?.startsWith("/")
    ? document.evaluate(
        sel,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue
    : document.querySelector(sel);

const pickAny = (selectors) => {
  for (const selector of toArray(selectors)) {
    const element = pick(selector);
    if (element) {
      return element;
    }
  }
  return null;
};

const pickVisibleAny = (selectors) => {
  for (const selector of toArray(selectors)) {
    const element = pick(selector);
    if (visible(element)) {
      return element;
    }
  }
  return null;
};

const normalizeText = (value) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const byText = (txt, root = document) => {
  const nodes = root.querySelectorAll("span, a, button, div");
  const target = normalizeText(txt);
  return Array.from(nodes).find((el) =>
    normalizeText(el.textContent).includes(target),
  );
};

const byAnyText = (texts, root = document) => {
  for (const text of toArray(texts)) {
    const element = byText(text, root);
    if (element) {
      return element;
    }
  }
  return null;
};

const compareVersions = (current, target) => {
  const left = String(current || "0")
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
  const right = String(target || "0")
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);

  const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i++) {
    const a = left[i] || 0;
    const b = right[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
};

const randomBetween = (min, max) =>
  min + Math.floor(Math.random() * (max - min + 1));

const safeClick = (el) => {
  if (!el) return false;
  try {
    el.click();
    return true;
  } catch {
    return false;
  }
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

export {
  wait,
  visible,
  pick,
  pickAny,
  pickVisibleAny,
  byText,
  byAnyText,
  normalizeText,
  compareVersions,
  randomBetween,
  safeClick,
  log,
};
