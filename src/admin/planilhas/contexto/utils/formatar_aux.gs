/* ============================================================
 * FUNÇÕES AUXILIARES
 * ============================================================ */


function aplicarEstiloBloco_(sheet, linhas, estilo) {

  if (!linhas.length) return;

  const lastCol = sheet.getLastColumn();

  linhas.forEach(linha => {

    const range = sheet.getRange(linha, 1, 1, lastCol);

    if (estilo.background) range.setBackground(estilo.background);
    if (estilo.fontColor) range.setFontColor(estilo.fontColor);
    if (estilo.fontWeight) range.setFontWeight(estilo.fontWeight);
    if (estilo.fontSize) range.setFontSize(estilo.fontSize);
    if (estilo.borderTop) {
      range.setBorder(true, false, false, false, false, false);
    }
  });
}

function abaTemDestaquesExternos_(sheet) {

  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return false;

  const bgColors = sheet
    .getRange(1, 1, lastRow, 1)
    .getBackgrounds()
    .flat();

  return bgColors.some(cor =>
    cor && !CORES_FORMATACAO_OFICIAL.includes(cor)
  );
}

function confirmarFormatacaoDaAba_(sheet) {

  const ui = SpreadsheetApp.getUi();
  const nome = sheet.getName();

  // 1️⃣ Já tem destaque externo?
  if (abaTemDestaquesExternos_(sheet)) {

    const resp = ui.alert(
      'Aba já possui itens destacados',
      `A aba "${nome}" contém linhas destacadas por processamento.\n\n` +
      'Reformatar pode REMOVER esses destaques.\n\nDeseja continuar?',
      ui.ButtonSet.YES_NO
    );

    return resp === ui.Button.YES;
  }

  // 2️⃣ Pergunta padrão
  const resp = ui.alert(
    'Formatar aba',
    `Deseja formatar a aba "${nome}"?`,
    ui.ButtonSet.YES_NO
  );

  return resp === ui.Button.YES;
}


/**
 * ============================================================
 * DETECTA LOCALIDADE A PARTIR DA PLANILHA
 * ============================================================
 *
 * Regras:
 * - Apenas coluna A
 * - A partir da linha 5
 * - NÃO pode iniciar com:
 *   (BEM, TOTAL, UNIDADE, TOMBAMENTO)
 *
 * @param {any} valA valor da célula A
 * @param {number} linha índice da linha (0-based) 
 * @return {string|null} texto da localidade
 */
function obterLocalidade_(valA, linha) {

  // 🔒 ignora cabeçalho geral (linhas 1–4)
  if (linha < 4) return null;

  if (typeof valA !== 'string') return null;

  const texto = valA.trim();
  if (!texto) return null;

  const upper = texto.toUpperCase();

  /* =====================================================
   * BLOQUEIOS SEMÂNTICOS (EXPLÍCITOS)
   * ===================================================== */
  if (
    upper.startsWith('(BEM') ||
    upper.startsWith('TOTAL') ||
    upper.startsWith('UNIDADE') ||
    upper.startsWith('TOMBAMENTO')
  ) {
    return null;
  }

  /* =====================================================
   * BLOQUEIO DE TOMBAMENTO PURO
   * ===================================================== */
  if (/^\d{10}$/.test(upper)) {
    return null;
  }

  /* =====================================================
  * BLOQUEIO DE PCASP
  * ===================================================== */
  if (/^\d{4}$/.test(upper)) {
    return null;
  }

  /* =====================================================
   * REGEX DE LOCALIDADE (FORMAS VÁLIDAS)
   * ===================================================== */
  const ehLocalidade =
    /^\d{2}(\.\d{2})+\s*-\s*/.test(upper) || // padrão antigo: 10.16.30 -
    /^(DEL|UOP).*$/.test(upper);             // DELxx - UOPxx   

  if (!ehLocalidade) return null;

  // ✅ É LOCALIDADE
  return texto;
}

/**
 * ============================================================
 * FORMATA O CABEÇALHO DE CADA ABA
 * ============================================================
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet[]} sheets 
 */

function aplicarCabecalhoPrincipal_(sheet) {
  sheet.getRange('A1:I1').merge().setFontSize(35).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A2:I2').merge().setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A3:I3').merge().setFontSize(13).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A4:I4').merge().setFontSize(13).setFontWeight('bold').setHorizontalAlignment('center');
}


