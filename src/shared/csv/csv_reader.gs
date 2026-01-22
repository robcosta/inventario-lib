/**
 * ============================================================
 * CSV — LEITURA
 * ============================================================
 */

function lerCSV_(file) {
  const content = file.getBlob().getDataAsString('UTF-8');
  return Utilities.parseCsv(content);
}

function nomeAbaPorCSV_(nomeArquivo) {
  return nomeArquivo.replace(/\.csv$/i, '').substring(0, 99);
}
