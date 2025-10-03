// ==== Gerenciamento de Wishlist ====

import CONFIG from "./config.js";
import { pick, visible, wait, log } from "./utils.js";

const Wishlist = {
  isAlreadyAdded: () => {
    const area = pick(CONFIG.SELECTORS.wishlistArea);
    if (!area) return false;

    const success = area.querySelector(CONFIG.SELECTORS.wishlistSuccess);
    return (success && visible(success)) || area.classList.contains("queue_btn_active");
  },

  add: async () => {
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

    btn.click();
    log("Adicionado à wishlist");
    await wait(CONFIG.TIMING.ACTION_DELAY);
    return true;
  },
};

export default Wishlist;
