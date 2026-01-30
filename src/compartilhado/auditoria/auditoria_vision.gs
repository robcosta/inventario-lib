/**
 * ============================================================
 * AUDITORIA - LEITURA DE LOGS DO VISION-CORE
 * ============================================================
 * Lê e processa logs de processamento do inventario-vision-core.
 * Fornece feedback detalhado ao usuário sobre o que aconteceu.
 */

/**
 * Obtém os logs de processamento do CONTROLE sheet da planilha.
 * @param {string} planilhaId - ID da planilha com CONTROLE
 * @param {string} abaControle - Nome da aba (padrão: __CONTROLE_PROCESSAMENTO__)
 * @return {Array} Array de logs: { timestamp, arquivo, status, erro }
 */
function obterLogsProcessamento_(planilhaId, abaControle = '__CONTROLE_PROCESSAMENTO__') {
  try {
    const ss = SpreadsheetApp.openById(planilhaId);
    const abasPreferidas = [abaControle, '__CONTROLE_PROCESSAMENTO__', 'CONTROLE', 'Log'];
    let aba = null;

    for (const nome of abasPreferidas) {
      if (!nome) continue;
      aba = ss.getSheetByName(nome);
      if (aba) break;
    }

    if (!aba) {
      console.warn(`⚠️ Aba de controle não encontrada (${abasPreferidas.filter(Boolean).join(', ')})`);
      return [];
    }

    // Esperado: [timestamp, arquivo, status, erro, detalhes]
    const dados = aba.getDataRange().getValues();

    if (dados.length < 2) {
      return []; // Apenas cabeçalho ou vazio
    }

    // Pular cabeçalho
    const logs = dados.slice(1).map((row, idx) => ({
      linha: idx + 2,
      timestamp: row[0],
      arquivo: row[1] || '',
      status: row[2] || 'PENDENTE',
      erro: row[3] || '',
      detalhes: row[4] || ''
    }));

    return logs;
  } catch (e) {
    console.error('Erro ao ler CONTROLE:', e.message);
    return [];
  }
}

/**
 * Calcula resumo dos logs.
 * @param {Array} logs - Array de logs
 * @return {Object} { total, sucesso, erro, tempo_inicio, tempo_fim }
 */
function resumirLogsProcessamento_(logs) {
  if (!logs || logs.length === 0) {
    return {
      total: 0,
      sucesso: 0,
      erro: 0,
      pendente: 0,
      percentual_sucesso: 0,
      tempo_inicio: null,
      tempo_fim: null
    };
  }

  const resumo = logs.reduce(
    (acc, log) => {
      acc.total++;
      if (log.status === 'ERRO') acc.erro++;
      else if (!log.status || log.status === 'PENDENTE') acc.pendente++;
      else acc.sucesso++;
      return acc;
    },
    { total: 0, sucesso: 0, erro: 0, pendente: 0 }
  );

  return {
    ...resumo,
    percentual_sucesso: resumo.total > 0 
      ? Math.round((resumo.sucesso / resumo.total) * 100) 
      : 0,
    tempo_inicio: logs.length > 0 ? logs[0].timestamp : null,
    tempo_fim: logs.length > 0 ? logs[logs.length - 1].timestamp : null,
    erros_lista: logs
      .filter(l => l.status === 'ERRO' && l.erro)
      .map(l => `• ${l.arquivo}: ${l.erro}`)
      .slice(0, 5) // Primeiros 5 erros
  };
}

/**
 * Obtém o último resumo de processamento.
 * @param {string} planilhaId - ID da planilha
 * @param {string} abaControle - Nome da aba CONTROLE
 * @return {Object} Resumo completo
 */
function obterResumoProcessamento_(planilhaId, abaControle = '__CONTROLE_PROCESSAMENTO__') {
  const logs = obterLogsProcessamento_(planilhaId, abaControle);
  const resumo = resumirLogsProcessamento_(logs);

  return {
    ...resumo,
    logs_detalhados: logs.slice(-10) // Últimos 10 registros
  };
}

/**
 * Processa resultado do vision-core + lê logs + retorna feedback completo.
 * @param {Object} resultadoVision - Resultado de chamarVisionBatch_
 * @param {string} planilhaId - ID da planilha
 * @return {Object} { sucesso, titulo, mensagem, logs }
 */
function obterFeedbackCompleto_(resultadoVision, planilhaId) {
  if (!resultadoVision.sucesso) {
    return {
      sucesso: false,
      titulo: '❌ Processamento Falhou',
      mensagem: resultadoVision.erro.mensagem,
      detalhes: resultadoVision.erro.detalhes || [],
      tempo_ms: resultadoVision.tempo_ms
    };
  }

  // Ler logs do CONTROLE
  const resumo = obterResumoProcessamento_(planilhaId);

  const titulo = resumo.erro === 0
    ? '✅ Processamento 100% Bem-sucedido'
    : resumo.percentual_sucesso > 80
    ? '⚠️ Processamento Parcialmente Bem-sucedido'
    : '❌ Processamento com Muitos Erros';

  const mensagem = `
${resumo.sucesso} arquivos processados com sucesso
${resumo.erro} arquivos com erro
${resumo.pendente} arquivos pendentes
Taxa de sucesso: ${resumo.percentual_sucesso}%
  `.trim();

  return {
    sucesso: resumo.erro === 0,
    titulo,
    mensagem,
    resumo: {
      total: resumo.total,
      sucesso: resumo.sucesso,
      erro: resumo.erro,
      percentual: resumo.percentual_sucesso
    },
    erros_amostra: resumo.erros_lista || [],
    tempo_ms: resultadoVision.tempo_ms
  };
}

/**
 * TESTE: Lê logs do CONTROLE.
 */
function teste_obterLogsProcessamento() {
  const contexto = obterContextoAtivo_();
  const logs = obterLogsProcessamento_(contexto.planilhaOperacionalId);

  console.log('Total de logs:', logs.length);
  console.log('Primeiros 5:', logs.slice(0, 5));

  const resumo = resumirLogsProcessamento_(logs);
  console.log('Resumo:', JSON.stringify(resumo, null, 2));

  return resumo;
}

/**
 * TESTE: Feedback completo.
 */
function teste_feedback() {
  const contexto = obterContextoAtivo_();
  const feedback = obterResumoProcessamento_(contexto.planilhaOperacionalId);

  console.log('=== FEEDBACK COMPLETO ===');
  console.log(JSON.stringify(feedback, null, 2));

  return feedback;
}
