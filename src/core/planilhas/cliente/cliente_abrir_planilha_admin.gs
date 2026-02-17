function clientAbrirPlanilhaAdmin_() {

  const ui = SpreadsheetApp.getUi();
  const contexto = resolverContextoAtual_();

  if (!contexto) {
    ui.alert('❌ Nenhum contexto encontrado.');
    return;
  }

  if (!contexto.planilhaAdminId) {
    ui.alert('❌ ID da Planilha Admin não encontrado no contexto.');
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
