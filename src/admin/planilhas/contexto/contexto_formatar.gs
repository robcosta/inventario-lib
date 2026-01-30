function formatarPlanilhaContexto_(spreadsheetId) {

  const id =
    spreadsheetId ||
    SpreadsheetApp.getActiveSpreadsheet().getId();

  toast_('Iniciando formatação da Planilha de Contexto...', 'Formatação');

  formatarPlanilha_(id);  

  toast_('Formatação da Planilha de Contexto concluída.', 'Concluído', 6);
}
