function formatarPlanilhaGeral_() {

  toast_('Localizando Planilha Geral...', 'Formatação');

  const planilha = obterPlanilhaGeral_();
  if (!planilha) {
    SpreadsheetApp.getUi().alert(
      'Planilha Geral não encontrada na pasta GERAL.'
    );
    return;
  }

  toast_(
    `Iniciando formatação da Planilha Geral (${planilha.getName()})`,
    'Formatação'
  );

  formatarPlanilha_(planilha.getId());

  toast_('Formatação da Planilha Geral concluída.', 'Concluído', 6);
}
