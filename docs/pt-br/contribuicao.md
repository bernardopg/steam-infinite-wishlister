# Guia de Contribuição

## Estrutura do Projeto

```
steam-infinite-wishlister/
├── src/
│   ├── config.js      # Configurações e constantes
│   ├── state.js       # Gerenciamento de estado global
│   ├── ui.js          # Interface do usuário
│   ├── game.js        # Detecção de tipo de jogo
│   ├── queue.js       # Navegação da fila
│   ├── loop.js        # Controlador do loop principal
│   ├── utils.js       # Funções utilitárias
│   └── main.js        # Ponto de entrada (inicialização)
├── scripts/
│   └── build-userscript.mjs  # Script de build
├── SteamInfiniteWishlister.user.js  # Userscript compilado (saída)
├── package.json       # Dependências e scripts
├── LICENSE            # Licença MIT
├── README.md          # Visão geral do projeto
└── docs/              # Documentação
    ├── README.md
    ├── en/
    └── pt-br/
```

## Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Extensão Tampermonkey (para testes)

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/bernardopg/steam-infinite-wishlister.git
cd steam-infinite-wishlister

# Instalar dependências
npm install
```

### Fluxo de Desenvolvimento

```bash
# Construir o userscript a partir dos módulos fonte
npm run build

# Modo watch (reconstruir ao mudar)
npm run watch
```

### Testes Manuais

1. Construa o userscript: `npm run build`
2. Abra o painel do Tampermonkey
3. Crie um novo script
4. Copie o conteúdo de `SteamInfiniteWishlister.user.js`
5. Salve e navegue até a Loja Steam
6. Verifique se o painel de controle aparece

## Sistema de Build

O projeto usa um processo simples de concatenação:

```
src/config.js
src/state.js
src/utils.js
src/game.js
src/queue.js
src/ui.js
src/loop.js
src/main.js
      ↓ (concat)
SteamInfiniteWishlister.user.js
```

### Script de Build

Localizado em `scripts/build-userscript.mjs`:

- Lê arquivos fonte em ordem
- Concatena com separadores
- Gera arquivo `.user.js` final
- Preserva cabeçalho de metadados do Tampermonkey

## Contribuindo

### Processo de Pull Request

1. Faça fork do repositório
2. Crie uma branch de feature (`git checkout -b feature/minha-feature`)
3. Faça suas mudanças
4. Teste completamente
5. Commit com mensagem descritiva
6. Push para seu fork
7. Abra um Pull Request

### Formato de Mensagem de Commit

```
tipo: descrição curta

Descrição mais longa se necessário

tipo: feat|fix|docs|style|refactor|test|chore
```

Exemplos:
- `feat: adicionar pausa entre itens da fila`
- `fix: corrigir seletor do botão de wishlist`
- `docs: atualizar diagrama de arquitetura`

### Nomenclatura de Branches

```
feature/adicionar-novo-filtro
fix/bug-navegacao-fila
docs/atualizar-readme
refactor/gerenciador-configuracoes
```

## Tarefas Comuns

### Adicionando um Novo Filtro

1. Adicione chave em `CONFIG.STORAGE_KEYS`
2. Inicialize em `State.settings`
3. Adicione checkbox em `UI.addControls()`
4. Adicione lógica em `QueueProcessor.processCurrentGameItem()`
5. Adicione comando de menu em `main.js`
6. Atualize esta documentação

### Alterando Seletores DOM

1. Edite `CONFIG.SELECTORS` em `config.js`
2. Teste nos layouts antigo e novo da Steam
3. Adicione seletores alternativos se necessário
4. Atualize documentação de seletores

### Modificando Timing

1. Edite `CONFIG.TIMING` em `config.js`
2. Teste com vários valores
3. Considere implicações anti-detecção
4. Documente a mudança

## Depuração

### Habilitar Log Verboso

```javascript
// No console ou modificando state
State.settings.logLevel = 2  // Modo verboso
```

### Problemas Comuns

| Problema | Causa Possível | Solução |
|----------|---------------|---------|
| Painel não aparece | Script não está rodando | Verifique Tampermonkey habilitado |
| Botões não respondem | DOM não pronto | Aumente delay inicial |
| Jogo errado detectado | Seletor desatualizado | Atualize CONFIG.SELECTORS |
| Fila não avança | Botão não encontrado | Adicione novos seletores ao array |
| Configurações não salvam | Limite de armazenamento | Verifique permissões GM_setValue |

## Dicas

1. **Sempre use Logger.log()** para depuração
2. **DOMCache** melhora performance - use!
3. **ErrorHandler.safeAsync()** para operações arriscadas
4. **State** é a fonte da verdade - consulte sempre
5. **UI.updateUI()** sincroniza tudo - chame após mudanças de estado
6. **CONFIG** centraliza tudo - prefira usar constantes

---

[← Voltar para Documentação](../README.md) | [Deploy →](deploy.md)