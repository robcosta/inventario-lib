/**
 * ============================================================
 * PLANILHA GERAL — ABRIR
 * ============================================================
 */
/*function abrirPlanilhaGeral_() {

  const ui = SpreadsheetApp.getUi();
  const planilha = obterPlanilhaGeral_();

  if (!planilha) {
    ui.alert('Nenhuma Planilha Geral encontrada.');
    return;
  }

  abrirPlanilhaNoNavegador_(planilha.getId());
}
*/
function abrirPlanilhaGeral_() {

  const ui = SpreadsheetApp.getUi();

  let id;

  try {
    id = resolverPlanilhaGeralId_();
  } catch (e) {
    ui.alert('❌ ' + e.message);
    return;
  }

  abrirPlanilhaNoNavegador_(id);
}

