# 🐛 Troubleshooting - patrimonio-lib v3.0

## 📋 Problemas Comuns

### 1️⃣ "Contexto Inválido" ao processar

**Sintoma:**
```
⚠️ Contexto Inválido
Sistema sem pasta de trabalho ativa.
```

**Causas:**
- [ ] Não clicou em "Escolher Pasta de Trabalho"
- [ ] Sessão expirou
- [ ] PropertiesService foi limpa

**Solução:**
1. Abra o menu `Patrimônio > Configuração > Escolher Pasta de Trabalho`
2. Selecione a pasta novamente
3. Tente processar novamente

**Debug:**
```javascript
// No editor, execute:
const contexto = obterContextoAtivo_();
console.log('Contexto atual:', contexto);
console.log('pastaTrabalhoId:', contexto.pastaTrabalhoId);
console.log('planilhaOperacionalId:', contexto.planilhaOperacionalId);
```

---

### 2️⃣ Processamento não inicia

**Sintoma:**
```
Modal aparece, fecha, mas nada acontece
```

**Causas:**
- [ ] Vision API não configurada
- [ ] Permissão de Drive insuficiente
- [ ] Cota de Vision esgotada

**Solução:**
1. Verifique logs do Apps Script (Ctrl+Enter)
2. Procure por erros em `vision.batchProcessarPastaCompleta()`
3. Verifique se as imagens têm tamanho adequado (>100x100px)

**Debug:**
```javascript
// Execute teste_chamarVisionBatch()
// Procure por erros no console
```

---

### 3️⃣ Erro "Sem acesso à planilha"

**Sintoma:**
```
❌ Processamento Falhou
Sem acesso à planilha Operacional (ID: xxxxxx)
```

**Causas:**
- [ ] Você foi removido do compartilhamento
- [ ] Planilha foi deletada
- [ ] ID está corrompido

**Solução:**
1. Verifique acesso à planilha manualmente
2. Verifique em "Compartilhado comigo" no Drive
3. Se precisar, reselecione a pasta: `Patrimônio > Configuração > Escolher Pasta`

**Debug:**
```javascript
function testarAcessoPlanilhas() {
  const contexto = obterContextoAtivo_();
  const ids = [
    { id: contexto.planilhaOperacionalId, nome: 'Operacional' },
    { id: contexto.planilhaGeralId, nome: 'Geral' }
  ];

  ids.forEach(({ id, nome }) => {
    try {
      SpreadsheetApp.openById(id);
      console.log(`✅ ${nome}: Acessível`);
    } catch (e) {
      console.error(`❌ ${nome}: ${e.message}`);
    }
  });
}
```

---

### 4️⃣ "Taxa de sucesso 0%" após processamento

**Sintoma:**
```
⚠️ Processamento Parcialmente Bem-sucedido
✅ Sucesso: 0
❌ Erro: 45
📊 Taxa: 0%
```

**Causas:**
- [ ] Imagens muito pequenas (< 100x100)
- [ ] Formato não suportado
- [ ] Drive carregando imagens muito lentamente
- [ ] API de Vision retornando muitos erros

**Solução:**
1. Verifique aba `__CONTROLE_PROCESSAMENTO__` na planilha
2. Veja coluna "erro" para detalhes específicos
3. Retetar com menos imagens

**Debug:**
```javascript
function analisarErros() {
  const contexto = obterContextoAtivo_();
  const logs = obterLogsProcessamento_(contexto.planilhaOperacionalId);
  
  const erros = logs
    .filter(l => l.status === 'ERRO')
    .map(l => l.erro)
    .reduce((acc, err) => {
      acc[err] = (acc[err] || 0) + 1;
      return acc;
    }, {});

  console.log('Erros agrupados:', erros);
}
```

---

### 5️⃣ Processamento congela/demora muito

**Sintoma:**
```
Modal fica aberto por 10+ minutos
Sem logs novos no console
```

**Causas:**
- [ ] Muitas imagens (>500) em uma pasta
- [ ] Imagens muito grandes (>5MB cada)
- [ ] Rede lenta
- [ ] Quota da API esgotada

**Solução:**
1. **Dividir em lotes menores** (máx 200 imagens por pasta)
2. **Comprimir imagens** antes de fazer upload
3. **Processar em horários de pico baixo** (madrugada)
4. **Aumentar cota** em Google Cloud Console

**Debug:**
```javascript
// Verificar quantidade de imagens
function contarImagens() {
  const contexto = obterContextoAtivo_();
  const pasta = DriveApp.getFolderById(contexto.pastaTrabalhoId);
  const imagens = pasta.getFilesByType('image/jpeg');
  
  let count = 0;
  while (imagens.hasNext()) {
    imagens.next();
    count++;
  }
  
  console.log(`Total de imagens: ${count}`);
  return count;
}
```

---

### 6️⃣ Logs não aparecem em "Resumo"

**Sintoma:**
```
✅ Sucesso: 0
❌ Erro: 0
📊 Taxa: 0%
(Sem logs)
```

**Causas:**
- [ ] Aba `__CONTROLE_PROCESSAMENTO__` não foi criada
- [ ] vision-core não conseguiu escrever logs
- [ ] Nome da aba diferente

**Solução:**
1. Abra a planilha operacional
2. Procure abas (clique em + ao lado das abas)
3. Se não encontrar `__CONTROLE_PROCESSAMENTO__`, crie manualmente:
   - Nome exato: `__CONTROLE_PROCESSAMENTO__`
   - Cabeçalho: `timestamp | arquivo | status | erro | detalhes`

**Debug:**
```javascript
function verificarAbaControle() {
  const contexto = obterContextoAtivo_();
  const ss = SpreadsheetApp.openById(contexto.planilhaOperacionalId);
  const abas = ss.getSheets().map(a => a.getName());
  
  console.log('Abas da planilha:', abas);
  
  const temControle = abas.includes('__CONTROLE_PROCESSAMENTO__');
  console.log('Tem __CONTROLE_PROCESSAMENTO__:', temControle);
  
  return temControle;
}
```

---

### 7️⃣ "Cor de destaque inválida"

**Sintoma:**
```
Avisos na preparação:
Cor de destaque inválida. Usando padrão: #1557B0
```

**Causas:**
- [ ] Cor salva em formato errado (ex: "azul" ao invés de "#0000FF")
- [ ] Caractere especial em hex

**Solução:**
1. Abra `Patrimônio > Configuração > Identidade da Pasta`
2. Selecione nova cor
3. Verifique formato: deve ser `#RRGGBB` (6 dígitos hexadecimais)

---

### 8️⃣ Retry não está funcionando

**Sintoma:**
```
Erro na primeira tentativa, não tenta novamente
```

**Causas:**
- [ ] Erro é crítico (validação falhou)
- [ ] Função não está usando `chamarVisionComRetry_`
- [ ] maxTentativas = 1

**Solução:**
Verifique que `processarImagem()` chama:
```javascript
const resultado = processarPastaComVision_(contextoAtivo, {
  maxTentativas: 3,  // ← Deve ser > 1
  delayMs: 1500
});
```

**Debug:**
```javascript
function testeRetry() {
  const contexto = obterContextoAtivo_();
  
  const resultado = chamarVisionComRetry_(contexto, {
    maxTentativas: 2,
    callbacks: {
      onTentativa: (info) => console.log(`Tentativa ${info.tentativa}/${info.total}`)
    }
  });
}
```

---

## 🔍 Ferramentas de Debug

### Ativar Logs Detalhados

```javascript
// Adicione ao início de processarImagem():
const DEBUG = true;

if (DEBUG) {
  const resultado = prepararContextoVision_(contextoAtivo);
  console.log('Validação:', JSON.stringify(resultado, null, 2));
}
```

### Ver Histórico de Execução

```javascript
function verHistoricoExecucoes() {
  const contexto = obterContextoAtivo_();
  const logs = obterLogsProcessamento_(contexto.planilhaOperacionalId);
  
  // Últimas 20 linhas
  const recentes = logs.slice(-20);
  
  recentes.forEach(log => {
    console.log(`[${log.timestamp}] ${log.arquivo}: ${log.status} - ${log.erro}`);
  });
}
```

### Limpar Logs (Cuidado!)

```javascript
function limparLogs() {
  const contexto = obterContextoAtivo_();
  const ss = SpreadsheetApp.openById(contexto.planilhaOperacionalId);
  const aba = ss.getSheetByName('__CONTROLE_PROCESSAMENTO__');
  
  if (aba) {
    // Manter cabeçalho, deletar dados
    const lastRow = aba.getLastRow();
    if (lastRow > 1) {
      aba.deleteRows(2, lastRow - 1);
    }
  }
}
```

---

## 📞 Escalation

Se o problema persiste:

1. **Colete informações:**
   ```javascript
   function coletarDiagnostico() {
     const contexto = obterContextoAtivo_();
     const validacao = validarContextoVision_(contexto);
     const logs = obterLogsProcessamento_(contexto.planilhaOperacionalId);
     
     return {
       versao_patrimonio: '3.0',
       contexto_valido: validacao.valido,
       erros_validacao: validacao.erros,
       total_logs: logs.length,
       ultimos_logs: logs.slice(-5)
     };
   }
   ```

2. **Verifique Console do Apps Script:**
   - Ctrl+Enter para abrir
   - Procure por erros/avisos
   - Copie stack trace completo

3. **Consulte CONTROLE sheet:**
   - Abra a planilha operacional
   - Vá para `__CONTROLE_PROCESSAMENTO__`
   - Verifique últimas linhas para detalhes de erro

4. **Contate o desenvolvedor** com:
   - Resultado de `coletarDiagnostico()`
   - Screenshot de erro
   - Logs do Apps Script
   - Descrição do que acontece

---

## 📌 Checklist Rápido

Antes de reprocessar:

- [ ] Contexto válido? `obterContextoAtivo_()` tem pastaTrabalhoId
- [ ] Acesso a Drive? Consigo abrir pasta manualmente
- [ ] Acesso a Sheets? Consigo abrir planilha manualmente
- [ ] Imagens adequadas? >100x100px, formato comum (jpg/png)
- [ ] Cota Vision? Verificar em Google Cloud Console
- [ ] Aba CONTROLE existe? Check na planilha operacional
- [ ] Retentativas ativadas? `maxTentativas: 3` em options

---

**Versão:** 3.0.0  
**Última atualização:** 2024
