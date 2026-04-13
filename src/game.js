// ==== Detecção de Jogos ====

import CONFIG from "./config.js";
import {
  byAnyText,
  normalizeText,
  pickAny,
  pickVisibleAny,
  visible,
} from "./utils.js";

const NON_GAME_MARKERS = [
  {
    type: "DLC",
    terms: ["dlc", "downloadable content", "conteudo para download"],
  },
  {
    type: "Demo",
    terms: ["demo", "demonstracao", "demonstration"],
  },
  {
    type: "Soundtrack",
    terms: ["soundtrack", "trilha sonora"],
  },
];

const hasAnyTerm = (text, terms) => terms.some((term) => text.includes(term));

const Game = {
  hasCards: () => {
    if (pickAny(CONFIG.SELECTORS.tradingCards)) return true;

    const labels = Array.from(
      document.querySelectorAll(".game_area_details_specs_ctn .label"),
    );
    const hasLabel = labels.some((el) => {
      const text = normalizeText(el.textContent);
      return text.includes("trading cards") || text.includes("cartas");
    });
    if (hasLabel) return true;

    return false;
  },

  isOwned: () => {
    const indicator = pickVisibleAny(CONFIG.SELECTORS.owned);
    if (indicator && visible(indicator)) return true;

    const maybeOwned = byAnyText([
      "In library",
      "Already in your Steam library",
      "Ja esta na sua biblioteca",
      "Já está na sua biblioteca",
    ]);

    return !!(maybeOwned && visible(maybeOwned));
  },

  detectNonGameType: () => {
    if (pickVisibleAny(CONFIG.SELECTORS.nonGameDlc)) return "DLC";
    if (pickVisibleAny(CONFIG.SELECTORS.nonGameDemo)) return "Demo";
    if (pickVisibleAny(CONFIG.SELECTORS.nonGameSoundtrack)) return "Soundtrack";
    if (pickVisibleAny(CONFIG.SELECTORS.nonGameVideo)) return "Video";
    if (pickVisibleAny(CONFIG.SELECTORS.nonGameSoftware)) return "Software";

    const typeSources = [
      ".breadcrumbs",
      "#genresAndManufacturer",
      ".game_description_snippet",
      ".game_page_autocollapse_ctn",
      ".game_area_purchase_game",
    ];
    const sample = normalizeText(
      typeSources
        .map((selector) => document.querySelector(selector)?.textContent || "")
        .join(" "),
    );

    for (const marker of NON_GAME_MARKERS) {
      if (hasAnyTerm(sample, marker.terms)) {
        return marker.type;
      }
    }

    return null;
  },

  getTitle: () => {
    const title = pickAny(CONFIG.SELECTORS.title);
    return title?.textContent?.trim() || "Jogo Atual";
  },

  shouldSkip: (settings) => {
    if (settings.skipOwned && Game.isOwned()) {
      return "Já possui";
    }

    if (settings.skipNonGames) {
      const type = Game.detectNonGameType();
      if (type) {
        return `Não-jogo (${type})`;
      }
    }

    if (settings.requireCards && !Game.hasCards()) {
      return "Sem cartas";
    }

    return null;
  },
};

export default Game;
