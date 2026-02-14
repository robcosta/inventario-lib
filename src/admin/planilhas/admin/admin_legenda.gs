/**
 * ============================================================
 * LEGENDA DINÂMICA — PLANILHA ADMIN
 * ============================================================
 * - Cores únicas por contexto
 * - Ordem alfabética
 * - Máximo 8 pastas
 * - Sem hash
 * - Sem correção automática de contexto
 * ============================================================
 */

function atualizarLegendasPlanilhaAdmin_(contexto) {

  if (!contexto?.planilhaAdminId) {
    console.warn('[LEGENDA] Contexto inválido.');
    return;
  }

  let pastas;

  try {
    pastas = obterPastasVivas_(contexto);
  } catch (e) {
    console.error('[LEGENDA] Erro ao obter pastas:', e.message);
    return;
  }

  const ss = SpreadsheetApp.openById(contexto.planilhaAdminId);

  if (!pastas.length) {
    limparLegendasAntigas_(contexto.planilhaAdminId);
    return;
  }

  // 🔹 Ordenação alfabética
  pastas.sort((a, b) => a.nome.localeCompare(b.nome));

  // 🔹 Limite de 8
  if (pastas.length > 8) {
    console.error('[LEGENDA] Mais de 8 pastas no contexto.');
    return;
  }

  // 🔹 Gerar mapa determinístico
  const cores = Object.values(CORES_DESTAQUE);
  const mapaCores = {};

  pastas.forEach((p, index) => {
    mapaCores[p.id] = cores[index];
  });

  console.log('=== 🎨 MAPA DE CORES DO CONTEXTO ===');
  pastas.forEach(p => {
    console.log(`${p.nome} → ${mapaCores[p.id]}`);
  });
  console.log('====================================');

  ss.getSheets().forEach(sheet => {

    if (sheet.getName() === '__CONTROLE_PROCESSAMENTO__') return;

    removerLegendaAntiga_(sheet);

    const builder = SpreadsheetApp.newRichTextValue();

    let texto = '';
    let pos = 0;

    pastas.forEach(p => {
      texto += ` ■ ${p.nome}    `;
    });

    builder.setText(texto);

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

    const rich = builder.build();

    const linha = sheet.getLastRow() < 5
      ? 10
      : sheet.getLastRow() + 2;

    sheet.getRange(linha, 1, 1, 9)
      .merge()
      .setBackground('#ffffff')
      .setRichTextValue(rich)
      .setHorizontalAlignment('left')
      .setVerticalAlignment('middle');
  });
}


/**
 * Remove legenda antiga de uma aba
 */
function removerLegendaAntiga_(sheet) {

  const lastRow = sheet.getLastRow();
  if (!lastRow) return;

  const data = sheet.getRange(1, 1, lastRow, 1).getValues();

  for (let i = data.length - 1; i >= 0; i--) {
    if (String(data[i][0]).includes('■')) {
      sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).breakApart();
      sheet.deleteRow(i + 1);
    }
  }
}


/**
 * Limpa legenda antiga em todas as abas
 */
function limparLegendasAntigas_(planilhaId) {

  if (!planilhaId) return;

  const ss = SpreadsheetApp.openById(planilhaId);

  ss.getSheets().forEach(sheet => {
    removerLegendaAntiga_(sheet);
  });
}
