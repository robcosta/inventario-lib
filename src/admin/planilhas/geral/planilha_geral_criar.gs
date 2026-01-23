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

  const existente = obterPlanilhaGeral_();

  if (existente) {
    const resp = ui.alert(
      'Planilha Geral',
      'A Planilha Geral já existe.\n\nDeseja RECRIAR a partir dos CSVs?\n\n⚠️ Todas as abas serão apagadas.',
      ui.ButtonSet.YES_NO
    );
    if (resp !== ui.Button.YES) return;

    existente.setTrashed(true);
  }

  const ss = SpreadsheetApp.create('Planilha Geral');
  DriveApp.getFileById(ss.getId()).moveTo(pastaGeral);

  const defaultSheet = ss.getSheets()[0];

  let primeiraAbaCriada = false;
  let abaParaExcluir = defaultSheet;

  const files = pastaCSV.getFilesByType(MimeType.CSV);

  while (files.hasNext()) {
    const file = files.next();
    const dados = lerCSV_(file);

    if (!dados || !dados.length) continue;

    const nomeAba = nomeAbaPorCSV_(file.getName());
    const sheet = ss.insertSheet(nomeAba);

    sheet
      .getRange(1, 1, dados.length, dados[0].length)
      .setValues(dados);

    // Marca que já existe ao menos uma aba válida
    primeiraAbaCriada = true;
  }

  // Só agora removemos a aba padrão
  if (primeiraAbaCriada) {
    ss.deleteSheet(abaParaExcluir);
  }

  ui.alert('Planilha Geral criada com sucesso a partir dos CSVs.');
}
