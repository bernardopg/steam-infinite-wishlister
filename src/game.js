// ==== Detecção de Jogos ====

import CONFIG from "./config.js";
import { pick, visible } from "./utils.js";

const Game = {
  hasCards: () => {
    const indicator = pick(CONFIG.SELECTORS.tradingCards);
    return indicator && visible(indicator);
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
