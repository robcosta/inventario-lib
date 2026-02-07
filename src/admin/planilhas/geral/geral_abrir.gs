/**
 * ============================================================
 * PLANILHA GERAL — ABRIR
 * ============================================================
 */

function abrirPlanilhaGeral_() {

  const ui = SpreadsheetApp.getUi();
  const planilha = obterPlanilhaGeral_();

  if (!planilha) {
    ui.alert('Nenhuma Planilha Geral encontrada.');
    return;
  }

  abrirPlanilhaNoNavegador_(planilha.getId());
}
