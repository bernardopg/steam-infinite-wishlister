# RELATÓRIO TÉCNICO COMPLETO

Data da auditoria: 2026-04-12
Projeto: Steam Infinite Wishlister
Escopo: validação da promessa da `premissa.md` + aderência entre código, build e documentação pública.

---

## 1) Resposta direta: o projeto cumpre o que promete na premissa?

**Veredito:** **cumpre em grande parte (7,5/8 passos), com ressalvas operacionais**.

O fluxo principal descrito na premissa está implementado no código (iniciar fila, detectar cartas, adicionar wishlist, avançar e reiniciar loop). A principal ressalva é que o script **não navega sozinho para `/explore/`**; ele depende de o usuário estar em uma página suportada para iniciar.

---

## 2) Matriz de aderência à premissa (`premissa.md`)

| Passo da premissa                                  | Status         | Evidência técnica                                                      | Observação                                                                          |
| -------------------------------------------------- | -------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1. Abrir `https://store.steampowered.com/explore/` | ⚠️ Parcial      | `src/main.js` e `src/loop.js`                                          | O script roda nas páginas `@match`, mas não força navegação ativa para `/explore/`. |
| 2. Clicar em “Começar a explorar a sua lista”      | ✅ Implementado | `Queue.tryStart()` em `src/queue.js`                                   | Usa seletores e fallback por texto.                                                 |
| 3. Aguardar carregamento da página do jogo         | ✅ Implementado | `CONFIG.TIMING` + `wait(...)` em `src/loop.js`/`src/queue.js`          | Há delays controlados após ações de navegação.                                      |
| 4. Verificar cartas colecionáveis                  | ✅ Implementado | `Game.hasCards()` em `src/game.js`                                     | Detecção por label, ícone e href `category2=29`.                                    |
| 5. Se houver cartas, adicionar na wishlist         | ✅ Implementado | `Wishlist.add()` em `src/wishlist.js`                                  | Inclui confirmação por polling e retry.                                             |
| 6. Clicar em “Próximo da lista”                    | ✅ Implementado | `Queue.clickNext()`/`Queue.advance()` em `src/queue.js`                | Fallback por texto também presente.                                                 |
| 7. Repetir até fim da fila                         | ✅ Implementado | `Loop.run()` em `src/loop.js`                                          | Loop contínuo com jitter entre ciclos.                                              |
| 8. Ao fim, “Iniciar outra lista >>” e continuar    | ✅ Implementado | `Queue.isEmpty()` + `Queue.tryStart()` em `src/loop.js`/`src/queue.js` | Também tenta `clickFinish()` quando aplicável.                                      |

---

## 3) Validação executável do projeto

### Comandos executados

- `npm run check`
  Resultado: **PASS** (`Userscript output is up to date`).
- `npm run build`
  Resultado: **PASS** (gerou `SteamInfiniteWishlister.user.js` e cópia compatível).
- Inspeção de problemas do workspace (`get_errors`)
  Resultado: **sem erros**.

### Conclusão de build/saúde técnica

- Pipeline de build está funcional.
- Artefato gerado está sincronizado com `src/` no momento da auditoria.
- Não há erros sintáticos/lint detectados por diagnóstico do editor.

---

## 4) Auditoria de promessas públicas (README/docs) vs implementação

### Itens aderentes

- Auto-wishlist da Discovery Queue: **implementado**.
- Filtro de cartas: **implementado**.
- Pular jogos possuídos: **implementado**.
- Loop com avanço e reinício de fila: **implementado**.
- Age gate bypass: **implementado** (com ressalva de robustez; ver riscos).
- Contadores e persistência básica: **implementado**.

### Itens com divergência (documentação promete mais que o código atual)

1. **Pause/Resume dedicado no painel**
   - Docs/README citam pausa/retomada.
   - Código tem apenas botões `Start` e `Stop` no painel.

2. **Process Once / Skip Item / Minimize**
   - Documentação cita esses controles.
   - Não há implementação desses botões na UI atual.

3. **Skip Non-Games completo (demos, soundtracks, vídeos)**
   - Docs descrevem filtro amplo.
   - Implementação atual detecta essencialmente DLC (`isDLC`) e não cobre todo o conjunto prometido.

4. **Update Checker funcional**
   - README/docos indicam verificação de atualização.
   - Não foi encontrado fluxo real de checagem periódica; há `@grant GM_xmlhttpRequest`, mas sem uso correspondente no `src/`.

5. **Comandos Tampermonkey descritos na doc não batem 1:1 com o código**
   - Docs listam comandos como Start/Pause/Stop e toggles adicionais.
   - Código registra apenas alguns toggles de configuração.

---

## 5) Inconsistências de versionamento/documentação

Foram encontradas inconsistências claras de versão entre artefatos:

- `package.json`: `2.3.0`
- `version.json`: `2.3.0`
- `src/config.js`: `2.3`
- metadata userscript em `src/main.js`: `2.2.0`
- badge do README: `2.2`

Impacto:

- Pode gerar confusão para usuário final sobre versão instalada.
- Dificulta suporte e rastreabilidade de bugs.

---

## 6) Riscos técnicos atuais

1. **Fragilidade a mudanças de layout da Steam**
   - Projeto depende de seletores CSS específicos.

2. **Sem testes automatizados**
   - Não há cobertura para validar regressões de fluxo principal.

3. **Detecção de cartas com componente textual localizável**
   - Parte da detecção usa string textual (“Cartas”), o que pode variar por idioma/contexto.

4. **Age bypass com risco de falso negativo em cenários de navegação**
   - A ordem do `step()` pode priorizar lógica de página geral antes do age gate em alguns contextos específicos.

---

## 7) Plano de ação recomendado (priorizado)

### P0 (corrigir imediatamente)

1. Unificar versão em todos os pontos (`package.json`, `version.json`, metadata e README badge).
2. Atualizar documentação para refletir exatamente o que existe hoje **ou** implementar os controles prometidos (Pause, Process Once, Skip Item, Minimize).
3. Definir oficialmente o escopo de “Skip Non-Games” e alinhar docs/código.

### P1 (estabilidade)

1. Adicionar smoke tests de fluxo principal (início, filtro, wishlist, avanço, reinício).
2. Melhorar fallback de seletores críticos (fila, wishlist, next, queue empty).
3. Fortalecer lógica de age gate para rodar antes da heurística de página geral quando necessário.

### P2 (produto)

1. Implementar update checker real (se desejado), com cooldown e aviso visual.
2. Melhorar UX do painel (minimizar, ação manual “processar uma vez”, pular item).

---

## 8) Conclusão final

Pela premissa original, o projeto está **funcional e majoritariamente aderente** ao fluxo prometido de automação da Discovery Queue com foco em jogos com cartas.

No entanto, em uma visão de produto completo, há **desalinhamento entre documentação e implementação real** em recursos de interface, filtros avançados e versionamento. O core funciona; o principal débito está em consistência de produto/documentação e robustez de manutenção.
