# 🧪 Guia de Testes - Validação de Pasta Deletada

## 📌 Prerequisitos

1. ✅ Sistema com contexto de trabalho criado
2. ✅ Pelo menos 1 pasta de trabalho criada
3. ✅ Pasta de trabalho ativa definida
4. ✅ Acesso administrativo ao Google Drive

---

## 🧪 Teste 1: Pasta Deletada com Alternativas Disponíveis

### Setup
```
1. Criar 3 pastas de trabalho: Pasta A, Pasta B, Pasta C
2. Definir Pasta A como ativa
3. Verificar que contexto tem pastaTrabalhoId = ID de Pasta A
```

### Procedimento
```
1. Ir ao Google Drive
2. Encontrar a pasta raiz do projeto (Inventário Patrimonial)
3. Deletar Pasta A (enviar à lixeira)
4. Retornar à planilha do admin
5. Menu > 🗂️ Pastas de Trabalho > 📂 Abrir pasta de trabalho
```

### Resultado Esperado
```
✅ Alerta exibido:
   "⚠️ A pasta de trabalho ativa foi deletada ou está na lixeira.
    A pasta ativa será resetada e você poderá escolher uma nova."

✅ Prompt apresentado com opções:
   "📂 Nenhuma pasta ativa. Escolha uma:
    1 - Pasta B
    2 - Pasta C"

✅ Usuário escolhe opção (ex: 1)

✅ Alerta de confirmação:
   "✅ Pasta de trabalho ativa definida:
    Pasta B"

✅ Contexto atualizado com pastaTrabalhoId = ID de Pasta B
✅ Legendas atualizadas na planilha
```

---

## 🧪 Teste 2: Pasta Deletada sem Alternativas

### Setup
```
1. Criar apenas 1 pasta de trabalho: Pasta X
2. Definir como ativa
3. Verificar que é a única pasta
```

### Procedimento
```
1. Ir ao Google Drive
2. Deletar Pasta X (enviar à lixeira)
3. Retornar à planilha do admin
4. Menu > 🗂️ Pastas de Trabalho > 📂 Abrir pasta de trabalho
```

### Resultado Esperado
```
✅ Alerta exibido:
   "⚠️ A pasta de trabalho ativa foi deletada ou está na lixeira.
    A pasta ativa será resetada e você poderá escolher uma nova."

✅ Alerta seguinte:
   "📂 Nenhuma pasta de trabalho disponível
    Deseja criar uma nova?"

✅ Se YES (SIM):
   - Sistema abre fluxo de criação de nova pasta
   - Usuário cria Pasta Y
   - Pasta Y é automaticamente definida como ativa

✅ Se NO (NÃO):
   - Sistema retorna ao menu principal
   - Nenhuma pasta ativa ainda
```

---

## 🧪 Teste 3: Pasta Deletada + Usuário Cancela Seleção

### Setup
```
1. Criar 2 pastas: Pasta P, Pasta Q
2. Definir Pasta P como ativa
```

### Procedimento
```
1. Ir ao Google Drive
2. Deletar Pasta P (enviar à lixeira)
3. Retornar à planilha
4. Menu > 🗂️ Pastas de Trabalho > 📂 Abrir pasta de trabalho
5. Quando pedir seleção, clicar CANCELAR
```

### Resultado Esperado
```
✅ Alerta de pasta deletada exibido

✅ Prompt com lista exibido:
   "1 - Pasta Q"

✅ Usuário clica CANCELAR

✅ Novo alerta pergunta:
   "Deseja criar uma nova pasta de trabalho?"

✅ Se YES:
   - Abre fluxo de criação
   - Usuário cria Pasta Z
   - Pasta Z ativada

✅ Se NO:
   - Sistema retorna ao menu
   - Nenhuma pasta ativa
```

---

## 🧪 Teste 4: Pasta Normal (Comportamento Padrão)

### Setup
```
1. Criar 1 pasta: Pasta N
2. Definir como ativa
3. NÃO deletar
```

### Procedimento
```
1. Menu > 🗂️ Pastas de Trabalho > 📂 Abrir pasta de trabalho
```

### Resultado Esperado
```
✅ Nenhum alerta de erro
✅ Nova aba do navegador abre
✅ URL mostra: https://drive.google.com/drive/folders/[ID_PASTA_N]
✅ Pasta N abre no Google Drive normalmente
✅ Contexto permanece inalterado
```

---

## 🧪 Teste 5: Processar Imagem com Pasta Deletada

### Setup
```
1. Criar 1 pasta: Pasta I
2. Definir como ativa
3. Deletar Pasta I
```

### Procedimento
```
1. Menu > 🖼️ Processar Imagem
```

### Resultado Esperado
```
✅ Alerta exibido:
   "⚠️ Pasta de Trabalho Deletada
    A pasta de trabalho ativa foi deletada ou está na lixeira.
    
    Escolha outra pasta ou crie uma nova no menu:
    🗂️ Pastas de Trabalho"

✅ Sistema não tenta processar
✅ Nenhum erro gerado
```

---

## 🧪 Teste 6: Escolher Pasta com Pasta Deletada

### Setup
```
1. Criar 3 pastas: Pasta 1, Pasta 2, Pasta 3
2. Definir Pasta 1 como ativa
3. Deletar Pasta 1
```

### Procedimento
```
1. Menu > 🗂️ Pastas de Trabalho > 🔁 Escolher pasta
```

### Resultado Esperado
```
✅ Alerta de pasta deletada (se implementado em escolherPastaTrabalho_)
   OU
✅ Lista mostra apenas Pasta 2 e Pasta 3
   (Pasta 1 não aparece pois foi deletada)

✅ Usuário escolhe Pasta 2

✅ Confirmação: "Pasta ativa definida e legenda atualizada: Pasta 2"
```

---

## ✅ Checklist de Validação

### Após cada teste, verificar:

- [ ] Mensagens de erro/aviso são claras e em português
- [ ] Ícones aparecem corretamente (emojis)
- [ ] Contexto é sempre consistente
- [ ] Legendas da planilha são atualizadas
- [ ] Toast de confirmação aparece quando apropriado
- [ ] Nenhuma pasta deletada aparece nas listas
- [ ] Fluxo de criação funciona quando acionado
- [ ] Navegador abre corretamente quando pasta existe

---

## 🐛 Problemas Esperados e Soluções

| Problema | Causa Possível | Solução |
|----------|-----------------|---------|
| Alerta não aparece | Pasta foi completamente removido (não apenas lixeira) | Mesmo efeito esperado |
| Pasta deletada ainda aparece na lista | Cache do DriveApp | Recarregar página |
| Contexto não atualiza | Props não sincronizadas | Verificar obterContextoAtivo_() |
| Legenda não atualiza | Função atualizarLegendasPlanilhaContexto_ falhou | Checar permissões |

---

## 📝 Notas Importantes

1. **Lixeira do Drive**: Pastas na lixeira são consideradas "deletadas" pelo sistema
2. **Timeout**: Se DriveApp.getFolderById() demorar, considere aumentar tempo
3. **Permissões**: Sistema precisa de permissão para acessar todas as pastas
4. **Recovery**: Não há recuperação de dados da pasta deletada, apenas mudança de contexto

---

## 🎯 Resultado Final

Após todos os testes passarem com sucesso:

✅ Sistema identifica corretamente quando pasta foi deletada  
✅ Oferece alternativas apropriadas ao usuário  
✅ Mantém dados do sistema consistentes  
✅ Documenta mudanças na auditoria (se aplicável)  
✅ Nunca tenta acessar recursos inacessíveis  

