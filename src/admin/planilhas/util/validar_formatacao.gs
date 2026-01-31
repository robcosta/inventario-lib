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
      
      // Verifica se tem dados na primeira linha (cabeçalho)
      const firstCell = sheet.getRange(1, 1);
      const cellValue = firstCell.getValue();
      
      // Se primeira célula está vazia, provavelmente não está formatada
      if (!cellValue || String(cellValue).trim() === '') {
        continue;
      }
      
      // Verifica se cabeçalho tem background color (formatação aplicada)
      const backgroundColor = firstCell.getBackground();
      
      // Se tem cor diferente de branco, indica formatação
      if (backgroundColor && backgroundColor !== '#ffffff' && backgroundColor !== '') {
        return true;
      }
      
      // Se tem font weight bold, também indica formatação
      const fontWeight = firstCell.getFontWeight();
      if (fontWeight === 'bold') {
        return true;
      }
      
      // Se chegou aqui, verifica a segunda célula também
      const secondCell = sheet.getRange(1, 2);
      const secondBG = secondCell.getBackground();
      if (secondBG && secondBG !== '#ffffff' && secondBG !== '') {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    console.error('Erro ao validar formatação:', e.message);
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
    if (!contexto || !contexto.planilhaOperacionalId) {
      return false;
    }
    return validarPlanilhaFormatada_(contexto.planilhaOperacionalId);
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
    const planilhaGeral = obterPlanilhaGeral_();
    if (!planilhaGeral) {
      return false;
    }
    return validarPlanilhaFormatada_(planilhaGeral.getId());
  } catch (e) {
    console.error('Erro ao validar Geral:', e.message);
    return false;
  }
}
