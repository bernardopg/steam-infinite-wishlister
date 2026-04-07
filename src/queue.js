// ==== Gerenciamento de Fila ====

import CONFIG from "./config.js";
import { pick, visible, byText, wait, log } from "./utils.js";

const Queue = {
  tryStart: () => {
    // Tenta botões específicos
    for (const selector of CONFIG.SELECTORS.queueButtons) {
      const btn = pick(selector);
      if (btn && visible(btn)) {
        btn.click();
        log(`Cliquei em: ${selector}`);
        return true;
      }
    }

    // Tenta busca por texto
    const textTargets = ["Iniciar outra lista", "Clique aqui para começar"];
    for (const txt of textTargets) {
      const el = byText(txt);
      if (el && visible(el)) {
        el.click();
        log(`Cliquei em: "${txt}"`);
        return true;
      }
    }

    return false;
  },

  clickNext: () => {
    const btn = pick(CONFIG.SELECTORS.nextButton);
    if (btn && visible(btn)) {
      btn.click();
      log("Cliquei em: Próximo");
      return true;
    }
    return false;
  },

  isEmpty: () => {
    const empty = pick(CONFIG.SELECTORS.queueEmpty);
    return empty && visible(empty);
  },

  clickFinish: () => {
    const btn = pick(CONFIG.SELECTORS.finishQueue);
    if (btn && visible(btn)) {
      btn.click();
      log("Cliquei em: Concluir lista");
      return true;
    }
    return false;
  },

  advance: async () => {
    if (Queue.clickNext()) {
      await wait(CONFIG.TIMING.ACTION_DELAY);
      return true;
    }
    // If clickNext failed, try finding and clicking by text
    const textBtns = ["Próximo da lista", "Próximo", "Next"];
    for (const txt of textBtns) {
      const el = byText(txt);
      if (el && visible(el)) {
        el.click();
        log(`Cliquei em botão por texto: "${txt}"`);
        await wait(CONFIG.TIMING.ACTION_DELAY);
        return true;
      }
    }
    log("Falha ao avançar: nenhum botão de próximo encontrado", 1);
    return false;
  },
};

export default Queue;
