/**
 * ============================================================
 * CSV — BACKEND (CORE)
 * ============================================================
 */

function receberCSV_(tipo, nomeArquivo, dataUrl) {

  let pastaDestino = null;

  if (tipo === 'GERAL') {
    pastaDestino = obterPastaCSVGeral_();
  }

  if (tipo === 'CONTEXTO') {
    pastaDestino = obterPastaCSVContexto_();
  }

  if (!pastaDestino) {
    throw new Error('Pasta de destino não encontrada para tipo: ' + tipo);
  }

  salvarCSV_(nomeArquivo, dataUrl, pastaDestino);
}