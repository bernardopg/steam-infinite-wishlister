# Arquitetura

## Visão Geral

O Steam Infinite Wishlister é um userscript Tampermonkey modular que automatiza a Fila de Descobertas da Steam. O projeto usa uma arquitetura de módulos ES6 concatenados em um único arquivo `.user.js` durante o build.

## Estrutura do Projeto

```
steam-infinite-wishlister/
├── src/                          # Código fonte (módulos ES6)
│   ├── config.js                 # Configurações centralizadas
│   ├── state.js                  # Estado global e persistência
│   ├── utils.js                  # Utilitários (DOM, logging, wait)
│   ├── ui.js                     # Interface/painel flutuante
│   ├── game.js                   # Detecção de tipo de jogo
│   ├── queue.js                  # Gerenciamento da fila
│   ├── wishlist.js               # Adição à wishlist com confirmação
│   ├── ageSkip.js                # Bypass de verificação de idade
│   ├── loop.js                   # Loop principal de automação
│   └── main.js                   # Ponto de entrada (metadata + init)
├── scripts/
│   └── build-userscript.mjs      # Build: concatena módulos em .user.js
├── docs/                         # Documentação
│   ├── README.md
│   ├── en/                       # Documentação em inglês
│   └── pt-br/                    # Documentação em português
├── SteamInfiniteWishlister.user.js  # Gerado pelo build
├── steam-infinite-wishlister.js     # Cópia do .user.js
├── package.json
├── version.json
└── TODO.md                       # Lista de tarefas e melhorias
```

## Build

O build concatena todos os módulos `src/` em ordem definida no script `build-userscript.mjs`, removendo os `import`/`export` e gerando um `.user.js` válido para Tampermonkey.

```bash
npm run build    # Gera SteamInfiniteWishlister.user.js
npm run check    # Verifica integridade do build
```

## Módulos

### CONFIG (`src/config.js`)

Configurações centralizadas e constantes.

| Seção | Propósito |
|-------|-----------|
| `VERSION` | Versão atual do script |
| `TIMING` | Delays e timeouts (LOOP_MIN, LOOP_MAX, ACTION_DELAY, QUEUE_GEN_DELAY) |
| `SELECTORS` | Seletores CSS para elementos da Steam |
| `STORAGE` | Chaves para GM_getValue/GM_setValue |

#### SELECTORS principais

| Seletor | Propósito |
|---------|-----------|
| `queueButtons` | Botões para iniciar fila |
| `wishlistArea` | Área de wishlist do jogo |
| `wishlistButton` | Botão de adicionar à wishlist |
| `wishlistSuccess` | Indicador visual de sucesso |
| `nextButton` | Botão "Próximo" da fila |
| `queueEmpty` | Indicador de fila vazia |
| `finishQueue` | Botão "Concluir lista" (.finish_queue_text) |
| `ageGate` | Verificação de idade |
| `ageConfirm` | Campo de ano do age gate |
| `ageConfirmBtn` | Botão de confirmar age gate |
| `tradingCards` | Link para trading cards |
| `owned` | Indicador de jogo possuído |
| `dlc` | Indicador de DLC |
| `title` | Título do jogo |

#### STORAGE

| Chave | Propósito |
|-------|-----------|
| `AUTO_START` | Auto-iniciar loop |
| `REQUIRE_CARDS` | Exigir cartas de troca |
| `SKIP_OWNED` | Pular jogos possuídos |
| `SKIP_DLC` | Pular DLCs |
| `AGE_SKIP` | Habilitar age skip |
| `STATS_WISHLISTED` | Contador persistente de adicionados |
| `STATS_SKIPPED` | Contador persistente de pulados |

### State (`src/state.js`)

Gerenciamento de estado global e persistência.

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `running` | boolean | Se o loop está ativo |
| `processing` | boolean | Se está processando um item |
| `settings.*` | boolean | Configurações do usuário |
| `stats.wishlisted` | number | Contador de adicionados (persistente) |
| `stats.skipped` | number | Contador de pulados (persistente) |
| `ui` | object | Referências de elementos DOM |

#### Funções

| Função | Propósito |
|--------|-----------|
| `initSettings()` | Inicializa settings via GM_getValue (chamado no main.js) |
| `saveStats()` | Salva contadores via GM_setValue (chamado após cada ação) |

### Utils (`src/utils.js`)

Utilitários gerais.

| Função | Propósito |
|--------|-----------|
| `pick(selector)` | Query selector simplificado |
| `visible(el)` | Verifica se elemento está visível |
| `byText(text)` | Busca elemento por texto |
| `wait(ms)` | Promise-based setTimeout |
| `log(msg, level)` | Logger com níveis (0=info, 1=debug, 2=verbose) |

### UI (`src/ui.js`)

Gerencia o painel flutuante e interações com o usuário.

| Função | Propósito |
|--------|-----------|
| `create()` | Criar painel flutuante completo |
| `updateStatus(msg, color)` | Atualizar texto de status |
| `setRunning(bool)` | Atualizar estado dos botões start/stop |
| `incrementWishlisted()` | Incrementar contador de adicionados |
| `incrementSkipped()` | Incrementar contador de pulados |

### Game (`src/game.js`)

Detecção e análise de tipo de jogo.

| Método | Retorno | Propósito |
|--------|---------|-----------|
| `getTitle()` | string | Obter título do jogo |
| `hasCards()` | boolean | Verifica se tem cartas de troca |
| `isOwned()` | boolean | Verifica se já possui o jogo |
| `isDLC()` | boolean | Verifica se é DLC |
| `shouldSkip(settings)` | string\|null | Motivo do skip ou null |

### Queue (`src/queue.js`)

Gerenciamento da fila de descobertas.

| Método | Retorno | Propósito |
|--------|---------|-----------|
| `tryStart()` | boolean | Tenta iniciar nova fila |
| `clickNext()` | boolean | Clica em "Próximo" |
| `clickFinish()` | boolean | Clica em "Concluir lista" |
| `isEmpty()` | boolean | Verifica se fila está vazia |
| `advance()` | Promise<boolean> | Avança para próximo item |

### Wishlist (`src/wishlist.js`)

Adição à wishlist com confirmação e retry.

| Método | Retorno | Propósito |
|--------|---------|-----------|
| `isAlreadyAdded()` | boolean | Verifica se já está na wishlist |
| `waitForConfirmation(maxWait)` | Promise<boolean> | Aguarda confirmação visual (polling) |
| `add(maxRetries)` | Promise<boolean> | Adiciona à wishlist com retry |

### AgeSkip (`src/ageSkip.js`)

Bypass automático de verificação de idade.

| Método | Retorno | Propósito |
|--------|---------|-----------|
| `isActive()` | boolean | Verifica se age gate está visível |
| `bypass()` | Promise<boolean> | Preenche ano (1990) e confirma |
| `waitForDismiss(timeout)` | Promise<boolean> | Aguarda age gate desaparecer |

### Loop (`src/loop.js`)

Loop principal de automação.

| Método | Propósito |
|--------|-----------|
| `start()` | Iniciar automação |
| `stop()` | Parar automação |
| `run()` | Loop contínuo com delay variável |
| `step()` | Processar um item da fila |

#### Fluxo do step()

```
1. Verificar age gate → se ativo, tentar bypass
2. Verificar se fila vazia:
   ├─ Tentar "Concluir lista" (clickFinish)
   └─ Se falhar, tentar gerar nova fila (tryStart)
3. Obter título do jogo
4. Verificar condições de skip (possuído, DLC, sem cartas)
5. Se não pular: adicionar à wishlist com confirmação
6. Avançar para próximo item
```

## Fluxo de Execução

### Inicialização

```
1. initSettings() — carrega configurações via GM_getValue
2. UI.create() — constrói painel flutuante
3. Conectar botões start/stop ao Loop
4. Registrar atalhos de teclado (Ctrl+Shift+S, Ctrl+Shift+X, Esc)
5. Registrar comandos de menu Tampermonkey
6. Se autoStart ativo → Loop.start() após 1.5s
```

### Loop Principal

```
Loop.start()
    ↓
Loop.run() — while(running)
    ↓
Loop.step()
    ├─ Age gate ativo? → bypass() → se falhar, pular
    ├─ Fila vazia?
    │   ├─ clickFinish() — tenta "Concluir lista"
    │   └─ tryStart() — tenta gerar nova fila
    ├─ Processar jogo:
    │   ├─ shouldSkip() — verifica condições
    │   ├─ Se pular: incrementSkipped() + saveStats()
    │   └─ Se não: Wishlist.add() → incrementWishlisted() + saveStats()
    └─ advance() — próximo item
    ↓
wait(jitter) — delay variável (700-1200ms)
    ↓
(repete)
```

## Dependências entre Módulos

```
config.js (usado por todos)
    ↓
state.js (usado por todos)
    ↓
utils.js (usado por todos)
    ↓
ui.js ←── state.js, utils.js
    ↓
game.js ←── utils.js
    ↓
queue.js ←── utils.js, config.js
    ↓
wishlist.js ←── utils.js, config.js
    ↓
ageSkip.js ←── utils.js, config.js
    ↓
loop.js ←── todos acima
    ↓
main.js ←── config, state, ui, loop, utils
```

## Guia de Manutenção

### Adicionar Novo Seletor

```javascript
// 1. Adicionar em CONFIG.SELECTORS
CONFIG.SELECTORS.finishQueue = ".finish_queue_text, .btn_finish_queue"

// 2. Usar no código
const btn = pick(CONFIG.SELECTORS.finishQueue)
```

### Adicionar Nova Configuração

```javascript
// 1. Adicionar chave em CONFIG.STORAGE
CONFIG.STORAGE.MINHA_NOVA = "wl_minha_nova"

// 2. Adicionar default em State.settings (state.js)
State.settings.minhaNova = false

// 3. Inicializar em initSettings()
State.settings.minhaNova = GM_getValue(CONFIG.STORAGE.MINHA_NOVA, false)
```

### Alterar Timing

```javascript
// Editar apenas CONFIG.TIMING
CONFIG.TIMING.MEU_NOVO_DELAY = 2000

// Usar no código
await wait(CONFIG.TIMING.MEU_NOVO_DELAY)
```

### Adicionar Nova Condição de Skip

```javascript
// Em Game.shouldSkip()
if (minhaCondicao) {
  return "Meu motivo de skip"
}
```

## Dicas

1. **Sempre use `log()`** para depuração em vez de `console.log()`
2. **`pick()` e `visible()`** são os utilitários principais para DOM
3. **`saveStats()`** deve ser chamado após cada ação que muda contadores
4. **State** é a fonte da verdade — consulte sempre
5. **CONFIG** centraliza tudo — prefira usar constantes em vez de strings hardcoded
6. **O build é necessário** após qualquer mudança em `src/`

---

[← Voltar para Documentação](../README.md) | [Contribuição →](contribuicao.md)