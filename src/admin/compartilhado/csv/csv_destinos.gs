/**
 * ============================================================
 * CSV — DESTINOS
 * ============================================================
 */

function obterPastaCSVGeral_() {
  const geral = obterPastaGeral_();
  if (!geral) return null;

  return obterOuCriarSubpasta_(geral, 'CSV_GERAL');
}

function obterPastaCSVContexto_() {
  const contexto = obterContextoAtivo_();
  if (!contexto || !contexto.pastaContextoId) return null;

  const pastaContexto = DriveApp.getFolderById(contexto.pastaContextoId);
  return obterOuCriarSubpasta_(pastaContexto, 'CSV_CONTEXTO');
}
