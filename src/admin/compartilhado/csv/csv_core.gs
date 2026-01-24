/**
 * ============================================================
 * CSV — CORE COMPARTILHADO
 * ============================================================
 */

function salvarCSV_(nomeArquivo, dataUrl, pastaDestino) {

  if (!nomeArquivo || !nomeArquivo.toLowerCase().endsWith('.csv')) {
    throw new Error('Arquivo inválido. Apenas CSV.');
  }

  if (!dataUrl || !dataUrl.startsWith('data:')) {
    throw new Error('Conteúdo do arquivo inválido.');
  }

  const base64 = dataUrl.split(',')[1];
  const bytes = Utilities.base64Decode(base64);

  const blob = Utilities.newBlob(
    bytes,
    'text/csv',
    nomeArquivo
  );

  pastaDestino.createFile(blob);
}
