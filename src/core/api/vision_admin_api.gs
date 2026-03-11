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

function normalizarEmailProcessamento_(email) {
  return String(email || '').trim().toLowerCase();
}
