/**
 * ============================================================
 * CONTEXTO RELATÓRIO — MANAGER
 * ============================================================
 */

function salvarContextoRelatorio_(contexto) {
  if (!contexto || typeof contexto !== 'object') {
    return;
  }

  PropertiesService
    .getDocumentProperties()
    .setProperty(
      PROPRIEDADES_RELATORIO.CONTEXTO_RELATORIO,
      JSON.stringify({
        ...contexto,
        tipo: 'RELATORIO'
      })
    );
}

function descobrirContextoRelatorioAutomaticamente_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;

  const planilhaAtualId = ss.getId();
  const contextos = listarContextos_();
  if (!contextos || !contextos.length) return null;

  const encontrado = contextos.find(ctx => ctx.planilhaRelatorioId === planilhaAtualId);
  if (!encontrado) return null;

  salvarContextoRelatorio_(encontrado);
  return encontrado;
}
