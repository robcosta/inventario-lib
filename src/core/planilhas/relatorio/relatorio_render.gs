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

  salvarContextoRelatorio_({
    ...contexto,
    planilhaRelatorioId: ss.getId()
  });

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
  removerAbasEmBrancoRelatorio_(ss);
  ordenarAbasRelatorio_(ss);

  try {
    const capa = ss.getSheetByName('CAPA');
    if (capa) ss.setActiveSheet(capa);
  } catch (e) {}
}

function removerAbasEmBrancoRelatorio_(ss) {
  const preservar = {
    CAPA: true,
    MANUAL: true,
    '__CONTROLE_PROCESSAMENTO__': true,
    'CONTROLE_PROCESSAMENTO': true
  };

  ss.getSheets().forEach(sheet => {
    const nome = sheet.getName();
    if (preservar[nome]) return;

    const range = sheet.getDataRange();
    if (
      range.getLastRow() === 1 &&
      range.getLastColumn() === 1 &&
      range.getValue() === '' &&
      ss.getSheets().length > 1
    ) {
      ss.deleteSheet(sheet);
    }
  });
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

function ordenarAbasRelatorio_(ss) {
  if (!ss) return;

  try {
    const capa = ss.getSheetByName('CAPA');
    if (capa) {
      ss.setActiveSheet(capa);
      ss.moveActiveSheet(1);
    }
  } catch (e) {}

  try {
    const manual = ss.getSheetByName('MANUAL');
    if (manual) {
      ss.setActiveSheet(manual);
      ss.moveActiveSheet(2);
    }
  } catch (e) {}

  try {
    const controle = ss.getSheetByName('__CONTROLE_PROCESSAMENTO__');
    if (controle) {
      ss.setActiveSheet(controle);
      ss.moveActiveSheet(ss.getSheets().length);
    }
  } catch (e) {}
}
