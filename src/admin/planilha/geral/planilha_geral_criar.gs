/**
 * ============================================================
 * PLANILHA GERAL — CRIAR / RECRIAR
 * ============================================================
 */

function criarOuRecriarPlanilhaGeral_() {

  const ui = SpreadsheetApp.getUi();
  const pastaGeral = obterPastaGeral_();

  if (!pastaGeral) {
    ui.alert('Pasta GERAL não encontrada.');
    return;
  }

  const existente = obterPlanilhaGeral_();

  if (existente) {
    const resp = ui.alert(
      'Planilha Geral',
      'Já existe uma Planilha Geral.\n\nDeseja RECRIAR?\n\n⚠️ Isso apagará a planilha atual.',
      ui.ButtonSet.YES_NO
    );

    if (resp !== ui.Button.YES) return;

    existente.setTrashed(true);
  }

  const ss = SpreadsheetApp.create('Planilha Geral');
  DriveApp.getFileById(ss.getId()).moveTo(pastaGeral);

  obterPastaCSVGeral_(); // garante a pasta CSV

  ui.alert('Planilha Geral criada com sucesso.');
}
