/**
 * ============================================================
 * PLANILHA GERAL — CRIAR OU RECRIAR (DOMÍNIO)
 * ============================================================
 *
 * Cria ou recria a Planilha Geral a partir dos CSVs
 * armazenados na pasta global CSV_GERAL.
 */
function criarOuRecriarPlanilhaGeral_() {

  const ui = SpreadsheetApp.getUi();
  const sistemaGlobal = obterSistemaGlobal_();
  const contexto = obterContextoDominio_();

  if (!contexto) {
    ui.alert('❌ Nenhum contexto ativo.');
    return;
  }

  if (!sistemaGlobal.pastaGeralId || !sistemaGlobal.pastaCSVGeralId) {
    ui.alert('❌ Pastas globais da Planilha Geral não configuradas.');
    return;
  }

  const pastaGeral = DriveApp.getFolderById(sistemaGlobal.pastaGeralId);
  const pastaCSV = DriveApp.getFolderById(sistemaGlobal.pastaCSVGeralId);

  const csvFiles = pastaCSV.getFilesByType(MimeType.CSV);

  if (!csvFiles.hasNext()) {
    ui.alert('Nenhum arquivo CSV encontrado em CSV_GERAL.');
    return;
  }

  // ============================================================
  // Confirma recriação
  // ============================================================

  if (contexto.planilhaGeralId) {

    const resp = ui.alert(
      'Planilha Geral',
      'Já existe uma Planilha Geral.\n\nDeseja RECRIAR a partir dos CSVs?\n\n⚠️ A planilha atual será removida.',
      ui.ButtonSet.YES_NO
    );

    if (resp !== ui.Button.YES) {
      toast_('Operação cancelada.', 'Planilha Geral');
      return;
    }

    try {
      DriveApp.getFileById(contexto.planilhaGeralId).setTrashed(true);
    } catch (e) {
      // silencioso — planilha pode já não existir
    }
  }

  toast_('Criando nova Planilha Geral...', 'Planilha Geral');

  const ss = SpreadsheetApp.create('GERAL: EM CONSTRUÇÃO');
  DriveApp.getFileById(ss.getId()).moveTo(pastaGeral);

  let dataMaisRecenteCSV = null;
  let criouAlgumaAba = false;

  const files = pastaCSV.getFilesByType(MimeType.CSV);

  toast_('Importando CSVs...', 'Planilha Geral');

  while (files.hasNext()) {

    const file = files.next();
    const dados = lerCSVComEdicao_(file);

    if (!dados || !dados.length) continue;

    const nomeAba = nomeAbaPorCSV_(file.getName());
    const sheet = ss.insertSheet(nomeAba);

    sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

    criouAlgumaAba = true;

    const dataArquivo = file.getLastUpdated();
    if (!dataMaisRecenteCSV || dataArquivo > dataMaisRecenteCSV) {
      dataMaisRecenteCSV = dataArquivo;
    }
  }

  if (criouAlgumaAba) {
    ss.deleteSheet(ss.getSheets()[0]);
  }

  if (dataMaisRecenteCSV) {

    const dataFormatada = Utilities.formatDate(
      dataMaisRecenteCSV,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm'
    );

    ss.rename(`GERAL: Importado em ${dataFormatada}`);
  }

  // ============================================================
  // Atualizações de estado
  // ============================================================

  // 🔹 Atualiza SISTEMA GLOBAL (fonte única)
  atualizarSistemaGlobal_({
    planilhaGeralId: ss.getId()
  });

  // 🔹 Atualiza contexto ativo (ADMIN ou CLIENTE)
  persistirContextoAtual_({
    planilhaGeralId: ss.getId()
  });

  toast_('Planilha Geral criada com sucesso!', 'Concluído', 6);
  ui.alert('Planilha Geral criada com sucesso a partir dos CSVs.');
}