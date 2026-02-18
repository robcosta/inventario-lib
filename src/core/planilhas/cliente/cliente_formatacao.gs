function formatarPlanilhaCliente_(spreadsheetId, contexto) {
 
  const ss = SpreadsheetApp.openById(spreadsheetId);

  // ======================================================
  // OBTÉM / RENOMEIA / CRIA A ABA "INFORMAÇÕES"
  // ======================================================
  let sheet = ss.getSheetByName("INFORMAÇÕES");

  if (!sheet) {
    // Caso padrão: planilha recém-criada
    const paginaPadrao = ss.getSheetByName("Página1");
    if (paginaPadrao) {
      paginaPadrao.setName("INFORMAÇÕES");
      sheet = paginaPadrao;
    } else {
      sheet = ss.insertSheet("INFORMAÇÕES");
    }
  }

  // ======================================================
  // LIMPEZA TOTAL DA ABA (a partir daqui tudo igual)
  // ======================================================
  sheet.clear();
  sheet.clearFormats();
  sheet.setHiddenGridlines(true);

  // ======================================================
  // DIMENSÕES (já definidas anteriormente)
  // ======================================================
  sheet.setRowHeight(4, 60);

  sheet.setColumnWidth(1, 300); // A
  sheet.setColumnWidth(2, 120); // B
  sheet.setColumnWidth(3, 300); // C
  sheet.setColumnWidth(4, 60); // D
  sheet.setColumnWidth(5, 300); // E
  sheet.setColumnWidth(6, 120); // F

  // ======================================================
  // CABEÇALHO (linha 4)
  // ======================================================
  sheet.getRange("B4:F4").setBackground("#1b1464");

  sheet
    .getRange("B4")
    .setValue("PRF")
    .setFontFamily("Graduate")
    .setFontSize(36)
    .setFontColor("#f7d046")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet
    .getRange("C4")
    .setValue("Inventário Patrimonial")
    .setFontFamily("Arial")
    .setFontSize(15)
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle");

  // ======================================================
  // TÍTULO
  // ======================================================
  sheet
    .getRange("D6")
    .setValue("INVENTÁRIO PATRIMONIAL")
    .setFontFamily("Arial")
    .setFontSize(18)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  // ======================================================
  // RÓTULOS DO CORPO
  // ======================================================
  const labels = [
    ["C8", "CONTEXTO DE TRABALHO :"],
    ["C9", "PASTA DE FOTOS ................:"],
    ["C10", "ACESSOS:"],
  ];

  labels.forEach(([cell, text]) => {
    sheet
      .getRange(cell)
      .setValue(text)
      .setFontFamily("Arial")
      .setFontSize(12)
      .setFontWeight("bold")
      .setHorizontalAlignment("left")
      .setVerticalAlignment("middle");
  });
  
  rodape_(sheet, 10);  
}

/**
 * ======================================================
 * RODAPÉ DINÂMICO UNIVERSAL
 * ======================================================
 */
function rodape_(sheet, ultimaLinhaEscrita) {

  const maxRows = sheet.getMaxRows();
  const colB = sheet.getRange(1, 2, maxRows, 1).getValues().flat();

  // 🔎 Remove rodapé antigo (se existir)
  for (let i = 0; i < colB.length; i++) {
    if (String(colB[i]).trim() === 'Inventário') {
      sheet.getRange(i + 1, 2, 1, 5).clearContent().clearFormat();
      sheet.getRange(i + 1, 5, 1, 2).breakApart();
      break;
    }
  }

  const linhaRodape = ultimaLinhaEscrita + 2;

  if (linhaRodape > maxRows) {
    sheet.insertRowsAfter(maxRows, linhaRodape - maxRows);
  }

  sheet.getRange(`B${linhaRodape}:F${linhaRodape}`)
    .setBackground('#f7d046');

  sheet.getRange(`B${linhaRodape}`)
    .setValue('     Inventário')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontColor('#666666')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  sheet.getRange(`E${linhaRodape}:F${linhaRodape}`).merge();

  const v = obterVersaoSistema_();

  sheet.getRange(`E${linhaRodape}`)
    .setValue(`${v.versao} (${v.build}) ${v.data}`)
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontColor('#999999')
    .setFontWeight('bold')
    .setHorizontalAlignment('right')
    .setVerticalAlignment('middle');
}


function cliente_formatarAbaManual_(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);

  // ======================================================
  // OBTÉM OU CRIA A ABA "MANUAL"
  // ======================================================
  let sheet = ss.getSheetByName("MANUAL");
  if (!sheet) {
    sheet = ss.insertSheet("MANUAL");
  }

  // ======================================================
  // LIMPEZA TOTAL
  // ======================================================
  sheet.clear();
  sheet.clearFormats();
  sheet.setHiddenGridlines(true);

  // ======================================================
  // DIMENSÕES (PIXEL)
  // ======================================================
  sheet.setColumnWidth(1, 50); // A
  sheet.setColumnWidth(2, 1150); // B

  sheet.setRowHeight(1, 50);
  sheet.setRowHeight(2, 1780);

  // ======================================================
  // TEXTO DO MANUAL
  // ======================================================
  const texto = `
# 📘 MAUAL DO USUÁRIO – Planilha do Inventário Patrimonial (CLIENTE)

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

## 🔎 Diagnóstico

Exibe um relatório técnico simplificado com:

* status do contexto
* IDs das planilhas
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

  // ======================================================
  // RICH TEXT
  // ======================================================
  let rt = SpreadsheetApp.newRichTextValue().setText(texto);

  function boldIfExists(fragment, size) {
    const i = texto.indexOf(fragment);
    if (i === -1) return;

    rt = rt.setTextStyle(
      i,
      i + fragment.length,
      SpreadsheetApp.newTextStyle()
        .setBold(true)
        .setFontFamily("Arial")
        .setFontSize(size)
        .build(),
    );
  }

  // Títulos e seções (apenas se existirem)
  boldIfExists("📘 Manual do Usuário", 16);
  boldIfExists("🎯 Objetivo desta planilha", 13);
  boldIfExists("📌 Onde está o menu?", 13);
  boldIfExists("🧭 O que o menu faz?", 13);
  boldIfExists("▶️ Processamento de Imagens", 13);
  boldIfExists("📂 Abrir Pasta de Trabalho", 13);
  boldIfExists("🔄 Atualizar Informações", 13);
  boldIfExists("🚫 O que NÃO fazer", 13);
  boldIfExists("ℹ️ Dicas importantes", 13);
  boldIfExists("✅ Resumo rápido", 13);

  // ======================================================
  // APLICA NA CÉLULA B2
  // ======================================================
  sheet
    .getRange("B2")
    .setRichTextValue(rt.build())
    .setWrap(true)
    .setVerticalAlignment("top")
    .setHorizontalAlignment("left");
}
