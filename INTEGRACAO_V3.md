# 📦 Integração patrimonio-lib ↔ inventario-vision-core v3.0

## 📋 Resumo Executivo

A refatoração **v3.0** da `patrimonio-lib` estabelece uma integração robusta, modular e auditável com `inventario-vision-core v3.0.0`.

### Principais Melhorias

✅ **Validação Centralizada** - Prepara contexto antes de chamar vision-core  
✅ **Retry Automático** - Até 3 tentativas com backoff exponencial  
✅ **Feedback Estruturado** - Resultado detalhado com logs de auditoria  
✅ **Tratamento de Erros** - Erros estruturados, não strings genéricas  
✅ **Callbacks Modulares** - Permite integração com UI/logging externo  

---

## 🏗️ Arquitetura

```
patrimonio-lib (v3.0)
│
├── admin/api/vision_admin_api.gs (REFATORADO)
│   └─ processarImagem() → [3 camadas abaixo]
│
├── Camada 1: VALIDAÇÃO
│   └─ src/admin/compartilhado/contexto/contexto_validador_vision.gs
│      • validarContextoVision_()
│      • prepararContextoVision_()
│
├── Camada 2: WRAPPER & RETRY
│   └─ src/integracao/vision_wrapper.gs
│      • chamarVisionBatch_()
│      • chamarVisionComRetry_()
│      • processarPastaComVision_()
│
└── Camada 3: AUDITORIA
    └─ src/compartilhado/auditoria/auditoria_vision.gs
       • obterLogsProcessamento_()
       • obterFeedbackCompleto_()
```

---

## 📊 Fluxo de Processamento

```
1. OBTER CONTEXTO
   └─ obterContextoAtivo_() 
   
2. VALIDAR & PREPARAR
   └─ prepararContextoVision_(contextoAtivo)
      └─ Retorna: contexto normalizado + validação
      
3. PROCESSAR COM RETRY
   └─ processarPastaComVision_(contextoAtivo, options)
      └─ chamarVisionComRetry_() [até 3x]
         └─ chamarVisionBatch_()
            └─ vision.batchProcessarPastaCompleta() [vision-core]
            
4. LER LOGS DE AUDITORIA
   └─ obterFeedbackCompleto_(resultado, planilhaId)
      └─ obterLogsProcessamento_()
      └─ resumirLogsProcessamento_()
      
5. EXIBIR FEEDBACK
   └─ Alert ao usuário com resumo
```

---

## 🔄 Estrutura de Contexto

### Contexto Recebido (patrimonio-lib)
```javascript
{
  pastaTrabalhoId: "string",           // ID da pasta no Drive
  pastaTrabalhoNome: "string",         // Nome da pasta
  planilhaOperacionalId: "string",     // ID da planilha alvo
  planilhaGeralId: "string",           // ID da planilha mãe
  planilhaControleId: "string?",       // ID alternativa (opcional)
  corDestaque: "string?",              // Cor hex (opcional)
  ABA_CONTROLE: "string?"              // Nome da aba de controle
}
```

### Contexto Normalizado (vision-core)
```javascript
{
  planilhaContextoId: "string",        // = planilhaOperacionalId
  planilhaGeralId: "string",           // = planilhaGeralId
  planilhaControleId: "string",        // = planilhaControleId (fallback: planilhaOperacionalId)
  corDestaque: "string",               // Cor hex ou padrão #1557B0
  ABA_CONTROLE: "string"               // Aba do sheet (padrão: __CONTROLE_PROCESSAMENTO__)
}
```

---

## 🛡️ Validação

### validarContextoVision_(contexto)

**Valida:**
- ✅ Estrutura do contexto (tipo objeto)
- ✅ Campos obrigatórios presentes: `pastaTrabalhoId`, `planilhaOperacionalId`, `planilhaGeralId`
- ✅ IDs são strings não-vazias
- ✅ Cor no formato hex (#RRGGBB)

**Retorna:**
```javascript
{
  valido: boolean,
  erros: string[],          // Erros críticos
  avisos: string[],         // Avisos não-bloqueantes
  contexto_normalizado: Object
}
```

### testarAcessoContextoVision_(contexto)

**Testa acesso real** (DriveApp, SpreadsheetApp):
- ✅ Acesso à pasta de trabalho
- ✅ Acesso à planilha operacional
- ✅ Acesso à planilha geral

**Retorna:**
```javascript
{
  acessivel: boolean,
  erros: string[]           // Mensagens de acesso negado
}
```

### prepararContextoVision_(contexto)

**Função de alto nível** que:
1. Valida estrutura
2. Testa acesso
3. Normaliza campos
4. Retorna pronto para vision-core

**Retorna:**
```javascript
{
  sucesso: boolean,
  dados: { contexto_vision, metadata } | null,
  erros: string[],
  avisos: string[]
}
```

---

## 🔌 Wrapper & Chamadas

### chamarVisionBatch_(contextoAtivo, options)

**Responsabilidades:**
1. Preparar contexto via `prepararContextoVision_()`
2. Chamar `vision.batchProcessarPastaCompleta()` (uma vez)
3. Gerenciar callbacks (onInicio, onSucesso, onErro)
4. Medir tempo de execução

**Options:**
```javascript
{
  pastaId: "string?",       // Sobrescreve ID da pasta
  callbacks: {
    onInicio: (info) => {},     // Chamado ao iniciar
    onSucesso: (info) => {},    // Chamado ao sucesso
    onErro: (erro) => {},       // Chamado ao erro
    onTentativa: (info) => {}   // Chamado em retry
  }
}
```

**Retorna:**
```javascript
{
  sucesso: boolean,
  resultado: any,           // Retorno de vision.batchProcessarPastaCompleta()
  erro: { tipo, mensagem, detalhes, tempo_ms } | null,
  tempo_ms: number
}
```

### chamarVisionComRetry_(contextoAtivo, options)

**Características:**
- Até 3 tentativas por padrão
- Backoff exponencial (1000ms × tentativa)
- Não falha na primeira tentativa

**Options:**
```javascript
{
  ...opcoes_de_chamarVisionBatch_,
  maxTentativas: 3,         // Padrão
  delayMs: 1000             // Base do backoff
}
```

### processarPastaComVision_(contextoAtivo, options)

**Wrapper de alto nível** que:
1. Chama `chamarVisionComRetry_()`
2. Lê logs via `obterFeedbackCompleto_()`
3. Retorna resumo executivo

**Retorna:**
```javascript
{
  sucesso: boolean,
  tempo_ms: number,
  mensagem: string,
  detalhes: any
}
```

---

## 📝 Auditoria & Feedback

### obterLogsProcessamento_(planilhaId, abaControle)

**Lê dados da aba CONTROLE** (criada por vision-core).

**Estrutura esperada da aba:**
| timestamp | arquivo | status | erro | detalhes |
|-----------|---------|--------|------|----------|
| 2024-01-15 10:30:45 | img1.jpg | OK | | Identificado como ... |
| 2024-01-15 10:31:02 | img2.jpg | ERRO | Conexão perdida | Retry necessário |

**Retorna:**
```javascript
Array<{
  linha: number,
  timestamp: Date | string,
  arquivo: string,
  status: "OK" | "ERRO" | "PENDENTE",
  erro: string,
  detalhes: string
}>
```

### resumirLogsProcessamento_(logs)

**Calcula estatísticas:**
- Total de arquivos
- Sucesso vs. Erro vs. Pendente
- Percentual de sucesso
- Amostra de erros (primeiros 5)

**Retorna:**
```javascript
{
  total: number,
  sucesso: number,
  erro: number,
  pendente: number,
  percentual_sucesso: number,
  tempo_inicio: Date | string,
  tempo_fim: Date | string,
  erros_lista: string[]
}
```

### obterFeedbackCompleto_(resultadoVision, planilhaId)

**Orquestra leitura de logs + resumo** e formata feedback amigável.

**Retorna:**
```javascript
{
  sucesso: boolean,
  titulo: string,           // "✅ 100% Bem-sucedido" etc.
  mensagem: string,
  resumo: {
    total, sucesso, erro, percentual
  },
  erros_amostra: string[],
  tempo_ms: number
}
```

---

## 🎯 Uso Prático

### Processamento Simples

```javascript
// Em vision_admin_api.gs::processarImagem()
const resultado = processarPastaComVision_(contextoAtivo);

if (resultado.sucesso) {
  ui.alert('✅ Concluído', resultado.mensagem);
} else {
  ui.alert('❌ Erro', resultado.mensagem);
}
```

### Com Callbacks Customizados

```javascript
const resultado = chamarVisionComRetry_(contextoAtivo, {
  maxTentativas: 3,
  callbacks: {
    onInicio: (info) => {
      console.log(`Iniciando em ${info.pasta}`);
    },
    onSucesso: (info) => {
      salvarTimestamp('ULTIMA_EXECUCAO', info.timestamp);
    },
    onErro: (erro) => {
      registrarErroEmPlanilha_(erro.mensagem);
    }
  }
});
```

### Lendo Logs Posteriormente

```javascript
const feedback = obterResumoProcessamento_(planilhaId);
console.log(`Taxa de sucesso: ${feedback.percentual_sucesso}%`);
console.log(`Erros:`, feedback.erros_lista);
```

---

## 🧪 Testes

### Testar Validação

```javascript
// No editor: Execute teste_validarContextoVision()
const resultado = teste_validarContextoVision();
// Consolelog: erros, avisos, contexto normalizado
```

### Testar Wrapper

```javascript
// Execute teste_chamarVisionBatch()
// Simula chamada com callbacks
```

### Testar Logs

```javascript
// Execute teste_obterLogsProcessamento()
// Lê logs do CONTROLE da planilha atual
```

---

## ⚠️ Tratamento de Erros

### Tipos de Erro

| Tipo | Causa | Solução |
|------|-------|---------|
| `VALIDACAO_FALHOU` | Campo obrigatório ausente | Escolher contexto novamente |
| `PASTA_NAO_DEFINIDA` | pastaTrabalhoId vazio | Clicar em "Escolher Pasta de Trabalho" |
| `VISION_EXCEPTION` | Erro no vision-core | Retenta automaticamente (até 3x) |
| `ACESSO_NEGADO` | Sem permissão em Drive/Sheets | Verificar permissões |

### Estrutura de Erro

```javascript
{
  tipo: "VALIDACAO_FALHOU" | "VISION_EXCEPTION" | etc.,
  mensagem: "Descrição amigável",
  detalhes: ["Erro 1", "Erro 2"],  // Opcional
  stack: "Stack trace",             // Opcional
  tempo_ms: 1250
}
```

---

## 📦 Compatibilidade

✅ **Backward Compatible** com vision-core v2.x  
✅ **Otimizado para** vision-core v3.0+  
✅ **Google Apps Script** V8 Runtime  

---

## 🔮 Próximos Passos (Futuro)

- [ ] Integração com sistema de notificações
- [ ] Dashboard de auditoria em tempo real
- [ ] Webhooks para sistemas externos
- [ ] Sincronização automática em horários agendados

---

## 📞 Suporte

Para dúvidas sobre integração:
1. Consulte os testes (teste_*.js)
2. Revise logs do Apps Script
3. Verifique CONTROLE sheet em vision-core

---

**Versão:** 3.0.0-patrimonio  
**Data:** 2024  
**Próxima Review:** v3.1
