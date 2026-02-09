/**
 * ============================================================
 * CSV — BACKEND (CORE)
 * ============================================================
 */

function receberCSV_(tipo, nomeArquivo, dataUrl) {

  Logger.log('[CSV] Recebendo CSV');
  Logger.log('[CSV] Tipo lógico: ' + tipo);
  Logger.log('[CSV] Arquivo: ' + nomeArquivo);

  let pastaDestino = null;

  // ==========================================================
  // CSV DA PLANILHA GERAL
  // ==========================================================
  if (tipo === 'GERAL') {
    pastaDestino = obterPastaCSVGeral_();
  }

  // ==========================================================
  // CSV DO CONTEXTO ADMIN (PADRÃO ÚNICO)
  // ==========================================================
  else {
    const contexto = obterContextoAtivo_();

    if (!contexto || !contexto.pastaCSVAdminId) {
      throw new Error(
        'Contexto inválido ou pasta CSV_ADMIN não configurada.'
      );
    }

    pastaDestino = DriveApp.getFolderById(
      contexto.pastaCSVAdminId
    );
  }

  if (!pastaDestino) {
    throw new Error(
      'Pasta de destino não resolvida (tipo=' + tipo + ')'
    );
  }

  salvarCSV_(nomeArquivo, dataUrl, pastaDestino);

  try {
    SpreadsheetApp.getActive().toast(
      'CSV importado com sucesso: ' + nomeArquivo,
      '✅ Importação concluída',
      4
    );
  } catch (e) {}
}
