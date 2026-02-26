/**
 * ============================================================
 * LAYOUT BASE — ESTRUTURA FÍSICA PADRÃO PRF
 * ============================================================
 *
 * Define:
 * - Altura da linha do cabeçalho
 * - Largura oficial das colunas
 *
 * ⚠️ NÃO altera conteúdo.
 * ⚠️ NÃO aplica texto.
 * ⚠️ Apenas estrutura visual base.
 *
 * Reutilizável por:
 * - Cliente
 * - Relatórios
 * - Futuras planilhas institucionais
 * ============================================================
 */
function layoutBaseEstrutura_(sheet) {

  // Altura do cabeçalho
  sheet.setRowHeight(4, 60);

  // Larguras oficiais (padrão institucional)
  sheet.setColumnWidth(1, 300);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 300);
  sheet.setColumnWidth(4, 60);
  sheet.setColumnWidth(5, 300);
  sheet.setColumnWidth(6, 120);
}