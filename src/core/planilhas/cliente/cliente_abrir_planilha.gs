/**
 * ============================================================
 * PLANILHA CLIENTE — ABRIR (ADMIN)
 * ============================================================
 *
 * Abre a planilha CLIENTE do contexto atual
 * usando a UI padrão abrirPlanilhaNoNavegador_.
 */
function abrirPlanilhaCliente_() {

  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoDominio_();

  if (!contexto) {
    ui.alert("❌ Nenhum contexto ativo.");
    return;
  }

  if (!contexto.planilhaClienteId) {
    ui.alert("❌ Planilha CLIENTE não configurada.");
    return;
  }

  abrirPlanilhaNoNavegador_(contexto.planilhaClienteId);
}