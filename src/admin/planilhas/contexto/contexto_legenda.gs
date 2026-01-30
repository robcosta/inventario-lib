/**
 * Reconstrói a legenda em todas as abas com fundo branco e lista completa de pastas.
 * Com validação robusta para evitar erros ao acessar planilhas.
 */
function atualizarLegendasPlanilhaContexto_(contexto) {
  // ✅ VALIDAÇÃO 1: Verificar contexto
  if (!contexto) {
    console.warn('atualizarLegendasPlanilhaContexto_: contexto nulo');
    return;
  }

  // ✅ VALIDAÇÃO 2: Verificar se planilhaOperacionalId está definido
  if (!contexto.planilhaOperacionalId || contexto.planilhaOperacionalId.trim() === '') {
    console.warn('atualizarLegendasPlanilhaContexto_: planilhaOperacionalId vazio ou não definido');
    return;
  }

  // ✅ VALIDAÇÃO 3: Busca apenas pastas que existem no Drive
  let listaPastas;
  try {
    listaPastas = obterPastasVivas_(contexto);
  } catch (e) {
    console.error('atualizarLegendasPlanilhaContexto_: Erro ao obter pastas vivas:', e.message);
    return;
  }

  if (listaPastas.length === 0) {
    // Se não houver pastas, apenas limpa as legendas antigas e sai
    try {
      limparLegendasAntigas_(contexto.planilhaOperacionalId);
    } catch (e) {
      console.warn('atualizarLegendasPlanilhaContexto_: Erro ao limpar legendas:', e.message);
    }
    return;
  }

  // ✅ VALIDAÇÃO 4: Obter referência da planilha com tratamento robusto
  let ss = null;
  let planilhaEncontrada = false;

  try {
    // Tentativa 1: Usar planilha ativa (mais rápido e seguro)
    const ssAtiva = SpreadsheetApp.getActiveSpreadsheet();
    if (ssAtiva && ssAtiva.getId && ssAtiva.getId() === contexto.planilhaOperacionalId) {
      ss = ssAtiva;
      planilhaEncontrada = true;
    }
  } catch (e) {
    console.warn('atualizarLegendasPlanilhaContexto_: Erro ao obter planilha ativa:', e.message);
  }

  // Tentativa 2: Abrir planilha pelo ID
  if (!planilhaEncontrada) {
    try {
      ss = SpreadsheetApp.openById(contexto.planilhaOperacionalId);
      planilhaEncontrada = true;
    } catch (e) {
      console.error(
        'atualizarLegendasPlanilhaContexto_: Falha ao acessar planilha.',
        'ID: ' + contexto.planilhaOperacionalId,
        'Erro: ' + e.message
      );
      
      // Fallback: Usar planilha ativa e corrigir o contexto
      try {
        ss = SpreadsheetApp.getActiveSpreadsheet();
        if (ss && ss.getId()) {
          const novoContexto = {
            ...contexto,
            planilhaOperacionalId: ss.getId()
          };
          salvarContextoAtivo_(novoContexto);
          planilhaEncontrada = true;
          console.info('atualizarLegendasPlanilhaContexto_: Contexto corrigido com planilha ativa');
        }
      } catch (fallbackError) {
        console.error('atualizarLegendasPlanilhaContexto_: Fallback também falhou:', fallbackError.message);
        return;
      }
    }
  }

  if (!planilhaEncontrada || !ss) {
    console.error('atualizarLegendasPlanilhaContexto_: Não foi possível obter referência da planilha');
    return;
  }

  // ✅ VALIDAÇÃO 5: Montar RichText com pastas válidas
  let richTextFinal;
  try {
    const builder = SpreadsheetApp.newRichTextValue();
    let textoAcumulado = "";
    listaPastas.forEach(p => { 
      textoAcumulado += ` ■ ${p.nome}    `; 
    });
    builder.setText(textoAcumulado);

    let pos = 0;
    listaPastas.forEach(p => {
      const bloco = ` ■ ${p.nome}    `;
      const estiloIcone = SpreadsheetApp.newTextStyle()
        .setForegroundColor(p.cor)
        .setBold(true)
        .setFontSize(14)
        .build();
      const estiloTexto = SpreadsheetApp.newTextStyle()
        .setForegroundColor("#202124")
        .setBold(true)
        .setFontSize(10)
        .build();
      builder.setTextStyle(pos, pos + 2, estiloIcone);
      builder.setTextStyle(pos + 2, pos + bloco.length, estiloTexto);
      pos += bloco.length;
    });
    richTextFinal = builder.build();
  } catch (e) {
    console.error('atualizarLegendasPlanilhaContexto_: Erro ao montar RichText:', e.message);
    return;
  }

  // ✅ VALIDAÇÃO 6: Aplicar legendas nas abas com tratamento individual
  try {
    const abas = ss.getSheets();
    if (!abas || abas.length === 0) {
      console.warn('atualizarLegendasPlanilhaContexto_: Nenhuma aba encontrada na planilha');
      return;
    }

    abas.forEach(sheet => {
      try {
        if (!sheet || sheet.getName() === '__CONTROLE_PROCESSAMENTO__') return;

        // Limpeza: Procura o ■ e remove a linha
        const lastRowScan = sheet.getLastRow();
        if (lastRowScan > 0) {
          const data = sheet.getRange(1, 1, lastRowScan, 1).getValues();
          for (let i = data.length - 1; i >= 0; i--) {
            if (String(data[i][0]).indexOf("■") !== -1) {
              try {
                sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).breakApart();
                sheet.deleteRow(i + 1);
              } catch (delError) {
                console.warn(`Erro ao deletar linha com legenda em ${sheet.getName()}:`, delError.message);
              }
            }
          }
        }

        // Adiciona nova legenda
        const novaLastRow = sheet.getLastRow();
        const linhaAlvo = novaLastRow < 5 ? 10 : novaLastRow + 2;
        const rangeLegenda = sheet.getRange(linhaAlvo, 1, 1, 9);

        rangeLegenda
          .merge()
          .setBackground("#ffffff")
          .setRichTextValue(richTextFinal)
          .setVerticalAlignment("middle")
          .setHorizontalAlignment("left");

      } catch (sheetError) {
        console.warn(`Erro ao atualizar legenda na aba ${sheet ? sheet.getName() : 'desconhecida'}:`, sheetError.message);
        // Continua com próxima aba em vez de falhar completamente
      }
    });
  } catch (e) {
    console.error('atualizarLegendasPlanilhaContexto_: Erro ao aplicar legendas:', e.message);
  }
}

/**
 * Função auxiliar para limpar quando não houver mais pastas.
 * Com tratamento robusto de erros.
 */
function limparLegendasAntigas_(planilhaId) {
  // ✅ VALIDAÇÃO: Verificar ID válido
  if (!planilhaId || planilhaId.trim() === '') {
    console.warn('limparLegendasAntigas_: planilhaId vazio ou nulo');
    return;
  }

  let ss;
  try {
    // Tentativa 1: Usar planilha ativa se for a mesma
    const ssAtiva = SpreadsheetApp.getActiveSpreadsheet();
    if (ssAtiva && ssAtiva.getId && ssAtiva.getId() === planilhaId) {
      ss = ssAtiva;
    } else {
      ss = SpreadsheetApp.openById(planilhaId);
    }
  } catch (e) {
    console.error('limparLegendasAntigas_: Erro ao acessar planilha:', e.message);
    return;
  }

  try {
    const abas = ss.getSheets();
    if (!abas || abas.length === 0) {
      console.warn('limparLegendasAntigas_: Nenhuma aba encontrada');
      return;
    }

    abas.forEach(sheet => {
      try {
        if (!sheet) return;
        
        const lastRow = sheet.getLastRow();
        if (lastRow === 0) return;
        
        const data = sheet.getRange(1, 1, lastRow, 1).getValues();
        for (let i = data.length - 1; i >= 0; i--) {
          if (String(data[i][0]).indexOf("■") !== -1) {
            try {
              sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).breakApart();
              sheet.deleteRow(i + 1);
            } catch (delError) {
              console.warn(`Erro ao deletar linha em ${sheet.getName()}:`, delError.message);
            }
          }
        }
      } catch (sheetError) {
        console.warn(`Erro ao processar aba ${sheet ? sheet.getName() : 'desconhecida'}:`, sheetError.message);
      }
    });
  } catch (e) {
    console.error('limparLegendasAntigas_: Erro geral:', e.message);
  }
}