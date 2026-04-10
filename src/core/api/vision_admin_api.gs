/**
 * ============================================================
 * PROCESSAR IMAGENS — INVENTÁRIO (DOMÍNIO)
 * ============================================================
 *
 * Fluxo:
 * 1️⃣ Resolver contexto (DOMÍNIO)
 * 2️⃣ Validar pasta ativa
 * 3️⃣ Validar planilhas (ADMIN + GERAL)
 * 4️⃣ Confirmar com usuário
 * 5️⃣ Montar contrato Vision
 * 6️⃣ Delegar processamento
 */
function processarImagens_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoDominio_();

  if (!contexto) {
    ui.alert("❌ Nenhum contexto ativo.");
    return;
  }

  // CLIENTE sempre enfileira para processamento privilegiado.
  if (contexto.tipo === 'CLIENTE') {
    try {
      enfileirarProcessamentoImagensCliente_(contexto);
    } catch (e) {
      Logger.log('[INVENTARIO][FILA][ERRO] ' + e.message);
    }
    return;
  }

  try {
    const preparacao = prepararProcessamentoVisionSemUi_(contexto);

    const confirmar = ui.alert(
      "🚀 Processar Fotos",
      `Processar imagens da pasta:\n"${preparacao.pastaNome}"?`,
      ui.ButtonSet.YES_NO
    );
    if (confirmar !== ui.Button.YES) return;

    const exec = executarProcessamentoVisionComPreparo_(preparacao, {
      origem: 'MENU_ADMIN'
    });
    const resultado = exec && exec.resultado ? exec.resultado : {};

    ui.alert(
      "🏁 Processamento Finalizado",
      `Total: ${resultado.total || 0}\n` +
      `✅ Sucesso: ${resultado.sucesso || 0}\n` +
      `❌ Erros: ${resultado.erro || 0}`,
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert(
      "❌ Erro no Processamento",
      e.message,
      ui.ButtonSet.OK
    );
  }
}

function prepararProcessamentoVisionSemUi_(contextoEntrada) {
  let contexto = contextoEntrada;

  contexto = sincronizarLocalidadeAtiva_(contexto);

  if (!contexto || !contexto.pastaLocalidadesId) {
    throw new Error('Contexto inválido.');
  }

  const pastaId = contexto.localidadeAtivaId;
  const pastaNome = contexto.localidadeAtivaNome;
  if (!pastaId) {
    throw new Error('Nenhuma pasta de fotos selecionada.');
  }

  try {
    DriveApp.getFolderById(pastaId);
  } catch (e) {
    throw new Error('A pasta selecionada não existe ou está inacessível.');
  }

  const planilhaAdminId = contexto.planilhaAdminId;
  const planilhaGeralId = contexto.planilhaGeralId || resolverPlanilhaGeralId_();
  if (!planilhaAdminId || !planilhaGeralId) {
    throw new Error('Planilhas obrigatórias não configuradas.');
  }

  const adminFormatada = validarPlanilhaFormatada_(planilhaAdminId);
  const geralPronta = validarPlanilhaGeralPronta_(planilhaGeralId);
  if (!adminFormatada || !geralPronta) {
    const faltantes = [];
    if (!adminFormatada) faltantes.push('ADMIN');
    if (!geralPronta) faltantes.push('GERAL (nome, dados e formatação)');
    throw new Error('Antes de processar imagens, formate: ' + faltantes.join(' e ') + '.');
  }

  const contextoVision = montarContextoVision_({
    ...contexto,
    planilhaGeralId: planilhaGeralId
  });

  Logger.log("=============== CONTEXTO VISION ===============");
  Logger.log("Tipo Contexto: " + contexto.tipo);
  Logger.log("planilhaContextoId: " + contextoVision.planilhaContextoId);
  Logger.log("planilhaGeralId: " + contextoVision.planilhaGeralId);
  Logger.log("pastaTrabalhoId: " + contextoVision.pastaTrabalhoId);
  Logger.log("pastaTrabalhoNome: " + contextoVision.pastaTrabalhoNome);
  Logger.log("corDestaque: " + contextoVision.corDestaque);
  Logger.log("================================================");

  return {
    contexto: contexto,
    pastaId: pastaId,
    pastaNome: pastaNome,
    planilhaAdminId: planilhaAdminId,
    planilhaGeralId: planilhaGeralId,
    contextoVision: contextoVision
  };
}

function executarProcessamentoVisionSemUi_(contexto, opcoes) {
  const preparacao = prepararProcessamentoVisionSemUi_(contexto);
  return executarProcessamentoVisionComPreparo_(preparacao, opcoes || {});
}

function executarProcessamentoVisionComPreparo_(preparacao, opcoes) {
  const op = opcoes || {};
  const planilhaAdminId = preparacao.planilhaAdminId;
  const linhaControleAntes = capturarUltimaLinhaControleProcessamento_(planilhaAdminId);
  let resultado;

  try {
    resultado = vision.batchProcessarPastaCompleta(
      preparacao.pastaId,
      preparacao.contextoVision
    );

    Logger.log("[INVENTARIO] Processamento concluído.");
    Logger.log("[INVENTARIO] Resultado: " + JSON.stringify(resultado));
  } finally {
    if (op.operadorEmail) {
      try {
        atualizarOperadorControleProcessamento_(
          planilhaAdminId,
          linhaControleAntes,
          op.operadorEmail,
          op.requestId
        );
      } catch (eAtualizar) {
        Logger.log('[INVENTARIO][CONTROLE][OPERADOR][AVISO] ' + eAtualizar.message);
      }
    }
  }

  // Preenche coluna Localização na ADMIN usando a cor de destaque aplicada.
  try {
    preencherLocalizacaoAdminPorCor_(preparacao.contexto);
  } catch (ePreencher) {
    Logger.log('[INVENTARIO][LOCALIZACAO][AVISO] ' + ePreencher.message);
  }

  // Garante consistência: destaque da localidade ativa sempre com a cor oficial da pasta.
  try {
    normalizarDestaqueAdminPorCorOficialDaLocalidadeAtiva_(preparacao.contexto);
  } catch (eNormalizarCor) {
    Logger.log('[INVENTARIO][DESTAQUE_COR][AVISO] ' + eNormalizarCor.message);
  }

  // Garante consistencia textual na GERAL:
  // grava a localidade exatamente como o nome da pasta ativa (ex.: "04", nao "4").
  try {
    const resumoNorm = normalizarLocalizacaoGeralPorNomeDaPastaAtiva_(preparacao.contexto);
    if (resumoNorm && resumoNorm.alteradas > 0) {
      Logger.log('[INVENTARIO][LOCALIZACAO][GERAL] Linhas normalizadas: ' + resumoNorm.alteradas);
    }
  } catch (eNormGeral) {
    Logger.log('[INVENTARIO][LOCALIZACAO][GERAL][AVISO] ' + eNormGeral.message);
  }

  return {
    resultado: resultado || {},
    linhaControleAntes: linhaControleAntes
  };
}

function capturarUltimaLinhaControleProcessamento_(planilhaAdminId) {
  if (!planilhaAdminId) return 1;
  try {
    const ss = SpreadsheetApp.openById(planilhaAdminId);
    const sheet = ss.getSheetByName('__CONTROLE_PROCESSAMENTO__');
    if (!sheet) return 1;
    return sheet.getLastRow();
  } catch (e) {
    return 1;
  }
}

function atualizarOperadorControleProcessamento_(planilhaAdminId, linhaAntes, operadorEmail, requestId) {
  const operador = normalizarEmailProcessamento_(operadorEmail);
  if (!planilhaAdminId || !operador) return;

  const ss = SpreadsheetApp.openById(planilhaAdminId);
  const sheet = ss.getSheetByName('__CONTROLE_PROCESSAMENTO__');
  if (!sheet) return;

  const ultimaLinha = sheet.getLastRow();
  const inicio = Math.max(2, Number(linhaAntes || 1) + 1);
  if (ultimaLinha < inicio) return;

  const qtd = ultimaLinha - inicio + 1;
  const executor = normalizarEmailProcessamento_(Session.getEffectiveUser().getEmail());

  const rangeOperador = sheet.getRange(inicio, 13, qtd, 1);
  const atuaisOperador = rangeOperador.getValues();

  let houveAlteracaoOperador = false;
  const novosOperador = atuaisOperador.map(item => {
    const atual = normalizarEmailProcessamento_(item[0]);
    if (!atual || atual === executor) {
      houveAlteracaoOperador = true;
      return [operador];
    }
    return [item[0]];
  });

  if (houveAlteracaoOperador) {
    rangeOperador.setValues(novosOperador);
  }

  if (requestId) {
    const marcador = 'FILA:' + requestId;
    const rangeObs = sheet.getRange(inicio, 14, qtd, 1);
    const atuaisObs = rangeObs.getValues();
    let houveAlteracaoObs = false;

    const novasObs = atuaisObs.map(item => {
      const atual = String(item[0] || '').trim();
      if (!atual) {
        houveAlteracaoObs = true;
        return [marcador];
      }
      if (atual.indexOf(marcador) !== -1) {
        return [atual];
      }
      return [atual + ' | ' + marcador];
    });

    if (houveAlteracaoObs) {
      rangeObs.setValues(novasObs);
    }
  }
}

/**
 * Preenche a coluna Localização na ADMIN a partir da cor de destaque
 * (uma cor por localidade). Só escreve quando a célula está vazia.
 */
function preencherLocalizacaoAdminPorCor_(contexto) {
  if (!contexto || !contexto.planilhaAdminId) return;

  let pastas = [];
  try {
    pastas = obterPastasVivas_(contexto) || [];
  } catch (e) {
    return;
  }

  const mapaCorParaNome = {};
  pastas.forEach(p => {
    const cor = normalizarCorHexLocalidades_(p && p.cor);
    if (cor) {
      mapaCorParaNome[cor] = p.nome || '';
    }
  });

  if (!Object.keys(mapaCorParaNome).length) return;

  const ss = SpreadsheetApp.openById(contexto.planilhaAdminId);
  const sheets = ss.getSheets();

  sheets.forEach(sheet => {
    const nome = sheet.getName();
    if (nome === '__CONTROLE_PROCESSAMENTO__' || nome === 'CAPA' || nome === 'MANUAL') return;

    const range = sheet.getDataRange();
    const valores = range.getValues();
    if (!valores.length) return;

    const fundos = range.getBackgrounds();
    const colLoc = Math.min(Math.max(6, 1), sheet.getLastColumn());

    let alterou = false;
    const novaColLoc = [];

    for (let i = 0; i < valores.length; i++) {
      let atual = valores[i][colLoc - 1];
      const atualTrim = String(atual || '').trim();
      const colA = String(valores[i][0] || '').trim();

      // Só preenche na linha do tombamento (coluna A preenchida). Continuações permanecem vazias.
      if (!atualTrim && colA && i > 0) {
        let corLinha = '';
        for (let j = 0; j < fundos[i].length; j++) {
          const cor = normalizarCorHexLocalidades_(fundos[i][j]);
          if (cor && cor !== '#ffffff') {
            corLinha = cor;
            break;
          }
        }
        const nomeLocalidade = corLinha ? mapaCorParaNome[corLinha] : '';
        if (nomeLocalidade) {
          atual = nomeLocalidade;
          alterou = true;
        }
      }
      novaColLoc.push([atual]);
    }

    if (alterou) {
      sheet.getRange(1, colLoc, novaColLoc.length, 1).setValues(novaColLoc);
    }
  });
}

function normalizarDestaqueAdminPorCorOficialDaLocalidadeAtiva_(contexto) {
  if (!contexto || !contexto.planilhaAdminId || !contexto.localidadeAtivaId) return;

  const normalizarTexto = (typeof normalizarTextoComparacao_ === 'function')
    ? normalizarTextoComparacao_
    : function(v) {
        return String(v || '')
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      };

  let pastas = [];
  try {
    pastas = obterPastasVivas_(contexto) || [];
  } catch (e) {
    return;
  }

  const pastaAtiva = pastas.find(p => String(p.id || '').trim() === String(contexto.localidadeAtivaId || '').trim());
  const corOficial = normalizarCorHexLocalidades_(pastaAtiva && pastaAtiva.cor);
  const nomeLocalidade = normalizarTexto((pastaAtiva && pastaAtiva.nome) || contexto.localidadeAtivaNome || '');

  if (!corOficial || !nomeLocalidade) return;

  if (typeof corEhDaPaletaFixa_ === 'function' && !corEhDaPaletaFixa_(corOficial)) {
    throw new Error('Cor oficial da localidade ativa está fora da paleta de 8 cores.');
  }

  const ss = SpreadsheetApp.openById(contexto.planilhaAdminId);
  const sheets = ss.getSheets();

  sheets.forEach(sheet => {
    const nome = sheet.getName();
    if (nome === '__CONTROLE_PROCESSAMENTO__' || nome === 'CAPA' || nome === 'MANUAL') return;

    const range = sheet.getDataRange();
    const valores = range.getValues();
    if (!valores.length) return;

    const fundos = range.getBackgrounds();
    const totalCols = fundos[0] ? fundos[0].length : 0;
    if (!totalCols) return;

    let colLoc = Math.min(Math.max(6, 1), sheet.getLastColumn());
    if (typeof detectarIndiceColunasInventario_ === 'function') {
      try {
        const idx = detectarIndiceColunasInventario_(valores);
        if (idx && idx.localizacao >= 0 && idx.localizacao < sheet.getLastColumn()) {
          colLoc = idx.localizacao + 1;
        }
      } catch (eIdx) {}
    }

    let alterou = false;

    for (let i = 0; i < valores.length; i++) {
      const localizacao = normalizarTexto(valores[i][colLoc - 1]);
      if (!localizacao || localizacao !== nomeLocalidade) continue;

      let linhaTemDestaque = false;
      for (let j = 0; j < totalCols; j++) {
        const corAtual = normalizarCorHexLocalidades_(fundos[i][j]);
        if (corAtual && corAtual !== '#ffffff') {
          linhaTemDestaque = true;
          break;
        }
      }
      if (!linhaTemDestaque) continue;

      for (let j = 0; j < totalCols; j++) {
        const corAtual = normalizarCorHexLocalidades_(fundos[i][j]);
        if (!corAtual || corAtual === '#ffffff') continue;
        if (corAtual !== corOficial) {
          fundos[i][j] = corOficial;
          alterou = true;
        }
      }
    }

    if (alterou) {
      range.setBackgrounds(fundos);
    }
  });
}

function normalizarEmailProcessamento_(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizarLocalizacaoGeralPorNomeDaPastaAtiva_(contexto) {
  if (!contexto) return { alteradas: 0 };

  const nomePasta = String(contexto.localidadeAtivaNome || '').trim();
  if (!nomePasta) return { alteradas: 0 };

  const planilhaGeralId = String(
    contexto.planilhaGeralId ||
    (typeof resolverPlanilhaGeralIdSeguro_ === 'function' ? resolverPlanilhaGeralIdSeguro_() : '') ||
    ''
  ).trim();
  if (!planilhaGeralId) return { alteradas: 0 };

  const ss = SpreadsheetApp.openById(planilhaGeralId);
  const sheets = ss.getSheets();
  let totalAlteradas = 0;

  sheets.forEach(sheet => {
    const nomeAba = String(sheet.getName() || '').toUpperCase();
    if (nomeAba === 'CAPA' || nomeAba === 'MANUAL' || nomeAba === '__CONTROLE_PROCESSAMENTO__') return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 1 || lastCol < 1) return;

    const range = sheet.getDataRange();
    const valores = range.getValues();
    if (!valores.length) return;

    let colLoc = Math.min(Math.max(6, 1), sheet.getLastColumn());
    let linhaInicialDados = 1;

    if (typeof detectarIndiceColunasInventario_ === 'function') {
      try {
        const idx = detectarIndiceColunasInventario_(valores);
        if (idx && idx.localizacao >= 0 && idx.localizacao < sheet.getLastColumn()) {
          colLoc = idx.localizacao + 1;
        }
        if (idx && idx.headerRow >= 0) {
          linhaInicialDados = idx.headerRow + 2; // 1-based, apos cabecalho
        }
      } catch (eIdx) {}
    }

    let alterou = false;
    let alteradasAba = 0;
    const novaCol = valores.map(r => [r[colLoc - 1]]);

    for (let i = Math.max(0, linhaInicialDados - 1); i < valores.length; i++) {
      const atual = valores[i] ? valores[i][colLoc - 1] : '';
      const atualTxt = String(atual || '').trim();
      if (!atualTxt) continue;

      if (!localidadeTextoEquivalenteGeral_(atualTxt, nomePasta)) continue;
      if (atualTxt === nomePasta) continue;

      novaCol[i][0] = nomePasta;
      alterou = true;
      alteradasAba++;
    }

    if (alterou) {
      sheet.getRange(1, colLoc, novaCol.length, 1).setValues(novaCol);
      totalAlteradas += alteradasAba;
    }
  });

  return { alteradas: totalAlteradas };
}

function normalizarTextoLocalidadeGeral_(valor) {
  const normalizarTexto = (typeof normalizarTextoComparacao_ === 'function')
    ? normalizarTextoComparacao_
    : function(v) {
        return String(v || '')
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      };

  const txt = normalizarTexto(valor);
  if (!txt) return '';

  if (/^\d+$/.test(txt)) {
    const semZeros = txt.replace(/^0+/, '');
    return semZeros || '0';
  }

  return txt;
}

function localidadeTextoEquivalenteGeral_(a, b) {
  const na = normalizarTextoLocalidadeGeral_(a);
  const nb = normalizarTextoLocalidadeGeral_(b);
  return !!(na && nb && na === nb);
}
