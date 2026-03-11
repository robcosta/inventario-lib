/**
 * ============================================================
 * VALIDAÇÃO DE FORMATAÇÃO DE PLANILHAS
 * ============================================================
 * Funções para validar se planilhas estão formatadas
 */

/**
 * Verifica se uma planilha está formatada
 * Uma planilha é considerada formatada se tem cabeçalho com cores/estilos
 * @param {string} spreadsheetId - ID da planilha a validar
 * @returns {boolean} true se formatada, false caso contrário
 */
function validarPlanilhaFormatada_(spreadsheetId) {
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheets = ss.getSheets();
    
    if (!sheets || sheets.length === 0) {
      return false;
    }
    
    // Verifica a primeira aba válida (não __CONTROLE_PROCESSAMENTO__)
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      const nomAba = sheet.getName();
      
      // Pula abas de controle
      if (nomAba === '__CONTROLE_PROCESSAMENTO__') continue;
      
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow < 1 || lastCol < 1) continue;

      // Buscar a linha de cabeçalho (Tombamento) na coluna A
      const maxScan = Math.min(lastRow, 200);
      const colA = sheet.getRange(1, 1, maxScan, 1).getValues().flat();
      let linhaHeader = -1;
      for (let r = 0; r < colA.length; r++) {
        const val = String(colA[r] || '').trim().toUpperCase();
        if (val.startsWith('TOMBAMENTO')) {
          linhaHeader = r + 1;
          break;
        }
      }

      // Se não encontrar a linha de cabeçalho, tenta a linha 1 como fallback
      const linhaAlvo = (linhaHeader !== -1) ? linhaHeader : 1;
      const colunasParaVerificar = Math.min(lastCol, 4); // Aumenta para 4 para incluir Localização
      const rangeHeader = sheet.getRange(linhaAlvo, 1, 1, colunasParaVerificar);
      const backgrounds = rangeHeader.getBackgrounds()[0];
      const fontWeights = rangeHeader.getFontWeights()[0];

      for (let c = 0; c < colunasParaVerificar; c++) {
        const bg = backgrounds[c];
        const fw = fontWeights[c];
        if (bg && bg !== '#ffffff' && bg !== '') return true;
        if (fw && fw.toLowerCase() === 'bold') return true;
      }
    }
    
    return false;
  } catch (e) {
    console.error('Erro ao validar formatação:', e.message);
    return false;
  }
}

function planilhaTemDadosOperacionais_(ss) {
  if (!ss) return false;

  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const nomeAba = String(sheet.getName() || '');
    if (nomeAba === '__CONTROLE_PROCESSAMENTO__') continue;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) continue;

    const linhasDados = Math.min(lastRow - 1, 400);
    const colunasDados = Math.min(lastCol, 30);
    const valores = sheet.getRange(2, 1, linhasDados, colunasDados).getValues();

    for (let r = 0; r < valores.length; r++) {
      for (let c = 0; c < valores[r].length; c++) {
        const valor = valores[r][c];
        if (valor !== '' && valor !== null && valor !== undefined) {
          return true;
        }
      }
    }
  }

  return false;
}

function validarPlanilhaGeralPronta_(spreadsheetId) {
  if (!spreadsheetId) return false;

  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    if (!nomePlanilhaGeralValido_(ss.getName())) return false;
    if (!planilhaTemDadosOperacionais_(ss)) return false;
    return validarPlanilhaFormatada_(spreadsheetId);
  } catch (e) {
    return false;
  }
}

/**
 * Valida se a Planilha Contexto está formatada
 * @returns {boolean} true se formatada, false caso contrário
 */
function validarPlanilhaContextoFormatada_() {
  try {
    const contexto = obterContextoAtivo_();
    if (!contexto || !contexto.planilhaAdminId) {
      return false;
    }
    return validarPlanilhaFormatada_(contexto.planilhaAdminId);
  } catch (e) {
    console.error('Erro ao validar Contexto:', e.message);
    return false;
  }
}

/**
 * Valida se a Planilha Geral está formatada
 * @returns {boolean} true se formatada, false caso contrário
 */
function validarPlanilhaGeralFormatada_() {
  try {
    const planilhaGeralId = resolverPlanilhaGeralId_();
    if (!planilhaGeralId) {
      return false;
    }
    return validarPlanilhaGeralPronta_(planilhaGeralId);
  } catch (e) {
    console.error('Erro ao validar Geral:', e.message);
    return false;
  }
}
