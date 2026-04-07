# TODO - Steam Infinite Wishlister

> Última atualização: 2026-04-07

---

## ✅ RESOLVIDOS (15/21 itens)

### Críticos (5/5)

| # | Item | Status | Data |
|---|------|--------|------|
| C1 | **Build quebrado** | ✅ Reescrito — concatenador de módulos src/ | 2026-04-07 |
| C2 | **ES modules incompatíveis** | ✅ Bundler gera .user.js válido para Tampermonkey | 2026-04-07 |
| C3 | **Duplicação de código** | ✅ src/ é fonte de verdade, .user.js é gerado | 2026-04-07 |
| C4 | **loop_simples_completo.js morto** | ✅ Arquivo removido | 2026-04-07 |
| C5 | **GM_getValue no top-level** | ✅ Movido para initSettings() | 2026-04-07 |

### Importantes (7/7)

| # | Item | Status | Data |
|---|------|--------|------|
| I1 | **Inconsistência de versões** | ✅ Unificado para v2.2.0 | 2026-04-07 |
| I2 | **Sem bundler funcional** | ✅ Pipeline: src/ → concat → .user.js | 2026-04-07 |
| I3 | **GM_* APIs inconsistentes** | ✅ 5 @grant declaradas no metadata | 2026-04-07 |
| I4 | **Age Skip ausente** | ⚠️ Não portado — funcional no .user.js antigo | pendente |
| I5 | **version.json inexistente** | ✅ Criado na raiz do projeto | 2026-04-07 |
| I6 | **@match patterns incompletos** | ✅ 5 patterns sincronizados | 2026-04-07 |
| I7 | **@run-at não especificado** | ✅ @run-at document-idle | 2026-04-07 |

### Médias (3/8)

| # | Item | Status | Data |
|---|------|--------|------|
| M1 | **Processo de build inexistente** | ✅ Build funcional (npm run build/check) | 2026-04-07 |
| M5 | **Logger sem níveis** | ✅ Adicionados níveis: info, debug, verbose | 2026-04-07 |
| M6 | **tryStart() redundante** | ✅ Removida chamada duplicada no loop | 2026-04-07 |

### Baixas (0/8)

| # | Item | Status | Data |
|---|------|--------|------|
| L5 | **package.json minimalista** | ✅ type: module adicionado | 2026-04-07 |

---

## ⏳ PENDENTES (6/21 itens)

### Médias (5 restantes)

| # | Item | Arquivos |
|---|------|----------|
| M2 | src/main.js sem IIFE protection | src/main.js |
| M3 | Seletores duplicados entre versões | src/config.js |
| M4 | Sem testes automatizados | Todo o projeto |
| M7 | Wishlist.add() sem confirmação | src/wishlist.js |
| M8 | Sem tratamento de erros de rede | src/wishlist.js |

### Baixas (8 restantes)

| # | Item | Arquivos |
|---|------|----------|
| L1 | Documentação desatualizada | docs/pt-br/arquitetura.md |
| L2 | UI básica no src/ | src/ui.js |
| L3 | Atalhos de teclado não configuráveis | src/main.js |
| L4 | ~~Sem version.json~~ | ✅ Criado |
| L5 | ~~package.json minimalista~~ | ✅ type: module adicionado |
| L6 | ~~loop_simples sem README~~ | ✅ Arquivo removido |
| L7 | Sem CI/CD | configuração repo |
| L8 | Seletores da Steam podem mudar | src/config.js |

---

## 📋 Arquivos Modificados

### Criados/Reescritos:

| Arquivo | Mudança |
|---------|---------|
| `scripts/build-userscript.mjs` | Reescrito — concatenador de módulos na ordem |
| `src/main.js` | Metadata block completo, @grant, @match, @run-at, menu commands |
| `src/state.js` | Named export `{ State, initSettings }`, GM_* no init |
| `src/loop.js` | Removido tryStart redundante, import { State } |
| `src/ui.js` | import { State } (named) |
| `src/utils.js` | Logger com níveis (info, debug, verbose) |
| `package.json` | v2.2.0, type: module |
| `version.json` | Novo arquivo — version checker |

### Removidos:

| Arquivo | Motivo |
|---------|--------|
| `loop_simples_completo.js` | Arquivo antigo de teste, duplicado |

### Gerados pelo build:

| Arquivo | Origem |
|---------|--------|
| `SteamInfiniteWishlister.user.js` | Gerado do src/ (595 linhas, v2.2.0) |
| `steam-infinite-wishlister.js` | Cópia do .user.js (compatibilidade) |

---

## 📊 Resumo de Saúde do Projeto (Atualizado)

| Área | Status | Detalhes |
|------|--------|----------|
| Build | ✅ Funcional | `npm run build` + `npm run check` funcionando |
| Fonte de Verdade | ✅ Definida | `src/` é canônico, `.user.js` é gerado |
| Compatibilidade | ✅ Tampermonkey | Metadata block com @grant, @match, @run-at |
| Versionamento | ✅ Unificado | v2.2.0 em todos os arquivos + version.json |
| Testes | ❌ Inexistentes | Zero cobertura |
| Documentação | ⚠️ Desatualizada | docs/ ainda reflete estrutura monolítica |
| Funcionalidade Core | ⚠️ Parcial | Age Skip não portado para módulos src/ |
| Size | 📉 Reduzido | 595 linhas (antes 2296) |

---

## 🚀 Próximos Passos Recomendados

### Prioridade Alta (para release):
1. **Portar AgeVerificationBypass** para `src/ageSkip.js` (funcionalidade existente no monolito antigo)
2. **Adicionar confirmação de wishlist** em `src/wishlist.js` (polling para verificar sucesso)
3. **Tratamento de erros de rede** (retry em falhas de wishlist)

### Prioridade Média (para qualidade):
4. **Atualizar documentação** (docs/pt-br/arquitetura.md)
5. **Criar testes básicos** (smoke test do loop)
6. **Remover IIFE protection warning** (envolver src/main.js em IIFE)

### Prioridade Baixa (nice-to-have):
7. **CI/CD** (GitHub Actions validar build)
8. **UI melhorada** (log de atividades, minimizar, collapse)

---

*Documento atualizado automaticamente conforme itens são resolvidos.*