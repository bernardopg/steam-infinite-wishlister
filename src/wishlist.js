// ==== Gerenciamento de Wishlist ====

import CONFIG from "./config.js";
import { pick, visible, wait, log } from "./utils.js";

const Wishlist = {
  /**
   * Verifica se o jogo já está na wishlist
   * Verifica múltiplos sinais: área de sucesso, botão ativo, ou botão de adicionar ausente
   * @returns {boolean}
   */
  isAlreadyAdded: () => {
    // Verifica se a área de sucesso existe (ID muda após adicionar)
    const successArea = document.querySelector("#add_to_wishlist_area_success");
    if (successArea && visible(successArea)) return true;

    // Verifica se existe botão ativo na área original
    const area = document.querySelector("#add_to_wishlist_area");
    if (area) {
      const btn = area.querySelector(".add_to_wishlist");
      // Se o botão existe mas tem classe de ativo, já foi adicionado
      if (btn && (btn.classList.contains("queue_btn_active") || btn.classList.contains("btn_wishlist_active"))) {
        return true;
      }
      // Se o botão de adicionar não existe mas a área existe, pode ter sido convertido
      if (!btn) {
        const success = area.querySelector(".add_to_wishlist_area_success");
        if (success && visible(success)) return true;
      }
    }

    // Fallback: verifica botão genérico ativo
    const activeBtn = document.querySelector(".queue_btn_active, .btn_wishlist_active");
    return activeBtn && visible(activeBtn);
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
