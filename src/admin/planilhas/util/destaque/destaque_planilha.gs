/**
 * ============================================================
 * DESTAQUE EM PLANILHA (VERSÃO FINAL)
 * ============================================================
 *
 * @param {Object} contexto
 */
function executarDestaquePlanilha_(contexto) {

  const ss = abrirPlanilhaPorContexto_(contexto.planilha, contexto.CONFIG);
  const sheet = ss.getSheetByName(contexto.aba);

  if (!sheet) {
    throw new Error('Aba não encontrada para destaque: ' + contexto.aba);
  }

  // 🔹 Linha principal
  destacarLinhaSePermitido_(sheet, contexto.linha, contexto.planilha, contexto.CONFIG);

  // 🔹 Linha imediatamente abaixo (regra especial)
  destacarLinhaAbaixoSePermitido_(sheet, contexto.linha, contexto.planilha, contexto.CONFIG);
}

function abrirPlanilhaPorContexto_(tipoPlanilha, CONFIG) {

  switch (tipoPlanilha) {
    case 'ALVO':
      return SpreadsheetApp.openById(CONFIG.UNIDADE_RESPONSAVEL);
    case 'MAE':
      return SpreadsheetApp.openById(CONFIG.UNIDADE_GESTORA);
    default:
      throw new Error('Tipo de planilha inválido para destaque');
  }
}

function destacarLinhaSePermitido_(sheet, linha1Based, tipoPlanilha, CONFIG) {

  const jaDestacada = linhaJaDestacada_(sheet, linha1Based);
  if (jaDestacada) return;

  const opcoes = opcoesDestaquePorPlanilha_(tipoPlanilha, CONFIG);

  // Ajuste para utilitário (espera índice compatível com Range)
  destacarLinha_(sheet, linha1Based, opcoes);
}

function destacarLinhaAbaixoSePermitido_(sheet, linhaPrincipal, tipoPlanilha, CONFIG) {

  const linhaAbaixo = linhaPrincipal + 1;

  if (linhaAbaixo > sheet.getLastRow()) return;

  // Verifica célula da coluna A
  const valorColA = String(sheet.getRange(linhaAbaixo, 1).getValue()).trim();

  if (valorColA !== '' && valorColA !== '(Bem de Terceiro)') return;

  if (linhaJaDestacada_(sheet, linhaAbaixo)) return;

  const opcoes = opcoesDestaquePorPlanilha_(tipoPlanilha, CONFIG);

  destacarLinha_(sheet, linhaAbaixo, opcoes);
}

function linhaJaDestacada_(sheet, linha1Based) {

  const bg = sheet
    .getRange(linha1Based, 1)
    .getBackground();

  // Branco padrão do Sheets
  return bg && bg !== '#ffffff';
}

function opcoesDestaquePorPlanilha_(tipoPlanilha, CONFIG) {

  if (tipoPlanilha === 'ALVO') {
    return {
      background: CONFIG.COR_DESTAQUE,
      fontWeight: 'bold'
    };
  }

  if (tipoPlanilha === 'MAE') {
    return {
      background: CONFIG.COR_DESTAQUE_MAE,
      fontWeight: 'bold'
    };
  }

  throw new Error('Tipo de planilha inválido para opções de destaque');
}

/**
 * ============================================================
 * FUNÇÃO GERAL DE DESTAQUE DE LINHA
 * ============================================================
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} linhaIndexZeroBased índice da linha (0-based)
 * @param {Object} opcoes opções visuais do destaque
 */
function destacarLinha_(sheet, linhaIndexZeroBased, opcoes) {

  const range = sheet.getRange(
    linhaIndexZeroBased,
    1,
    1,
    sheet.getLastColumn()
  );

  if (opcoes.merge) {
    range.merge();
  }

  if (opcoes.background) {
    range.setBackground(opcoes.background);
  }

  if (opcoes.fontColor) {
    range.setFontColor(opcoes.fontColor);
  }

  if (opcoes.fontWeight) {
    range.setFontWeight(opcoes.fontWeight);
  }

  if (opcoes.fontSize) {
    range.setFontSize(opcoes.fontSize);
  }

  if (opcoes.horizontalAlignment) {
    range.setHorizontalAlignment(opcoes.horizontalAlignment);
  }

  if (opcoes.border) {
    range.setBorder(
      opcoes.border.top ?? false,
      opcoes.border.left ?? false,
      opcoes.border.bottom ?? false,
      opcoes.border.right ?? false,
      false,
      false
    );
  }
}
