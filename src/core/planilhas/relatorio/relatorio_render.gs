/**
 * ============================================================
 * RELATÓRIOS — RENDERIZAÇÃO DA ABA "CAPA"
 * ============================================================
 *
 * Primeira versão estrutural.
 *
 * Estrutura:
 *  - Layout estrutural base
 *  - Cabeçalho PRF institucional
 *  - Título principal
 *  - Subtítulo: RELATÓRIOS
 *  - Rodapé institucional
 *
 * ❌ Ainda não possui bloco dinâmico de relatórios
 * ❌ Ainda não possui controle de processamento
 *
 * Base reutiliza módulos institucionais:
 *  - layoutBaseEstrutura_
 *  - layoutCabecalhoPRF_
 *  - layoutTituloPrincipal_
 *  - layoutRodapeInstitucional_
 *
 * ============================================================
 */
/**
 * ============================================================
 * RELATÓRIO — RENDERIZAÇÃO DA CAPA
 * ============================================================
 */
function renderizarPlanilhaRelatorio_(contexto, ssOverride) {

  if (!contexto) {
    throw new Error('renderizarPlanilhaRelatorio_: contexto inválido.');
  }

  const ss = ssOverride || SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw new Error('Nenhuma planilha ativa.');
  }

  let sheet = ss.getSheetByName('CAPA');

  if (!sheet) {
    sheet = ss.insertSheet('CAPA');
  }

  ss.setActiveSheet(sheet);
  sheet.clear();
  sheet.setHiddenGridlines(true);

  layoutBaseEstrutura_(sheet);
  layoutCabecalhoPRF_(sheet);
  layoutTituloPrincipal_(sheet, 'RELATÓRIO');

  layoutRodapeInstitucional_(sheet, 12);

  criarAbaControleRelatorio_(ss);
}