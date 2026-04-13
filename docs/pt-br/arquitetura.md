# Arquitetura

## Visão Geral

O projeto usa módulos ES no diretório `src/` e gera um único `.user.js` para execução no Tampermonkey.

A fonte da verdade é `src/`; os arquivos gerados são artefatos de build.

## Módulos de Runtime

| Módulo | Responsabilidade |
|---|---|
| `config.js` | Versão, timing, seletores, chaves de storage e textos |
| `state.js` | Estado global de execução e inicialização de configurações |
| `utils.js` | Helpers de DOM, normalização textual, comparação de versão e log |
| `game.js` | Detecção de cartas/owned/non-game e motivo de skip |
| `wishlist.js` | Adição à wishlist com polling de confirmação e retry |
| `queue.js` | Start/restart/advance/empty/finish da fila |
| `ageSkip.js` | Detecção e bypass de age gate |
| `ui.js` | Painel flutuante, contadores, controles e indicador de update |
| `loop.js` | Orquestração start/pause/stop/process-once/skip-item |
| `update.js` | Verificação de versão em `version.json` com cooldown |
| `main.js` | Metadata userscript, init, menu e atalhos |

## Pipeline de Build

`scripts/build-userscript.mjs`:

1. Lê módulos em ordem fixa.
2. Extrai metadata userscript de `src/main.js`.
3. Remove linhas `import`/`export`.
4. Concatena em `SteamInfiniteWishlister.user.js`.
5. Copia para `steam-infinite-wishlister.js`.

## Modelo de Estado

`State` mantém:

- Loop: `running`, `paused`, `processing`
- Settings: `autoStart`, `autoRestart`, `requireCards`, `skipOwned`, `skipNonGames`, `ageSkip`
- Contadores: `wishlisted`, `skipped`
- Update: `available`, `latestVersion`, `url`
- Referências de UI

## Ordem de Execução (`Loop.step`)

1. Age gate (quando habilitado).
2. Garantia de contexto de fila.
3. Detecção de fila vazia (com auto-restart opcional).
4. Avaliação de filtros.
5. Wishlist ou skip.
6. Avanço para próximo item.

## Escopo de `Skip Non-Games`

Inclui:

- DLC
- Demo
- Trilha sonora
- Vídeo
- Software/Ferramenta

Estratégia: seletores como fonte primária, com fallback textual em regiões conhecidas da página.

## Design do Update Checker

- Origem: `version.json` do repositório.
- Cooldown: 24h (`UPDATE_CHECK_COOLDOWN_MS`).
- Cache: última versão conhecida salva no storage do Tampermonkey.
- UI: linha de versão destacada quando há update.

## Estratégia de Testes

Smoke tests automatizados em `tests/*.test.js` cobrem:

- Detecção de cards e non-game
- Fallback de start/next da fila
- Pausa com fila vazia e auto-restart desligado
- Caminho de `processOnce`
- Comportamento do update checker

---

[Voltar para Docs](../README.md) | [Contribuição](contribuicao.md)
