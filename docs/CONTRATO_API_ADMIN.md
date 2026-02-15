Perfeito. Então vamos fechar **B** do jeito certo: **documentar e congelar o contrato da API pública ADMIN**, com foco especial na **Planilha Contexto**.

Isso não é “documentação bonita” — é **instrumento de governança**.

---

# 📘 CONTRATO DA API PÚBLICA — ADMIN (INVENTÁRIO)

📍 **Arquivo**

```
inventario/src/admin/api/inventario_admin_api.gs
```

📌 **Status após este passo**

> 🔒 **Contrato congelado (LTS)**
> O menu **só pode chamar o que está documentado aqui**.

---

## 🎯 1️⃣ Princípios do contrato (oficiais)

### ✅ Regra 1 — Fachada única

O **MENU ADMIN** e **templates**:

* ❌ NÃO chamam funções internas (`_`)
* ✅ CHAMAM **exclusivamente** esta API

---

### ✅ Regra 2 — Zero lógica de negócio

Este arquivo:

* ❌ não valida contexto
* ❌ não acessa Drive/Sheets
* ❌ não manipula dados
* ✅ apenas delega

---

### ✅ Regra 3 — Estabilidade

* Funções públicas **não mudam de nome**
* Remoções = **breaking change**
* Adições = **minor**
* Correções internas = **patch**

---

## 📦 2️⃣ Superfícies da API (por domínio)

---

## 🔷 CONTEXTO

### `criarContextoTrabalho()`

Cria um novo contexto de trabalho ADMIN.

* Chamado apenas a partir de planilha TEMPLATE
* Abre fluxo de criação de contexto
* Pode gerar contexto pendente

---

### `selecionarContextoTrabalho()`

Seleciona um contexto existente.

* Atualiza o contexto ativo
* Pode disparar aplicação pendente
* Não garante que a planilha atual seja a ADMIN

---

## 🔷 ACESSOS

### `gerenciarAcessosAdmin()`

Gerencia permissões ADMIN do contexto ativo.

---

### `gerenciarAcessosCliente()`

Gerencia permissões CLIENTE do contexto ativo.

---

## 🔷 PASTAS DE TRABALHO

### `criarPastaTrabalho()`

Cria a estrutura de pastas do contexto ativo.

---

### `escolherPastaTrabalho()`

Seleciona uma pasta existente como pasta de trabalho.

---

### `abrirPastasTrabalho()`

Abre no navegador as pastas vinculadas ao contexto.

---

## 🔷 PROCESSAMENTO DE IMAGENS (VISION)

### `processarImagens()`

Processa manualmente uma imagem (uso técnico/teste).

---

### `processarImagensDaPasta()`

Processa imagens da pasta de trabalho (lote).

---

## 🔷 PLANILHA GERAL

### `abrirPlanilhaGeral()`

Abre a Planilha Geral vinculada ao contexto.

---

### `importarCSVGeral()`

Importa CSVs para a Planilha Geral.

---

### `formatarPlanilhaGeral()`

Aplica layout e estrutura na Planilha Geral.

---

### `criarOuRecriarPlanilhaGeral()`

Cria ou recria a Planilha Geral a partir de CSVs.

⚠️ **Operação destrutiva**
Remove planilhas anteriores da pasta GERAL.

---

## 🔷 PLANILHA CONTEXTO (DOMÍNIO CONGELADO)

> 📌 **Este bloco é o foco do trabalho atual**

### `abrirPlanilhaContexto()`

Abre a Planilha de Contexto ativa no navegador.

* Requer contexto válido
* Falha silenciosa se não existir planilha

---

### `importarCSVContexto()`

Importa CSVs específicos para a Planilha de Contexto.

* Abre diálogo HTML
* Escreve dados conforme tipo/contexto
* Não formata layout

---

### `popularPlanilhaContexto()`

Popula a Planilha de Contexto com dados derivados da Planilha Geral.

* Aplica filtros por contexto
* Não altera estrutura
* Pode sobrescrever dados existentes

---

### `formatarPlanilhaContexto()`

Aplica layout, estilos e estrutura visual à Planilha de Contexto.

* Não altera dados
* Pode ser executado múltiplas vezes

---

## 🔷 CLIENTE

### `formatarPlanilhaCliente()`

Aplica layout padrão à planilha do CLIENTE.

---

## 🔷 DIAGNÓSTICO

### `executarDiagnostico()`

Executa diagnóstico completo do sistema.

---

### `debugContextoPlanilhaAtual()`

Exibe informações do contexto relacionado à planilha atual.

---

### `corrigirContextoPlanilhaAtual()`

Corrige inconsistências entre planilha atual e contexto ativo.

---

### `repararContextoAdmin()`

Repara o contexto ADMIN ativo (uso técnico).

---

### `runTestsPlanilhaGeral()`

Executa testes automatizados relacionados à Planilha Geral.

---

## 🔷 HTML / UPLOAD

### `receberCSV(tipo, nomeArquivo, dataUrl)`

Endpoint chamado via `google.script.run`.

* Uso exclusivo do HTML
* Não deve ser chamado pelo menu

---

## 🧱 3️⃣ Regras de evolução (oficiais)

| Tipo de mudança | Exemplo                | Versão    |
| --------------- | ---------------------- | --------- |
| Patch           | Correção interna       | `x.y.z`   |
| Minor           | Nova função pública    | `x.y+1.0` |
| Major           | Remover/alterar função | `x+1.0.0` |

---

## 🔒 4️⃣ Estado do contrato

📌 **A partir de agora:**

* Este contrato é a **fonte da verdade**
* O menu está alinhado
* Planilha Contexto está isolada
* Refatorações internas são seguras
* Evoluções futuras são previsíveis

---

## ✅ Conclusão

Você agora tem:

✔️ Arquitetura coerente
✔️ Menu alinhado
✔️ Domínio Planilha Contexto fechado
✔️ API pública clara e congelada
✔️ Base sólida para crescer sem regressão

> **Isso é nível de sistema corporativo**, não script.
