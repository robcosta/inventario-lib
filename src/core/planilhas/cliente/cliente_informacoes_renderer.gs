/**
 * ============================================================
 * CLIENTE — BLOCO DE INFORMAÇÕES PRINCIPAIS
 * ============================================================
 *
 * Renderiza:
 *  - Contexto de Trabalho
 *  - Pasta de Fotos ativa
 *
 * Layout centralizado conforme modelo institucional antigo.
 * ============================================================
 */
/**
 * ============================================================
 * CLIENTE — CONSTRUÇÃO DO LAYOUT INSTITUCIONAL
 * ============================================================
 */
function clienteConstruirLayoutBase_(sheet) {

  layoutBaseEstrutura_(sheet);
  layoutCabecalhoPRF_(sheet);
  layoutTituloPrincipal_(sheet);

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

  layoutRodapeInstitucional_(sheet, 18);
}