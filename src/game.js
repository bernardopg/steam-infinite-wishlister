// ==== Detecção de Jogos ====

import CONFIG from "./config.js";
import { pick, visible } from "./utils.js";

const Game = {
  hasCards: () => {
    // 1. Seletor principal (páginas normais e fila)
    const indicator = pick(CONFIG.SELECTORS.tradingCards);
    if (indicator) {
      log("Cartas detectadas pelo seletor principal", 1);
      return true;
    }

    // 2. Verifica pelo texto "Cartas Colecionáveis Steam" no label
    const cardLabels = Array.from(document.querySelectorAll('.game_area_details_specs_ctn .label, .queue_item_text .label'));
    const hasCardLabel = cardLabels.some(el =>
      el.textContent.includes('Cartas') || el.textContent.includes('Cards')
    );
    if (hasCardLabel) {
      log("Cartas detectadas pelo texto do label", 1);
      return true;
    }

    // 3. Verifica pelo ícone das cartas
    const cardIcons = document.querySelectorAll('.category_icon[src*="ico_cards"]');
    if (cardIcons.length > 0) {
      log("Cartas detectadas pelo ícone", 1);
      return true;
    }

    // 4. Verifica links com href contendo category2=29
    const cardLinks = document.querySelectorAll('a[href*="category2=29"]');
    if (cardLinks.length > 0) {
      log("Cartas detectadas pelo link category2=29", 1);
      return true;
    }

    // Debug: mostrar exatamente o que foi encontrado
    log("Sem cartas detectadas. Verificando o que existe na página:", 1);

    // Debug: mostrar todos os links com category2
    const allCat2Links = document.querySelectorAll('a[href*="category2"]');
    log("  - Total links com category2: " + allCat2Links.length, 1);
    allCat2Links.forEach((link, i) => {
      log(`    [${i}] href="${link.getAttribute('href')}" text="${link.textContent.trim().substring(0, 50)}"`, 1);
    });

    // Debug: verificar game_area_details_specs_ctn
    const specsCtns = document.querySelectorAll('.game_area_details_specs_ctn');
    log("  - game_area_details_specs_ctn: " + specsCtns.length, 1);
    specsCtns.forEach((ctn, i) => {
      log(`    [${i}] href="${ctn.getAttribute('href')}" text="${ctn.textContent.trim().substring(0, 50)}"`, 1);
    });

    // Debug: verificar category_icons
    const icons = document.querySelectorAll('.category_icon');
    log("  - category_icon: " + icons.length, 1);
    icons.forEach((icon, i) => {
      log(`    [${i}] src="${icon.getAttribute('src')}"`, 1);
    });

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
