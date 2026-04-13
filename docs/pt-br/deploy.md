# Guia de Deploy

## Versionamento de Release

O projeto usa versionamento semântico: `MAJOR.MINOR.PATCH`.

Para esta linha de release:

- Versão do pacote: `2.4.0`
- Header userscript `@version`: `2.4.0`
- `version.json`: `2.4.0`

## Checklist de Release

1. Atualizar versão de forma consistente em:
   - `package.json`
   - `src/config.js`
   - metadata de `src/main.js`
   - `version.json`
   - badge de `README.md`
2. Executar validação completa:

```bash
npm install
npm run build
npm run check
npm run test
```

3. Confirmar artefatos gerados:
   - `SteamInfiniteWishlister.user.js`
   - `steam-infinite-wishlister.js`
4. Commit + push para `main`.
5. Criar tag `vX.Y.Z`.
6. Publicar GitHub Release com changelog.

## Comandos de Build/Sincronização

```bash
npm run build
npm run check
```

`check` falha se o artefato estiver fora de sincronia com `src/`.

## Fluxo de Release no GitHub

```bash
git add -A
git commit -m "release: v2.4.0"
git push origin main
git tag v2.4.0
git push origin v2.4.0
```

Se `gh` CLI estiver disponível/autenticado:

```bash
gh release create v2.4.0 \
  --title "Steam Infinite Wishlister v2.4.0" \
  --notes-file RELEASE_NOTES.md
```

## Contrato do Update Checker

Formato de `version.json`:

```json
{
  "version": "2.4.0",
  "updateUrl": "https://github.com/bernardopg/steam-infinite-wishlister/releases/latest"
}
```

O userscript consulta esse endpoint com cooldown de 24h e também permite verificação manual pelo menu do Tampermonkey.

## Publicação no Greasy Fork

1. Gere build atualizado.
2. Copie conteúdo de `SteamInfiniteWishlister.user.js`.
3. Suba nova versão no Greasy Fork.
4. Garanta que a versão coincide com a tag/release.

---

[Voltar para Docs](../README.md) | [Arquitetura](arquitetura.md)
