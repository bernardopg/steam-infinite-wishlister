# TODO - Retomada do desenvolvimento

## P0 - Corrigir base de distribuicao e execucao

- [ ] Definir qual arquivo e a fonte canonica do projeto: `steam-infinite-wishlister.js` ou a versao modular em `src/`.
- [ ] Criar processo de build para gerar um unico userscript instalavel `.user.js`.
- [ ] Garantir que o artefato gerado funcione no Tampermonkey sem `import` nativo entre arquivos locais.
- [ ] Adicionar `package.json` com scripts minimos de build, lint e validacao.
- [ ] Publicar ou passar a gerar o arquivo referenciado no README (`SteamInfiniteWishlister.user.js`) ou corrigir a documentacao para o nome real.
- [ ] Alinhar metadados do userscript (`@name`, `@version`, `@match`, `@grant`) com a funcionalidade real entregue.

## P0 - Recuperar funcionalidades perdidas no refactor modular

- [ ] Restaurar bypass de age gate da Steam.
- [ ] Restaurar suporte a paginas `curator` e `steamcommunity`, se ainda fizer parte do escopo.
- [ ] Restaurar auto-restart da Discovery Queue ao fim da fila.
- [ ] Restaurar pausa, resume, processamento manual de um item e "pular item".
- [ ] Restaurar integracao com menu do Tampermonkey (`GM_registerMenuCommand`).
- [ ] Restaurar verificacao de atualizacao de versao, ou remover esse recurso da documentacao.
- [ ] Restaurar filtro de "nao-jogos" completo; hoje o modular cobre apenas DLC e deixa de fora demos, soundtracks, apps, videos e afins.
- [ ] Restaurar contadores e estado de sessao com a mesma abrangencia documentada.

## P1 - Corrigir comportamento funcional e robustez

- [ ] Impedir que o contador de wishlist incremente quando o item ja estava na wishlist antes da execucao.
- [ ] Confirmar sucesso real apos clique de wishlist antes de contar como adicionado.
- [ ] Diferenciar claramente "ja estava na wishlist" de "foi adicionado agora".
- [ ] Fortalecer deteccao de fim de fila, inicio de nova fila e navegacao para o proximo item.
- [ ] Adicionar fallbacks de seletor para layout novo da Steam, reaproveitando o que ja existe no script monolitico.
- [ ] Evitar loops silenciosos quando nenhum botao valido e encontrado.
- [ ] Melhorar logs e estados de erro para facilitar diagnostico em producao.

## P1 - Documentacao e consistencia do repositorio

- [ ] Atualizar README para refletir exatamente o que a versao atual entrega.
- [ ] Remover promessas de recursos que nao existem mais no modular ou recoloca-los antes de anunciar.
- [ ] Revisar `ARCHITECTURE.md` para corresponder ao codigo atual, ou marcar claramente que descreve a versao monolitica legada.
- [ ] Revisar `MODULAR-README.md` para remover exemplos que nao existem na implementacao atual.
- [ ] Documentar fluxo de desenvolvimento local: editar, gerar bundle, testar no Tampermonkey e publicar.

## P1 - Validacao minima antes de voltar a evoluir features

- [ ] Criar checklist manual de smoke test para os cenarios principais.
- [ ] Adicionar pelo menos testes unitarios para regras puras: filtros, interpretacao de estado e seletores/fallbacks.
- [ ] Validar comportamento em paginas com fila ativa, fila vazia, item ja possuido, item sem cartas e item ja wishlisted.
- [ ] Testar persistencia de configuracoes entre reloads e navegacao.

## P2 - Limpeza arquitetural

- [ ] Eliminar duplicacao entre `steam-infinite-wishlister.js`, `loop_simples_completo.js` e `src/`, mantendo apenas o necessario.
- [ ] Extrair um `SettingsManager` simples para padronizar leitura e escrita de configuracoes.
- [ ] Separar claramente regras de negocio, acesso ao DOM e camada de UI.
- [ ] Centralizar seletores e motivos de skip em estruturas mais faceis de manter.
- [ ] Criar estrategia de versao unica para codigo, README e metadata do userscript.

## P2 - Melhorias futuras apos estabilizacao

- [ ] Adicionar filtro configuravel para demos, soundtracks, videos e software separadamente.
- [ ] Adicionar niveis de log configuraveis pela UI.
- [ ] Adicionar exportacao/importacao de configuracoes.
- [ ] Melhorar a UI com estados mais claros de processamento, pausa e erro.
- [ ] Avaliar telemetria local opcional de sessao apenas para debug manual.

## Ordem recomendada de retomada

1. Escolher a base canonica e montar build instalavel.
2. Restaurar os recursos criticos perdidos no modular.
3. Corrigir contagem e confirmacao de wishlist.
4. Atualizar documentacao para o estado real do projeto.
5. Criar validacao minima para nao quebrar a retomada.
