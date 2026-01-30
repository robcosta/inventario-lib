# 🚀 GUIA DE DEPLOY - patrimonio-lib v3.0

## ⚡ Deploy Rápido (5 minutos)

### Passo 1: Copiar Arquivos

Copie os 3 novos arquivos `.gs` para seu projeto no Google Apps Script:

```
✅ contexto_validador_vision.gs
   Local: src/admin/compartilhado/contexto/

✅ vision_wrapper.gs
   Local: src/integracao/ [crie pasta se não existir]

✅ auditoria_vision.gs
   Local: src/compartilhado/auditoria/ [crie pasta se não existir]
```

### Passo 2: Atualizar vision_admin_api.gs

**Substitua a função `processarImagem()` pelo código refatorado.**

Encontre:
```javascript
function processarImagem() {
  // ... código antigo ...
}
```

Substitua por:
```javascript
/**
 * ============================================================
 * PROCESSADOR DE IMAGENS v3.0 - REFATORADO
 * ============================================================
 */
function processarImagem() {
  // ... [usar o código novo do arquivo] ...
}
```

### Passo 3: Salvar

```
Ctrl+S (ou Cmd+S no Mac)
```

Aguarde sincronização com Google Apps Script.

### Passo 4: Testar

No editor do Apps Script:
```
Executar > Selecionar função > teste_validarContextoVision
```

Deve exibir no console:
```
=== TESTE DE VALIDAÇÃO ===
Sucesso: true
Erros: []
Avisos: []
Contexto normalizado: { ... }
```

### Passo 5: Usar

Nada muda para o usuário!

```javascript
processarImagem(); // Continua igual
// Mas internamente: valida → processa → auditoria
```

---

## 📂 Estrutura Final do Projeto

```
src/
├── integracao/                          [NOVA PASTA]
│   └── vision_wrapper.gs                [NOVO]
│
├── compartilhado/
│   ├── contexto/
│   │   └── contexto_validador_vision.gs [NOVO]
│   │
│   └── auditoria/                       [NOVA PASTA]
│       └── auditoria_vision.gs          [NOVO]
│
├── admin/
│   └── api/
│       └── vision_admin_api.gs          [MODIFICADO: processarImagem()]
│
└── [outros arquivos - sem mudanças]
```

---

## ✅ Checklist de Validação Pós-Deploy

Após fazer deploy, valide:

```javascript
// 1. Validação funciona?
const prep = prepararContextoVision_(obterContextoAtivo_());
console.assert(prep.sucesso || prep.erros.length > 0);
// ✅ Se não der erro, passou

// 2. Wrapper funciona?
teste_chamarVisionBatch();
// ✅ Procure por "Resultado final" no console

// 3. Auditoria funciona?
const logs = obterLogsProcessamento_(
  obterContextoAtivo_().planilhaOperacionalId
);
console.assert(Array.isArray(logs));
// ✅ Se exibir logs, passou

// 4. Função principal não quebrou?
processarImagem(); // Clique "Não" em qualquer dialog
// ✅ Se não der erro, passou
```

---

## 🔧 Troubleshooting Deploy

### Erro: "prepararContextoVision_ is not defined"

**Causa:** Arquivo `contexto_validador_vision.gs` não foi copiado.

**Solução:**
1. Verifique se o arquivo está em `src/admin/compartilhado/contexto/`
2. Salve (Ctrl+S)
3. Aguarde 5 segundos
4. Tente novamente

### Erro: "vision_wrapper.gs:XX - Function not found"

**Causa:** Arquivo não está sendo reconhecido.

**Solução:**
1. No editor, clique em **Explorador** (ícone de arquivo)
2. Procure por `vision_wrapper.gs` na pasta `src/integracao/`
3. Se não estiver lá, copie novamente
4. Salve (Ctrl+S)

### Modal fica branco ou não fecha

**Causa:** Possível erro em `processarImagem()`.

**Solução:**
1. Abra Console (Ctrl+Enter)
2. Procure por erros em vermelho
3. Copie o erro e procure em `TROUBLESHOOTING.md`

### "preparContextoVision return undefined"

**Causa:** `prepararContextoVision_()` não encontrada.

**Solução:**
1. Verifique que `contexto_validador_vision.gs` está na estrutura certa
2. Abra o arquivo e veja se tem `function prepararContextoVision_` 
3. Salve tudo novamente (Ctrl+S)
4. Aguarde sincronização (30 segundos)

---

## 📊 Verificar Deploy Bem-sucedido

Execute este script para validar tudo:

```javascript
function verificarDeployV3() {
  console.log('=== VERIFICAÇÃO DE DEPLOY v3.0 ===\n');

  // 1. Validador
  try {
    prepararContextoVision_;
    console.log('✅ Validador: OK');
  } catch (e) {
    console.error('❌ Validador: FALTA');
  }

  // 2. Wrapper
  try {
    chamarVisionBatch_;
    console.log('✅ Wrapper: OK');
  } catch (e) {
    console.error('❌ Wrapper: FALTA');
  }

  // 3. Auditoria
  try {
    obterFeedbackCompleto_;
    console.log('✅ Auditoria: OK');
  } catch (e) {
    console.error('❌ Auditoria: FALTA');
  }

  // 4. Função principal
  try {
    processarImagem;
    console.log('✅ processarImagem: REFATORADA');
  } catch (e) {
    console.error('❌ processarImagem: ERRO');
  }

  console.log('\n=== RESULTADO ===');
  console.log('Se todos OK, deploy bem-sucedido! ✅');
}

// Execute:
// Executar > Selecionar função > verificarDeployV3
```

---

## 🔄 Rollback (Desfazer)

Se houver problema, você pode voltar à v2.x:

1. **Remova os 3 novos arquivos:**
   - `contexto_validador_vision.gs`
   - `vision_wrapper.gs`
   - `auditoria_vision.gs`

2. **Desfaça a mudança em `vision_admin_api.gs`:**
   - Recoloque o `processarImagem()` da v2.x

3. **Salve (Ctrl+S)**

4. **Pronto!** Sistema volta ao v2.x

---

## 📚 Documentação Importante

Após deploy, leia:

1. **`INTEGRACAO_V3.md`** - Como funciona por dentro
2. **`TROUBLESHOOTING.md`** - Se algo der errado
3. **`RESUMO_REFATORACAO_V3.md`** - Visão geral das mudanças

---

## 🎯 Próximos Passos Recomendados

Após validar tudo:

1. ✅ Testar com 1-2 pastas pequenas
2. ✅ Verificar feedback no console
3. ✅ Testar retry desligando internet (opcional)
4. ✅ Ler documentação de integração
5. ✅ Estar pronto para suportar usuários

---

## ⏱️ Tempos Esperados

| Tarefa | Tempo |
|--------|-------|
| Copiar arquivos | 3 min |
| Atualizar `vision_admin_api.gs` | 1 min |
| Testar validação | 1 min |
| Deploy total | **5 minutos** |

---

## 🆘 Precisa de Ajuda?

Se algo deu errado:

1. Execute `verificarDeployV3()`
2. Veja a saída no console
3. Procure a erro em `TROUBLESHOOTING.md`
4. Se não encontrar, note:
   - Mensagem exata do erro
   - Qual função falhou
   - Quando começou

---

**Deploy bem-sucedido = patrimonio-lib v3.0 pronto para usar! 🎉**

---

**Versão:** 3.0.0  
**Data:** 2024  
**Próxima atualização:** v3.1
