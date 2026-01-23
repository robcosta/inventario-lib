function removerAbasVazias_(planilhaAlvo) {

  // Usa a planilha passada por parâmetro
  const sheets = planilhaAlvo.getSheets();
  
  // Tenta ativar a primeira aba segura (Controle ou índice 0)
  // Isso evita erro ao deletar a aba que estava ativa
  try {
     const controle = planilhaAlvo.getSheetByName('__CONTROLE_PROCESSAMENTO__');
     if(controle) {
       planilhaAlvo.setActiveSheet(controle);
     } else {
       planilhaAlvo.setActiveSheet(sheets[0]);
     }
  } catch(e) {
    // Silencia erro se não conseguir focar (comum em openById)
  }

  const abasParaRemover = [];

  sheets.forEach(sheet => {

    const nome = sheet.getName();

    // ❌ Nunca remove aba técnica
    if (nome === '__CONTROLE_PROCESSAMENTO__') return;

    // Verifica se tem dados reais
    const range = sheet.getDataRange();
    
    // Otimização: Se for apenas A1 e estiver vazio, nem pega values
    if (range.getLastRow() === 1 && range.getLastColumn() === 1 && range.getValue() === "") {
        abasParaRemover.push(sheet);
        return;
    }

    const values = range.getValues();
    let temDadoReal = false;

    // Loop quebra assim que acha 1 dado, economizando processamento
    outerLoop:
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values[i].length; j++) {
        const v = values[i][j];
        if (v !== '' && v !== null && v !== undefined) {
          temDadoReal = true;
          break outerLoop;
        }
      }
    }

    if (!temDadoReal) {
      abasParaRemover.push(sheet);
    }
  });

  if (abasParaRemover.length === 0) return;

  // 🔒 Remove de trás para frente para evitar conflito de índice
  abasParaRemover.reverse().forEach(sheet => {
    try {
      planilhaAlvo.deleteSheet(sheet);
    } catch (e) {
      Logger.log(`Erro ao deletar aba ${sheet.getName()}: ${e.message}`);
    }
  });

  // Nota: Toast só aparece se for a planilha ativa do usuário
  try {
    SpreadsheetApp.getActive().toast(
      `🧹 ${abasParaRemover.length} aba(s) vazia(s) removida(s)`,
      'Limpeza concluída',
      5
    );
  } catch(e) {}
}