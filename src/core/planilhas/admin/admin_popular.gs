/**
 * ============================================================
 * PLANILHA CONTEXTO — POPULAR A PARTIR DE CSV (ID-BASED)
 * ============================================================
 * Cada CSV gera uma aba distinta.
 * Abas vazias são removidas (exceto técnicas).
 *
 * Fonte única dos CSVs:
 * → contexto.pastaCSVAdminId
 */

/**
 * Bridge chamada pelo menu.
 * Resolve IDs a partir do contexto ativo.
 */
function popularPlanilhaContexto_() {
  const contexto = obterContextoAtivo_();

  if (!contexto || !contexto.planilhaAdminId) {
    throw new Error(
      'Contexto inválido: planilhaAdminId ausente ao popular Planilha Contexto.'
    );
  }

  if (!contexto.pastaCSVAdminId) {
    throw new Error(
      'Contexto inválido: pastaCSVAdminId ausente ao popular Planilha Contexto.'
    );
  }

  const resultado = popularPlanilhaContextoPorId_(
    contexto.planilhaAdminId,
    contexto.pastaCSVAdminId
  );

  toast_(
    `Contexto atualizado: ${resultado.novos} novo(s), ${resultado.atualizados} atualizado(s).`,
    'Concluído',
    6
  );
}

/**
 * ============================================================
 * FUNÇÃO REAL (ID-BASED)
 * ============================================================
 * Não depende de UI nem de planilha ativa.
 */
function popularPlanilhaContextoPorId_(spreadsheetId, pastaCsvAdminId) {

  if (!spreadsheetId || typeof spreadsheetId !== 'string') {
    throw new Error('spreadsheetId inválido ao popular Planilha Contexto.');
  }

  if (!pastaCsvAdminId || typeof pastaCsvAdminId !== 'string') {
    throw new Error('pastaCsvAdminId inválido ao popular Planilha Contexto.');
  }

  const planilha = SpreadsheetApp.openById(spreadsheetId);
  const pastaCSV = DriveApp.getFolderById(pastaCsvAdminId);

  const arquivos = pastaCSV.getFilesByType(MimeType.CSV);
  if (!arquivos.hasNext()) {
    return { novos: 0, atualizados: 0 };
  }

  // ----------------------------------------------------------
  // Mapear abas existentes
  // ----------------------------------------------------------
  const abasExistentes = {};
  planilha.getSheets().forEach(sheet => {
    abasExistentes[sheet.getName()] = sheet;
  });

  let novos = 0;
  let atualizados = 0;

  // ----------------------------------------------------------
  // Processar CSVs
  // ----------------------------------------------------------
  while (arquivos.hasNext()) {
    const file = arquivos.next();
    const nomeAba = nomeAbaPorCSV_(file.getName());
    const dados = lerCSV_(file);

    if (!dados || dados.length === 0) continue;

    let sheet = abasExistentes[nomeAba];

    if (sheet) {
      sheet.clearContents();
      atualizados++;
    } else {
      sheet = planilha.insertSheet(nomeAba);
      abasExistentes[nomeAba] = sheet;
      novos++;
    }

    sheet
      .getRange(1, 1, dados.length, dados[0].length)
      .setValues(dados);
  }

  SpreadsheetApp.flush();

  removerAbasVaziasPorId_(spreadsheetId);

  return { novos, atualizados };
}

/**
 * ============================================================
 * REMOVER ABAS VAZIAS (ID-BASED)
 * ============================================================
 */
function removerAbasVaziasPorId_(spreadsheetId) {

  const planilha = SpreadsheetApp.openById(spreadsheetId);
  const sheets = planilha.getSheets();

  // Tentar focar uma aba segura antes de deletar
  try {
    const controle = planilha.getSheetByName('__CONTROLE_PROCESSAMENTO__');
    if (controle) {
      planilha.setActiveSheet(controle);
    } else if (sheets.length > 0) {
      planilha.setActiveSheet(sheets[0]);
    }
  } catch (e) {}

  const abasParaRemover = [];

  sheets.forEach(sheet => {
    const nome = sheet.getName();

    // Nunca remover aba técnica
    if (nome === '__CONTROLE_PROCESSAMENTO__') return;

    const range = sheet.getDataRange();

    // Caso simples: apenas A1 vazio
    if (
      range.getLastRow() === 1 &&
      range.getLastColumn() === 1 &&
      range.getValue() === ''
    ) {
      abasParaRemover.push(sheet);
      return;
    }

    const values = range.getValues();
    let temDadoReal = false;

    outer:
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values[i].length; j++) {
        const v = values[i][j];
        if (v !== '' && v !== null && v !== undefined) {
          temDadoReal = true;
          break outer;
        }
      }
    }

    if (!temDadoReal) {
      abasParaRemover.push(sheet);
    }
  });

  // Remover de trás para frente
  abasParaRemover.reverse().forEach(sheet => {
    try {
      planilha.deleteSheet(sheet);
    } catch (e) {
      Logger.log(
        `Erro ao deletar aba ${sheet.getName()}: ${e.message}`
      );
    }
  });
}
