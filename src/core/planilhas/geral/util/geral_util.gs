/**
 * ============================================================
 * PLANILHA GERAL — CORE
 * ============================================================
 */
/**
/**
 * Retorna a Planilha Geral (Spreadsheet)
 * - Prioridade: ScriptProperties
 * - Fallback: busca na pasta GERAL e sincroniza o ID
 *
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet|null}
 */
function obterPlanilhaGeral_() {

  // 1️⃣ Tenta via ScriptProperties
  const id = obterPlanilhaGeralId_();
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {
      // ID inválido ou planilha removida → segue fallback
      Logger.log('[GERAL] ID salvo inválido, tentando localizar no Drive.');
    }
  }

  // 2️⃣ Fallback: busca na pasta GERAL
  const pastaGeral = obterPastaGeral_();
  const files = pastaGeral.getFilesByType(MimeType.GOOGLE_SHEETS);
  // 3️⃣ Busca o ID da pasta CSV_GERAL nas configurações e valida se é subpasta de GERAL
  let pastaCSV = null;
  if (sistemaGlobal.pastaCSVGeralId) {
    try {
      pastaCSV = DriveApp.getFolderById(sistemaGlobal.pastaCSVGeralId);
      // Confirma se CSV_GERAL é subpasta de GERAL
      let pai = pastaCSV.getParents();
      let isSubpasta = false;
      while (pai.hasNext()) {
        let p = pai.next();
        if (p.getId() === pastaGeral.getId()) {
          isSubpasta = true;
          break;
        }
      }
      if (!isSubpasta) {
        Logger.log('[CSV_GERAL] ERRO: Pasta CSV_GERAL não é subpasta de GERAL.');
        throw new Error('Pasta CSV_GERAL não é subpasta de GERAL.');
      }
    } catch (e) {
      Logger.log('[CSV_GERAL] ERRO: Pasta CSV_GERAL não encontrada ou inválida. Será criada.');
      pastaCSV = null;
    }
  }
  if (!pastaCSV) {
    pastaCSV = obterOuCriarSubpasta_(pastaGeral, 'CSV_GERAL');
    atualizarSistemaGlobal_({ pastaCSVGeralId: pastaCSV.getId() });
    Logger.log('[CSV_GERAL] Pasta CSV_GERAL criada/sincronizada: ' + pastaCSV.getId());
  }
  const file = files.next();
  const spreadsheet = SpreadsheetApp.openById(file.getId());

  // 3️⃣ Sincroniza o ID para uso futuro
  setPlanilhaGeralId_(spreadsheet.getId());

  return spreadsheet;
}

// ============================================================
// NOTA: obterPlanilhaGeralId_() e setPlanilhaGeralId_() 
// foram removidas deste arquivo. Versões atualizadas estão em:
// admin/compartilhado/config/sistema_global.gs
// ============================================================

/**
 * Obtém a pasta GERAL
 * - Prioridade: ScriptProperties (ID)
 * - Fallback: busca por estrutura e sincroniza IDs
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function obterPastaGeral_() {
  // 1️⃣ Tenta via ScriptProperties (ID)
  const sistemaGlobal = obterSistemaGlobal_();
  
  if (sistemaGlobal.pastaGeralId) {
    try {
      return DriveApp.getFolderById(sistemaGlobal.pastaGeralId);
    } catch (e) {
      Logger.log('[GERAL] ID de pasta GERAL inválido, buscando por estrutura...');
    }
  }

  // 2️⃣ Fallback: busca por estrutura
  const raiz = obterPastaInventario_();
  if (!raiz) return null;

  // Cria/obtém a pasta GERAL diretamente sob a raiz
  const pastaGeral = obterOuCriarSubpasta_(raiz, 'GERAL');

  // 3️⃣ Sincroniza ID para uso futuro
  atualizarSistemaGlobal_({
    pastaGeralId: pastaGeral.getId()
  });

  return pastaGeral;
}

/**
 * Obtém a pasta CSV_GERAL
 * - Prioridade: ScriptProperties (ID)
 * - Fallback: busca por estrutura e sincroniza ID
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function obterPastaCSVGeral_() {
  // 1️⃣ Sempre parte da raiz do projeto
  const sistemaGlobal = obterSistemaGlobal_();
  let pastaRaiz = null;
  try {
    pastaRaiz = DriveApp.getFolderById(sistemaGlobal.pastaRaizId);
  } catch (e) {
    Logger.log('[CSV_GERAL] ERRO: Pasta raiz do projeto não encontrada ou ID inválido.');
    throw new Error('Pasta raiz do projeto não encontrada. Configure o ID corretamente.');
  }
  if (!pastaRaiz) {
    Logger.log('[CSV_GERAL] ERRO: Pasta raiz do projeto não encontrada.');
    throw new Error('Pasta raiz do projeto não encontrada.');
  }


  // 2️⃣ Busca/recupera pasta GERAL diretamente na raiz
  let pastaGeral = obterOuCriarSubpasta_(pastaRaiz, 'GERAL');

  // 3️⃣ Busca/cria CSV_GERAL dentro de GERAL
  let pastaCSV = obterOuCriarSubpasta_(pastaGeral, 'CSV_GERAL');

  // 4️⃣ Sincroniza ID para uso futuro
  const idPastaCSV = pastaCSV.getId();
  atualizarSistemaGlobal_({ pastaCSVGeralId: idPastaCSV });
  Logger.log('[CSV_GERAL] ✅ Pasta CSV_GERAL sincronizada: ' + idPastaCSV);
  return pastaCSV;
}
