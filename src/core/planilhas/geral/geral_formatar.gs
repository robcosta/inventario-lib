function formatarPlanilhaGeral_() {

  const ui = SpreadsheetApp.getUi();
  toast_('Validando contexto...', 'Formatação');

  const contexto = resolverContextoAtual_();

  if (!contexto) {
    ui.alert('❌ Nenhum contexto ativo.');
    return;
  }

  if (!contexto.planilhaGeralId) {
    ui.alert('❌ Planilha Geral não definida no contexto.');
    return;
  }

  let planilha;

  try {
    planilha = SpreadsheetApp.openById(contexto.planilhaGeralId);
  } catch (e) {
    ui.alert('❌ Não foi possível acessar a Planilha Geral.\n\n' + e.message);
    return;
  }

  toast_(
    `Iniciando formatação da Planilha Geral (${planilha.getName()})`,
    'Formatação'
  );

  formatarPlanilha_(contexto.planilhaGeralId);

  toast_('Formatação da Planilha Geral concluída.', 'Concluído', 6);
}
