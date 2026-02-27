/**
 * ============================================================
 * RELATÓRIO — RENDERIZAÇÃO UNIVERSAL
 * ============================================================
 *
 * Pode ser chamada pela:
 * - ADMIN
 * - CLIENTE
 * - própria RELATÓRIO
 */
function relatorioRenderizarCapa() {

  const contexto = obterContextoDominio_();

  if (!contexto) {
    throw new Error('Nenhum contexto ativo.');
  }

  if (!contexto.planilhaRelatorioId) {
    throw new Error('ID da planilha RELATÓRIO não encontrado no contexto.');
  }

  const ssAtual = SpreadsheetApp.getActiveSpreadsheet();

  // ==========================================================
  // Se já estiver na RELATÓRIO
  // ==========================================================

  if (ssAtual.getId() === contexto.planilhaRelatorioId) {

    renderizarPlanilhaRelatorio_(contexto, ssAtual);
    return;
  }

  // ==========================================================
  // Se estiver na ADMIN ou CLIENTE
  // ==========================================================

  const ssRelatorio = SpreadsheetApp.openById(contexto.planilhaRelatorioId);

  renderizarPlanilhaRelatorio_(contexto, ssRelatorio);
}