// ==== Detecção de Jogos ====

import CONFIG from "./config.js";
import { pick, visible } from "./utils.js";

const Game = {
  hasCards: () => {
    // 1. Seletor principal (páginas normais e fila)
    const indicator = pick(CONFIG.SELECTORS.tradingCards);
    if (indicator) return true;

    // 2. Verifica pelo texto "Cartas Colecionáveis Steam" no label
    const cardLabels = Array.from(document.querySelectorAll('.game_area_details_specs_ctn .label, .queue_item_text .label'));
    const hasCardLabel = cardLabels.some(el =>
      el.textContent.includes('Cartas') || el.textContent.includes('Cards')
    );
    if (hasCardLabel) return true;

    // 3. Verifica pelo ícone das cartas
    const cardIcons = document.querySelectorAll('.category_icon[src*="ico_cards"]');
    if (cardIcons.length > 0) return true;

    // 4. Verifica links com href contendo category2=29
    const cardLinks = document.querySelectorAll('a[href*="category2=29"]');
    if (cardLinks.length > 0) return true;

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
