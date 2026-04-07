# Guia do Usuário

## Visão Geral do Painel

O painel flutuante aparece no canto inferior direito das páginas suportadas da Steam:

### Exibição de Status

| Elemento | Descrição |
|----------|-----------|
| **Texto de Status** | Estado atual do script (Executando, Pausado, Adicionando, etc.) |
| **Contador de Sessão** | Itens adicionados na sessão atual (X Adicionados) |
| **Versão** | Versão do script com indicador de atualização |

### Botões

| Botão | Ação |
|-------|------|
| **▶️ Iniciar** | Iniciar ou retomar automação |
| **⏸️ Pausar** | Pausar após processar item atual |
| **⏹️ Parar** | Parar completamente, desabilitar Auto-Start |
| **🖱️ Processar Uma Vez** | Avaliar item atual sem iniciar loop |
| **⏭️ Pular Item** | Pular item atual sem avaliação |
| **▬ Minimizar** | Recolher painel para economizar espaço |

### Configurações (Checkboxes)

| Configuração | Descrição |
|--------------|-----------|
| **Auto-Start** | Iniciar processamento automaticamente ao carregar página |
| **Auto-Restart** | Gerar nova fila quando a atual terminar |
| **Exigir Cartas** | Apenas jogos com cartas colecionáveis da Steam |
| **Pular Possuídos** | Pular jogos já presentes na sua biblioteca |
| **Pular Não-Jogos** | Pular DLCs, demos, trilhas sonoras, vídeos |

## Como Funciona

### Fluxo de Automação

```
1. Script ativa em páginas suportadas
   ↓
2. Ignora verificação de idade automaticamente
   ↓
3. Em páginas da Fila de Descobertas:
   ↓
4. Se Auto-Start habilitado → inicia loop
   ↓
5. Verifica item atual contra filtros
   ↓
6. Se passar nos filtros → Adiciona à Wishlist
   ↓
7. Se loop ativo → Clica em "Próximo na Fila"
   ↓
8. Se fila vazia & Auto-Restart → Gera nova fila
   ↓
9. Repete até ser parado
```

### Lógica de Processamento

Para cada item na fila:

1. **Obter informações do jogo**
   - Título
   - Quantidade restante na fila

2. **Verificar condições de skip:**
   - ✅ Já possui? (se `Pular Possuídos` ativo)
   - ✅ Tipo não-jogo? (se `Pular Não-Jogos` ativo)
   - ✅ Sem cartas? (se `Exigir Cartas` ativo)

3. **Executar ação:**
   - Se pular: Incrementar contador, registrar motivo
   - Se passar: Clicar em "Adicionar à Lista", aguardar confirmação

4. **Avançar fila** (se não for ação manual)

## Comandos do Menu Tampermonkey

Clique com botão direito no ícone do Tampermonkey:

| Comando | Descrição |
|---------|-----------|
| **▶️ Iniciar** | Iniciar automação |
| **⏸️ Pausar** | Pausar automação |
| **⏹️ Parar** | Parar automação |
| **⚙️ Alternar Auto-Start** | Habilitar/desabilitar Auto-Start |
| **⚙️ Alternar Auto-Restart** | Habilitar/desabilitar Auto-Restart |
| **⚙️ Alternar Filtro Cartas** | Habilitar/desabilitar exigência de cartas |
| **⚙️ Alternar Pular Possuídos** | Habilitar/desabilitar pular possuídos |
| **⚙️ Alternar Pular Não-Jogos** | Habilitar/desabilitar pular não-jogos |

## Mensagens de Status

| Status | Significado |
|--------|-------------|
| **Pronto** | Aguardando ação do usuário |
| **Executando** | Processando itens da fila |
| **Pausado** | Automação pausada |
| **Parado** | Automação parada |
| **Adicionando** | Adicionando item à wishlist |
| **Adicionado** | Adicionado com sucesso à wishlist |
| **Pulando** | Pulando item atual |
| **Pulado** | Item foi pulado |
| **Avançando** | Indo para próximo item |
| **Verificando** | Analisando item atual |
| **Erro** | Ocorreu um erro |
| **Fila Vazia** | Sem itens restantes |
| **Gerando** | Criando nova fila |

## Dicas e Boas Práticas

### Para Colecionadores de Cartas

1. ✅ Ative o filtro **Exigir Cartas**
2. ✅ Ative **Pular Possuídos** para evitar duplicatas
3. ✅ Use Auto-Start para processamento automático

### Para Construir Wishlist

1. ✅ Desative **Exigir Cartas** para todos os jogos
2. ✅ Ative **Pular Possuídos** e **Pular Não-Jogos**
3. ✅ Use modo manual para adição seletiva

### Para Velocidade

- Reduza delays em `CONFIG.TIMING` (apenas usuários avançados)
- Evite usar o navegador enquanto o script roda
- Mantenha a aba da fila visível

### Para Confiabilidade

- Mantenha a loja Steam logada
- Não navegue para fora durante processamento
- Atualize o script regularmente para mudanças na Steam

## Notificações de Atualização

O script verifica atualizações a cada 24 horas:

| Indicador | Significado |
|-----------|-------------|
| **v2.1** | Atualizado |
| **v2.1 🆕** | Atualização disponível! |

Clique no número da versão para visitar a página de atualização.

## Perguntas Frequentes

**P: Posso usar em múltiplas contas?**
R: Sim, as configurações são armazenadas por domínio e funcionam com qualquer conta Steam.

**P: Funciona na nova interface da Steam?**
R: O script é atualizado regularmente para mudanças na interface. Mantenha-o atualizado.

**P: Posso personalizar os filtros?**
R: Use os checkboxes no painel para mudanças de filtro em tempo real.

**P: O que acontece se a Steam mudar o layout?**
R: O script inclui seletores alternativos. Se algo quebrar, verifique atualizações.

---

[← Voltar para Documentação](../README.md) | [Arquitetura →](arquitetura.md)