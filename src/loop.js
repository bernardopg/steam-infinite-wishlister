// ==== Loop Principal ====

import CONFIG from "./config.js";
import { State, saveStats } from "./state.js";
import Game from "./game.js";
import Wishlist from "./wishlist.js";
import Queue from "./queue.js";
import UI from "./ui.js";
import AgeSkip from "./ageSkip.js";
import { pickAny, randomBetween, wait, log } from "./utils.js";

const Loop = {
  start: () => {
    if (State.running) return;

    State.running = true;
    State.paused = false;
    UI.setLoopState("running");
    UI.updateStatus("Executando...", "#66c0f4");
    log("Loop iniciado");

    void Loop.run();
  },

  pause: () => {
    if (!State.running) return;

    State.running = false;
    State.paused = true;
    UI.setLoopState("paused");
    UI.updateStatus("Pausado", "#e4d00a");
    log("Loop pausado");
  },

  stop: () => {
    State.running = false;
    State.paused = false;
    UI.setLoopState("stopped");
    UI.updateStatus("Parado");
    log("Loop parado");
  },

  processOnce: async () => {
    if (State.running || State.processing) {
      return false;
    }

    UI.updateStatus("Processando item único...", "#66c0f4");
    const processed = await Loop.step({ manual: true });

    if (!State.running) {
      UI.setLoopState(State.paused ? "paused" : "stopped");
    }

    return processed;
  },

  skipCurrent: async () => {
    if (State.processing) {
      return false;
    }

    UI.updateStatus("Pulando item manualmente...", "#aaa");
    UI.incrementSkipped();
    saveStats();

    const advanced = await Queue.advance();
    UI.updateStatus(advanced ? "Item pulado" : "Falha ao pular", advanced ? "#aaa" : "#ff7a7a");
    return advanced;
  },

  run: async () => {
    while (State.running) {
      await Loop.step();

      if (!State.running) {
        break;
      }

      // Delay variável
      const jitter = randomBetween(CONFIG.TIMING.LOOP_MIN, CONFIG.TIMING.LOOP_MAX);
      await wait(jitter);
    }
  },

  ensureQueueContext: async () => {
    if (Queue.openFirstQueueItem()) {
      await wait(CONFIG.TIMING.QUEUE_GEN_DELAY * 2);
      return true;
    }

    if (Queue.tryStart()) {
      await wait(CONFIG.TIMING.QUEUE_GEN_DELAY);
      return true;
    }

    return false;
  },

  step: async ({ manual = false } = {}) => {
    if (State.processing) return;
    State.processing = true;

    try {
      // 0. Verificar e bypass age gate (deve ocorrer antes da heurística de contexto)
      if (State.settings.ageSkip && AgeSkip.isActive()) {
        log("Age gate detectado, tentando bypass...");
        UI.updateStatus("Bypass age gate...", "#e4d00a");
        const bypassed = await AgeSkip.bypass();
        if (bypassed) {
          await AgeSkip.waitForDismiss();
          log("Age gate bypass com sucesso");
        } else {
          log("Falha no age gate bypass, pulando jogo", 1);
          UI.updateStatus("Age gate falhou, pulando", "#ff7a7a");
          UI.incrementSkipped();
          saveStats();
          await Queue.advance();
        }
        return true;
      }

      if (!State.settings.ageSkip && AgeSkip.isActive()) {
        UI.updateStatus("Age gate ativo. Habilite Age Skip ou confirme manualmente.", "#ff7a7a");
        return false;
      }

      // 1. Verificar se estamos em página com item de jogo ativo da fila
      if (!pickAny(CONFIG.SELECTORS.title)) {
        log("Sem jogo ativo detectado; tentando abrir/gerar fila...", 1);
        UI.updateStatus("Iniciando fila...", "#e4d00a");

        const started = await Loop.ensureQueueContext();
        if (!started && !manual && State.running) {
          UI.updateStatus("Abra /explore e clique em iniciar", "#ff7a7a");
          Loop.pause();
        }
        return false;
      }

      // 2. Verificar se a fila está vazia
      if (Queue.isEmpty()) {
        if (!State.settings.autoRestart) {
          UI.updateStatus("Fila vazia (auto-restart desativado)", "#e4d00a");
          if (!manual && State.running) {
            Loop.pause();
          }
          return false;
        }

        if (Queue.clickFinish()) {
          UI.updateStatus("Concluindo lista...", "#a1dd4a");
          await wait(CONFIG.TIMING.QUEUE_GEN_DELAY);
        }

        UI.updateStatus("Fila vazia, reiniciando...", "#e4d00a");
        if (Queue.tryStart()) {
          await wait(CONFIG.TIMING.QUEUE_GEN_DELAY);
          return false;
        }

        UI.updateStatus("Falha ao reiniciar fila", "#ff7a7a");
        return false;
      }

      // 3. Processar jogo atual
      const title = Game.getTitle();
      UI.updateStatus(`Verificando: ${title}`, "#66c0f4");

      const skipReason = Game.shouldSkip(State.settings);

      if (skipReason) {
        log(`Pulando: ${title} (${skipReason})`);
        UI.updateStatus(`Pulado: ${skipReason}`, "#aaa");
        UI.incrementSkipped();
        saveStats();
      } else {
        // 3. Adicionar à wishlist com confirmação
        const added = await Wishlist.add();
        if (added) {
          log(`Adicionado: ${title}`);
          UI.updateStatus("Adicionado!", "#a1dd4a");
          UI.incrementWishlisted();
          saveStats();
        } else {
          log(`Falha ao adicionar ${title} à wishlist`, 1);
          UI.updateStatus("Falha ao adicionar", "#ff7a7a");
        }
      }

      // 4. Avançar para o próximo
      await Queue.advance();
      return true;
    } catch (e) {
      log(`Erro no loop: ${e.message}`);
      UI.updateStatus(`Erro: ${e.message}`, "#ff7a7a");
      return false;
    } finally {
      State.processing = false;
    }
  },
};

export default Loop;
