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

  Logger.log(`renderizarPlanilhaRelatorio_: renderizando aba CAPA para o contexto ${contexto.nome || 'não definido'}`);

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

  relatorioRenderAbaManual_(ss);
  criarAbaControleRelatorio_(ss);
}

function relatorioRenderAbaManual_(ss) {
  let manual = ss.getSheetByName('MANUAL');

  if (!manual) {
    manual = ss.insertSheet('MANUAL');
  }

  manual.clear();
  manual.setHiddenGridlines(true);
  manual.getRange('A1').setValue('MANUAL — RELATÓRIO');
  manual.getRange('A2').setValue('Aba reservada para orientações e procedimentos do relatório.');
}