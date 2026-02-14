/**
 * ============================================================
 * PLANILHA CONTEXTO — ABRIR
 * ============================================================
 */

function abrirPlanilhaContexto_() {

  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();
  let planilhaId = contexto && contexto.planilhaAdminId;

  if (!planilhaId) {
    const rawClient = PropertiesService
      .getDocumentProperties()
      .getProperty('CONTEXTO_TRABALHO');

    if (rawClient) {
      try {
        const clientContexto = JSON.parse(rawClient);
        const lista = listarContextos_();
        const alvo = lista.find(c =>
          (c.nome || '').toUpperCase() === (clientContexto.nome || '').toUpperCase()
        );
        if (alvo && alvo.planilhaAdminId) {
          planilhaId = alvo.planilhaAdminId;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  if (!planilhaId) {
    ui.alert('Nenhuma Planilha Contexto encontrada.');
    return;
  }

  abrirPlanilhaNoNavegador_(planilhaId);
}
