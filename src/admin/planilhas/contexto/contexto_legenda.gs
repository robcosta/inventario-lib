/**
 * Reconstrói a legenda em todas as abas com fundo branco e lista completa de pastas.
 */
/**
 * Limpa legendas anteriores e reconstrói uma barra única na Coluna A.
 */
/**
 * Reconstrói a legenda mesclando colunas para não esticar a Coluna A.
 */
function atualizarLegendasPlanilhaContexto_(contexto) {
  if (!contexto?.planilhaOperacionalId) return;

  // 1. Busca apenas pastas que existem no Drive
  const listaPastas = obterPastasVivas_(contexto);
  if (listaPastas.length === 0) {
    // Se não houver pastas, apenas limpa as legendas antigas e sai
    limparLegendasAntigas_(contexto.planilhaOperacionalId);
    return;
  }

  const ss = SpreadsheetApp.openById(contexto.planilhaOperacionalId);

  // 2. Monta o RichText (Mesma lógica anterior...)
  const builder = SpreadsheetApp.newRichTextValue();
  let textoAcumulado = "";
  listaPastas.forEach(p => { textoAcumulado += ` ■ ${p.nome}    `; });
  builder.setText(textoAcumulado);

  let pos = 0;
  listaPastas.forEach(p => {
    const bloco = ` ■ ${p.nome}    `;
    const estiloIcone = SpreadsheetApp.newTextStyle().setForegroundColor(p.cor).setBold(true).setFontSize(14).build();
    const estiloTexto = SpreadsheetApp.newTextStyle().setForegroundColor("#202124").setBold(true).setFontSize(10).build();
    builder.setTextStyle(pos, pos + 2, estiloIcone);
    builder.setTextStyle(pos + 2, pos + bloco.length, estiloTexto);
    pos += bloco.length;
  });
  const richTextFinal = builder.build();

  // 3. Aplica nas abas limpando e mesclando
  ss.getSheets().forEach(sheet => {
    if (sheet.getName() === '__CONTROLE_PROCESSAMENTO__') return;

    // Limpeza (Procura o ■ e remove a linha)
    const lastRowScan = sheet.getLastRow();
    if (lastRowScan > 0) {
      const data = sheet.getRange(1, 1, lastRowScan, 1).getValues();
      for (let i = data.length - 1; i >= 0; i--) {
        if (String(data[i][0]).indexOf("■") !== -1) {
          sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).breakApart();
          sheet.deleteRow(i + 1);
        }
      }
    }

    const novaLastRow = sheet.getLastRow();
    const linhaAlvo = novaLastRow < 5 ? 10 : novaLastRow + 2;
    const rangeLegenda = sheet.getRange(linhaAlvo, 1, 1, 9); 

    rangeLegenda.merge()
      .setBackground("#ffffff")
      .setRichTextValue(richTextFinal)
      .setVerticalAlignment("middle")
      .setHorizontalAlignment("left");
  });
}

/**
 * Função auxiliar para limpar quando não houver mais pastas
 */
function limparLegendasAntigas_(planilhaId) {
  const ss = SpreadsheetApp.openById(planilhaId);
  ss.getSheets().forEach(sheet => {
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) return;
    const data = sheet.getRange(1, 1, lastRow, 1).getValues();
    for (let i = data.length - 1; i >= 0; i--) {
      if (String(data[i][0]).indexOf("■") !== -1) {
        sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).breakApart();
        sheet.deleteRow(i + 1);
      }
    }
  });
}