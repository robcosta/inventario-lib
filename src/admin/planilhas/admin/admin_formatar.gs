/**
 * ============================================================
 * PLANILHA CONTEXTO — FORMATAÇÃO (ID-BASED)
 * ============================================================
 * Responsável por formatar a Planilha Contexto
 * usando exclusivamente o ID do Spreadsheet.
 */

/**
 * Bridge chamada pelo menu.
 * Resolve o ID a partir do contexto ativo.
 */
function formatarPlanilhaContexto_() {
  const contexto = obterContextoAtivo_();

  if (!contexto || !contexto.planilhaAdminId) {
    throw new Error(
      'Contexto inválido: planilhaAdminId ausente ao formatar Planilha Contexto.'
    );
  }

  formatarPlanilhaContextoPorId_(contexto.planilhaAdminId);
}

/**
 * Função real (ID-based).
 * Pode ser chamada em testes e automações.
 */
function formatarPlanilhaContextoPorId_(spreadsheetId) {
  if (!spreadsheetId || typeof spreadsheetId !== 'string') {
    throw new Error('spreadsheetId inválido para formatação da Planilha Contexto.');
  }

  toast_(
    'Iniciando formatação da Planilha de Contexto...',
    'Formatação'
  );

  formatarPlanilha_(spreadsheetId);

  toast_(
    'Formatação da Planilha de Contexto concluída.',
    'Concluído',
    6
  );
}
