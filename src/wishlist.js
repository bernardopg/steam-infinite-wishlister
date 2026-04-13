// ==== Gerenciamento de Wishlist ====

import CONFIG from "./config.js";
import {
  byAnyText,
  normalizeText,
  pickAny,
  pickVisibleAny,
  safeClick,
  visible,
  wait,
  log,
} from "./utils.js";

const findWishlistButton = (area) => {
  if (area) {
    for (const selector of CONFIG.SELECTORS.wishlistButton) {
      const button = area.querySelector(selector);
      if (button) return button;
    }
  }
  return pickAny(CONFIG.SELECTORS.wishlistButton);
};

const Wishlist = {
  /**
   * Verifica se o jogo já está na wishlist
   * Verifica múltiplos sinais: área de sucesso, botão ativo, ou botão de adicionar ausente
   * @returns {boolean}
   */
  isAlreadyAdded: () => {
    const successArea = pickVisibleAny(CONFIG.SELECTORS.wishlistSuccess);
    if (successArea && visible(successArea)) return true;

    const area = pickAny(CONFIG.SELECTORS.wishlistArea);
    if (area) {
      const btn = findWishlistButton(area);
      if (
        btn &&
        (btn.classList.contains("queue_btn_active") ||
          btn.classList.contains("btn_wishlist_active") ||
          btn.getAttribute("aria-pressed") === "true")
      ) {
        return true;
      }

      if (!btn) {
        const success = area.querySelector("#add_to_wishlist_area_success");
        if (success && visible(success)) return true;
      }

      const btnText = normalizeText(btn?.textContent);
      if (
        btnText &&
        CONFIG.TEXTS.wishlistAdded.some((value) =>
          btnText.includes(normalizeText(value)),
        )
      ) {
        return true;
      }
    }

    const activeBtn = pickVisibleAny(CONFIG.SELECTORS.wishlistSuccess);
    if (activeBtn) return true;

    const byText = byAnyText(CONFIG.TEXTS.wishlistAdded);
    if (byText && visible(byText)) return true;

    return false;
  },

  /**
   * Aguarda confirmação visual de que o item foi adicionado à wishlist
   * Usa polling para verificar mudança de estado
   * @param {number} maxWait - Tempo máximo de espera em ms
   * @returns {Promise<boolean>} true se confirmado
   */
  waitForConfirmation: async (maxWait = 3000) => {
    const start = Date.now();
    const pollInterval = 200;

    while (Date.now() - start < maxWait) {
      if (Wishlist.isAlreadyAdded()) {
        return true;
      }
      await wait(pollInterval);
    }

    return false;
  },

  /**
   * Tenta adicionar o jogo à wishlist com confirmação e retry
   * @param {number} maxRetries - Número máximo de tentativas
   * @returns {Promise<boolean>} true se adicionado com sucesso
   */
  add: async (maxRetries = 2) => {
    if (Wishlist.isAlreadyAdded()) {
      log("Já está na wishlist");
      return true;
    }

    // Tenta adicionar com retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const area = pickAny(CONFIG.SELECTORS.wishlistArea);
        if (!area) {
          log("Área de wishlist não encontrada", 1);
          return false;
        }

        const btn = findWishlistButton(area);
        if (!btn || !visible(btn)) {
          log("Botão de wishlist não encontrado", 1);
          return false;
        }

        if (attempt > 1) {
          log(`Tentativa ${attempt}/${maxRetries} para adicionar à wishlist`);
          await wait(CONFIG.TIMING.ACTION_DELAY);
        }

        if (!safeClick(btn)) {
          log(`Falha de clique na tentativa ${attempt}`, 1);
          continue;
        }

        // Aguarda confirmação visual
        const confirmed = await Wishlist.waitForConfirmation();

        if (confirmed) {
          log(`Adicionado à wishlist com sucesso (tentativa ${attempt})`);
          return true;
        }

        log(`Confirmação falhou na tentativa ${attempt}`, 1);
      } catch (e) {
        log(`Erro na tentativa ${attempt}: ${e.message}`, 1);
      }
    }

    log(`Falha ao adicionar à wishlist após ${maxRetries} tentativas`, 1);
    return false;
  },
};

export default Wishlist;
