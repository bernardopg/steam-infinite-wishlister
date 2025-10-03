# Steam Infinite Wishlister v2.1 🚀

[![Versão](https://img.shields.io/badge/versão-2.1-orange.svg)](https://github.com/bernardopg/steam-wishlist-looper)
[![Licença](https://img.shields.io/badge/licença-MIT-blue.svg)](./LICENSE)
[![Tampermonkey](https://img.shields.io/badge/compatível-Tampermonkey-orange.svg)](https://www.tampermonkey.net/)

Transforme sua experiência na Steam com o **Steam Infinite Wishlister**, a ferramenta definitiva para automatizar e personalizar sua lista de desejos diretamente da Fila de Descobertas da Steam. Com filtros poderosos, automação inteligente e uma interface moderna, adicionar jogos à sua lista nunca foi tão fácil e eficiente! 🎮

![Steam Logo](https://store.steampowered.com/favicon.ico)

## 🌐 English | 🇧🇷 Português

<details open>
<summary><strong>Português (Brasil)</strong></summary>

## 📚 Documentação

- **[Guia de Arquitetura](ARCHITECTURE.md)** - Documentação completa da estrutura modular, fluxos de execução e guia de manutenção do código

## Por que usar o Steam Infinite Wishlister? 💡

- **Economize Tempo**: Automatize a adição de jogos à sua lista de desejos com base em critérios personalizados.
- **Controle Total**: Filtre jogos por cartas colecionáveis, ignore jogos já possuídos ou não-jogos como DLCs e demos.
- **Experiência Sem Interrupções**: Supere verificações de idade e avance automaticamente na fila de descobertas.
- **Interface Intuitiva**: Um painel de controle flutuante que combina funcionalidade com design moderno.

## Recursos Destaques 🌟

- **Auto-Wishlist**: Adiciona itens da Fila de Descobertas à sua lista de desejos com base nas suas regras. ✅
- **Filtros Avançados**:
  - 🎴 **Exigir Cartas Colecionáveis**: Apenas jogos com Steam Trading Cards.
  - 🚫 **Ignorar Jogos Possuídos**: Pula automaticamente jogos que você já tem.
  - 🛠️ **Ignorar Não-Jogos**: Exclui DLCs, trilhas sonoras, demos e aplicativos.
- **Automação da Fila**:
  - ⏩ Avança automaticamente para o próximo item.
  - 🔄 Gera e inicia uma nova fila ao finalizar a atual (opcional).
- **Desvio de Verificação de Idade**: Lida automaticamente com prompts de conteúdo maduro. 🔞
- **Painel de Controle Moderno**:
  - ▶️ **Iniciar/Pausar/Retomar/Parar**: Controle total sobre a automação.
  - 🖱️ **Controles Manuais**: "Processar Uma Vez" ou "Pular Item" quando a automação está pausada.
  - 📊 **Contador de Sessão**: Mostra quantos itens foram adicionados na sessão atual.
  - ➖ **Minimizar**: Recolha o painel para mais espaço na tela.
  - ℹ️ **Status Detalhado**: Exibe o estado atual (Executando, Pausado, Adicionando, etc.).
  - ⚙️ **Configurações Rápidas**: Ative/desative filtros e automações diretamente no painel.
  - 🔔 **Notificação de Atualização**: Saiba se há uma nova versão disponível.
- **Robustez**: Lógica aprimorada para funcionar em diferentes layouts de página da Steam. 🛡️
- **Integração com Tampermonkey**: Acesse controles e configurações pelo menu da extensão. 🔧

## Instalação 🛠️

1. Instale o **[Tampermonkey](https://www.tampermonkey.net/)** (ou outro gerenciador de userscripts compatível como Violentmonkey ou Greasemonkey) no seu navegador (Chrome, Firefox, Edge, Opera, etc.).
2. **[Clique aqui para instalar o script](https://raw.githubusercontent.com/bernardopg/steam-wishlist-looper/main/SteamInfiniteWishlister.user.js)** (ou copie o código do arquivo `.user.js` e cole em um novo script no Tampermonkey).
3. Visite a [Loja Steam](https://store.steampowered.com/), especialmente a [Fila de Descobertas](https://store.steampowered.com/explore/) ou qualquer página de jogo (`/app/...`), para ver o painel da ferramenta.

## Como Usar 🎮

- **Painel de Controle**: Um painel flutuante aparece no canto inferior direito em páginas suportadas da Steam.
  - **Iniciar/Retomar**: Começa ou retoma o loop de automação. ▶️
  - **Pausar**: Pausa a automação, finalizando o processamento do item atual. ⏸️
  - **Parar**: Interrompe o script e desativa Início/Reinício Automático por padrão. ⏹️
  - **Processar Uma Vez**: Avalia manualmente o item atual (adicionar/pular) sem iniciar o loop. 🖱️
  - **Pular Item**: Avança manualmente para o próximo item sem avaliação. ➡️
  - **Opções**: Ative/desative filtros e automações com caixas de seleção. ⚙️
  - **(X Adicionados)**: Mostra quantos itens foram adicionados nesta sessão. 📈
  - **Status**: Exibe a atividade atual do script. ℹ️
  - **▬ / □**: Minimiza ou restaura o painel de controle. ➖
  - **vX.X**: Mostra a versão do script e indica se há atualizações. 🔔
- **Menu Tampermonkey**: Clique no ícone do Tampermonkey na barra de ferramentas do navegador para acessar comandos de Iniciar/Pausar/Parar e alternar configurações. Útil se o painel interferir em algo ou se preferir acesso por menu. 🔧

## Como Funciona 🔍

1. O script é ativado em páginas suportadas da loja e comunidade Steam.
2. Ele tenta automaticamente contornar **verificações de idade** usando cookies e métodos de execução de script.
3. Em páginas da Fila de Descobertas (ou páginas de aplicativos no contexto de uma fila):
   - Se **Início Automático** estiver ativado, o loop começa.
   - O script verifica o item atual contra seus filtros (Possuído? Não-Jogo? Sem Cartas?).
   - Verifica se o item já está na sua lista de desejos.
   - Se passar nos filtros e não estiver na lista, clica em **Adicionar à Lista de Desejos** e incrementa o contador.
   - Se o loop estiver ativo, clica automaticamente em **Próximo na Fila**.
   - Se a fila terminar e **Reinício Automático** estiver ativado, tenta gerar e iniciar uma nova fila.

## Configuração ⚙️

Todas as configurações são feitas via caixas de seleção no painel ou alternâncias no menu do Tampermonkey:

- **Automação**: `Início Automático`, `Reinício Automático da Fila`
- **Filtros**: `Exigir Cartas`, `Ignorar Possuídos`, `Ignorar Não-Jogos`
- **Interface**: Alternância de minimizar

As configurações são salvas automaticamente ao serem alteradas.

## Páginas Suportadas 📍

O script funciona em:

- Páginas de jogos/aplicativos Steam (`store.steampowered.com/app/*`)
- Páginas da Fila de Descobertas (`store.steampowered.com/explore*`)
- Páginas de Curadores Steam (`store.steampowered.com/curator/*`)
- Páginas da Comunidade Steam (`steamcommunity.com/*`) (principalmente para desvio de verificação de idade)

## Novidades na v2.1 🆕

- Compatibilidade melhorada com as últimas mudanças de layout da Steam.
- Detecção aprimorada de cartas de jogos, DLCs e jogos já possuídos.
- Tempos otimizados para melhor desempenho e confiabilidade.
- Bypass de verificação de idade aprimorado.
- Tratamento de erros mais robusto.
- Seletores DOM expandidos para melhor compatibilidade.
- Várias pequenas melhorias e correções de bugs.

## Permissões 🔐

Este script requer as seguintes permissões do Tampermonkey (`@grant`):

- `GM_addStyle`: Para injetar CSS no painel de interface.
- `GM_registerMenuCommand`: Para adicionar controles ao menu do Tampermonkey.
- `GM_setValue` / `GM_getValue`: Para salvar e carregar suas configurações.
- `GM_xmlhttpRequest`: Para verificar atualizações do script.

## Licença 📜

[MIT License](./LICENSE)

## Créditos 👏

- Desenvolvido por [bernardopg](https://github.com/bernardopg)
- Inspirado pela comunidade Steam, necessidades de automação da fila de descobertas e colecionadores de cartas!

---

**Nota:** Este script interage programaticamente com o site da Steam. Embora projetado para imitar ações do usuário, use-o com responsabilidade. Não é afiliado ou endossado pela Valve ou Steam. Use por sua conta e risco. Alterações no site da Steam podem afetar a funcionalidade do script.

</details>

<details>
<summary><strong>English</strong></summary>

## Why Use Steam Infinite Wishlister? 💡

- **Save Time**: Automate adding games to your wishlist based on custom criteria.
- **Total Control**: Filter games by trading cards, skip owned games or non-games like DLCs and demos.
- **Seamless Experience**: Bypass age checks and automatically advance through the discovery queue.
- **Intuitive Interface**: A floating control panel that blends functionality with modern design.

## Key Features 🌟

- **Auto-Wishlist**: Adds items from the Discovery Queue to your wishlist based on your rules. ✅
- **Advanced Filters**:
  - 🎴 **Require Trading Cards**: Only games with Steam Trading Cards.
  - 🚫 **Skip Owned Games**: Automatically skips games you already own.
  - 🛠️ **Skip Non-Games**: Excludes DLCs, soundtracks, demos, and apps.
- **Queue Automation**:
  - ⏩ Automatically advances to the next item.
  - 🔄 Generates and starts a new queue when the current one ends (optional).
- **Age Gate Bypass**: Automatically handles mature content prompts. 🔞
- **Modern Control Panel**:
  - ▶️ **Start/Pause/Resume/Stop**: Full control over automation.
  - 🖱️ **Manual Controls**: "Process Once" or "Skip Item" when automation is paused.
  - 📊 **Session Counter**: Shows how many items were added in the current session.
  - ➖ **Minimize**: Collapse the panel for more screen space.
  - ℹ️ **Detailed Status**: Displays current state (Running, Paused, Adding, etc.).
  - ⚙️ **Quick Settings**: Toggle filters and automations directly from the panel.
  - 🔔 **Update Notification**: Know if a new version is available.
- **Robustness**: Enhanced logic to work across different Steam page layouts. 🛡️
- **Tampermonkey Integration**: Access controls and settings via the extension menu. 🔧

## Installation 🛠️

1. Install **[Tampermonkey](https://www.tampermonkey.net/)** (or another compatible userscript manager like Violentmonkey or Greasemonkey) on your browser (Chrome, Firefox, Edge, Opera, etc.).
2. **[Click here to install the script](https://raw.githubusercontent.com/bernardopg/steam-wishlist-looper/main/SteamInfiniteWishlister.user.js)** (or copy the code from the `.user.js` file and paste it into a new Tampermonkey script).
3. Visit the [Steam Store](https://store.steampowered.com/), especially the [Discovery Queue](https://store.steampowered.com/explore/) or any game page (`/app/...`), to see the tool's panel.

## How to Use 🎮

- **Control Panel**: A floating panel appears in the bottom-right on supported Steam pages.
  - **Start/Resume**: Begins or resumes the automation loop. ▶️
  - **Pause**: Pauses the automation, finishing the current item processing. ⏸️
  - **Stop**: Halts the script and disables Auto-Start/Auto-Restart by default. ⏹️
  - **Process Once**: Manually evaluates the current item (add/skip) without starting the loop. 🖱️
  - **Skip Item**: Manually advances to the next item without evaluation. ➡️
  - **Options**: Toggle filters and automations with checkboxes. ⚙️
  - **(X Added)**: Shows how many items were added this session. 📈
  - **Status**: Displays the script's current activity. ℹ️
  - **▬ / □**: Minimizes or restores the control panel. ➖
  - **vX.X**: Shows the script version and indicates if updates are available. 🔔
- **Tampermonkey Menu**: Click the Tampermonkey icon in your browser toolbar to access Start/Pause/Stop commands and toggle settings. Useful if the panel interferes or if you prefer menu access. 🔧

## How It Works 🔍

1. The script activates on supported Steam store and community pages.
2. It automatically attempts to bypass **age verification** using cookies and script execution methods.
3. On Discovery Queue pages (or app pages within a queue context):
   - If **Auto-Start** is enabled, the loop begins.
   - The script checks the current item against your filters (Owned? Non-Game? No Cards?).
   - It checks if the item is already on your wishlist.
   - If it passes filters and isn't wishlisted, it clicks **Add to Wishlist** and increments the counter.
   - If the loop is active, it automatically clicks **Next in Queue**.
   - If the queue ends and **Auto-Restart** is enabled, it tries to generate and start a new queue.

## Configuration ⚙️

All configurations are done via checkboxes in the panel or toggles in the Tampermonkey menu:

- **Automation**: `Auto-Start`, `Auto-Restart Queue`
- **Filters**: `Require Cards`, `Skip Owned`, `Skip Non-Games`
- **Interface**: Minimize toggle

Settings are saved automatically upon change.

## Supported Pages 📍

The script works on:

- Steam game/app pages (`store.steampowered.com/app/*`)
- Discovery Queue pages (`store.steampowered.com/explore*`)
- Steam Curator pages (`store.steampowered.com/curator/*`)
- Steam Community pages (`steamcommunity.com/*`) (mainly for age gate bypass)

## What's New in v2.1 🆕

- Improved compatibility with Steam's latest UI layout changes.
- Enhanced detection of game cards, DLCs, and owned games.
- Optimized timing for better performance and reliability.
- Improved age verification bypass.
- More robust error handling.
- Expanded DOM selectors for better compatibility.
- Various minor improvements and bug fixes.

## Permissions 🔐

This script requires the following Tampermonkey permissions (`@grant`):

- `GM_addStyle`: To inject CSS for the interface panel.
- `GM_registerMenuCommand`: To add controls to the Tampermonkey menu.
- `GM_setValue` / `GM_getValue`: To save and load your settings.
- `GM_xmlhttpRequest`: To check for script updates.

## License 📜

[MIT License](./LICENSE)

## Credits 👏

- Developed by [bernardopg](https://github.com/bernardopg)
- Inspired by the Steam community, discovery queue automation needs, and card collectors!

---

**Disclaimer:** This script interacts programmatically with the Steam website. While designed to mimic user actions, use it responsibly. It is not affiliated with or endorsed by Valve or Steam. Use at your own risk. Changes to the Steam website may affect script functionality.

</details>
