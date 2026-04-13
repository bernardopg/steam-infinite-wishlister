// ==== Age Gate Bypass ====

import CONFIG from "./config.js";
import {
  byAnyText,
  pickAny,
  pickVisibleAny,
  safeClick,
  visible,
  wait,
  log,
} from "./utils.js";

const setFieldValue = (field, value) => {
  if (!field) return;
  field.focus();
  field.value = String(value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
};

const AgeSkip = {
  /**
   * Verifica se há um age gate visível na página
   * @returns {boolean}
   */
  isActive: () => {
    const ageGate = pickVisibleAny(CONFIG.SELECTORS.ageGate);
    if (ageGate && visible(ageGate)) return true;

    return window.location.pathname.includes("/agecheck");
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

    const yearInput = pickAny(CONFIG.SELECTORS.ageConfirmYear);
    const monthInput = pickAny(CONFIG.SELECTORS.ageConfirmMonth);
    const dayInput = pickAny(CONFIG.SELECTORS.ageConfirmDay);

    if (yearInput) {
      setFieldValue(yearInput, "1990");
    }
    if (monthInput) setFieldValue(monthInput, "1");
    if (dayInput) setFieldValue(dayInput, "1");

    await wait(200);

    const confirmBtn = pickVisibleAny(CONFIG.SELECTORS.ageConfirmBtn);
    if (confirmBtn && safeClick(confirmBtn)) {
      log("Age gate bypass - clique no botão de confirmação");
      await wait(800);
      return true;
    }

    const textButton = byAnyText([
      "Ver página",
      "View Page",
      "Continue",
      "Entrar",
      "Acessar",
    ]);
    if (textButton && visible(textButton) && safeClick(textButton)) {
      log("Age gate bypass - fallback textual");
      await wait(800);
      return true;
    }

    const form =
      yearInput?.form ||
      document.querySelector("form[action*='agecheck']") ||
      document.querySelector("form");

    if (form) {
      if (typeof form.submit === "function") {
        form.submit();
      } else {
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
      }
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
    const initialPath = window.location.pathname;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const pathChanged = window.location.pathname !== initialPath;
      if (!AgeSkip.isActive() || pathChanged) {
        return true;
      }
      await wait(100);
    }
    log("Age gate não desapareceu após bypass", 1);
    return false;
  },
};

export default AgeSkip;
