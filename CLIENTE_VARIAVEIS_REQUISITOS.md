# Variáveis Obrigatórias no Cliente

## Estrutura de Contexto Requerida

O cliente precisa ter acesso a estas 5 variáveis para funcionar completamente:

```json
{
  "nome": "DEL01 - CAUCAIA",
  "pastaTrabalhoId": "1qEfEi094PWIC4DS9Ez_kzNF6Mtxl6-7o",
  "planilhaClienteId": "1BxfgAmLg5u5Yn9Z4mNkY5cKVtvEzc-R-NZE2I9zNqow",
  "planilhaContextoId": "1N1-jrEuARgqq9cZw3N1ukiMo9EUlJe7rR3YBMKiSKhA",
  "planilhaGeralId": "1xyz...",
  "emailOperador": "usuario@email.com"
}
```

## Definição de Cada Campo

### 1. **pastaTrabalhoId** ✅ (Renomeado de pastaUnidadeId)
- **Tipo**: String (ID do Drive)
- **Descrição**: ID da pasta de trabalho que representa um contexto específico
- **Diferença**: A `pastaUnidade` contém TODOS os contextos de um projeto; `pastaTrabalho` é UM ÚNICO contexto
- **Como Obter**: Criado em [contexto_criar.gs](src/admin/compartilhado/contexto/contexto_criar.gs#L80)
  ```javascript
  const pastaUnidade = obterOuCriarSubpasta_(pastaUnidades, nomeContexto);
  pastaTrabalhoId: pastaUnidade.getId()
  ```
- **Onde Armazenado**: `CONTEXTO_TRABALHO` (DocumentProperties do cliente)

### 2. **planilhaClienteId** ✅
- **Tipo**: String (ID do Sheets)
- **Descrição**: ID da planilha do cliente (UI do usuário)
- **Como Obter**: Criado em [contexto_criar.gs](src/admin/compartilhado/contexto/contexto_criar.gs#L86)
  ```javascript
  const planilhaCliente = SpreadsheetApp.create('UI ' + nomeUsuario);
  planilhaClienteId: planilhaCliente.getId()
  ```
- **Onde Armazenado**: `CONTEXTO_TRABALHO` (DocumentProperties do cliente)

### 3. **planilhaContextoId** ⚠️ (Necessário)
- **Tipo**: String (ID do Sheets)
- **Descrição**: ID da planilha operacional/contexto (planilha onde admin trabalha)
- **Alias**: `planilhaOperacionalId` (usado internamente no admin)
- **Como Obter**: É a planilha operacional do admin
  ```javascript
  const planilhaOperacional = SpreadsheetApp.getActiveSpreadsheet();
  planilhaContextoId = planilhaOperacional.getId()
  ```
- **Onde Armazenado**: Atualmente em `ADMIN_CONTEXTO_ATIVO`, precisa ser propagado para `CONTEXTO_TRABALHO`

### 4. **planilhaGeralId** ⚠️ (Necessário)
- **Tipo**: String (ID do Sheets)
- **Descrição**: ID da planilha mãe (referência compartilhada)
- **Como Obter**: Via ScriptProperties
  ```javascript
  // Em geral_util.gs
  function obterPlanilhaGeralId_() {
    return PropertiesService.getScriptProperties()
      .getProperty('PLANILHA_GERAL_ID');
  }
  ```
- **Onde Armazenado**: `ScriptProperties.getProperty('PLANILHA_GERAL_ID')`
- **Nota**: Adicionado dinamicamente em [vision_admin_api.gs](src/admin/api/vision_admin_api.gs#L105) quando necessário

### 5. **emailOperador** ✅ (Renomeado de emailAdmin)
- **Tipo**: String (email)
- **Descrição**: Email do usuário logado (pode ser admin ou cliente)
- **Como Obter**: Session API
  ```javascript
  emailOperador: Session.getActiveUser().getEmail()
  ```
- **Onde Armazenado**: `CONTEXTO_TRABALHO` (DocumentProperties do cliente)

## Status de Implementação

| Campo | Status | Armazenado | Propagado para Cliente |
|-------|--------|-----------|------------------------|
| pastaTrabalhoId | ✅ Implementado | CONTEXTO_TRABALHO | ✅ Sim |
| planilhaClienteId | ✅ Implementado | CONTEXTO_TRABALHO | ✅ Sim |
| planilhaContextoId | ⚠️ Necessário | ADMIN_CONTEXTO_ATIVO | ❌ Não |
| planilhaGeralId | ⚠️ Necessário | ScriptProperties | ❌ Parcialmente |
| emailOperador | ✅ Implementado | CONTEXTO_TRABALHO | ✅ Sim |

## Ações Necessárias (v1.0.0)

1. **Adicionar `planilhaContextoId` ao contexto do cliente**
   - Arquivo: [contexto_criar.gs](src/admin/compartilhado/contexto/contexto_criar.gs)
   - Adicionar: `planilhaContextoId: planilhaOperacional.getId()` ao contextoCliente
   
2. **Garantir `planilhaGeralId` está sempre disponível**
   - Já tem lógica em [vision_admin_api.gs](src/admin/api/vision_admin_api.gs#L105)
   - Verificar se está sendo propagado para CONTEXTO_TRABALHO

## Futuro (v1.1.0 - Refatoração)

- Centralizar todas as chaves de properties em arquivo CONFIG único
- Considerar renomear `planilhaContextoId` → `planilhaOperacionalId` para consistência
- Implementar validação e fallback automático para todos os IDs
