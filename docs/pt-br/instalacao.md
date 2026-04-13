# Guia de Instalação

## Requisitos

- Navegador com suporte a userscript (Chrome, Edge, Firefox, Opera).
- Tampermonkey (recomendado).

## Instalar

### Opção A: instalação direta

[Instalar via URL raw](https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js)

### Opção B: instalação manual

1. Abra o painel do Tampermonkey.
2. Crie um novo script.
3. Cole o conteúdo de `SteamInfiniteWishlister.user.js`.
4. Salve.

## Checklist do Primeiro Uso

1. Acesse a [Fila de Descobertas](https://store.steampowered.com/explore/).
2. Confirme se o painel flutuante aparece no canto inferior direito.
3. Ajuste as opções:
   - Auto-Start
   - Auto-Restart Queue
   - Require Cards
   - Skip Owned
   - Skip Non-Games
   - Age Skip
4. Clique em `Start`.

## URLs Suportadas

| Escopo | Padrão |
|---|---|
| Páginas de app Steam | `*://store.steampowered.com/app/*` |
| Fila de Descobertas | `*://store.steampowered.com/explore*` |
| Curadores | `*://store.steampowered.com/curator/*` |
| Comunidade Steam | `*://steamcommunity.com/*` |

## Permissões Necessárias

| Permissão | Uso |
|---|---|
| `GM_addStyle` | Estilo do painel |
| `GM_registerMenuCommand` | Ações rápidas no Tampermonkey |
| `GM_getValue` / `GM_setValue` | Persistência de configurações e contadores |
| `GM_xmlhttpRequest` | Verificação de versão (`version.json`) |

## Solução de Problemas

### Painel não aparece

1. Atualize a página.
2. Verifique se o script está habilitado no Tampermonkey.
3. Confirme que a URL está em um padrão suportado.

### Fila não avança

1. Confirme que a fila da Steam está realmente aberta.
2. Mantenha a aba ativa durante a validação inicial.
3. Desative scripts/extensões conflitantes temporariamente.

### Age gate bloqueado

1. Mantenha `Age Skip` ativado.
2. Se a Steam mudar layout, confirme manualmente uma vez e continue.

---

[Voltar para Docs](../README.md) | [Guia do Usuário](guia-usuario.md)
