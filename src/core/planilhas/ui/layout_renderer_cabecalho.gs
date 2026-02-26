/**
 * ============================================================
 * LAYOUT — CABEÇALHO INSTITUCIONAL PRF
 * ============================================================
 *
 * Renderiza:
 * - Faixa azul institucional
 * - PRF em Graduate amarelo
 * - "Inventário Patrimonial" em branco
 *
 * ⚠️ Visual fiel ao layout original.
 * ⚠️ NÃO deve ser modificado.
 *
 * Reutilizável por qualquer planilha institucional.
 * ============================================================
 */
function layoutCabecalhoPRF_(sheet) {

  // Faixa azul
  sheet.getRange("B4:F4").setBackground("#1b1464");

  // PRF
  sheet.getRange("B4")
    .setValue("PRF")
    .setFontFamily("Graduate")
    .setFontSize(36)
    .setFontColor("#f7d046")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  // Texto lateral
  sheet.getRange("C4")
    .setValue("Inventário Patrimonial")
    .setFontFamily("Arial")
    .setFontSize(15)
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle");
}