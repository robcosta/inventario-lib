/**
 * ============================================================
 * CSV — BACKEND (CORE)
 * ============================================================
 */

function receberCSV_(tipo, nomeArquivo, dataUrl) {

<<<<<<< HEAD
  let pastaDestino = null;

  if (tipo === 'GERAL') {
=======
  Logger.log('[CSV-BACKEND] Iniciando recebimento de CSV');
  Logger.log('[CSV-BACKEND] Tipo: ' + tipo);
  Logger.log('[CSV-BACKEND] Nome arquivo: ' + nomeArquivo);
  try {
    SpreadsheetApp.getActive().toast(
      'Recebendo arquivo: ' + nomeArquivo,
      '⏳ Iniciando importação',
      4
    );
  } catch (e) {}

  let pastaDestino = null;

  if (tipo === 'GERAL') {
    Logger.log('[CSV-BACKEND] Obtendo pasta CSV_GERAL...');
    try {
      SpreadsheetApp.getActive().toast(
        'Obtendo pasta CSV_GERAL...',
        '📂 Localizando pasta',
        3
      );
    } catch (e) {}
>>>>>>> bugfix-contexto-persistencia
    pastaDestino = obterPastaCSVGeral_();
  }

  if (tipo === 'CONTEXTO') {
<<<<<<< HEAD
=======
    Logger.log('[CSV-BACKEND] Obtendo pasta CSV_CONTEXTO...');
    try {
      SpreadsheetApp.getActive().toast(
        'Obtendo pasta CSV_CONTEXTO...',
        '📂 Localizando pasta',
        3
      );
    } catch (e) {}
>>>>>>> bugfix-contexto-persistencia
    pastaDestino = obterPastaCSVContexto_();
  }

  if (!pastaDestino) {
<<<<<<< HEAD
    throw new Error('Pasta de destino não encontrada para tipo: ' + tipo);
  }

  salvarCSV_(nomeArquivo, dataUrl, pastaDestino);
=======
    Logger.log('[CSV-BACKEND] ❌ ERRO: Pasta de destino não encontrada!');
    try {
      SpreadsheetApp.getActive().toast(
        'Erro: Pasta de destino não encontrada para tipo: ' + tipo,
        '❌ Erro ao salvar CSV',
        8
      );
    } catch (e) {}
    throw new Error('Pasta de destino não encontrada para tipo: ' + tipo);
  }

  Logger.log('[CSV-BACKEND] ✅ Pasta obtida: ' + pastaDestino.getName() + ' (ID: ' + pastaDestino.getId() + ')');
  try {
    SpreadsheetApp.getActive().toast(
      'Salvando arquivo em: ' + pastaDestino.getName(),
      '💾 Salvando CSV',
      4
    );
  } catch (e) {}

  salvarCSV_(nomeArquivo, dataUrl, pastaDestino);

  Logger.log('[CSV-BACKEND] ✅ CSV salvo com sucesso!');
>>>>>>> bugfix-contexto-persistencia
}