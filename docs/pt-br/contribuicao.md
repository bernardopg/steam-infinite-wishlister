# Guia de Contribuição

## Estrutura do Projeto

```
src/
  config.js
  state.js
  utils.js
  ui.js
  game.js
  wishlist.js
  queue.js
  ageSkip.js
  loop.js
  update.js
  main.js
scripts/
  build-userscript.mjs
tests/
  game.test.js
  queue.test.js
  loop.test.js
  update.test.js
```

## Setup Local

```bash
git clone https://github.com/bernardopg/steam-infinite-wishlister.git
cd steam-infinite-wishlister
npm install
```

## Comandos de Desenvolvimento

```bash
npm run build
npm run check
npm run test
npm run verify
```

`verify` = `check + test`.

## Notas de Build

- A ordem dos módulos está em `scripts/build-userscript.mjs` (`MODULE_ORDER`).
- `src/main.js` deve ser o último módulo (metadata é extraída dele).
- Saídas geradas:
  - `SteamInfiniteWishlister.user.js`
  - `steam-infinite-wishlister.js`

## Notas de Teste

- Testes usam Node test runner + jsdom.
- `tests/helpers/test-env.js` mocka DOM e APIs do Tampermonkey.
- Concorrência dos testes em `1` para evitar colisão de globais.

## Fluxo de Contribuição

1. Crie uma branch.
2. Implemente feature/correção.
3. Execute `npm run verify`.
4. Atualize docs EN/PT-BR se houve mudança de comportamento.
5. Faça commit com mensagem clara.

## Convenção de Commit

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `test:` atualização de testes
- `docs:` atualização de documentação
- `chore:` manutenção/tooling

## Boas Práticas

- Centralize seletores em `config.js`.
- Sempre adicione fallback de seletor/texto para mudanças de layout da Steam.
- Persista estado de usuário com `GM_getValue/GM_setValue`.
- Evite alterar arquivos gerados manualmente sem rodar build/check depois.

---

[Voltar para Docs](../README.md) | [Deploy](deploy.md)
