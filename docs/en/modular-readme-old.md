# 📦 Steam Wishlist Looper - Estrutura Modular

## 🎯 Filosofia

Este projeto foi dividido em **módulos simples e independentes**, seguindo a filosofia do `loop_simples_completo.js`:

- ✅ Código limpo e direto
- ✅ Funções pequenas e focadas
- ✅ Fácil de entender e modificar
- ✅ Sem complexidade desnecessária

---

## 📂 Estrutura de Arquivos

```text
src/
├── main.js       # Ponto de entrada (UserScript)
├── config.js     # Configurações e constantes
├── state.js      # Estado global da aplicação
├── utils.js      # Funções utilitárias
├── game.js       # Detecção de jogos/DLC/cartas
├── wishlist.js   # Gerenciamento de wishlist
├── queue.js      # Gerenciamento de fila
├── ui.js         # Interface do usuário
└── loop.js       # Loop principal
```

---

## 🔍 Descrição dos Módulos

### 1. **main.js** (~50 linhas)

**O que faz:** Ponto de entrada do script

- Inicializa a UI
- Conecta eventos dos botões
- Configura atalhos de teclado
- Inicia auto-start se habilitado

**Quando modificar:**

- Adicionar novos atalhos de teclado
- Mudar comportamento de inicialização
- Adicionar novos event listeners globais

---

### 2. **config.js** (~50 linhas)

**O que faz:** Centraliza todas as configurações

- Versão do script
- Timings (delays, intervalos)
- Seletores CSS do Steam
- Chaves de armazenamento

**Quando modificar:**

- Steam mudou a estrutura HTML
- Ajustar velocidade do loop
- Adicionar novos seletores

**Exemplo:**

```javascript
TIMING: {
  LOOP_MIN: 700,    // Delay mínimo entre ações
  LOOP_MAX: 1200,   // Delay máximo (anti-detecção)
}
```

---

### 3. **state.js** (~30 linhas)

**O que faz:** Gerencia o estado global

- Estado do loop (running/stopped)
- Configurações do usuário
- Estatísticas (wishlisted, skipped)
- Referências da UI

**Quando modificar:**

- Adicionar novas configurações
- Adicionar novos contadores
- Mudar valores padrão

---

### 4. **utils.js** (~30 linhas)

**O que faz:** Funções utilitárias reutilizáveis

- `wait(ms)` - Delay com Promise
- `visible(el)` - Verifica visibilidade
- `pick(sel)` - querySelector melhorado
- `byText(txt)` - Busca por texto
- `log(msg)` - Log padronizado

**Quando modificar:**

- Adicionar novas funções auxiliares
- Melhorar seletores existentes

---

### 5. **game.js** (~45 linhas)

**O que faz:** Detecta informações do jogo

- Verifica se tem cartas colecionáveis
- Verifica se já possui o jogo
- Detecta DLC
- Pega título do jogo
- Decide se deve pular

**Quando modificar:**

- Adicionar novos critérios de skip
- Melhorar detecção de DLC/demos
- Adicionar novos tipos de filtro

**Exemplo:**

```javascript
shouldSkip: (settings) => {
  if (settings.skipOwned && Game.isOwned()) {
    return "Já possui";
  }
  // ... mais checks
}
```

---

### 6. **wishlist.js** (~40 linhas)

**O que faz:** Gerencia a wishlist

- Verifica se já está na wishlist
- Adiciona à wishlist
- Aguarda confirmação

**Quando modificar:**

- Steam mudar botão de wishlist
- Adicionar verificações extras
- Melhorar detecção de sucesso

---

### 7. **queue.js** (~55 linhas)

**O que faz:** Gerencia a fila de descoberta

- Inicia nova fila
- Avança para próximo jogo
- Detecta fila vazia

**Quando modificar:**

- Adicionar novos seletores de botões
- Melhorar detecção de fila vazia
- Adicionar fallbacks

**Exemplo:**

```javascript
tryStart: () => {
  for (const selector of CONFIG.SELECTORS.queueButtons) {
    const btn = pick(selector);
    if (btn && visible(btn)) {
      btn.click();
      return true;
    }
  }
  return false;
}
```

---

### 8. **ui.js** (~140 linhas)

**O que faz:** Cria e gerencia a interface

- Cria painel flutuante
- Atualiza contadores
- Muda status
- Gerencia botões e checkboxes

**Quando modificar:**

- Redesenhar interface
- Adicionar novos controles
- Mudar cores/estilos

**Estrutura:**

```javascript
UI.create()              // Cria UI
UI.updateStatus(msg)     // Atualiza status
UI.incrementWishlisted() // +1 wishlist
UI.setRunning(bool)      // Habilita/desabilita botões
```

---

### 9. **loop.js** (~90 linhas)

**O que faz:** Loop principal da aplicação

- Controla start/stop
- Executa steps em loop
- Coordena todos os módulos
- Trata erros

**Quando modificar:**

- Mudar lógica do fluxo
- Adicionar novos steps
- Melhorar tratamento de erros

**Fluxo:**

```text
Loop.start()
  └─> Loop.run()
       └─> Loop.step() [loop]
            ├─> Queue.isEmpty()? → tryStart()
            ├─> Game.shouldSkip()? → skip
            ├─> Wishlist.add()
            └─> Queue.advance()
```

---

## 🔄 Fluxo de Execução

```text
1. main.js inicializa
   ↓
2. UI.create() monta interface
   ↓
3. Usuário clica Start OU auto-start
   ↓
4. Loop.start()
   ↓
5. Loop infinito:
   a) Verifica fila vazia → reinicia
   b) Pega info do jogo atual
   c) Verifica critérios de skip
   d) Adiciona à wishlist OU pula
   e) Avança para próximo
   f) Aguarda delay aleatório
   ↓
6. Repete até Stop
```

---

## 🛠️ Como Usar

### Desenvolvimento Local

```bash
# Os arquivos já estão em src/
# Para usar no Tampermonkey, você precisa:
# 1. Concatenar todos em um arquivo OU
# 2. Usar um bundler como Rollup/Webpack
```

### Build Simples (Manual)

```bash
# Copie o conteúdo de cada arquivo na ordem:
cat src/utils.js src/config.js src/state.js src/game.js \
    src/wishlist.js src/queue.js src/ui.js src/loop.js \
    src/main.js > steam-wishlist-looper-bundled.js
```

### Modificações Comuns

**Mudar velocidade:**

```javascript
// config.js
TIMING: {
  LOOP_MIN: 500,  // Mais rápido
  LOOP_MAX: 800,
}
```

**Adicionar novo filtro:**

```javascript
// game.js
shouldSkip: (settings) => {
  // ... checks existentes

  if (settings.skipDemos && Game.isDemo()) {
    return "É demo";
  }
}
```

**Adicionar botão na UI:**

```javascript
// ui.js → HTML
<button id="wl-pause">Pause</button>

// ui.js → event listener
State.ui.pauseBtn.addEventListener("click", Loop.pause);
```

---

## 📊 Comparação com Versão Original

| Aspecto | Original | Modular |
|---------|----------|---------|
| **Linhas** | ~2100 | ~500 (10 arquivos) |
| **Complexidade** | Alta | Baixa |
| **Manutenção** | Difícil | Fácil |
| **Legibilidade** | 😰 | 😊 |
| **Modularidade** | Nenhuma | Total |

---

## 🎨 Vantagens

✅ **Simples:** Cada arquivo tem uma responsabilidade clara
✅ **Pequeno:** ~50 linhas por arquivo em média
✅ **Legível:** Código limpo e direto
✅ **Manutenível:** Fácil de encontrar e modificar
✅ **Testável:** Módulos independentes
✅ **Escalável:** Adicionar features sem bagunça

---

## 🚀 Próximos Passos

Para usar em produção, você precisa:

1. **Bundler** (Rollup/Webpack) para juntar os módulos
2. **Build script** para gerar arquivo final
3. **Testes** para cada módulo
4. **CI/CD** para build automático

Ou simplesmente **concatenar manualmente** para usar no Tampermonkey!

---

## 📝 Notas

- Todos os módulos usam `export default`
- Imports são ES6 modules
- Compatível com Tampermonkey (com bundling)
- Mantém mesma funcionalidade do original
- Código inspirado em `loop_simples_completo.js`

---

**Versão:** 2.2
**Autor:** bernardopg
**Licença:** MIT
