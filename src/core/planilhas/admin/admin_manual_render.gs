/**
 * ============================================================
 * ADMIN - RENDERIZACAO DA ABA MANUAL
 * ============================================================
 *
 * - Cria ou atualiza a aba MANUAL na planilha ADMIN
 * - Insere o texto do manual gerado em docs_generated
 */
function adminRenderAbaManual_(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);

  let sheet = ss.getSheetByName('MANUAL');
  if (!sheet) {
    sheet = ss.insertSheet('MANUAL');
  }

  sheet.clear();
  sheet.clearFormats();
  sheet.setHiddenGridlines(true);

  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 1150);
  sheet.setRowHeight(1, 50);
  sheet.setRowHeight(2, 21);

  const texto = obterTexto_manual_admin();
  let richText = SpreadsheetApp.newRichTextValue().setText(texto);

  function boldIfExists(fragment, size) {
    const index = texto.indexOf(fragment);
    if (index === -1) return;

    richText = richText.setTextStyle(
      index,
      index + fragment.length,
      SpreadsheetApp.newTextStyle()
        .setBold(true)
        .setFontFamily('Arial')
        .setFontSize(size)
        .build()
    );
  }

  boldIfExists('MANUAL DO ADMINISTRADOR', 16);
  boldIfExists('Objetivo', 13);
  boldIfExists('Fluxo recomendado', 13);
  boldIfExists('Contexto', 13);
  boldIfExists('Acessos', 13);
  boldIfExists('Planilha GERAL', 13);
  boldIfExists('Planilha ADMIN', 13);
  boldIfExists('Resumo rapido', 13);

  sheet.getRange('B1')
    .setValue('Dois cliques na celula B2 para leitura completa do manual ADMIN.')
    .setFontFamily('Arial')
    .setFontSize(13)
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  sheet.getRange('B2')
    .setRichTextValue(richText.build())
    .setWrap(true)
    .setVerticalAlignment('top')
    .setHorizontalAlignment('left');

  ordenarAbasAdminPadrao_(ss);
}

function ordenarAbasAdminPadrao_(ss) {
  if (!ss) return;

  try {
    const capa = ss.getSheetByName('CAPA');
    if (capa) {
      ss.setActiveSheet(capa);
      ss.moveActiveSheet(1);
    }

    const manual = ss.getSheetByName('MANUAL');
    if (manual) {
      ss.setActiveSheet(manual);
      ss.moveActiveSheet(2);
    }

    const controle = ss.getSheetByName('__CONTROLE_PROCESSAMENTO__');
    if (controle) {
      ss.setActiveSheet(controle);
      ss.moveActiveSheet(ss.getSheets().length);
    }

    if (capa) {
      ss.setActiveSheet(capa);
    }
  } catch (e) {
    Logger.log('[ADMIN][ABAS][ORDENACAO][ERRO] ' + e.message);
  }
}
