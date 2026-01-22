/**
 * ============================================================
 * CSV — BACKEND
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
    throw new Error('Pasta de destino não encontrada.');
  }

  salvarCSV_(nomeArquivo, dataUrl, pastaDestino);
}
