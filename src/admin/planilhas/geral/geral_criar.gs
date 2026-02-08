/**
 * ============================================================
 * PLANILHA GERAL — CRIAR / RECRIAR
 * ============================================================
 */
function criarOuRecriarPlanilhaGeral_() {

  const ui = SpreadsheetApp.getUi();
  const pastaGeral = obterPastaGeral_();
  const pastaCSV = obterPastaCSVGeral_();

  if (!pastaCSV) {
    ui.alert('Pasta CSV_GERAL não encontrada.');
    return;
  }

  const csvFiles = pastaCSV.getFilesByType(MimeType.CSV);
  if (!csvFiles.hasNext()) {
    ui.alert('Nenhum arquivo CSV encontrado em CSV_GERAL.');
    return;
  }

  // ==========================================================
  // 🔎 Verifica se já existe Planilha Geral
  // ==========================================================
  const existentes = pastaGeral.getFilesByType(MimeType.GOOGLE_SHEETS);
  let existePlanilha = existentes.hasNext();

  if (existePlanilha) {
    const resp = ui.alert(
      'Planilha Geral',
      'Já existe uma Planilha Geral.\n\nDeseja RECRIAR a partir dos CSVs?\n\n⚠️ A planilha atual será removida.',
      ui.ButtonSet.YES_NO
    );
    if (resp !== ui.Button.YES) {
      toast_('Operação cancelada pelo usuário.', 'Planilha Geral');
      return;
    }
  }

  toast_('Preparando recriação da Planilha Geral...', 'Planilha Geral');

  // ==========================================================
  // 🗑️ Remove TODAS as planilhas antigas da pasta
  // ==========================================================
  let removidas = 0;
  const antigos = pastaGeral.getFilesByType(MimeType.GOOGLE_SHEETS);

  while (antigos.hasNext()) {
    antigos.next().setTrashed(true);
    removidas++;
  }

  if (removidas > 0) {
    toast_(`${removidas} planilha(s) antiga(s) removida(s).`, 'Planilha Geral');
  }

  // ==========================================================
  // 🆕 Cria nova planilha
  // ==========================================================
  toast_('Criando nova Planilha Geral...', 'Planilha Geral');

  const ss = SpreadsheetApp.create('Planilha Geral');
  DriveApp.getFileById(ss.getId()).moveTo(pastaGeral);

<<<<<<< HEAD
  // registra o ID correto
  setPlanilhaGeralId_(ss.getId());
=======
  // ==========================================================
  // 💾 Registra IDs no sistema global
  // ==========================================================
  setPlanilhaGeralId_(ss.getId());
  // Confirmação visual e log
  try {
    toast_('ID da nova Planilha Geral salvo: ' + ss.getId(), 'ID Atualizado', 5);
  } catch (e) {}
  Logger.log('[GERAL] Novo ID da Planilha Geral salvo: ' + ss.getId());

  atualizarSistemaGlobal_({
    pastaGeralId: pastaGeral.getId(),
    pastaCSVGeralId: pastaCSV.getId()
  });
  Logger.log('[GERAL] IDs salvos: planilha=' + ss.getId() + ', pastaGeral=' + pastaGeral.getId() + ', pastaCSV=' + pastaCSV.getId());
>>>>>>> bugfix-contexto-persistencia

  const abaPadrao = ss.getSheets()[0];
  let criouAlgumaAba = false;

  const files = pastaCSV.getFilesByType(MimeType.CSV);

  toast_('Importando CSVs...', 'Planilha Geral');

  while (files.hasNext()) {
    const file = files.next();
<<<<<<< HEAD
    const dados = lerCSV_(file);
=======
    let dados = lerCSVComEdicao_(file);
>>>>>>> bugfix-contexto-persistencia

    if (!dados || !dados.length) continue;

    const nomeAba = nomeAbaPorCSV_(file.getName());
    const sheet = ss.insertSheet(nomeAba);

    sheet
      .getRange(1, 1, dados.length, dados[0].length)
      .setValues(dados);

    criouAlgumaAba = true;
  }

  // ==========================================================
  // 🧹 Remove aba padrão
  // ==========================================================
  if (criouAlgumaAba) {
    ss.deleteSheet(abaPadrao);
  }

  toast_('Planilha Geral criada com sucesso!', 'Concluído', 6);

  ui.alert('Planilha Geral criada com sucesso a partir dos CSVs.');
}
