# Deployment

## Fonte canonica publicada

- Source atual publicada: `steam-infinite-wishlister.js`
- Artefato instalavel/versionado: `SteamInfiniteWishlister.user.js`

## Build

```bash
npm run build
```

Isso atualiza `SteamInfiniteWishlister.user.js` a partir de `steam-infinite-wishlister.js`.

Para validar que o artefato committed esta sincronizado:

```bash
npm run check
```

## GitHub -> Tampermonkey

URL canonica de instalacao direta pelo GitHub Raw:

```text
https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js
```

O metadata do userscript ja aponta `@updateURL` e `@downloadURL` para essa URL.

Fluxo recomendado:

1. Editar `steam-infinite-wishlister.js`
2. Rodar `npm run build`
3. Commitar `steam-infinite-wishlister.js` e `SteamInfiniteWishlister.user.js`
4. Push para `main`
5. Reinstalar ou atualizar via Tampermonkey usando a URL raw acima

## GitHub -> Greasy Fork

No Greasy Fork, configure o script para sincronizar por URL com:

```text
https://raw.githubusercontent.com/bernardopg/steam-infinite-wishlister/main/SteamInfiniteWishlister.user.js
```

Depois configure um webhook `push` no GitHub apontando para o endpoint fornecido pelo Greasy Fork.

Importante:

- Nao commite o secret do webhook no repositorio.
- Guarde o secret apenas na configuracao do GitHub e no Greasy Fork.
- O repositorio deve sempre manter `SteamInfiniteWishlister.user.js` atualizado para que o sync funcione.
