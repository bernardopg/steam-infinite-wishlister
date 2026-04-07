// ==== Age Gate Bypass ====

import CONFIG from "./config.js";
import { pick, visible, wait, log } from "./utils.js";

const AgeSkip = {
  /**
   * Verifica se há um age gate visível na página
   * @returns {boolean}
   */
  isActive: () => {
    const ageGate = pick(CONFIG.SELECTORS.ageGate);
    return ageGate && visible(ageGate);
  },

  /**
   * Tenta preencher o ano de nascimento e confirmar para pular o age gate
   * Define o ano para 1990 (usuário com 35+ anos)
   * @returns {Promise<boolean>} true se conseguiu bypass
   */
  bypass: async () => {
    if (!AgeSkip.isActive()) {
      return false;
    }

    log("Age gate detectado, tentando bypass...");

    // Tenta encontrar o campo de ano
    const yearInput = pick(CONFIG.SELECTORS.ageConfirm);

    if (yearInput) {
      // Preenche o campo de ano com 1990
      yearInput.focus();
      yearInput.value = "1990";
      yearInput.dispatchEvent(new Event("input", { bubbles: true }));
      yearInput.dispatchEvent(new Event("change", { bubbles: true }));
      await wait(200);
    }

    // Tenta encontrar e clicar no botão de confirmação
    const confirmBtn = pick(CONFIG.SELECTORS.ageConfirmBtn);

    if (confirmBtn && visible(confirmBtn)) {
      confirmBtn.click();
      log("Age gate bypass - clique no botão de confirmação");
      await wait(800);
      return true;
    }

    // Fallback: tenta submeter o formulário diretamente
    const form = document.querySelector("form");
    if (form) {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      log("Age gate bypass - submit do formulário");
      await wait(800);
      return true;
    }

    log("Não foi possível fazer bypass do age gate", 1);
    return false;
  },

  /**
   * Aguarda o age gate desaparecer após o bypass
   * @param {number} timeout - Tempo máximo de espera em ms
   * @returns {Promise<boolean>}
   */
  waitForDismiss: async (timeout = 3000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (!AgeSkip.isActive()) {
        return true;
      }
      await wait(100);
    }
    log("Age gate não desapareceu após bypass", 1);
    return false;
  },
};

export default AgeSkip;