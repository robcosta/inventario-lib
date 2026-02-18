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
    ["C9", "PASTA DE FOTOS ............... :"],
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
  cliente_formatarAbaManual_(ss.getId());
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


/**
 * ============================================================
 * CLIENTE — FORMATAR ABA MANUAL
 * ============================================================
 *
 * - Cria ou atualiza a aba MANUAL
 * - Insere texto formatado
 * - Ajusta altura da linha automaticamente
 * - Não utiliza altura fixa
 */
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
  // DIMENSÕES
  // ======================================================
  sheet.setColumnWidth(1, 50);    // A
  sheet.setColumnWidth(2, 1150);  // B

  sheet.setRowHeight(1, 50);
  sheet.setRowHeight(2, 21); // altura base padrão

  // ======================================================
  // TEXTO DO MANUAL (DESACOPLADO)
  // ======================================================
  const texto = obterTextoManualCliente_();

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
        .build()
    );
  }

  // Formatação básica de títulos
  boldIfExists("📘 MAUAL DO USUÁRIO", 16);
  boldIfExists("🎯 Objetivo desta planilha", 13);
  boldIfExists("📌 Onde está o menu?", 13);
  boldIfExists("🧭 O que o menu faz?", 13);
  boldIfExists("🔄 Atualizar Informações", 13);
  boldIfExists("📂 Área de Fotos", 13);
  boldIfExists("🖼️ Processar Imagens", 13);
  boldIfExists("📖 Planilhas", 13);
  boldIfExists("🔎 Diagnóstico", 13);
  boldIfExists("🚫 O que NÃO fazer", 13);
  boldIfExists("ℹ️ Dicas importantes", 13);
  boldIfExists("✅ Resumo rápido", 13);

  // texto de introdução
  sheet
    .getRange("B1") 
    .setVerticalAlignment("middle")  
    .setHorizontalAlignment("left")
    .setFontFamily("Arial")
    .setFontSize(13)
    .setFontColor("#232020")    
    .setFontWeight("bold")
    .setValue("Dois cliques dentro da célula B2 para abrir o manual completo do usuário.");

  sheet
  .getRange("B2")
  .setRichTextValue(rt.build())
  .setWrap(true)
  .setVerticalAlignment("top")
  .setHorizontalAlignment("left");
}
