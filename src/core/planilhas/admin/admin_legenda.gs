/**
 * ============================================================
 * LEGENDA DINÂMICA — PLANILHA ADMIN (ENTERPRISE RESILIENTE)
 * ============================================================
 * ✔ Compatível com execução bound e externa
 * ✔ Não reabre planilha se já ativa
 * ✔ Não derruba execução por erro em aba específica
 * ✔ Limite máximo de 8 pastas
 * ✔ Tolerante a falhas internas do Spreadsheet
 * ============================================================
 */

function atualizarLegendasPlanilhaAdmin_(contexto) {

  if (!contexto?.planilhaAdminId) {
    return;
  }

  let pastas;
  try {
    pastas = obterPastasVivas_(contexto);
  } catch (e) {
    return;
  }

  let ss;

  try {
    const ssAtiva = SpreadsheetApp.getActiveSpreadsheet();

    if (ssAtiva && ssAtiva.getId() === contexto.planilhaAdminId) {
      ss = ssAtiva;
    } else {
      ss = SpreadsheetApp.openById(contexto.planilhaAdminId);
    }
  } catch (e) {
    return;
  }

  if (!ss) return;

  if (!pastas || pastas.length === 0) {
    limparLegendasAntigas_(ss);
    return;
  }

  // Ordenação única (já aplicada implicitamente no mapa,
  // mas garantimos visualmente também)
  pastas.sort((a, b) => a.nome.localeCompare(b.nome));

  if (pastas.length > 8) {
    return;
  }

  let richTextFinal;

  try {

    const builder = SpreadsheetApp.newRichTextValue();

    let texto = '';
    pastas.forEach(p => {
      texto += ` ■ ${p.nome}    `;
    });

    builder.setText(texto);

    let pos = 0;

    pastas.forEach(p => {

      const bloco = ` ■ ${p.nome}    `;

      const estiloIcone = SpreadsheetApp.newTextStyle()
        .setForegroundColor(p.cor) // 🔥 agora usa p.cor
        .setBold(true)
        .setFontSize(14)
        .build();

      const estiloTexto = SpreadsheetApp.newTextStyle()
        .setForegroundColor('#202124')
        .setBold(true)
        .setFontSize(10)
        .build();

      builder.setTextStyle(pos, pos + 2, estiloIcone);
      builder.setTextStyle(pos + 2, pos + bloco.length, estiloTexto);

      pos += bloco.length;
    });

    richTextFinal = builder.build();

  } catch (e) {
    return;
  }

  let abas;
  try {
    abas = ss.getSheets();
  } catch (e) {
    console.warn('[LEGENDA] Erro ao obter abas:', e.message);
    return;
  }

  abas.forEach(sheet => {
    try {
      if (!sheet) return;

      const nomeAba = sheet.getName();
      if (nomeAba === '__CONTROLE_PROCESSAMENTO__') return;
      if (nomeAba === 'CAPA') return;

      removerLegendaAntiga_(sheet);

      const ultimaLinha = sheet.getLastRow();
      const linhaDestino = ultimaLinha < 5 ? 10 : ultimaLinha + 2;
      const totalColunas = Math.max(sheet.getLastColumn(), 1);

      const range = sheet.getRange(linhaDestino, 1, 1, totalColunas);

      try { range.breakApart(); } catch (_) {}

      range
        .merge()
        .setBackground('#ffffff')
        .setRichTextValue(richTextFinal)
        .setHorizontalAlignment('left')
        .setVerticalAlignment('middle');
    } catch (e) {
      console.warn('[LEGENDA] Erro ao atualizar aba:', sheet ? sheet.getName() : '-', e.message);
    }
  });
}

/**
 * Remove legenda antiga com isolamento por aba
 */
function removerLegendaAntiga_(sheet) {

  try {

    const lastRow = sheet.getLastRow();
    if (!lastRow) return;

    const lastColumn = Math.max(sheet.getLastColumn(), 1);

    const data = sheet.getRange(1, 1, lastRow, 1).getValues();

    for (let i = data.length - 1; i >= 0; i--) {

      if (String(data[i][0]).includes('■')) {

        try {
          sheet.getRange(i + 1, 1, 1, lastColumn).breakApart();
        } catch (_) {}

        try {
          sheet.deleteRow(i + 1);
        } catch (_) {}
      }
    }

  } catch (e) {
    console.warn('[LEGENDA] Erro ao remover legenda antiga:', e.message);
  }
}


/**
 * Limpa legendas em todas as abas (seguro)
 */
function limparLegendasAntigas_(ss) {

  if (!ss) return;

  let abas;

  try {
    abas = ss.getSheets();
  } catch (e) {
    console.warn('[LEGENDA] Não foi possível obter abas para limpeza:', e.message);
    return;
  }

  abas.forEach(sheet => {
    try {
      removerLegendaAntiga_(sheet);
    } catch (_) {}
  });
}
