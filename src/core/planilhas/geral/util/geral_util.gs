/**
 * ============================================================
 * PLANILHA GERAL - UTILITARIOS DE PASTA
 * ============================================================
 */

/**
 * Resolve a pasta GERAL com prioridade para o sistema global.
 *
 * @return {GoogleAppsScript.Drive.Folder}
 */
function obterPastaGeral_() {
  const sistemaGlobal = obterSistemaGlobal_() || {};
  const pastaGeralId = String(sistemaGlobal.pastaGeralId || '').trim();

  if (pastaGeralId) {
    try {
      return DriveApp.getFolderById(pastaGeralId);
    } catch (e) {
      Logger.log('[GERAL] PASTA_GERAL_ID invalido/inacessivel. Tentando redescobrir.');
    }
  }

  const raiz = obterPastaInventario_();
  if (!raiz) {
    throw new Error('Pasta raiz do projeto nao encontrada.');
  }

  const pastaGeral = obterOuCriarSubpasta_(raiz, 'GERAL');

  atualizarSistemaGlobal_({
    pastaRaizId: raiz.getId(),
    pastaGeralId: pastaGeral.getId()
  });

  return pastaGeral;
}

/**
 * Resolve a pasta CSV_GERAL com prioridade para o sistema global.
 *
 * Ordem:
 * 1) Usa PASTA_CSV_GERAL_ID se valido.
 * 2) Fallback por PASTA_GERAL_ID.
 * 3) Fallback estrutural pela raiz do projeto.
 *
 * @return {GoogleAppsScript.Drive.Folder}
 */
function obterPastaCSVGeral_() {
  const sistemaGlobal = obterSistemaGlobal_() || {};
  const pastaCSVGeralId = String(sistemaGlobal.pastaCSVGeralId || '').trim();

  // Caminho principal: usar direto o ID salvo no sistema global.
  if (pastaCSVGeralId) {
    try {
      return DriveApp.getFolderById(pastaCSVGeralId);
    } catch (e) {
      Logger.log('[CSV_GERAL] PASTA_CSV_GERAL_ID invalido/inacessivel. Tentando redescobrir.');
    }
  }

  let pastaGeral = null;
  const pastaGeralId = String(sistemaGlobal.pastaGeralId || '').trim();

  if (pastaGeralId) {
    try {
      pastaGeral = DriveApp.getFolderById(pastaGeralId);
    } catch (e) {
      Logger.log('[CSV_GERAL] PASTA_GERAL_ID invalido/inacessivel. Tentando via raiz.');
    }
  }

  if (!pastaGeral) {
    const raiz = obterPastaInventario_();
    if (!raiz) {
      throw new Error('Pasta raiz do projeto nao encontrada.');
    }

    pastaGeral = obterOuCriarSubpasta_(raiz, 'GERAL');
    atualizarSistemaGlobal_({
      pastaRaizId: raiz.getId(),
      pastaGeralId: pastaGeral.getId()
    });
  }

  const pastaCSVGeral = obterOuCriarSubpasta_(pastaGeral, 'CSV_GERAL');

  atualizarSistemaGlobal_({
    pastaGeralId: pastaGeral.getId(),
    pastaCSVGeralId: pastaCSVGeral.getId()
  });

  return pastaCSVGeral;
}
