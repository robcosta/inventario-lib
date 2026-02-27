/**
 * ============================================================
 * LAYOUT — TÍTULO PRINCIPAL
 * ============================================================
 *
 * Renderiza:
 * - "INVENTÁRIO PATRIMONIAL"
 * - Opcionalmente um subtítulo (ex: RELATÓRIOS)
 *
 * Mantém posicionamento original:
 * - Coluna D
 * - Linha 6
 *
 * ============================================================
 */
function layoutTituloPrincipal_(sheet, subtitulo) {

  sheet.getRange("D6")
    .setValue("INVENTÁRIO PATRIMONIAL")
    .setFontFamily("Arial")
    .setFontSize(18)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  if (subtitulo) {
    sheet.getRange("D7")
      .setValue(subtitulo.toUpperCase())
      .setFontFamily("Arial")
      .setFontSize(16)
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
  }
}