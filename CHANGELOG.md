# Changelog - Inventario

Todas as mudanças notáveis serão documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/).  
Versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Em Desenvolvimento
- Sistema de contextos múltiplos em fase de testes
- Arquitetura baseada em IDs completamente implementada

---

## v0.11.1 – 2026-02-07

### 🐛 Corrigido - Bugs Críticos de Persistência de Contexto

#### Bug #1: Contexto não salvava ID ao selecionar
- **Arquivo:** `contexto_criar.gs` / `contexto_selecionar.gs`
- Contexto criado/selecionado não persistia campo `id`
- Causava falha na validação `planilhaTemContexto_()`

#### Bug #2: listarContextos_() descartava dados completos
- **Arquivo:** `contexto_utils.gs` 
- Função `listarContextos_()` retornava apenas 3 campos (nome, pastaId, planilhaOperacionalId)
- Agora retorna contexto completo de ScriptProperties com todos os campos
- Implementação expandida para 100+ linhas com logs detalhados

#### Bug #3: Contexto não persistia ao trocar planilhas  
- **Arquivo:** `contexto_selecionar.gs`
- `selecionarContextoTrabalho_()` salvava contexto na planilha ORIGEM antes de abrir planilha DESTINO
- Alterado para usar `salvarContextoAdminPendente_()` que persiste na planilha correta
- Contexto pendente aplicado automaticamente no `onOpen` da planilha destino

### 🔄 Modificado

#### Validação de Contexto Refatorada
- **Arquivo:** `contexto_utils.gs` - `planilhaTemContexto_()`
- Validação alterada de `id && nome && planilhaClienteId` para `planilhaOperacionalId === planilhaAtualId`  
- Usa campo essencial (planilhaOperacionalId) ao invés de campos opcionais
- Mais robusto e consistente com arquitetura de IDs

#### Menu Admin com Debug Detalhado
- **Arquivo:** `admin_menu_renderer.gs`
- Adicionados logs extensivos para rastreamento de validação de contexto
- Facilita diagnóstico de problemas de menu

### 🗑️ Removido - Limpeza de Código (Duplicações)

#### Funções Duplicadas de Planilha Geral
- **Arquivo:** `geral_util.gs`
- ❌ Removidas: `obterPlanilhaGeralId_()`, `setPlanilhaGeralId_()`  
- ✅ Mantidas em: `sistema_global.gs` (versão correta usa constante PROPRIEDADES_GLOBAL)

#### Função de Atualização Obsoleta
- **Arquivo:** `contexto_utils.gs`
- ❌ Removida: `atualizarContexto__()` (2 underscores)
- ✅ Mantida em: `contexto_atualizar.gs` - `atualizarContexto_()` (com validações completas + JSDoc)

#### Arquivo Cliente Obsoleto
- **Arquivo DELETADO:** `cliente_info.gs` (80 linhas)
- ❌ Continha: `cliente_montarInformacoes__()` (não usada)  
- ✅ Versão ativa: `cliente_montarInformacoes.gs` - `cliente_montarInformacoes_()` (usada em 3 lugares)

### ✨ Novo - Ferramentas de Diagnóstico

#### Função de Debug de Contexto
- **Arquivo:** `admin_diagnostico.gs`
- `debugContextoPlanilhaAtual_()` - Diagnóstico completo via logs (sem UI)
- Exibe todos os campos do contexto, validações, e estado de ScriptProperties

#### Função de Correção One-Time
- **Arquivo:** `admin_diagnostico.gs`  
- `corrigirContextoPlanilhaAtual_()` - Corrige contextos incompletos/trocados (legado)
- ⚠️ Temporária - remover após uso em todas as planilhas afetadas

#### Documentação de Rastreamento
- **Arquivo NOVO:** `LEMBRETES_REMOCAO.md`
- Rastreia funções temporárias para remoção futura
- Lista duplicações identificadas e status de remoção

### 📊 Técnico

- **Deploy:** 55 arquivos (anteriormente 56, -1 após deletar cliente_info.gs)
- **Análise:** 167 funções escaneadas, 3 duplicações críticas eliminadas
- **Branch:** `bugfix-contexto-persistencia`
- **Commits:** 
  - `9917f69` - fix: Corrigir bugs críticos de persistência (#1, #2, #3)
  - `66d882f` - refactor: remove duplicações de código

---

## v0.13.0 – 2026-01-28


### ✨ Novo - Sistema de Cores de Destaque Refatorado

#### Paleta de Cores Simplificada
- **`src/admin/compartilhado/ui/cores_destaque.gs`** - Refatorado
  - 8 cores predefinidas muito claras e suaves (tons pastel)
  - Cores: Azul, Verde, Amarelo, Laranja, Rosa, Roxo, Cinza, Turquesa
  - Formato padronizado em hex com documentação por cor
  - Funções de teste: `teste_validarCoresDestaque()` e `teste_simularAtribuicaoCores()`

#### Validação de Limite por Contexto
- **`src/admin/pasta_trabalho/pasta_criar.gs`** - Novo controle
  - Limite de 8 pastas de trabalho **por contexto** (não global)
  - Cada contexto (DEL01, DEL04, etc) pode ter até 8 pastas independentemente
  - Mensagem clara quando limite é atingido, informando contexto e quantidade atual
  - Validação dinâmica baseada em `CORES_DESTAQUE_LISTA.length`

#### Sistema de Identidade de Pasta Simplificado
- **`src/admin/pasta_trabalho/pasta_util.gs`** - Refatorado
  - `gerenciarIdentidadePasta_()` agora usa **apenas** `CORES_DESTAQUE_LISTA`
  - Removida paleta duplicada `paletaForte` que causava conflito
  - Garante atribuição de cores exclusivas por contexto
  - Fallback seguro para primeira cor se todas forem usadas

#### Tratamento de Erro Robusto
- **`src/admin/api/vision_admin_api.gs`** - Melhorado
  - Try-catch ao redor do processamento de imagens
  - Flag `modalAberto` para rastrear se modal foi exibido
  - Apenas fecha modal se foi realmente aberto
  - Graceful error handling com mensagens apropriadas

### 🔄 Modificado

#### `src/admin/compartilhado/ui/cores_destaque.gs`
- Cores muito mais claras: `#EBF3FB` (azul) em vez de `#D9EAF7`
- Adicionado atributo `Máximo de 8 cores por contexto` na documentação
- Expandidas funções de teste com simulação realista

#### `src/admin/pasta_trabalho/pasta_criar.gs`
- Adicionada validação de limite antes de criar pasta
- Mensagem agora menciona "por contexto" explicitamente
- Exibe contexto.nome no aviso para clareza

#### `src/admin/pasta_trabalho/pasta_util.gs`
- Removida lógica complexa de leitura de cores de planilha
- Simplificado para usar apenas `CORES_DESTAQUE_LISTA`
- Comentários atualizados para refletir novo comportamento

### 🐛 Corrigido

#### Modal Dialog Error
- ❌ **Antes**: `TypeError: ui.closeModalDialog is not a function` 
- ✅ **Depois**: Verifica se modal foi aberto antes de tentar fechar
- Implementado try-catch duplo para segurança máxima

#### Cor de Destaque Incorreta
- ❌ **Antes**: Pastas recebiam cores erradas (cinza em vez de azul)
- ✅ **Depois**: Sistema garante 8 cores corretas e consistentes por contexto

#### Sem Limite de Pastas
- ❌ **Antes**: Usuário podia criar ilimitadas pastas (ambíguo)
- ✅ **Depois**: Limite claro de 8 pastas por contexto com feedback

### ⚡ Melhorias

#### Experiência do Usuário
- Cores 100% mais claras (tons pastel suaves)
- Feedback claro quando limite de pastas é atingido
- Cada contexto é independente

#### Arquitetura
- Código mais simples sem duplicação de paletas
- Sistema de cores centralizado e testável
- Erro handling defensivo

#### Manutenibilidade
- Testes automáticos para validar cores
- Documentação clara de limites por contexto
- Código modular e fácil de estender

### 🎯 Compatibilidade

- ✅ 100% backward compatible com v3.0.0
- ✅ Melhoria de segurança (sem quebra)
- ✅ Melhoria visual (cores mais claras)
- ✅ Google Apps Script V8 Runtime

### 📋 Detalhes Técnicos

**Cores Nova Paleta**:
```
AZUL:     #EBF3FB (era #D9EAF7)
VERDE:    #EEF5ED (era #DFF2E1)
AMARELO:  #FFFDF0 (era #FFF4CC)
LARANJA:  #FFF6F0 (era #FFE5CC)
ROSA:     #FDEEF2 (era #FADADD)
ROXO:     #F3ECFC (era #E6D9F2)
CINZA:    #F8F8F8 (era #ECECEC)
TURQUESA: #ECFAF9 (era #D9F2F2)
```

**Fluxo de Criação de Pasta**:
1. Contar pastas existentes no contexto atual
2. Validar se existe cor disponível em `CORES_DESTAQUE_LISTA`
3. Se limite atingido → Avisar e cancelar
4. Se OK → Criar pasta e atribuir próxima cor disponível

---

## v3.0.0 – 2024

### ✨ Novo - Integração Completa com vision-core v3.0.0

#### Camada de Validação
- **`src/admin/compartilhado/contexto/contexto_validador_vision.gs`**
  - `validarContextoVision_()` - Valida estrutura e campos obrigatórios
  - `testarAcessoContextoVision_()` - Testa acesso real a Drive/Sheets
  - `prepararContextoVision_()` - Orquestra validação + acesso + normalização

#### Camada de Wrapper & Integração
- **`src/integracao/vision_wrapper.gs`**
  - `chamarVisionBatch_()` - Chamada com callbacks estruturados
  - `chamarVisionComRetry_()` - Retry automático (até 3x com backoff exponencial)
  - `processarPastaComVision_()` - Orquestra wrapper + auditoria

#### Camada de Auditoria
- **`src/compartilhado/auditoria/auditoria_vision.gs`**
  - `obterLogsProcessamento_()` - Lê aba CONTROLE de vision-core
  - `resumirLogsProcessamento_()` - Estatísticas (taxa sucesso, erros)
  - `obterFeedbackCompleto_()` - Feedback estruturado com logs

#### Documentação
- **`INTEGRACAO_V3.md`** - Guia completo de arquitetura e fluxo
- **`TROUBLESHOOTING.md`** - 8 problemas comuns + soluções

### 🔄 Modificado

#### `src/admin/api/vision_admin_api.gs`
- Refatoração completa de `processarImagem()`
- Adicionado validação via `validador_vision`
- Adicionado retry automático (máx 3 tentativas)
- Feedback agora mostra taxa de sucesso, erros específicos, tempo
- Logs estruturados no console

### ⚡ Melhorias

#### Robustez
- Retry automático em falhas transientes
- Validação antes de chamar vision-core
- Backoff exponencial para retentativas

#### Experiência do Usuário
- Feedback detalhado com taxa de sucesso (%)
- Amostra de erros específicos
- Tempo de execução trackado
- Modal de progresso amigável

#### Manutenibilidade
- Código modular (3 camadas separadas)
- Callbacks para hooks customizados
- Estruturas de dados padronizadas
- Testes inclusos em cada módulo

### 🎯 Compatibilidade

- ✅ 100% backward compatible com vision-core v2.x
- ✅ Otimizado para vision-core v3.0.0
- ✅ Google Apps Script V8 Runtime

---

## v0.2.0 – 2026-01-xx
### Added
- Funcionalidade Selecionar Contexto
- Abertura da planilha do contexto em nova aba via HTML dialog

### Fixed
- Exclusão do contexto atual da lista de seleção
- Correções de fluxo sem quebrar Criar Contexto
