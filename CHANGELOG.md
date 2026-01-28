## v3.1.0 – 2026-01-28

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
