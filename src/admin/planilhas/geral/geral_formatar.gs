function formatarPlanilhaGeral_() {

  toast_('Localizando Planilha Geral...', 'Formatação');

  const planilha = obterPlanilhaGeral_();
  if (!planilha) {
    SpreadsheetApp.getUi().alert(
      'Planilha Geral não encontrada na pasta GERAL.'
    );
    return;
  }

  toast_(
    `Iniciando formatação da Planilha Geral (${planilha.getName()})`,
    'Formatação'
  );

  formatarPlanilha_(planilha.getId());

  // Adiciona "Localização" na coluna H para linhas de cabeçalho "Tombamento"
  adicionarLocalizacaoNaGeral_(planilha);

  toast_('Formatação da Planilha Geral concluída.', 'Concluído', 6);
}

/**
 * Adiciona "Localização" na coluna H para todas as linhas onde a coluna A contém "Tombamento"
 * @param {Spreadsheet} planilha - A planilha Geral
 */
function adicionarLocalizacaoNaGeral_(planilha) {
  try {
    const sheets = planilha.getSheets();
    
    sheets.forEach(sheet => {
      const nomeAba = sheet.getName();
      if (nomeAba === '__CONTROLE_PROCESSAMENTO__') return;
      
      const lastRow = sheet.getLastRow();
      if (lastRow < 1) return;
      
      const colAValues = sheet.getRange(1, 1, lastRow, 1).getValues();
      
      for (let i = 0; i < colAValues.length; i++) {
        const valA = String(colAValues[i][0] || '').trim();
        
        if (valA.startsWith('Tombamento')) {
          const linha = i + 1;
          const celulaA = sheet.getRange(linha, 1);
          const celulaH = sheet.getRange(linha, 8);
          
          // Define o valor "Localização"
          celulaH.setValue('Localização');
          
          // Copia a formatação de texto (negrito, fonte, tamanho) da célula A
          celulaH.setFontWeight(celulaA.getFontWeight());
          celulaH.setFontFamily(celulaA.getFontFamily());
          celulaH.setFontSize(celulaA.getFontSize());
          celulaH.setFontColor(celulaA.getFontColor());
          
          // Mantém o destaque (cor de fundo) existente da célula H
          // Não fazemos celulaH.setBackground(...) para preservar o que já existe
        }
      }
    });
  } catch (e) {
    console.error('Erro ao adicionar Localização na Geral:', e.message);
  }
}
