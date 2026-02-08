/**
 * ============================================================
 * CSV — DESTINOS
 * ============================================================
 */

/**
 * NOTA: obterPastaCSVGeral_() foi removida (duplicação).
 * Use a versão em: admin/planilhas/geral/util/geral_util.gs
 */

function obterPastaCSVContexto_() {
  const contexto = obterContextoAtivo_();
  if (!contexto || !contexto.pastaContextoId) return null;

  const pastaContexto = DriveApp.getFolderById(contexto.pastaContextoId);
  return obterOuCriarSubpasta_(pastaContexto, 'CSV_CONTEXTO');
}
