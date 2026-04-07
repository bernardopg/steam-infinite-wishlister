# Guia de Instalação

## Pré-requisitos

- Navegador compatível (Chrome, Firefox, Edge, Opera, etc.)
- Extensão de gerenciamento de userscripts instalada

## Passo a Passo

### 1. Instale o Gerenciador de Scripts

Escolha uma das opções:

| Gerenciador | Chrome | Firefox | Edge |
|-------------|--------|---------|------|
| [Tampermonkey](https://www.tampermonkey.net/) | ✅ | ✅ | ✅ |
| [Violentmonkey](https://violentmonkey.github.io/) | ✅ | ✅ | ✅ |
| [Greasemonkey](https://www.greasespot.net/) | ❌ | ✅ | ❌ |

**Recomendado:** Tampermonkey para melhor compatibilidade.

### 2. Instale o Script

**Opção A: Instalação Direta (Recomendado)**

[Clique aqui para instalar diretamente](https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js)

O Tampermonkey deve abrir automaticamente e solicitar a instalação.

**Opção B: Instalação Manual**

1. Copie o conteúdo de [`SteamInfiniteWishlister.user.js`](https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js)
2. Abra o painel do Tampermonkey
3. Crie um novo script
4. Cole o código
5. Salve (Ctrl+S)

### 3. Verifique a Instalação

1. Acesse a [Loja Steam](https://store.steampowered.com/)
2. Vá para a [Fila de Descobertas](https://store.steampowered.com/explore/)
3. Procure o painel flutuante no canto inferior direito

Se o painel aparecer, a instalação foi bem-sucedida! ✅

## Configuração

### Configuração Inicial

Na primeira vez que abrir o script, configure estas opções no painel:

| Configuração | Descrição | Recomendado |
|--------------|-----------|:-----------:|
| **Auto-Start** | Iniciar processamento automaticamente ao carregar | ✅ |
| **Auto-Restart** | Gerar nova fila quando a atual terminar | ✅ |
| **Exigir Cartas** | Apenas jogos com cartas colecionáveis | ✅ |
| **Pular Possuídos** | Pular jogos que você já tem | ✅ |
| **Pular Não-Jogos** | Pular DLCs, demos, trilhas sonoras, etc. | ✅ |

### Salvando Configurações

Todas as configurações são salvas automaticamente entre sessões.

## Solução de Problemas

### Painel Não Aparece

1. Atualize a página (F5)
2. Verifique se o Tampermonkey está habilitado
3. Verifique se o script está ativo para o domínio da Steam
4. Abra o console do navegador (F12) e procure erros

### Script Não Funciona

1. Verifique se está em uma página suportada
2. Confirme que a fila carregou
3. Desative scripts conflitantes
4. Atualize para a última versão

### Problemas com Verificação de Idade

O script ignora automaticamente verificações de idade. Se falhar:
1. Clique manualmente em "Ver página" na verificação
2. O script deve continuar no próximo item

## Páginas Suportadas

| Tipo de Página | URL | Recursos |
|----------------|-----|----------|
| Páginas de Jogos | `store.steampowered.com/app/*` | Wishlist, Fila |
| Fila de Descobertas | `store.steampowered.com/explore*` | Automação Completa |
| Curadores | `store.steampowered.com/curator/*` | Navegação da Fila |
| Comunidade | `steamcommunity.com/*` | Ignorar Idade |

## Permissões

O script solicita estas permissões do Tampermonkey:

| Permissão | Propósito |
|-----------|-----------|
| `GM_addStyle` | Injetar CSS no painel de controle |
| `GM_registerMenuCommand` | Adicionar comandos ao menu do Tampermonkey |
| `GM_setValue` / `GM_getValue` | Salvar e carregar configurações |
| `GM_xmlhttpRequest` | Verificar atualizações do script |

---

[← Voltar para Documentação](../README.md) | [Guia do Usuário →](guia-usuario.md)