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

  const planilhaRelatorioId = resolverPlanilhaRelatorioId_(contexto);

  const ssAtual = SpreadsheetApp.getActiveSpreadsheet();

  // ==========================================================
  // Se já estiver na RELATÓRIO
  // ==========================================================

  if (ssAtual.getId() === planilhaRelatorioId) {

    renderizarPlanilhaRelatorio_(contexto, ssAtual);
    return;
  }

  // ==========================================================
  // Se estiver na ADMIN ou CLIENTE
  // ==========================================================

  const ssRelatorio = SpreadsheetApp.openById(planilhaRelatorioId);

  renderizarPlanilhaRelatorio_(contexto, ssRelatorio);
}

function relatorioRenderMenu() {
  relatorioRenderMenu_();
}

function relatorioGerarVisaoGeral() {
  relatorioGerarVisaoGeral_();
}

function relatorioGerarBensPendentes() {
  relatorioGerarBensPendentes_();
}

function relatorioGerarBensEncontrados() {
  relatorioGerarBensEncontrados_();
}

function relatorioGerarBensOutraLocalidade() {
  relatorioGerarBensOutraLocalidade_();
}

function relatorioGerarBensEtiquetas() {
  relatorioGerarBensEtiquetas_();
}

function abrirPlanilhaRelatorio() {
  abrirPlanilhaRelatorio_();
}
