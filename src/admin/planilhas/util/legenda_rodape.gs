function aplicarLegendaRodape_(sheet, pastaTrabalho) {

  const nomeAba = sheet.getName();
  if (nomeAba === '__CONTROLE_PROCESSAMENTO__') return;

  const ultimaLinha = sheet.getLastRow() + 2;

  const cor = obterCorDaPastaTrabalho_(pastaTrabalho.id);

  const texto = `📂 Fotos: ${pastaTrabalho.nome} — ${new Date().toLocaleString()}`;

  const range = sheet.getRange(ultimaLinha, 1, 1, sheet.getLastColumn());

  range
    .merge()
    .setValue(texto)
    .setBackground(cor)
    .setFontStyle('italic')
    .setFontSize(10)
    .setHorizontalAlignment('left');
}

function aplicarLegendasPlanilhaContexto_() {

  const pasta = obterPastaTrabalho_();
  if (!pasta) return;

  const contexto = obterContextoAtivo_();
  const ss = SpreadsheetApp.openById(contexto.planilhaAdminId);

  ss.getSheets().forEach(sheet => {
    aplicarLegendaRodape_(sheet, pasta);
  });
}

