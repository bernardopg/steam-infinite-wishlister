# Guia de Deploy

## Processo de Build

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Construindo o Userscript

```bash
# Instalar dependências (primeira vez)
npm install

# Construir o userscript
npm run build
```

Isso concatena todos os arquivos fonte de `src/` em `SteamInfiniteWishlister.user.js` com o cabeçalho de metadados do Tampermonkey.

## Publicando no GitHub

### Release Manual

1. Atualize a versão em `src/config.js`:
   ```javascript
   CURRENT_VERSION: "2.1"  // Atualizar aqui
   ```

2. Construa o userscript:
   ```bash
   npm run build
   ```

3. Commit das mudanças:
   ```bash
   git add -A
   git commit -m "release: v2.1"
   git push
   ```

4. Crie um Release no GitHub:
   - Vá para repositório → Releases → Draft new release
   - Tag: `v2.1`
   - Título: `Steam Infinite Wishlister v2.1`
   - Anexe `SteamInfiniteWishlister.user.js`
   - Escreva changelog
   - Publique

### URL Raw para Instalação Direta

Após o push para a branch `main`, o script fica disponível em:

```
https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js
```

Esta URL é usada para instalação com um clique.

## Publicando no Greasy Fork

### Preparação

1. Verifique se o userscript tem metadados corretos:
   ```javascript
   // ==UserScript==
   // @name         Steam Infinite Wishlister
   // @namespace    https://github.com/bernardopg/steam-infinite-wishlister
   // @version      2.1
   // @description  Automatiza a Fila de Descobertas da Steam para adicionar jogos à wishlist
   // @description:pt-BR Automatiza a Fila de Descobertas da Steam para adicionar jogos à wishlist
   // @author       bernardopg
   // @license      MIT
   // @match        https://store.steampowered.com/*
   // @match        https://steamcommunity.com/*
   // @grant        GM_addStyle
   // @grant        GM_registerMenuCommand
   // @grant        GM_setValue
   // @grant        GM_getValue
   // @grant        GM_xmlhttpRequest
   // @connect      raw.githubusercontent.com
   // ==/UserScript==
   ```

2. Construa o script final:
   ```bash
   npm run build
   ```

### Passos

1. Acesse [Greasy Fork](https://greasyfork.org/)
2. Faça login com sua conta
3. Clique em **"Publish a script"**
4. Preencha:
   - **Nome do script:** Steam Infinite Wishlister
   - **Descrição:** Automatiza a Fila de Descobertas da Steam com filtros para wishlist
   - **Código:** Cole o conteúdo de `SteamInfiniteWishlister.user.js`
5. Configure informações adicionais:
   - **Versão:** Igual a `CURRENT_VERSION`
   - **Licença:** MIT
6. Clique em **"Submit script for review"**

### Atualizando no Greasy Fork

1. Acesse a página do seu script
2. Clique em **"Upload new version"**
3. Cole o código atualizado
4. Atualize número de versão e changelog
5. Envie

## Gerenciamento de Versões

### Esquema de Versões

Usa versionamento semântico: `MAJOR.MINOR.PATCH`

| Tipo | Quando Incrementar | Exemplo |
|------|-------------------|---------|
| MAJOR | Mudanças quebradoras | 1.0 → 2.0 |
| MINOR | Novas funcionalidades | 2.0 → 2.1 |
| PATCH | Correções de bugs | 2.1.0 → 2.1.1 |

### Verificador de Atualizações

O script verifica atualizações automaticamente:

- Busca `version.json` do GitHub
- Compara com `CONFIG.CURRENT_VERSION`
- Mostra notificação se houver atualização
- Verifica a cada 24 horas para evitar spam

### Criando version.json

```json
{
  "version": "2.1.0",
  "download_url": "https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js",
  "changelog": "Correções de bugs e melhorias"
}
```

Armazene na raiz do repositório ou no GitHub Pages.

## CI/CD (Opcional)

### Exemplo com GitHub Actions

Crie `.github/workflows/build.yml`:

```yaml
name: Build Userscript

on:
  push:
    branches: [ main ]
    paths:
      - 'src/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'chore: rebuild userscript'
          file_pattern: '*.user.js'
```

Isso reconstrói automaticamente o userscript quando arquivos fonte mudam.

## Testes Antes do Release

### Checklist

- [ ] Build completa sem erros
- [ ] Script instala via URL raw
- [ ] Painel aparece nas páginas da Steam
- [ ] Todos os botões funcionam
- [ ] Configurações persistem entre sessões
- [ ] Auto-Start funciona
- [ ] Auto-Restart funciona
- [ ] Todos os filtros funcionam
- [ ] Bypass de idade funciona
- [ ] Número de versão atualizado
- [ ] Changelog atualizado

### Testes por Navegador

Teste nos navegadores suportados:
- Chrome (mais recente)
- Firefox (mais recente)
- Edge (mais recente)

### Testes no Tampermonkey

- Verifique se comandos do menu funcionam
- Confirme que script está habilitado para domínios da Steam
- Verifique se cabeçalho de metadados está correto

## Solução de Problemas

### Build Falha

```bash
# Verificar versão do Node
node --version  # Deve ser 18+

# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Script Não Instala

- Verifique se URL raw está correta
- Confirme que Tampermonkey está habilitado
- Verifique se bloqueadores de anúncios não estão interferindo

### Rejeição no Greasy Fork

- Motivos comuns: código minificado ou ofuscado
- Solução: Envie código legível e não-minificado
- Verificação: Script não é duplicado

### Versão Não Atualiza

- Limpe cache do navegador
- Force atualização via Tampermonkey → Check for updates
- Verifique se `version.json` está acessível

## Checklist de Release

Antes de cada release:

1. [ ] Atualizar `CONFIG.CURRENT_VERSION` em `src/config.js`
2. [ ] Atualizar `@version` no cabeçalho do userscript
3. [ ] Atualizar changelog no README
4. [ ] Merge para branch `main`
5. [ ] Executar `npm run build`
6. [ ] Verificar se `SteamInfiniteWishlister.user.js` está correto
7. [ ] Commit das mudanças finais
8. [ ] Push para GitHub
9. [ ] Criar Release no GitHub
10. [ ] Atualizar no Greasy Fork
11. [ ] Atualizar `version.json`
12. [ ] Marcar issue/PR como resolvido

---

[← Voltar para Documentação](../README.md) | [← Arquitetura](arquitetura.md)