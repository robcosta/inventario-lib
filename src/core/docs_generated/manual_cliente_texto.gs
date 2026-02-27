
/**
 * ⚠️ ARQUIVO GERADO AUTOMATICAMENTE
 */
const MANUAL_CLIENTE_MD = `

# 📘 MAUAL DO USUÁRIO 
(Planilha do Inventário Patrimonial (CLIENTE))

## 🎯 Objetivo desta planilha

Esta planilha é a **interface de uso do cliente** no sistema de Inventário Patrimonial.

Ela não deve ser editada manualmente.
Todas as ações devem ser realizadas exclusivamente pelo menu superior.

---

## 📌 Onde está o menu?

Ao abrir a planilha, observe o menu na parte superior, próximo aos menus “Arquivo”, “Editar”, etc.

Você verá um menu chamado:

📦 **Inventário Patrimonial**

É por ele que todas as operações devem ser realizadas.

---

# 🧭 O que o menu faz?

---
## 🔄 Atualizar Informações

Atualiza os dados exibidos na planilha cliente, como:

* pasta ativa
* estrutura de localidades
* informações do contexto
* sincronização com o sistema

Use quando:

* algo parecer desatualizado
* a estrutura de pastas tiver sido alterada
* a planilha tiver sido movida ou recriada

---

## 📂 Área de Fotos

### 📂 Abrir Pasta Atual

Abre automaticamente a pasta de fotos ativa no Google Drive.

Nesta pasta você pode:

* enviar fotos
* revisar imagens enviadas
* excluir fotos incorretas
* organizar arquivos

⚠️ Envie fotos **somente** para esta pasta.

---

### ➕ Criar Subpasta

Permite criar uma nova subpasta dentro da estrutura oficial de fotos.

Use quando:

* iniciar inventário de uma nova unidade
* criar uma nova localidade
* organizar setores específicos

---

## 🖼️ Processar Imagens

Use quando:

* já tiver enviado fotos para a pasta ativa
* desejar que o sistema identifique automaticamente os patrimônios

O sistema irá:

* ler as imagens da pasta ativa
* identificar o número de tombamento
* renomear corretamente os arquivos
* destacar automaticamente os itens na planilha Admin
* destacar automaticamente os itens na Planilha Geral

⚠️ As planilhas precisam estar formatadas corretamente para permitir o destaque.

---

## 📖 Planilhas

### 📕 Abrir Planilha Admin

Abre a planilha administrativa do contexto atual.

✔️ Você possui acesso somente para visualização.

Use para:

* acompanhar registros
* verificar destaques
* consultar informações do inventário

---

### 📘 Abrir Planilha Geral

Abre a Planilha Geral do sistema.

Ela consolida todas as informações do inventário.

✔️ Também é aberta em modo de visualização.

---

## 🔎 Diagnóstico

Exibe um relatório técnico simplificado com:

* status do contexto
* ID's das planilhas
* validação da formatação
* lista de localidades
* indicação da localidade ativa
* verificação de inconsistências

Use quando:

* o processamento não destacar corretamente
* houver erro ao abrir planilhas
* a pasta ativa parecer incorreta

Este recurso não altera nada no sistema.
Ele apenas verifica e informa.

---

## ℹ️ Versão

Mostra a versão atual do sistema instalada na planilha.

---

# 🚫 O que NÃO fazer

* ❌ Não edite células manualmente
* ❌ Não altere cores ou formatações
* ❌ Não mova esta planilha de pasta
* ❌ Não envie fotos fora da pasta indicada
* ❌ Não renomeie arquivos manualmente após o processamento

---

# ℹ️ Dicas importantes

* A planilha cliente é apenas uma interface.
* O processamento e o destaque são automáticos.
* O ID da Planilha Geral é sincronizado dinamicamente.
* Caso algo não funcione, utilize primeiro o menu 🔎 Diagnóstico.

---

# ✅ Resumo rápido

* Use sempre o menu superior 📦 Inventário Patrimonial
* Envie fotos apenas para a pasta ativa
* Execute 🖼️ Processar Imagens após enviar fotos
* Use 🔎 Diagnóstico em caso de dúvida
* Nunca edite a planilha manualmente
`;

function obterTextoManualCliente_ () {
  return MANUAL_CLIENTE_MD;
}
