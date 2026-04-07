// ==== Gerenciamento de Wishlist ====

import CONFIG from "./config.js";
import { pick, visible, wait, log } from "./utils.js";

const Wishlist = {
  /**
   * Verifica se o jogo já está na wishlist
   * @returns {boolean}
   */
  isAlreadyAdded: () => {
    const area = pick(CONFIG.SELECTORS.wishlistArea);
    if (!area) return false;

    const success = area.querySelector(CONFIG.SELECTORS.wishlistSuccess);
    return (success && visible(success)) || area.classList.contains("queue_btn_active");
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
    const area = pick(CONFIG.SELECTORS.wishlistArea);
    if (!area) {
      log("Área de wishlist não encontrada");
      return false;
    }

    if (Wishlist.isAlreadyAdded()) {
      log("Já está na wishlist");
      return true;
    }

    const btn = area.querySelector(CONFIG.SELECTORS.wishlistButton);
    if (!btn || !visible(btn)) {
      log("Botão de wishlist não encontrado");
      return false;
    }

    // Tenta adicionar com retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          log(`Tentativa ${attempt}/${maxRetries} para adicionar à wishlist`);
          await wait(CONFIG.TIMING.ACTION_DELAY);
        }

        btn.click();

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
