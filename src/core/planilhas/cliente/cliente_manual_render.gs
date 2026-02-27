/**
 * ============================================================
 * CLIENTE — FORMATAR ABA MANUAL
 * ============================================================
 *
 * - Cria ou atualiza a aba MANUAL
 * - Insere texto formatado
 * - Ajusta altura dinamicamente
 */
function clienteRenderAbaManual_(spreadsheetId) {

  const ss = SpreadsheetApp.openById(spreadsheetId);

  let sheet = ss.getSheetByName("MANUAL");

  if (!sheet) {
    sheet = ss.insertSheet("MANUAL");
  }

  sheet.clear();
  sheet.clearFormats();
  sheet.setHiddenGridlines(true);

  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 1150);

  sheet.setRowHeight(1, 50);
  sheet.setRowHeight(2, 21);

  const texto = obterTextoManualCliente_();

  let richText = SpreadsheetApp.newRichTextValue().setText(texto);

  function boldIfExists(fragment, size) {

    const index = texto.indexOf(fragment);
    if (index === -1) return;

    richText = richText.setTextStyle(
      index,
      index + fragment.length,
      SpreadsheetApp.newTextStyle()
        .setBold(true)
        .setFontFamily("Arial")
        .setFontSize(size)
        .build()
    );
  }

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

  sheet.getRange("B1")
    .setValue("Dois cliques dentro da célula B2 para abrir o manual completo do usuário.")
    .setFontFamily("Arial")
    .setFontSize(13)
    .setFontWeight("bold")
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle");

  sheet.getRange("B2")
    .setRichTextValue(richText.build())
    .setWrap(true)
    .setVerticalAlignment("top")
    .setHorizontalAlignment("left");
}