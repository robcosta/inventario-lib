/**
 * ============================================================
 * CLIENTE — LAYOUT BASE
 * ============================================================
 */
function clienteConstruirLayoutBase_(sheet) {

  sheet.setRowHeight(4, 60);

  sheet.setColumnWidth(1, 300);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 300);
  sheet.setColumnWidth(4, 60);
  sheet.setColumnWidth(5, 300);
  sheet.setColumnWidth(6, 120);

  // Cabeçalho
  sheet.getRange("B4:F4").setBackground("#1b1464");

  sheet.getRange("B4")
    .setValue("PRF")
    .setFontFamily("Graduate")
    .setFontSize(36)
    .setFontColor("#f7d046")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet.getRange("C4")
    .setValue("Inventário Patrimonial")
    .setFontFamily("Arial")
    .setFontSize(15)
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle");

  sheet.getRange("D6")
    .setValue("INVENTÁRIO PATRIMONIAL")
    .setFontFamily("Arial")
    .setFontSize(18)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  // Rótulos
  const labels = [
    ["C8", "CONTEXTO DE TRABALHO :"],
    ["C9", "PASTA DE FOTOS ............... :"],
    ["C10", "ACESSOS:"],
  ];

  labels.forEach(([cell, text]) => {
    sheet.getRange(cell)
      .setValue(text)
      .setFontFamily("Arial")
      .setFontSize(12)
      .setFontWeight("bold")
      .setHorizontalAlignment("left")
      .setVerticalAlignment("middle");
  });

  rodape_(sheet, 10);
}
