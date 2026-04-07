// ==== Detecção de Jogos ====

import CONFIG from "./config.js";
import { pick, visible } from "./utils.js";

const Game = {
  hasCards: () => {
    // 1. Seletor por texto em labels
    const cardLabels = Array.from(document.querySelectorAll('.game_area_details_specs_ctn .label'));
    if (cardLabels.some(el => el.textContent.includes('Cartas'))) return true;

    // 2. Seletor por ícone
    if (document.querySelector('.category_icon[src*="ico_cards"]')) return true;

    // 3. Seletor por link
    if (document.querySelector('a[href*="category2=29"]')) return true;

    return false;
  },

  isOwned: () => {
    const indicator = pick(CONFIG.SELECTORS.owned);
    return indicator && visible(indicator);
  },

  isDLC: () => {
    const indicator = pick(CONFIG.SELECTORS.dlc);
    return indicator && visible(indicator);
  },

  getTitle: () => {
    const title = pick(CONFIG.SELECTORS.title);
    return title?.textContent?.trim() || "Jogo Atual";
  },

  shouldSkip: (settings) => {
    if (settings.skipOwned && Game.isOwned()) {
      return "Já possui";
    }

    if (settings.skipDLC && Game.isDLC()) {
      return "É DLC";
    }

    if (settings.requireCards && !Game.hasCards()) {
      return "Sem cartas";
    }

    return null;
  },
};

export default Game;
