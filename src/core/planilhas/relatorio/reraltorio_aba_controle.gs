/**
 * ============================================================
 * RELATÓRIO — ABA DE CONTROLE
 * ============================================================
 *
 * Garante existência da aba técnica:
 * __CONTROLE_PROCESSAMENTO__
 *
 * Essa aba é:
 * - Técnica
 * - Oculta
 * - Protegida futuramente
 *
 * ============================================================
 */
function criarAbaControleRelatorio_(ss) {

  if (!ss) {
    throw new Error('criarAbaControleRelatorio_: Spreadsheet não informado.');
  }

  let sheet = ss.getSheetByName('__CONTROLE_PROCESSAMENTO__');

  if (!sheet) {
    sheet = ss.insertSheet('__CONTROLE_PROCESSAMENTO__');
  }

  sheet.clear();
  sheet.setHiddenGridlines(true);

  sheet.getRange('A1').setValue('DATA_GERACAO');
  sheet.getRange('B1').setValue('USUARIO');
  sheet.getRange('C1').setValue('RELATORIO');
  sheet.getRange('D1').setValue('OBSERVACOES');

  sheet.hideSheet();
}