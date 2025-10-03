// ==== Loop Principal ====

import CONFIG from "./config.js";
import State from "./state.js";
import Game from "./game.js";
import Wishlist from "./wishlist.js";
import Queue from "./queue.js";
import UI from "./ui.js";
import { wait, log } from "./utils.js";

const Loop = {
  start: async () => {
    if (State.running) return;

    State.running = true;
    UI.setRunning(true);
    UI.updateStatus("Iniciando...", "#66c0f4");
    log("Loop iniciado");

    Loop.run();
  },

  stop: () => {
    State.running = false;
    UI.setRunning(false);
    UI.updateStatus("Parado");
    log("Loop parado");
  },

  run: async () => {
    while (State.running) {
      await Loop.step();

      // Delay variável
      const jitter =
        CONFIG.TIMING.LOOP_MIN +
        Math.floor(Math.random() * (CONFIG.TIMING.LOOP_MAX - CONFIG.TIMING.LOOP_MIN + 1));
      await wait(jitter);
    }
  },

  step: async () => {
    if (State.processing) return;
    State.processing = true;

    try {
      // 1. Verificar se a fila está vazia
      if (Queue.isEmpty()) {
        UI.updateStatus("Fila vazia, reiniciando...", "#e4d00a");
        if (Queue.tryStart()) {
          await wait(CONFIG.TIMING.QUEUE_GEN_DELAY);
        }
        State.processing = false;
        return;
      }

      // 2. Tentar iniciar fila se necessário
      if (Queue.tryStart()) {
        await wait(CONFIG.TIMING.QUEUE_GEN_DELAY);
        State.processing = false;
        return;
      }

      // 3. Processar jogo atual
      const title = Game.getTitle();
      UI.updateStatus(`Verificando: ${title}`, "#66c0f4");

      const skipReason = Game.shouldSkip(State.settings);

      if (skipReason) {
        log(`Pulando: ${title} (${skipReason})`);
        UI.updateStatus(`Pulado: ${skipReason}`, "#aaa");
        UI.incrementSkipped();
      } else {
        // Adicionar à wishlist
        const added = await Wishlist.add();
        if (added) {
          log(`Adicionado: ${title}`);
          UI.updateStatus("Adicionado!", "#a1dd4a");
          UI.incrementWishlisted();
        }
      }

      // 4. Avançar para o próximo
      await Queue.advance();
    } catch (e) {
      log(`Erro no loop: ${e.message}`);
      UI.updateStatus(`Erro: ${e.message}`, "#ff7a7a");
    } finally {
      State.processing = false;
    }
  },
};

export default Loop;
