# Arquitetura

## Visão Geral

O Steam Infinite Wishlister é organizado em módulos modulares que trabalham juntos para automatizar a Fila de Descobertas da Steam. O script é desenvolvido como um userscript Tampermonkey com clara separação de responsabilidades.

## Estrutura dos Módulos

```
CONFIG (Configuração)
   ↓
State (Estado Global)
   ↓
Logger → UI → SettingsManager
   ↓              ↓
QueueNavigation ← QueueProcessor → GameInfoUtils
   ↓              ↓
LoopController ← ErrorHandler
```

## Módulos

### CONFIG

Configurações centralizadas e constantes.

| Seção | Propósito |
|-------|-----------|
| `TIMING` | Delays e timeouts para automação |
| `SELECTORS` | Seletores CSS/DOM para elementos da Steam |
| `STORAGE_KEYS` | Constantes para chaves de armazenamento |
| `CURRENT_VERSION` | Versão do script |

### State

Gerenciamento de estado global da aplicação.

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `loop.state` | string | Estado atual: "Stopped", "Running", "Paused" |
| `loop.timeoutId` | number | ID do setTimeout para limpeza |
| `loop.isProcessing` | boolean | Se está processando um item |
| `loop.failedQueueRestarts` | number | Falhas consecutivas de reinício |
| `settings.*` | boolean | Valores de configuração do usuário |
| `stats.*` | number | Contadores de estatísticas da sessão |
| `ui.elements` | object | Referências de elementos DOM |

### Logger

Sistema de logging com níveis configuráveis.

| Nível | Valor | Uso |
|-------|-------|-----|
| INFO | 0 | Informações importantes (sempre exibido) |
| DEBUG | 1 | Detalhes de depuração |
| VERBOSE | 2 | Tudo incluindo rastreamento |

### UI

Gerencia o painel flutuante e interações com o usuário.

| Função | Propósito |
|--------|-----------|
| `updateStatusText(msg, type)` | Atualizar exibição de status |
| `incrementWishlistCounter()` | Incrementar contador de wishlist |
| `incrementSkippedCounter()` | Incrementar contador de pulados |
| `addToActivityLog(action, item, reason)` | Adicionar ao log de atividades |
| `updateManualButtonStates()` | Atualizar estados dos botões manuais |
| `addControls()` | Criar toda a interface |
| `updateUI()` | Sincronizar UI com State |
| `toggleMinimizeUI()` | Minimizar/restaurar painel |
| `updateVersionInfo(latest, url)` | Atualizar exibição de versão |

### SettingsManager

Gerenciamento persistente de configurações.

| Função | Propósito |
|--------|-----------|
| `updateSetting(key, value)` | Atualizar valor de configuração |
| `toggleSetting(key, current)` | Alternar configuração booleana |

### AgeVerificationBypass

Bypass automático de verificação de idade para conteúdo adulto.

| Método | Propósito |
|--------|-----------|
| `init()` | Inicializar todos os mecanismos de bypass |
| `setCookies()` | Definir cookies de verificação |
| `handleStoreSite()` | Tratar páginas da loja |
| `handleCommunitySite()` | Tratar páginas da comunidade |

### DOMCache

Otimização de performance através de cache de elementos.

| Método | Propósito |
|--------|-----------|
| `get(key, selector)` | Obter elemento com cache |
| `clear(key?)` | Limpar cache (todo ou específico) |
| `cacheSelectors(map)` | Cache de múltiplos elementos |

### GameInfoUtils

Detecção e análise de tipo de jogo.

| Método | Retorno | Propósito |
|--------|---------|-----------|
| `getAppType()` | string | Detectar tipo do app (Jogo, DLC, Demo, etc.) |
| `checkIfNonGame()` | string|null | Deve pular como não-jogo? |
| `clearCache()` | void | Limpar cache de detecção |

### QueueNavigation

Controles de navegação da fila de descobertas.

| Método | Retorno | Propósito |
|--------|---------|-----------|
| `advanceQueue()` | string | Avançar para próximo item |
| `ensureQueueVisible()` | void | Garantir que fila está visível |
| `generateNewQueue()` | boolean | Gerar nova fila |

Estratégia de avanço tenta: Botão Next → Botão Ignore → Submit do formulário → Falha

### ErrorHandler

Tratamento centralizado de erros.

| Método | Propósito |
|--------|-----------|
| `handleError(error, context, stopLoop)` | Tratar e registrar erros |
| `safeAsync(operation, context)` | Wrapper seguro para async |
| `validateDOMState()` | Validar estado do DOM |

### QueueProcessor

Engine central de processamento de itens.

| Método | Retorno | Propósito |
|--------|---------|-----------|
| `checkQueueStatusAndHandle()` | boolean | Verificar fila e reagir |
| `processCurrentGameItem(manual)` | void | Processar item atual |
| `confirmWishlistSuccess()` | Promise | Confirmar adição à wishlist |
| `processOnce()` | void | Processamento manual único |
| `skipItem()` | void | Pular item manualmente |

### LoopController

Controlador do loop principal de automação.

| Método | Propósito |
|--------|-----------|
| `startLoop()` | Iniciar automação |
| `pauseLoop()` | Pausar automação |
| `stopLoop(keepSettings)` | Parar completamente |

### VersionChecker

Sistema de verificação de atualizações.

| Método | Propósito |
|--------|-----------|
| `checkForUpdates()` | Verificar e notificar atualizações |

## Fluxo de Execução

### Inicialização

```
1. Mensagem de inicialização do Logger
2. UI.createControls() - Construir interface
3. GM_registerMenuCommand() - Registrar itens de menu
4. VersionChecker.checkForUpdates() - Verificar atualizações
5. AgeVerificationBypass.init() - Configurar bypass
6. Se autoStart ativo → LoopController.startLoop()
```

### Loop Principal

```
startLoop()
   ↓
mainLoop()
   ↓
checkQueueStatusAndHandle()
   ├─ Fila vazia? → generateNewQueue()
   ├─ Fila oculta? → generateNewQueue()
   └─ OK? → continuar
   ↓
processCurrentGameItem()
   ├─ Obter info do jogo
   ├─ Verificar condições de skip
   ├─ Wishlist ou pular
   └─ advanceQueue()
   ↓
setTimeout(mainLoop, CHECK_INTERVAL)
   ↓
(repete)
```

### Processamento de Item

```
processCurrentGameItem()
   ↓
1. Obter título e informações
   ↓
2. Verificar Condições de Skip:
   │
   ├─ Possui? ──SIM──→ Pular
   │    NÃO
   │    ↓
   ├─ Não-jogo? ──SIM──→ Pular
   │    NÃO
   │    ↓
   └─ Sem cartas? ──SIM──→ Pular
        NÃO
        ↓
3. Adicionar à Wishlist
   ↓
4. advanceQueue()
```

## Dependências entre Módulos

```
CONFIG (usado por todos)
   ↓
State (usado por todos)
   ↓
Logger (usado por todos)
   ↓
UI ←─────────────── SettingsManager
   ↓                       ↓
DOMCache ←─ GameInfoUtils  │
   ↓             ↓          │
QueueNavigation ←┘          │
   ↓                        │
ErrorHandler ←──────────────┘
   ↓
QueueProcessor (usa tudo)
   ↓
LoopController
```

## Guia de Manutenção

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

// 4. Adicionar checkbox na UI se necessário
```

### Alterar Timing

```javascript
// Editar apenas CONFIG.TIMING
CONFIG.TIMING.MEU_NOVO_DELAY = 2000

// Usar no código
await new Promise(r => setTimeout(r, CONFIG.TIMING.MEU_NOVO_DELAY))
```

### Adicionar Nova Condição de Skip

```javascript
// Em QueueProcessor.processCurrentGameItem() ou GameInfoUtils.checkIfNonGame()

if (minhaCondicao) {
  skipReason = "Meu motivo de skip"
  Logger.log(` -> Pulando: ${skipReason}`, 1)
}
```

## Dicas

1. **Sempre use Logger.log()** para depuração
2. **DOMCache** melhora performance - use!
3. **ErrorHandler.safeAsync()** para operações arriscadas
4. **State** é a fonte da verdade - consulte sempre
5. **UI.updateUI()** sincroniza tudo - chame após mudanças de estado
6. **CONFIG** centraliza tudo - prefira usar constantes

---

[← Voltar para Documentação](../README.md) | [Contribuição →](contribuicao.md)