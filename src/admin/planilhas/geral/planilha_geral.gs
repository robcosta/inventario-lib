/**
 * ============================================================
 * PLANILHA GERAL — CORE
 * ============================================================
 */

function obterPastaGeral_() {
  const raiz = obterPastaInventario_();
  if (!raiz) return null;

  const planilha = obterOuCriarSubpasta_(raiz, 'PLANILHAS');
  return obterOuCriarSubpasta_(planilha, 'GERAL');
}

function obterPastaCSVGeral_() {
  const geral = obterPastaGeral_();
  if (!geral) return null;

  return obterOuCriarSubpasta_(geral, 'CSV_GERAL');
}

function obterPlanilhaGeral_() {
  const pastaGeral = obterPastaGeral_();
  if (!pastaGeral) return null;

  const files = pastaGeral.getFilesByType(MimeType.GOOGLE_SHEETS);
  return files.hasNext() ? files.next() : null;
}
