/**
 * ============================================================
 * PLANILHA RELATÓRIO — ABRIR
 * ============================================================
 */
function abrirPlanilhaRelatorio_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoDominio_();

  if (!contexto) {
    ui.alert('❌ Nenhum contexto ativo.');
    return;
  }

  let planilhaRelatorioId;
  try {
    planilhaRelatorioId = resolverPlanilhaRelatorioId_(contexto);
  } catch (e) {
    ui.alert('❌ ' + e.message);
    return;
  }

  abrirPlanilhaNoNavegador_(planilhaRelatorioId);
}
