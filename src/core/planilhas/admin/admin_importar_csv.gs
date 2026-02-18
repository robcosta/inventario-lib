/**
 * ============================================================
 * PLANILHA CONTEXTO — IMPORTAR CSV (ID-BASED / CONTEXT-AWARE)
 * ============================================================
 * Responsável apenas por abrir o diálogo de importação.
 * A validação de contexto acontece ANTES da abertura.
 */

/**
 * Bridge chamada pelo menu.
 */
function importarCSVAdmin_() {
  const contexto = obterContextoAtivo_();

  if (!contexto || !contexto.planilhaAdminId) {
    throw new Error(
      'Contexto inválido: planilhaAdminId ausente ao importar CSV de Contexto.'
    );
  }

  abrirDialogImportacaoCSV_('ADMIN');
}