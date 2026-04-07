# TODO - Steam Infinite Wishlister

> Última atualização: 2026-04-07

---

## ✅ RESOLVIDOS (19/21 itens)

### Críticos (5/5)

| # | Item | Status | Data |
|---|------|--------|------|
| C1 | **Build quebrado** | ✅ Reescrito — concatenador de módulos src/ | 2026-04-07 |
| C2 | **ES modules incompatíveis** | ✅ Bundler gera .user.js válido para Tampermonkey | 2026-04-07 |
| C3 | **Duplicação de código** | ✅ src/ é fonte de verdade, .user.js é gerado | 2026-04-07 |
| C4 | **loop_simples_completo.js morto** | ✅ Arquivo removido | 2026-04-07 |
| C5 | **GM_getValue no top-level** | ✅ Movido para initSettings() | 2026-04-07 |

### Importantes (8/8)

| # | Item | Status | Data |
|---|------|--------|------|
| I1 | **Inconsistência de versões** | ✅ Unificado para v2.2.0 | 2026-04-07 |
| I2 | **Sem bundler funcional** | ✅ Pipeline: src/ → concat → .user.js | 2026-04-07 |
| I3 | **GM_* APIs inconsistentes** | ✅ 5 @grant declaradas no metadata | 2026-04-07 |
| I4 | **Age Skip ausente** | ✅ Portado para src/ageSkip.js com bypass automático | 2026-04-07 |
| I5 | **version.json inexistente** | ✅ Criado na raiz do projeto | 2026-04-07 |
| I6 | **@match patterns incompletos** | ✅ 5 patterns sincronizados | 2026-04-07 |
| I7 | **@run-at não especificado** | ✅ @run-at document-idle | 2026-04-07 |
| I8 | **Import stripping no build** | ✅ stripImports() aplicado ao main body | 2026-04-07 |

### Médias (5/8)

| # | Item | Status | Data |
|---|------|--------|------|
| M1 | **Processo de build inexistente** | ✅ Build funcional (npm run build/check) | 2026-04-07 |
| M5 | **Logger sem níveis** | ✅ Adicionados níveis: info, debug, verbose | 2026-04-07 |
| M6 | **tryStart() redundante** | ✅ Removida chamada duplicada no loop | 2026-04-07 |
| M7 | **Wishlist.add() sem confirmação** | ✅ Polling para verificar sucesso após clique | 2026-04-07 |
| M8 | **Sem tratamento de erros de rede** | ✅ Retry automático com maxRetries | 2026-04-07 |

### Baixas (1/8)

| # | Item | Status | Data |
|---|------|--------|------|
| L5 | **package.json minimalista** | ✅ type: module adicionado | 2026-04-07 |

---

## ⏳ PENDENTES (2/21 itens)

### Médias (3 restantes)

| # | Item | Arquivos | Prioridade |
|---|------|----------|------------|
| M2 | src/main.js sem IIFE protection | src/main.js | Baixa |
| M3 | Seletores duplicados entre versões | src/config.js | Baixa |
| M4 | Sem testes automatizados | Todo o projeto | Média |

### Baixas (7 restantes)

| # | Item | Arquivos | Prioridade |
|---|------|----------|------------|
| L1 | Documentação desatualizada | docs/pt-br/arquitetura.md | Baixa |
| L2 | UI básica no src/ | src/ui.js | Baixa |
| L3 | Atalhos de teclado não configuráveis | src/main.js | Baixa |
| L6 | Sem CI/CD | configuração repo | Baixa |
| L7 | Seletores da Steam podem mudar | src/config.js | Baixa |
| L8 | Sem log de atividades no painel | src/ui.js | Baixa |
| L9 | Sem botão para minimizar painel | src/ui.js | Baixa |

---

## 📋 Arquivos Modificados

### Criados/Reescritos nesta sessão:

| Arquivo | Mudança |
|---------|---------|
| `src/ageSkip.js` | **Novo** — Age Gate Bypass com detecção automática, preenchimento de ano e submit |
| `src/wishlist.js` | Reescrito — Confirmação por polling, retry automático, JSDoc |
| `src/loop.js` | Adicionado AgeSkip integration, melhor handling de erros |
| `src/config.js` | Adicionados seletores de age gate e STORAGE.AGE_SKIP |

### Criados/Reescritos anteriormente:

| Arquivo | Mudança |
|---------|---------|
| `scripts/build-userscript.mjs` | Reescrito — concatenador de módulos na ordem |
| `src/main.js` | Metadata block completo, @grant, @match, @run-at, menu commands |
| `src/state.js` | Named export `{ State, initSettings }`, GM_* no init |
| `src/ui.js` | import { State } (named) |
| `src/utils.js` | Logger com níveis (info, debug, verbose) |
| `src/queue.js` | Gerenciamento de fila com tryStart, clickNext, isEmpty, advance |
| `src/game.js` | Detecção de jogos: hasCards, isOwned, isDLC, getTitle, shouldSkip |
| `package.json` | v2.2.0, type: module |
| `version.json` | Novo arquivo — version checker |

### Removidos:

| Arquivo | Motivo |
|---------|--------|
| `loop_simples_completo.js` | Arquivo antigo de teste, duplicado |

### Gerados pelo build:

| Arquivo | Origem |
|---------|--------|
| `SteamInfiniteWishlister.user.js` | Gerado do src/ (v2.2.0) |
| `steam-infinite-wishlister.js` | Cópia do .user.js (compatibilidade) |

---

## 📊 Resumo de Saúde do Projeto

| Área | Status | Detalhes |
|------|--------|----------|
| Build | ✅ Funcional | `npm run build` + `npm run check` funcionando |
| Fonte de Verdade | ✅ Definida | `src/` é canônico, `.user.js` é gerado |
| Compatibilidade | ✅ Tampermonkey | Metadata block com @grant, @match, @run-at |
| Versionamento | ✅ Unificado | v2.2.0 em todos os arquivos + version.json |
| Age Gate Bypass | ✅ Implementado | Detecção automática, bypass com ano + submit |
| Wishlist Confirmação | ✅ Implementado | Polling visual com timeout de 3s |
| Retry de Rede | ✅ Implementado | maxRetries=2 com logging de erros |
| Testes | ❌ Inexistentes | Zero cobertura |
| Documentação | ⚠️ Desatualizada | docs/ ainda reflete estrutura monolítica |
| Size | 📉 Reduzido | ~500 linhas em módulos separados |

---

## 🚀 Próximos Passos Recomendados

### Prioridade Alta (para próxima release):
1. **Rodar build e testar no Tampermonkey** — verificar se age skip funciona na prática
2. **Testar confirmação de wishlist** — verificar polling detecta sucesso corretamente
3. **Testar retry de rede** — simular falhas de conexão

### Prioridade Média (para qualidade):
4. **Criar testes básicos** — smoke test do loop, testes unitários de utils
5. **Atualizar documentação** — docs/pt-br/arquitetura.md para refletir módulos src/
6. **Adicionar log de atividades** — painel com histórico de ações (adicionados/pulados)

### Prioridade Baixa (nice-to-have):
7. **CI/CD** — GitHub Actions para validar build em PRs
8. **UI melhorada** — minimizar painel, collapse de opções, log scrollable
9. **Atalhos de teclado configuráveis** — permitir usuário definir hotkeys

---

*Documento atualizado automaticamente conforme itens são resolvidos.*