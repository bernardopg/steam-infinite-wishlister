# 🏗️ Arquitetura do Steam Infinite Wishlister

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura Modular](#estrutura-modular)
- [Fluxo de Execução](#fluxo-de-execução)
- [Módulos Detalhados](#módulos-detalhados)
- [Guia de Manutenção](#guia-de-manutenção)

---

## 🎯 Visão Geral

O script é organizado em **9 módulos independentes** que trabalham juntos:

```text
CONFIG (Configurações)
   ↓
State (Estado Global)
   ↓
Logger → UI → SettingsManager
   ↓              ↓
QueueNavigation ← QueueProcessor → GameInfoUtils
   ↓              ↓
LoopController ← ErrorHandler
```

---

## 📦 Estrutura Modular

### 1️⃣ **CONFIG** (Linhas ~22-125)

**Propósito:** Centralizar todas as configurações

```javascript
CONFIG = {
  TIMING: { ... },        // Tempos de delay
  SELECTORS: { ... },     // Seletores CSS/DOM
  STORAGE_KEYS: { ... },  // Chaves localStorage
  MAX_QUEUE_RESTART_FAILURES: 5,
  CURRENT_VERSION: "2.1"
}
```

**Responsabilidades:**

- ⏱️ Definir delays e timeouts
- 🎯 Centralizar seletores CSS
- 💾 Gerenciar chaves de armazenamento
- 🔢 Constantes do sistema

---

### 2️⃣ **State** (Linhas ~127-177)

**Propósito:** Gerenciar estado global da aplicação

```javascript
State = {
  loop: {
    state: "Stopped|Running|Paused",
    timeoutId: null,
    isProcessing: false,
    manualActionInProgress: false,
    failedQueueRestarts: 0
  },
  settings: {
    autoStartEnabled: bool,
    requireTradingCards: bool,
    skipNonGames: bool,
    skipOwnedGames: bool,
    logLevel: 0-2
  },
  stats: {
    wishlistedThisSession: number,
    skippedThisSession: number
  },
  ui: { elements: {} }
}
```

**Quando usar:**

- 🔄 Verificar estado do loop
- ⚙️ Ler configurações do usuário
- 📊 Acessar estatísticas
- 🎨 Referenciar elementos UI

---

### 3️⃣ **Logger** (Linhas ~179-202)

**Propósito:** Sistema de logging com níveis

```javascript
Logger.log(message, level)
// level 0 = INFO (sempre mostra)
// level 1 = DEBUG (detalhes)
// level 2 = VERBOSE (tudo)
```

**Funções:**

- `log(message, level)` - Log com nível

**Quando usar:**

- 📝 Debugar problemas
- 📊 Rastrear fluxo de execução
- ⚠️ Reportar erros

---

### 4️⃣ **UI** (Linhas ~204-801)

**Propósito:** Gerenciar interface visual e interações

#### Funções Principais

```javascript
// Status
UI.updateStatusText(message, type)
// type: "info" | "action" | "success" | "skipped" | "error" | "paused"

// Contadores
UI.incrementWishlistCounter()
UI.incrementSkippedCounter()

// Log de Atividades
UI.addToActivityLog(action, item, reason)

// Botões
UI.updateManualButtonStates()

// Criação
UI.addControls() // Cria toda a UI

// Atualização
UI.updateUI() // Sincroniza UI com State

// Minimizar
UI.toggleMinimizeUI()

// Versão
UI.updateVersionInfo(latestVersion, updateUrl)
```

**Quando usar:**

- 🎨 Atualizar visual
- 📢 Mostrar mensagens ao usuário
- 🔄 Sincronizar estado visual
- 📊 Atualizar contadores

---

### 5️⃣ **SettingsManager** (Linhas ~803-873)

**Propósito:** Gerenciar configurações persistentes

```javascript
// Atualizar configuração
SettingsManager.updateSetting(key, newValue)

// Toggle booleano (usado pelos menu commands)
SettingsManager.toggleSetting(key, currentValue)
```

**Chaves disponíveis:**

- `CONFIG.STORAGE_KEYS.AUTO_START`
- `CONFIG.STORAGE_KEYS.AUTO_RESTART_QUEUE`
- `CONFIG.STORAGE_KEYS.REQUIRE_CARDS`
- `CONFIG.STORAGE_KEYS.SKIP_NON_GAMES`
- `CONFIG.STORAGE_KEYS.SKIP_OWNED`

**Quando usar:**

- 💾 Salvar preferências do usuário
- 🔄 Atualizar configurações
- ⚙️ Toggle de features

---

### 6️⃣ **AgeVerificationBypass** (Linhas ~875-1117)

**Propósito:** Bypass automático de verificação de idade

```javascript
// Inicialização
AgeVerificationBypass.init()

// Funções internas:
- setCookies()           // Define cookies de idade
- handleStoreSite()      // Trata página store
- handleCommunitySite()  // Trata página community
- tryProceedFunction()   // Tenta clicar botão Proceed
```

**Quando usar:**

- 🚪 Automaticamente ao iniciar
- ❌ Não precisa chamar manualmente

---

### 7️⃣ **DOMCache** (Linhas ~1119-1162)

**Propósito:** Cache de elementos DOM para performance

```javascript
// Obter elemento (com cache)
const element = DOMCache.get(key, selector)

// Limpar cache
DOMCache.clear()        // Tudo
DOMCache.clear(key)     // Específico

// Cache múltiplos
DOMCache.cacheSelectors({ key1: sel1, key2: sel2 })
```

**Quando usar:**

- 🚀 Melhorar performance
- 🔍 Buscar elementos frequentemente
- 🧹 Limpar em caso de erro

---

### 8️⃣ **GameInfoUtils** (Linhas ~1164-1266)

**Propósito:** Analisar tipo de jogo/app

```javascript
// Detectar tipo de app
const type = GameInfoUtils.getAppType()
// Retorna: "Game" | "DLC" | "Soundtrack" | "Demo" |
//          "Application" | "Video" | "Mod" | "Artbook"

// Verificar se deve pular
const skipReason = GameInfoUtils.checkIfNonGame()
// Retorna: string (motivo) ou null

// Limpar cache
GameInfoUtils.clearCache()
```

**Quando usar:**

- 🎮 Identificar tipo de item
- ⏭️ Decidir se pular item
- 🧹 Limpar cache de tipos

---

### 9️⃣ **QueueNavigation** (Linhas ~1268-1441)

**Propósito:** Navegar pela fila de descoberta

#### Funções Principais

```javascript
// Avançar para próximo item
await QueueNavigation.advanceQueue()
// Retorna: "Next" | "Ignore" | "FormSubmit" | "Failed"

// Garantir visibilidade da fila
QueueNavigation.ensureQueueVisible()

// Gerar nova fila
await QueueNavigation.generateNewQueue()
// Retorna: boolean (sucesso/falha)
```

**Estratégia de Avanço:**

1. Tenta botão "Next in Queue"
2. Tenta botão "Ignore"
3. Tenta submit do formulário
4. Retorna "Failed"

**Estratégia de Geração:**
Tenta seletores nesta ordem:

1. `#refresh_queue_btn > span`
2. `#refresh_queue_btn`
3. `#discovery_queue_start_link` (ID)
4. `.discover_queue_empty_refresh_btn`
5. `.btnv6_lightblue_blue.btn_medium`
6. `.discovery_queue_start_link` (classe)
7. `[href*='discoveryqueue']`
8. Fallback: `window.DiscoveryQueue.GenerateNewQueue()`

**Quando usar:**

- ⏭️ Avançar para próximo jogo
- 🔄 Reiniciar fila terminada
- 👁️ Corrigir problemas de visibilidade

---

### 🔟 **ErrorHandler** (Linhas ~1443-1496)

**Propósito:** Tratamento centralizado de erros

```javascript
// Tratar erro
ErrorHandler.handleError(error, context, stopLoop)

// Wrapper async seguro
await ErrorHandler.safeAsync(operation, context)

// Validar DOM
const isValid = ErrorHandler.validateDOMState()
```

**Quando usar:**

- ❌ Capturar exceções
- 🛡️ Proteger operações async
- ✅ Validar estado do DOM

---

### 1️⃣1️⃣ **QueueProcessor** (Linhas ~1498-1899)

**Propósito:** Processar items da fila (CORE DO SISTEMA)

#### Funções Principais

```javascript
// Verificar status da fila e reagir
await QueueProcessor.checkQueueStatusAndHandle()
// Retorna: boolean (continuar processamento ou não)

// Processar item atual
await QueueProcessor.processCurrentGameItem(isManualTrigger)

// Confirmar wishlist (polling)
await QueueProcessor.confirmWishlistSuccess()

// Ações manuais
QueueProcessor.processOnce()
QueueProcessor.skipItem()
```

**Lógica de Processamento:**

1. **Obter informações do jogo**
   - Título
   - Fila restante

2. **Verificar condições de skip:**
   - ✅ Owned? (se `skipOwnedGames`)
   - ✅ Non-game? (se `skipNonGames`)
   - ✅ No cards? (se `requireTradingCards`)

3. **Ação:**
   - Se skip: incrementar contador, log
   - Se não skip: tentar adicionar à wishlist

4. **Avançar fila** (se não for manual)

**Quando usar:**

- 🎮 Processar jogo atual
- ✅ Verificar estado da fila
- 👆 Ações manuais do usuário

---

### 1️⃣2️⃣ **LoopController** (Linhas ~1901-2008)

**Propósito:** Controlar loop principal

```javascript
// Iniciar loop
LoopController.startLoop()

// Pausar loop
LoopController.pauseLoop()

// Parar loop
LoopController.stopLoop(keepSettings)

// Loop principal (interno)
LoopController.mainLoop() // Chamado recursivamente
```

**Ciclo do Loop:**

```text
startLoop()
   ↓
mainLoop()
   ↓
checkQueueStatusAndHandle()
   ↓
processCurrentGameItem()
   ↓
setTimeout(mainLoop, CHECK_INTERVAL)
```

**Quando usar:**

- ▶️ Iniciar automação
- ⏸️ Pausar temporariamente
- ⏹️ Parar completamente

---

### 1️⃣3️⃣ **VersionChecker** (Linhas ~2010-2073)

**Propósito:** Verificar atualizações

```javascript
await VersionChecker.checkForUpdates()
```

**Funcionamento:**

1. Verifica se passou o intervalo (24h)
2. Faz requisição para `version.json`
3. Compara versões
4. Atualiza UI se houver update

**Quando usar:**

- 🚀 Automaticamente na inicialização
- 🔄 A cada 24 horas

---

## 🔄 Fluxo de Execução

### Inicialização (Linhas ~2075-2129)

```javascript
(function init() {
  1. Logger.log("Initializing...")
  2. UI.addControls()                      // Cria UI
  3. GM_registerMenuCommand(...)           // Menu commands
  4. VersionChecker.checkForUpdates()      // Verifica updates
  5. AgeVerificationBypass.init()          // Bypass idade
  6. if (autoStartEnabled) startLoop()     // Auto-start
})()
```

### Loop Principal

```text
1. mainLoop() é chamado
   ↓
2. checkQueueStatusAndHandle()
   ├─ Fila vazia? → generateNewQueue()
   ├─ Fila invisível? → generateNewQueue()
   └─ OK? → continuar
   ↓
3. processCurrentGameItem()
   ├─ Obter info do jogo
   ├─ Verificar skip conditions
   ├─ Wishlist ou skip
   └─ advanceQueue()
   ↓
4. setTimeout(mainLoop, 3500ms)
   ↓
   (repete)
```

### Processamento de Item

```text
processCurrentGameItem()
   ↓
1. Obter título e info
   ↓
2. Verificar Skip Conditions:
   │
   ├─ Owned? ──YES──> Skip
   │    NO
   │    ↓
   ├─ Non-game? ──YES──> Skip
   │    NO
   │    ↓
   └─ No cards? ──YES──> Skip
        NO
        ↓
3. Adicionar à Wishlist
   ↓
4. advanceQueue()
```

---

## 🛠️ Guia de Manutenção

### Adicionar Novo Seletor

```javascript
// 1. Adicionar em CONFIG.SELECTORS
CONFIG.SELECTORS.novoGrupo = {
  elemento: ".meu-seletor"
}

// 2. Usar no código
const el = document.querySelector(CONFIG.SELECTORS.novoGrupo.elemento)
```

### Adicionar Nova Configuração

```javascript
// 1. Adicionar chave em CONFIG.STORAGE_KEYS
CONFIG.STORAGE_KEYS.NOVA_CONFIG = "minhaNovaConfig"

// 2. Inicializar em State.settings
settings: {
  minhaNovaConfig: GM_getValue(CONFIG.STORAGE_KEYS.NOVA_CONFIG, valorPadrao)
}

// 3. Adicionar no keyMap do SettingsManager
keyMap[CONFIG.STORAGE_KEYS.NOVA_CONFIG] = "minhaNovaConfig"

// 4. Adicionar checkbox na UI (se necessário)
```

### Modificar Timing

```javascript
// Apenas edite CONFIG.TIMING
CONFIG.TIMING.MEU_NOVO_DELAY = 2000

// Use no código
await new Promise(r => setTimeout(r, CONFIG.TIMING.MEU_NOVO_DELAY))
```

### Adicionar Novo Tipo de Skip

```javascript
// Em GameInfoUtils.checkIfNonGame() ou QueueProcessor.processCurrentGameItem()

// Adicionar verificação
if (minhaCondicao) {
  skipReason = "Meu motivo de skip"
  Logger.log(` -> Skipping: ${skipReason}`, 1)
}
```

### Debug

```javascript
// Aumentar log level temporariamente
State.settings.logLevel = 2  // Verbose

// Ou permanente via GM_setValue
GM_setValue(CONFIG.STORAGE_KEYS.LOG_LEVEL, 2)
```

---

## 📊 Dependências entre Módulos

```text
CONFIG (usado por todos)
   ↓
State (usado por todos)
   ↓
Logger (usado por todos)
   ↓
UI ←──────────────── SettingsManager
   ↓                        ↓
DOMCache ←─ GameInfoUtils  │
   ↓              ↓         │
QueueNavigation ←─┘         │
   ↓                        │
ErrorHandler ←──────────────┘
   ↓
QueueProcessor (usa TUDO)
   ↓
LoopController
```

---

## 🎯 Onde Modificar Para

### Mudar comportamento de skip

→ `QueueProcessor.processCurrentGameItem()`
→ `GameInfoUtils.checkIfNonGame()`

### Adicionar novo botão de geração de fila

→ `QueueNavigation.generateNewQueue()` - array `selectors`

### Mudar delays

→ `CONFIG.TIMING`

### Adicionar nova configuração persistente

→ `CONFIG.STORAGE_KEYS`
→ `State.settings`
→ `SettingsManager.updateSetting()`

### Modificar UI

→ `UI.addControls()` - HTML template
→ `GM_addStyle()` - CSS

### Adicionar novo check de status

→ `QueueProcessor.checkQueueStatusAndHandle()`

### Modificar lógica de avanço

→ `QueueNavigation.advanceQueue()`

---

## 💡 Dicas

1. **Sempre use Logger.log()** para debug
2. **DOMCache** melhora performance - use!
3. **ErrorHandler.safeAsync()** para operações arriscadas
4. **State** é a fonte da verdade - consulte sempre
5. **UI.updateUI()** sincroniza tudo - chame após mudanças
6. **CONFIG** centraliza tudo - prefira constantes

---

## 🔮 Futuro: Possível Split de Arquivos

Se decidir dividir o arquivo:

```text
src/
├── config.js           # CONFIG
├── state.js            # State
├── logger.js           # Logger
├── ui/
│   ├── ui.js          # UI
│   └── styles.css     # Estilos
├── managers/
│   ├── settings.js    # SettingsManager
│   └── errors.js      # ErrorHandler
├── game/
│   ├── info.js        # GameInfoUtils
│   ├── queue.js       # QueueNavigation
│   └── processor.js   # QueueProcessor
├── controllers/
│   └── loop.js        # LoopController
├── utils/
│   ├── dom-cache.js   # DOMCache
│   ├── age-bypass.js  # AgeVerificationBypass
│   └── version.js     # VersionChecker
└── main.js            # Inicialização
```

Mas isso requer build system (webpack/rollup)!

---

**Versão:** 2.1
**Última atualização:** 2025-01-03
