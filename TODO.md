# TODO - Steam Infinite Wishlister

> Última atualização: 2026-04-13
> Versão atual: 2.4.0

## Concluído na v2.4.0

- P0.1: Versionamento unificado entre `package.json`, `version.json`, metadata userscript e README.
- P0.2: Documentação EN/PT-BR sincronizada com implementação real.
- P0.3: Escopo oficial de `Skip Non-Games` definido e implementado (DLC, demo, soundtrack, video, software/tool).
- P1.1: Smoke tests automatizados adicionados (`tests/*.test.js`).
- P1.2: Seletores e fallbacks reforçados para fila e wishlist.
- P1.3: Lógica de age gate fortalecida e executada antes da heurística de contexto.
- P2.1: Update checker funcional com cooldown de 24h e indicador visual.
- P2.2: Painel atualizado com Pause, Process Once, Skip Item e Minimize.

## Pendências abertas

### Alta prioridade

1. Criar CI para rodar `npm run verify` em PRs.
2. Adicionar changelog formal por release (arquivo dedicado).

### Média prioridade

3. Expandir testes e2e em navegador real com páginas da Steam.
4. Melhorar heurísticas de non-game para reduzir casos limite em layouts novos.

### Baixa prioridade

5. Melhorar UX visual do painel (temas/compact mode).
6. Exportar/importar configurações do usuário.
