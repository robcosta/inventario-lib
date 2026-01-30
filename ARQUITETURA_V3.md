# 🏗️ ARQUITETURA PATRIMONIO-LIB V3.0

## Diagrama de Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                     USUÁRIO CLICA: Processar                      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│           vision_admin_api.gs::processarImagem()                  │
│                     (v3.0 - REFATORADA)                           │
├─────────────────────────────────────────────────────────────────┤
│ 1. Obter contexto de PropertiesService                           │
│ 2. Confirmar com usuário (Yes/No)                               │
│ 3. Buscar cor de destaque (identidade)                          │
│ 4. Modal de progresso: "⏳ Processando..."                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│    CAMADA 1: VALIDAÇÃO                                            │
│    contexto_validador_vision.gs::prepararContextoVision_()       │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Valida estrutura do contexto                                  │
│ ✓ Valida campos obrigatórios (pastaTrabalhoId, etc)            │
│ ✓ Testa acesso a Drive/Sheets                                  │
│ ✓ Normaliza para vision-core                                   │
│                                                                   │
│ Retorna: { sucesso: true/false, dados, erros, avisos }         │
└──────────┬──────────────────────────────────────────┬───────────┘
           │                                          │
      ✅ OK?                                    ❌ FALHA
           │                                          │
           ▼                                          ▼
   CONTINUA                           Erro estruturado
                                       └─→ Retorna ao usuário
                                           UI Alert: "Contexto inválido"
                                           PROCESSO TERMINA

                  ┌────────────────────────────────────┐
                  │  CAMADA 2: WRAPPER + RETRY        │
                  │  vision_wrapper.gs                 │
                  ├────────────────────────────────────┤
                  │ Chamar com Retry                   │
                  │ chamarVisionComRetry_()            │
                  │                                    │
                  │ Tentativa 1: Chamar vision        │
                  │   └─→ vision.batchProcessar...   │
                  │   └─→ Success? SIM: vai p/ audit │
                  │   └─→ Success? NÃO: retry        │
                  │                                    │
                  │ Tentativa 2: (após 1.5s)          │
                  │ Tentativa 3: (após 3.0s)          │
                  │                                    │
                  │ Retorna: { sucesso, resultado }   │
                  └────────┬──────────────┬────────────┘
                           │              │
                      ✅ OK?          ❌ 3x falhou
                           │              │
                           ▼              ▼
                    CONTINUA    Erro estruturado
                               └─→ Erro final
                                   └─→ Retorna ao usuário
                                       UI Alert: Falha

              ┌──────────────────────────────────────┐
              │  CAMADA 3: AUDITORIA                │
              │  auditoria_vision.gs                 │
              ├──────────────────────────────────────┤
              │ Ler aba CONTROLE de vision-core     │
              │ obterFeedbackCompleto_()            │
              │                                      │
              │ Estrutura esperada:                 │
              │ [timestamp | arquivo | status | ... │
              │  2024-01-15 10:30 | img1.jpg | OK | │
              │  2024-01-15 10:31 | img2.jpg | ERR|  │
              │  ...]                               │
              │                                      │
              │ Calcula:                            │
              │ - Total de arquivos processados     │
              │ - Sucesso vs Erro vs Pendente      │
              │ - Taxa de sucesso (%)               │
              │ - Amostra de erros                  │
              │                                      │
              │ Retorna: { sucesso, titulo,        │
              │   mensagem, resumo, erros_amostra } │
              └────────┬────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   FEEDBACK FINAL AO USUÁRIO                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ✅ Processamento 100% Bem-sucedido                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ✅ Sucesso: 45                                                   │
│ ❌ Erro: 0                                                       │
│ 📊 Taxa: 100%                                                    │
│                                                                    │
│ ⏱️ Tempo: 2.5 segundos                                           │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Arquitetura de 3 Camadas

```
┌──────────────────────────────────────────────────────────────┐
│                    ENTRADA: Contexto                         │
│              (de obterContextoAtivo_())                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
     ┌───────────────▼────────────────┐
     │  CAMADA 1: VALIDAÇÃO           │
     │  ══════════════════════════════ │
     │ validarContextoVision_()        │
     │ testarAcessoContextoVision_()  │
     │ prepararContextoVision_()      │
     │                                │
     │ Valida:                         │
     │ • Estrutura do objeto           │
     │ • Campos obrigatórios           │
     │ • Acesso Drive/Sheets          │
     │                                │
     │ Normaliza:                      │
     │ • Mapeia campos                 │
     │ • Completa valores padrão       │
     │ • Retorna pronto para vision    │
     └────────────────┬────────────────┘
                      │
                      ▼
     ┌───────────────────────────────┐
     │  CAMADA 2: WRAPPER & RETRY    │
     │  ═══════════════════════════  │
     │ chamarVisionBatch_()           │
     │ chamarVisionComRetry_()        │
     │ processarPastaComVision_()    │
     │                                │
     │ Responsabilidades:             │
     │ • Preparar contexto (camada 1) │
     │ • Chamar vision-core           │
     │ • Retry com backoff            │
     │ • Callbacks (onInicio, etc)   │
     │ • Orquestra camada 3 (auditoria│
     │                                │
     │ Retenta:                       │
     │ • Até 3 vezes                  │
     │ • Backoff: 1s, 2s, 3s         │
     │ • Só em erro transiente        │
     └────────────────┬────────────────┘
                      │
                      ▼
     ┌───────────────────────────────┐
     │  CAMADA 3: AUDITORIA          │
     │  ═════════════════════════════ │
     │ obterLogsProcessamento_()      │
     │ resumirLogsProcessamento_()   │
     │ obterFeedbackCompleto_()      │
     │                                │
     │ Lê:                            │
     │ • Aba CONTROLE de vision-core │
     │ • Registros: timestamp, arquivo│
     │   status, erro                │
     │                                │
     │ Calcula:                       │
     │ • Total de arquivos            │
     │ • Sucesso: X                   │
     │ • Erro: Y                      │
     │ • Taxa: Z%                     │
     │ • Amostra de erros             │
     │                                │
     │ Formata:                       │
     │ • Título amigável              │
     │ • Mensagem estruturada         │
     │ • Feedback executivo           │
     └────────────────┬────────────────┘
                      │
     ┌────────────────▼────────────────┐
     │  SAÍDA: Feedback Estruturado   │
     │                                 │
     │ {                               │
     │   sucesso: boolean,             │
     │   titulo: string,               │
     │   mensagem: string,             │
     │   resumo: {                     │
     │     total, sucesso, erro, %     │
     │   },                            │
     │   erros_amostra: [strings],    │
     │   tempo_ms: number              │
     │ }                               │
     └─────────────────────────────────┘
```

---

## Fluxo de Retry Automático

```
┌──────────────┐
│   Chamar     │
│   Vision     │
└──────┬───────┘
       │
       ▼
   Sucesso?
    /      \
  ✅        ❌
  /          \
 │            ▼
 │        Tentativa
 │        1 de 3?
 │         /     \
 │       ✅        ❌
 │       /          \
 │      │            ▼
 │      │        Aguardar
 │      │        1500ms
 │      │            │
 │      │            ▼
 │      │        ┌──────────┐
 │      │        │ Tentativa│
 │      │        │    2     │
 │      │        └────┬─────┘
 │      │             │
 │      │        Sucesso?
 │      │         /     \
 │      │       ✅        ❌
 │      │       /          \
 │      │      │            ▼
 │      │      │        Aguardar
 │      │      │        3000ms
 │      │      │            │
 │      │      │            ▼
 │      │      │        ┌──────────┐
 │      │      │        │ Tentativa│
 │      │      │        │    3     │
 │      │      │        └────┬─────┘
 │      │      │             │
 │      │      │        Sucesso?
 │      │      │         /     \
 │      │      │       ✅        ❌
 │      │      │       /          \
 │      └──────┴──────┘            ▼
 │                              FALHA
 │                              Final
 │                              
 └──────────────────────────────→ SUCESSO

Backoff: 1.5s × 1 = 1.5s para tentativa 2
         1.5s × 2 = 3.0s para tentativa 3
```

---

## Estrutura de Dados: Contexto

### Entrada (patrimonio-lib)

```javascript
{
  // Obrigatórios
  pastaTrabalhoId: "1abc2def3ghi4jkl...",
  planilhaOperacionalId: "2xyz3abc4def5ghi...",
  planilhaGeralId: "3lmn4opq5rst6uvw...",
  
  // Opcionais
  pastaTrabalhoNome: "Pasta Trabalho 01",
  planilhaControleId: "4xyz5abc6def7ghi...",
  corDestaque: "#1557B0",
  ABA_CONTROLE: "__CONTROLE_PROCESSAMENTO__"
}
```

### Normalizado (para vision-core)

```javascript
{
  // Mapeado de operacional
  planilhaContextoId: "2xyz3abc4def5ghi...",
  planilhaGeralId: "3lmn4opq5rst6uvw...",
  planilhaControleId: "4xyz5abc6def7ghi...",
  
  // Com valores padrão
  corDestaque: "#1557B0",
  ABA_CONTROLE: "__CONTROLE_PROCESSAMENTO__"
}
```

### Feedback (para usuário)

```javascript
{
  sucesso: true,
  titulo: "✅ Processamento 100% Bem-sucedido",
  mensagem: "45 arquivos processados com sucesso\n0 com erro",
  resumo: {
    total: 45,
    sucesso: 45,
    erro: 0,
    percentual: 100
  },
  erros_amostra: [],
  tempo_ms: 2500
}
```

---

## Integração com vision-core

```
patrimonio-lib v3.0          inventario-vision-core v3.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENTRADA:                      PROCESSA:
contextoAtivo                 • OCR das imagens
  ↓                           • Identificação
[Validar]                     • Destacar
  ↓                           • Registrar logs
[Normalizar]
  ↓                        SAÍDA:
contextoPadronizado           • Escreve em planilha
  ↓                           • Escreve em aba CONTROLE
vision.batch                  
  ProcessarPastaCompleta()
  
RETORNO:                      EFEITO COLATERAL:
resultadoVision              • Aba CONTROLE preenchida
  ↓                          • Com dados de cada imagem
[Ler logs CONTROLE]
  ↓
[Calcular estatísticas]
  ↓
feedbackCompleto
  ↓
[Exibir ao usuário]
```

---

## Tratamento de Erros - Diagrama

```
                    ┌─────────────────┐
                    │ Chamar Vision   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
         Validação      Acesso          Vision
         Falhou          Negado         Exception
              │              │              │
              │              │              │
        Erro Crítico    Erro Crítico   Pode Retry?
              │              │         /      \
              └──────┬───────┴────────/        \
                     │                    Sim   Não
                     │                     │     │
                     │              [Retry 3x] │
                     │                     │    │
                     └─────────┬───────────┘    │
                               │                │
                               ▼                ▼
                        ┌──────────────┐  ┌────────────┐
                        │ Sucesso      │  │ Erro Final │
                        │ ou Erro      │  │            │
                        │ Final        │  │ Estruturado│
                        └──────┬───────┘  └────┬───────┘
                               │               │
                               └───────┬───────┘
                                       │
                                       ▼
                              ┌───────────────┐
                              │ Ler Logs      │
                              │ (Auditoria)   │
                              └───────┬───────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │ Feedback        │
                             │ Estruturado     │
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │ UI Alert        │
                             │ ao Usuário      │
                             └─────────────────┘
```

---

## Dependências Entre Camadas

```
vision_admin_api.gs
    │
    ├─→ validarContextoVision_()     [Camada 1]
    │   └─→ testarAcessoContextoVision_()
    │
    ├─→ processarPastaComVision_()   [Camada 2]
    │   ├─→ chamarVisionComRetry_()
    │   │   └─→ chamarVisionBatch_()
    │   │       └─→ prepararContextoVision_()  [Camada 1]
    │   │           └─→ vision.batchProcessarPastaCompleta()  [vision-core]
    │   │
    │   └─→ obterFeedbackCompleto_() [Camada 3]
    │       ├─→ obterLogsProcessamento_()
    │       └─→ resumirLogsProcessamento_()
    │
    └─→ ui.alert() [Google Apps Script nativo]
        └─→ Exibir feedback final

FLUXO:  1→2→3 (sequencial)
DEPS:   2 depende de 1
        2 e 3 dependem de vision-core
```

---

**Arquitetura completa de patrimonio-lib v3.0 com 3 camadas modular e escalável!**
