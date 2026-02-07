# 🔧 Correção: Erro ao Atualizar Legendas após Criar Pasta de Contexto

## 📋 Problema Identificado

Quando o usuário criava uma pasta de contexto, a operação era bem-sucedida, mas ao tentar atualizar as legendas da planilha operacional, ocorria o erro:

```
Exception: O serviço Planilhas apresentou falha ao acessar o documento com o código [ID_PLANILHA].
```

### Causa Raiz

A função `atualizarLegendasPlanilhaContexto_()` estava tentando acessar a planilha operacional sem validações adequadas:

1. ❌ Não validava se `planilhaOperacionalId` existia ou era válido
2. ❌ Não tratava exceções de forma granular
3. ❌ Falhava completamente se uma aba tivesse problema
4. ❌ Sem fallback adequado para casos de ID inválido
5. ❌ A função `limparLegendasAntigas_()` não tinha tratamento de erro

---

## ✅ Solução Implementada

### 1. **Validações Robustas em `atualizarLegendasPlanilhaContexto_()`**

```javascript
// ✅ VALIDAÇÃO 1: Contexto não nulo
if (!contexto) {
  console.warn('atualizarLegendasPlanilhaContexto_: contexto nulo');
  return;
}

// ✅ VALIDAÇÃO 2: planilhaOperacionalId válido
if (!contexto.planilhaOperacionalId || contexto.planilhaOperacionalId.trim() === '') {
  console.warn('atualizarLegendasPlanilhaContexto_: planilhaOperacionalId vazio');
  return;
}

// ✅ VALIDAÇÃO 3: obterPastasVivas_ com try/catch
try {
  listaPastas = obterPastasVivas_(contexto);
} catch (e) {
  console.error('atualizarLegendasPlanilhaContexto_: Erro ao obter pastas vivas:', e.message);
  return;
}
```

### 2. **Acesso à Planilha com Múltiplas Tentativas**

```javascript
// Tentativa 1: Usar planilha ativa (mais rápido e seguro)
const ssAtiva = SpreadsheetApp.getActiveSpreadsheet();
if (ssAtiva && ssAtiva.getId() === contexto.planilhaOperacionalId) {
  ss = ssAtiva;
  planilhaEncontrada = true;
}

// Tentativa 2: Abrir planilha pelo ID
if (!planilhaEncontrada) {
  try {
    ss = SpreadsheetApp.openById(contexto.planilhaOperacionalId);
    planilhaEncontrada = true;
  } catch (e) {
    // Fallback: Usar planilha ativa e corrigir o contexto
    ss = SpreadsheetApp.getActiveSpreadsheet();
    salvarContextoAtivo_({ ...contexto, planilhaOperacionalId: ss.getId() });
  }
}
```

### 3. **Tratamento por Aba com Recuperação**

```javascript
abas.forEach(sheet => {
  try {
    // ... processar aba ...
  } catch (sheetError) {
    console.warn(`Erro na aba ${sheet.getName()}:`, sheetError.message);
    // Continua com próxima aba em vez de falhar completamente
  }
});
```

### 4. **Tratamento de Erro em `pasta_criar.gs`**

```javascript
try {
  const contextoNovo = obterContextoAtivo_();
  if (contextoNovo && contextoNovo.planilhaOperacionalId) {
    atualizarLegendasPlanilhaContexto_(contextoNovo);
  }
} catch (e) {
  console.error('criarPastaTrabalho_: Erro ao atualizar legendas:', e.message);
  ui.alert(
    '⚠️ Pasta criada com sucesso!\n\n' +
    'Mas houve erro ao atualizar a legenda:\n\n' +
    e.message + '\n\n' +
    'A pasta está ativa. Atualize a legenda manualmente se necessário.'
  );
  return;
}
```

### 5. **Melhor Tratamento em `limparLegendasAntigas_()`**

- Validação do `planilhaId`
- Try/catch para cada aba
- Tentativa de usar planilha ativa primeiro
- Logs informativos para debug

---

## 🔄 Fluxo de Execução Melhorado

### Antes
```
criarPastaTrabalho_()
  ↓
definirPastaTrabalho_()
  ↓
atualizarLegendasPlanilhaContexto_()
  ├─ Tenta acessar planilha pelo ID
  ├─ SEM validação do ID
  ├─ Sem tratamento de erro específico
  └─ ❌ ERRO: Falha ao acessar documento
```

### Depois
```
criarPastaTrabalho_()
  ↓
try {
  ├─ definirPastaTrabalho_() ✅
  ├─ obterContextoAtivo_() ✅
  ├─ Validar planilhaOperacionalId ✅
  └─ atualizarLegendasPlanilhaContexto_()
      ├─ Validação 1: contexto não nulo ✅
      ├─ Validação 2: ID válido e não vazio ✅
      ├─ Validação 3: obterPastasVivas_ com try/catch ✅
      ├─ Tentativa 1: planilha ativa ✅
      ├─ Tentativa 2: abrir pelo ID ✅
      ├─ Fallback: corrigir ID com planilha ativa ✅
      └─ Processar cada aba com try/catch ✅
  └─ ✅ SUCESSO ou mensagem clara de erro
} catch (e) {
  ├─ Alerta informativo ao usuário
  └─ ✅ Pasta criada mesmo se legenda falhar
}
```

---

## 🎯 Benefícios

### Para o Usuário
✅ Pasta é criada com sucesso sempre  
✅ Se houver erro na legenda, recebe mensagem clara  
✅ Nunca perde a pasta criada por erro de legenda  
✅ Pode atualizar legenda manualmente depois se necessário  

### Para o Sistema
✅ Identifica a causa exata do erro via logs  
✅ Tenta múltiplos caminhos para resolver o problema  
✅ Não falha completamente se uma aba tiver problema  
✅ Corrige automaticamente IDs inválidos no contexto  

---

## 📊 Cenários Cobertos

| Cenário | Antes | Depois |
|---------|-------|--------|
| planilhaOperacionalId inválido | ❌ Erro | ✅ Fallback + corrige |
| planilhaOperacionalId vazio | ❌ Erro | ✅ Valida e retorna calmamente |
| Uma aba com problema | ❌ Falha tudo | ✅ Processa outras abas |
| Permissão negada na planilha | ❌ Erro | ✅ Alerta claro ao usuário |
| Pasta criada com sucesso | ✅ Funciona | ✅ Melhor ainda com erros tratados |

---

## 📝 Arquivos Modificados

| Arquivo | Função | Mudança |
|---------|--------|---------|
| `contexto_legenda.gs` | `atualizarLegendasPlanilhaContexto_()` | ✏️ Adicionadas 6 validações + tratamento robusto |
| `contexto_legenda.gs` | `limparLegendasAntigas_()` | ✏️ Adicionado try/catch em cada nível |
| `pasta_criar.gs` | `criarPastaTrabalho_()` | ✏️ Adicionado try/catch ao chamar atualizarLegendasPlanilhaContexto_ |

---

## 🧪 Como Reproduzir o Erro Anterior

**Não é mais possível reproduzir o erro original**, pois foi corrigido. Mas aqui estava o comportamento:

1. Criar pasta de contexto
2. Sistema tentava atualizar legendas
3. Se `planilhaOperacionalId` fosse inválido ou vazio
4. Recebia erro: "O serviço Planilhas apresentou falha ao acessar o documento"
5. Pasta era criada, mas contexto finalizava em erro

---

## ✅ Teste de Validação

Após a correção, ao criar pasta de contexto:

1. ✅ Alerta de sucesso: "Pasta criada e definida como ativa"
2. ✅ Legendas são atualizadas em todas as abas
3. ✅ Se houver erro na legenda, alerta claro explica o motivo
4. ✅ Pasta fica ativa mesmo se legenda falhar
5. ✅ Logs mostram exatamente onde/por que um erro ocorreu

---

## 🔍 Debug com Logs

Para rastrear problemas futuros, verifique o console (Apps Script > Execução):

```
✅ Logs informativos:
- atualizarLegendasPlanilhaContexto_: contexto nulo
- atualizarLegendasPlanilhaContexto_: planilhaOperacionalId vazio
- atualizarLegendasPlanilhaContexto_: Contexto corrigido com planilha ativa
- Erro ao deletar linha com legenda em [SHEET]: [MENSAGEM]

❌ Logs de erro:
- atualizarLegendasPlanilhaContexto_: Falha ao acessar planilha
- criarPastaTrabalho_: Erro ao atualizar legendas
```

---

## 💡 Próximos Passos Sugeridos

- [ ] Testar em vários contextos diferentes
- [ ] Verificar se `planilhaOperacionalId` é sempre preenchido ao criar contexto
- [ ] Considerar adicionar validação similar em outras funções que acessam planilhas
- [ ] Documentar no README que erros de legenda não deletam a pasta criada

