/**
 * ============================================================
 * UTILITÁRIOS ADMINISTRATIVOS
 * ============================================================
 */

/**
 * Obtém a pasta raiz do inventário
 * Prioridade: ScriptProperties -> Pasta mãe da planilha ativa
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function obterPastaInventario_() {
  // 1️⃣ Tentar via configuração global (ID)
  const sistemaGlobal = obterSistemaGlobal_();
  
  if (sistemaGlobal.pastaRaizId) {
    try {
      return DriveApp.getFolderById(sistemaGlobal.pastaRaizId);
    } catch (e) {
      Logger.log('[UTILS] ID salvo inválido, tentando obter pela planilha ativa...');
    }
  }

  // 2️⃣ Fallback: obter pasta mãe da planilha ativa (ID)
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;

  const arquivo = DriveApp.getFileById(ss.getId());
  const pais = arquivo.getParents();
  if (!pais.hasNext()) return null;

  const pasta = pais.next();

  // 3️⃣ Sincroniza o ID para uso futuro
  atualizarSistemaGlobal_({ pastaRaizId: pasta.getId() });
  
  return pasta;
}

/**
 * Obtém ou cria uma subpasta
 * @param {GoogleAppsScript.Drive.Folder} pai
 * @param {string} nome
 * @return {GoogleAppsScript.Drive.Folder}
 */
function obterOuCriarSubpasta_(pai, nome) {
  const it = pai.getFoldersByName(nome);
  return it.hasNext() ? it.next() : pai.createFolder(nome);
}

/**
 * ============================================================
 * DRIVE — SUBPASTA (OBTER OU CRIAR)
 * ============================================================
 * Retorna uma subpasta existente ou cria se não existir.
 *
 * @param {GoogleAppsScript.Drive.Folder} pastaPai
 * @param {string} nomeSubpasta
 * @return {GoogleAppsScript.Drive.Folder}
 */
function obterOuCriarSubpasta_(pastaPai, nomeSubpasta) {
  if (!pastaPai) {
    throw new Error('obterOuCriarSubpasta_: pastaPai inválida.');
  }

  if (!nomeSubpasta || typeof nomeSubpasta !== 'string') {
    throw new Error('obterOuCriarSubpasta_: nomeSubpasta inválido.');
  }

  const it = pastaPai.getFoldersByName(nomeSubpasta);
  return it.hasNext()
    ? it.next()
    : pastaPai.createFolder(nomeSubpasta);
}
