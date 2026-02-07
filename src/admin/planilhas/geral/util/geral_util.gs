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
  if (!pastaGeral) return null;

  const files = pastaGeral.getFilesByType(MimeType.GOOGLE_SHEETS);
  if (!files.hasNext()) return null;

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
