// ==== Gerenciamento de Fila ====

import CONFIG from "./config.js";
import {
  byAnyText,
  pickVisibleAny,
  safeClick,
  visible,
  wait,
  log,
} from "./utils.js";

const Queue = {
  openFirstQueueItem: () => {
    const links = document.querySelectorAll(CONFIG.SELECTORS.queueStartLinks);
    for (const link of links) {
      if (visible(link) && safeClick(link)) {
        log("Cliquei no primeiro item da fila");
        return true;
      }
    }
    return false;
  },

  tryStart: () => {
    const button = pickVisibleAny(CONFIG.SELECTORS.queueButtons);
    if (button && safeClick(button)) {
      log("Cliquei no botão de início/reinício da fila");
      return true;
    }

    if (Queue.openFirstQueueItem()) {
      return true;
    }

    const byTextButton = byAnyText(CONFIG.TEXTS.queueStart);
    if (byTextButton && visible(byTextButton) && safeClick(byTextButton)) {
      log("Cliquei por texto para iniciar/reiniciar a fila");
      return true;
    }

    return false;
  },

  clickNext: () => {
    const btn = pickVisibleAny(CONFIG.SELECTORS.nextButton);
    if (btn && safeClick(btn)) {
      log("Cliquei em: Próximo");
      return true;
    }

    const byTextButton = byAnyText(CONFIG.TEXTS.queueNext);
    if (byTextButton && visible(byTextButton) && safeClick(byTextButton)) {
      log("Cliquei em Próximo por fallback textual");
      return true;
    }

    return false;
  },

  isEmpty: () => {
    const empty = pickVisibleAny(CONFIG.SELECTORS.queueEmpty);
    if (empty) return true;

    const byText = byAnyText(CONFIG.TEXTS.queueEmpty);
    return !!(byText && visible(byText));
  },

  clickFinish: () => {
    const btn = pickVisibleAny(CONFIG.SELECTORS.finishQueue);
    if (btn && safeClick(btn)) {
      log("Cliquei em: Concluir lista");
      return true;
    }

    const byTextButton = byAnyText(CONFIG.TEXTS.queueFinish);
    if (byTextButton && visible(byTextButton) && safeClick(byTextButton)) {
      log("Cliquei em Concluir lista por fallback textual");
      return true;
    }

    return false;
  },

  advance: async () => {
    if (Queue.clickNext()) {
      await wait(CONFIG.TIMING.ACTION_DELAY);
      return true;
    }

    log("Falha ao avançar: nenhum botão de próximo encontrado", 1);
    return false;
  },
};

export default Queue;
