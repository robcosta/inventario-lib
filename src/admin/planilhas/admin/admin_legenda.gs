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
    console.warn('[LEGENDA] Contexto inválido.');
    return;
  }

  // 🔹 Obter pastas vivas
  let pastas;
  try {
    pastas = obterPastasVivas_(contexto);
  } catch (e) {
    console.error('[LEGENDA] Erro ao obter pastas:', e.message);
    return;
  }

  // 🔹 Resolver Spreadsheet (bound-safe)
  let ss;
  try {
    const ssAtiva = SpreadsheetApp.getActiveSpreadsheet();

    if (ssAtiva && ssAtiva.getId() === contexto.planilhaAdminId) {
      ss = ssAtiva;
    } else {
      ss = SpreadsheetApp.openById(contexto.planilhaAdminId);
    }
  } catch (e) {
    console.error('[LEGENDA] Falha ao acessar planilha ADMIN:', e.message);
    return;
  }

  if (!ss) {
    console.error('[LEGENDA] Spreadsheet não resolvido.');
    return;
  }

  // 🔹 Se não houver pastas → apenas limpar
  if (!pastas || pastas.length === 0) {
    limparLegendasAntigas_(ss);
    return;
  }

  // 🔹 Ordenação determinística
  pastas.sort((a, b) => a.nome.localeCompare(b.nome));

  if (pastas.length > 8) {
    console.error('[LEGENDA] Limite máximo de 8 pastas excedido.');
    return;
  }

  // 🔹 Mapa determinístico de cores
  const cores = Object.values(CORES_DESTAQUE);
  const mapaCores = {};

  pastas.forEach((p, index) => {
    mapaCores[p.id] = cores[index];
  });

  // 🔹 Construir RichText uma única vez
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
      const cor = mapaCores[p.id];

      const estiloIcone = SpreadsheetApp.newTextStyle()
        .setForegroundColor(cor)
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
    console.error('[LEGENDA] Erro ao montar RichText:', e.message);
    return;
  }

  // 🔹 Aplicar legenda aba por aba (isolado)
  let abas;

  try {
    abas = ss.getSheets();
  } catch (e) {
    console.error('[LEGENDA] Falha ao obter abas:', e.message);
    return;
  }

  if (!abas || abas.length === 0) {
    console.warn('[LEGENDA] Nenhuma aba encontrada.');
    return;
  }

  abas.forEach(sheet => {

    try {

      if (!sheet || sheet.getName() === '__CONTROLE_PROCESSAMENTO__') {
        return;
      }

      removerLegendaAntiga_(sheet);

      const ultimaLinha = sheet.getLastRow();
      const linhaDestino = ultimaLinha < 5 ? 10 : ultimaLinha + 2;

      const totalColunas = Math.max(sheet.getLastColumn(), 1);

      const range = sheet.getRange(linhaDestino, 1, 1, totalColunas);

      // Evitar erro de merge já existente
      try {
        range.breakApart();
      } catch (_) {}

      range
        .merge()
        .setBackground('#ffffff')
        .setRichTextValue(richTextFinal)
        .setHorizontalAlignment('left')
        .setVerticalAlignment('middle');

    } catch (sheetError) {
      console.warn(`[LEGENDA] Erro ao atualizar aba ${sheet ? sheet.getName() : 'desconhecida'}:`,
        sheetError.message);
      // Continua nas próximas abas
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
