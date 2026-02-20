/**
 * ============================================================
 * PLANILHA ADMIN — ABRIR
 * ============================================================
 *
 * Abre a planilha ADMIN do contexto atual
 * usando a UI padrão abrirPlanilhaNoNavegador_.
 */
function adminAbrirPlanilha_() {

  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoDominio_();

  if (!contexto) {
    ui.alert('❌ Nenhum contexto ativo.');
    return;
  }

  if (!contexto.planilhaAdminId) {
    ui.alert('❌ Planilha ADMIN não configurada.');
    return;
  }

  try {
    abrirPlanilhaNoNavegador_(contexto.planilhaAdminId);
  } catch (e) {
    ui.alert(
      '❌ Não foi possível abrir a Planilha Admin.\n\n' + e.message
    );
  }
}