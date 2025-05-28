<!-- filepath: /home/bitter/dev/Scripts/steam-infinite-wishlister/README.md -->

# Steam Infinite Wishlister v2.0

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Tampermonkey](https://img.shields.io/badge/Userscript-Tampermonkey-brightgreen.svg)](https://www.tampermonkey.net/)

---

## 🌐 English | 🇧🇷 Português

<details>
<summary><strong>English</strong></summary>

## Overview

**Steam Infinite Wishlister** is an advanced userscript for automating the Steam Discovery Queue wishlisting process. It features powerful filtering, queue automation, age gate bypass, a modern control panel, and robust compatibility with Steam's ever-changing layout.

---

## Features

- **Auto-Wishlist**: Adds items from the Discovery Queue to your wishlist automatically.
- **Powerful Filtering**:
  - ✅ Require Trading Cards
  - ✅ Skip Owned Games
  - ✅ Skip Non-Games (DLC, Soundtracks, Demos, Videos, Apps, etc.)
- **Queue Automation**: Advances queue, auto-generates new queue when finished.
- **Age Gate Bypass**: Handles Steam's age verification automatically.
- **Enhanced UI Panel**: Floating panel with Start/Pause/Stop, manual controls, session counter, minimize, status, and instant config toggles.
- **Version Check**: Notifies you if a new version is available.
- **Robustness**: Works across different Steam layouts and languages.
- **Tampermonkey Menu Integration**: All controls also available via the extension menu.

---

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or Violentmonkey/Greasemonkey) for your browser.
2. [Install the script](https://raw.githubusercontent.com/bernardopg/steam-wishlist-looper/main/SteamInfiniteWishlister.user.js) (or copy the code from `.user.js` to a new script).
3. Visit the [Steam Store](https://store.steampowered.com/) or [Discovery Queue](https://store.steampowered.com/explore/) to see the UI panel.

---

## Usage

- The control panel appears in the bottom-right on supported Steam pages.
- **Start/Resume**: Begin or resume automation.
- **Pause**: Pauses after current item.
- **Stop**: Halts automation and disables auto features.
- **Process Once**: Manually process the current item.
- **Skip Item**: Manually skip the current item.
- **Checkboxes**: Toggle filters and automation instantly.
- **Session Counter**: Shows how many items were wishlisted this session.
- **Status**: Displays current activity.
- **Minimize**: Collapse/expand the panel.
- **Version**: Shows current version and update status.
- **Tampermonkey Menu**: All controls also available via the extension icon.

---

## Configuration

All options are available in the UI panel and Tampermonkey menu:
- **Automation**: Auto-Start, Auto-Restart Queue
- **Filtering**: Require Cards, Skip Owned, Skip Non-Games
- **UI**: Minimize toggle

Settings are saved automatically.

---

## Supported Pages

- Steam game/app pages (`store.steampowered.com/app/*`)
- Discovery Queue (`store.steampowered.com/explore*`)
- Curator pages (`store.steampowered.com/curator/*`)
- Steam Community (`steamcommunity.com/*`) (for age gate bypass)

---

## Permissions

This script requires the following Tampermonkey permissions:
- `GM_addStyle`: Inject CSS for the UI panel.
- `GM_registerMenuCommand`: Add controls to the Tampermonkey menu.
- `GM_setValue` / `GM_getValue`: Save/load your settings.
- `GM_xmlhttpRequest`: Check for script updates.

---

## License

[MIT License](./LICENSE)

---

## Credits

- Script by [bernardopg](https://github.com/bernardopg)
- Inspired by the Steam community and card collectors!

---

**Disclaimer:** This script interacts with the Steam website programmatically. Use responsibly. Not affiliated with Valve/Steam. Use at your own risk. Steam updates may break functionality.

</details>

---

<details open>
<summary><strong>Português (Brasil)</strong></summary>

## Visão Geral

**Steam Infinite Wishlister** é um userscript avançado para automatizar o processo de adicionar jogos à sua lista de desejos na Discovery Queue da Steam. Possui filtros poderosos, automação de fila, bypass de verificação de idade, painel de controle moderno e alta compatibilidade com diferentes layouts da Steam.

---

## Funcionalidades

- **Auto-Wishlist**: Adiciona itens da Discovery Queue à sua lista de desejos automaticamente.
- **Filtros Avançados**:
  - ✅ Exigir Cartas Colecionáveis
  - ✅ Pular Jogos Já Possuídos
  - ✅ Pular Não-Jogos (DLC, Trilhas Sonoras, Demos, Vídeos, Apps, etc.)
- **Automação de Fila**: Avança a fila e gera nova automaticamente ao terminar.
- **Bypass de Idade**: Lida automaticamente com a verificação de idade da Steam.
- **Painel de Controle**: Painel flutuante com Iniciar/Pausar/Parar, controles manuais, contador de sessão, minimizar, status e opções instantâneas.
- **Verificação de Versão**: Notifica se há nova versão disponível.
- **Robustez**: Funciona em diferentes layouts e idiomas da Steam.
- **Menu Tampermonkey**: Todos os controles também disponíveis pelo menu da extensão.

---

## Instalação

1. Instale o [Tampermonkey](https://www.tampermonkey.net/) (ou Violentmonkey/Greasemonkey) no seu navegador.
2. [Instale o script](https://raw.githubusercontent.com/bernardopg/steam-wishlist-looper/main/SteamInfiniteWishlister.user.js) (ou copie o código do `.user.js` para um novo script).
3. Acesse a [Steam Store](https://store.steampowered.com/) ou a [Discovery Queue](https://store.steampowered.com/explore/) para ver o painel.

---

## Como Usar

- O painel aparece no canto inferior direito das páginas suportadas.
- **Iniciar/Retomar**: Começa ou retoma a automação.
- **Pausar**: Pausa após o item atual.
- **Parar**: Interrompe a automação e desativa recursos automáticos.
- **Processar Uma Vez**: Processa manualmente o item atual.
- **Pular Item**: Pula manualmente o item atual.
- **Caixas de Opção**: Ative/desative filtros e automação instantaneamente.
- **Contador de Sessão**: Mostra quantos itens foram adicionados nesta sessão.
- **Status**: Exibe a atividade atual.
- **Minimizar**: Minimiza/expande o painel.
- **Versão**: Mostra a versão atual e status de atualização.
- **Menu Tampermonkey**: Todos os controles também disponíveis pelo ícone da extensão.

---

## Configuração

Todas as opções estão disponíveis no painel e no menu do Tampermonkey:
- **Automação**: Auto-Iniciar, Auto-Reiniciar Fila
- **Filtros**: Exigir Cartas, Pular Possuídos, Pular Não-Jogos
- **UI**: Minimizar painel

As configurações são salvas automaticamente.

---

## Páginas Suportadas

- Páginas de jogos/apps da Steam (`store.steampowered.com/app/*`)
- Discovery Queue (`store.steampowered.com/explore*`)
- Curator (`store.steampowered.com/curator/*`)
- Steam Community (`steamcommunity.com/*`) (para bypass de idade)

---

## Permissões

Este script requer as seguintes permissões do Tampermonkey:
- `GM_addStyle`: Injeta CSS do painel.
- `GM_registerMenuCommand`: Adiciona controles ao menu do Tampermonkey.
- `GM_setValue` / `GM_getValue`: Salva/carrega suas configurações.
- `GM_xmlhttpRequest`: Verifica atualizações do script.

---

## Licença

[MIT License](./LICENSE)

---

## Créditos

- Script por [bernardopg](https://github.com/bernardopg)
- Inspirado pela comunidade Steam e colecionadores de cartas!

---

**Aviso:** Este script interage programaticamente com o site da Steam. Use com responsabilidade. Não é afiliado à Valve/Steam. Use por sua conta e risco. Mudanças na Steam podem quebrar o funcionamento.

</details>
