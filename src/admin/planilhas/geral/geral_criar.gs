/**
 * ============================================================
 * PLANILHA GERAL — CRIAR / RECRIAR (ID-BASED + DATA DOS CSVs)
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
  const existePlanilha = existentes.hasNext();

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
  // 🗑️ Remove planilhas antigas
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
  // 🆕 Cria nova planilha (nome provisório)
  // ==========================================================
  toast_('Criando nova Planilha Geral...', 'Planilha Geral');

  const ss = SpreadsheetApp.create('GERAL: EM CONSTRUÇÃO');
  DriveApp.getFileById(ss.getId()).moveTo(pastaGeral);

  // ==========================================================
  // 💾 Registra IDs no sistema global
  // ==========================================================
  setPlanilhaGeralId_(ss.getId());

  atualizarSistemaGlobal_({
    pastaGeralId: pastaGeral.getId(),
    pastaCSVGeralId: pastaCSV.getId()
  });

  Logger.log('[GERAL] Planilha criada: ' + ss.getId());

  const abaPadrao = ss.getSheets()[0];
  let criouAlgumaAba = false;
  let dataMaisRecenteCSV = null;

  const files = pastaCSV.getFilesByType(MimeType.CSV);

  toast_('Importando CSVs...', 'Planilha Geral');

  while (files.hasNext()) {
    const file = files.next();

    const dados = lerCSVComEdicao_(file);
    if (!dados || !dados.length) continue;

    const nomeAba = nomeAbaPorCSV_(file.getName());
    const sheet = ss.insertSheet(nomeAba);

    sheet
      .getRange(1, 1, dados.length, dados[0].length)
      .setValues(dados);

    criouAlgumaAba = true;

    // 🕒 Captura data mais recente dos CSVs
    const dataArquivo = file.getLastUpdated();
    if (!dataMaisRecenteCSV || dataArquivo > dataMaisRecenteCSV) {
      dataMaisRecenteCSV = dataArquivo;
    }
  }

  // ==========================================================
  // 🧹 Remove aba padrão
  // ==========================================================
  if (criouAlgumaAba) {
    ss.deleteSheet(abaPadrao);
  }

  // ==========================================================
  // 🏷️ Renomear Planilha Geral com data do CSV
  // ==========================================================
  if (dataMaisRecenteCSV) {
    const dataFormatada = Utilities.formatDate(
      dataMaisRecenteCSV,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm'
    );

    ss.rename(`GERAL: Importado em ${dataFormatada}`);
  }

  toast_('Planilha Geral criada com sucesso!', 'Concluído', 6);
  ui.alert('Planilha Geral criada com sucesso a partir dos CSVs.');
}
