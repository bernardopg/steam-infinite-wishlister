# Guia do Usuário

## Visão Geral do Painel

O painel flutuante exibe:

- Status da execução
- Contadores persistentes (`adicionados` e `pulados`)
- Indicador de versão/atualização
- Controles manuais
- Configurações em tempo real

## Botões

| Botão | Comportamento |
|---|---|
| `Start` | Inicia ou retoma o loop |
| `Pause` | Pausa a execução |
| `Stop` | Encerra a execução |
| `Process Once` | Processa apenas o item atual |
| `Skip Item` | Avança manualmente e incrementa pulados |
| `_` | Minimiza o painel |

## Configurações

| Configuração | Efeito |
|---|---|
| `Auto-Start` | Inicia automaticamente após carregar a página |
| `Auto-Restart Queue` | Reinicia a fila quando ela termina |
| `Require Cards` | Pula itens sem cartas colecionáveis |
| `Skip Owned` | Pula jogos já presentes na biblioteca |
| `Skip Non-Games` | Pula DLC, demo, trilha sonora, vídeo e software/ferramenta |
| `Age Skip` | Tenta ignorar automaticamente o age gate |

## Fluxo de Processamento

A cada ciclo, o script faz:

1. Detecta e tenta bypass de age gate (se ativo).
2. Garante contexto da fila.
3. Detecta fila vazia.
4. Avalia filtros.
5. Adiciona na wishlist (com retry e confirmação) ou pula.
6. Avança para o próximo item.

## Escopo do Filtro `Skip Non-Games`

O filtro cobre:

- DLC
- Demo
- Trilha sonora
- Vídeo
- Software/Ferramenta

A detecção usa estratégia seletor-primeiro com fallback textual em áreas conhecidas da página.

## Atalhos de Teclado

| Atalho | Ação |
|---|---|
| `Ctrl+Shift+S` | Start/Resume |
| `Ctrl+Shift+P` | Pause |
| `Ctrl+Shift+X` | Stop |
| `Ctrl+Shift+O` | Process Once |
| `Ctrl+Shift+N` | Skip Item |
| `Esc` | Stop |

## Comandos do Menu Tampermonkey

Inclui:

- Start, Pause, Stop
- Process Once, Skip Item
- Toggle de configurações
- Check updates now

## Update Checker

- Usa `version.json` do repositório.
- Cooldown de 24h (`UPDATE_CHECK_COOLDOWN_MS`).
- Pode ser executado manualmente via menu.
- Indicador de versão no painel destaca quando existe versão nova.

## Solução de Problemas

### Fila não reinicia

Confira se `Auto-Restart Queue` está habilitado.

### Travado no age gate

Mantenha `Age Skip` habilitado, ou confirme manualmente uma vez.

### Classificação incorreta de tipo de item

Desative `Skip Non-Games` temporariamente e abra issue com URL + screenshot.

---

[Voltar para Docs](../README.md) | [Arquitetura](arquitetura.md)
