/**
 * ============================================================
 * WRAPPER DE INTEGRAÇÃO - VISION (100% ID-BASED)
 * ============================================================
 * Responsabilidade:
 * - Validar contexto de planilhas
 * - Receber pastaId explicitamente
 * - Chamar vision-core
 * - Controlar retry
 *
 * ❗ Não depende de pastaTrabalhoId no contexto
 * ❗ Não altera contexto
 * ❗ Não define cor
 * ============================================================
 */


/**
 * Executa batch na Vision.
 * @param {Object} contextoAtivo
 * @param {Object} options { pastaId: string, callbacks }
 * @return {Object}
 */
function chamarVisionBatch_(contextoAtivo, options = {}) {

  const startTime = Date.now();

  // =============================
  // PASSO 1 — VALIDAR CONTEXTO
  // =============================
  const preparo = prepararContextoVision_(contextoAtivo);

  if (!preparo.sucesso) {

    const erro = {
      tipo: 'VALIDACAO_FALHOU',
      mensagem: preparo.erros.join('; '),
      detalhes: preparo.erros,
      tempo_ms: Date.now() - startTime
    };

    options.callbacks?.onErro?.(erro);

    return { sucesso: false, resultado: null, erro, tempo_ms: erro.tempo_ms };
  }

  // =============================
  // PASSO 2 — PASTA EXPLÍCITA
  // =============================
  const pastaId = options.pastaId;

  if (!pastaId || typeof pastaId !== 'string') {

    const erro = {
      tipo: 'PASTA_NAO_DEFINIDA',
      mensagem: 'ID da pasta não fornecido explicitamente ao wrapper.',
      tempo_ms: Date.now() - startTime
    };

    options.callbacks?.onErro?.(erro);

    return { sucesso: false, resultado: null, erro, tempo_ms: erro.tempo_ms };
  }

  // =============================
  // PASSO 3 — EXECUTAR VISION
  // =============================
  try {

    options.callbacks?.onInicio?.({
      pastaId,
      timestamp: new Date().toLocaleString()
    });

    const resultadoVision = vision.batchProcessarPastaCompleta(
      pastaId,
      preparo.dados.contexto_vision
    );

    options.callbacks?.onSucesso?.({
      pastaId,
      timestamp: new Date().toLocaleString(),
      tempo_ms: Date.now() - startTime
    });

    return {
      sucesso: true,
      resultado: resultadoVision,
      erro: null,
      tempo_ms: Date.now() - startTime
    };

  } catch (e) {

    const erroVision = {
      tipo: 'VISION_EXCEPTION',
      mensagem: e.message,
      stack: e.stack,
      tempo_ms: Date.now() - startTime
    };

    options.callbacks?.onErro?.(erroVision);

    return { sucesso: false, resultado: null, erro: erroVision, tempo_ms: erroVision.tempo_ms };
  }
}


/**
 * Wrapper com retry automático.
 */
function chamarVisionComRetry_(contextoAtivo, options = {}) {

  const maxTentativas = options.maxTentativas || 3;
  const delayMs = options.delayMs || 1000;

  let tentativa = 1;
  let resultado = null;

  while (tentativa <= maxTentativas) {

    options.callbacks?.onTentativa?.({
      tentativa,
      total: maxTentativas
    });

    resultado = chamarVisionBatch_(contextoAtivo, options);

    if (resultado.sucesso) {
      return resultado;
    }

    if (tentativa === maxTentativas) {
      options.callbacks?.onErro?.(resultado.erro);
    }

    if (tentativa < maxTentativas) {
      Utilities.sleep(delayMs * tentativa);
    }

    tentativa++;
  }

  return resultado;
}


/**
 * Processa pasta com resumo estruturado.
 */
function processarPastaComVision_(contextoAtivo, options = {}) {

  const resultado = chamarVisionComRetry_(contextoAtivo, {
    maxTentativas: options.maxTentativas || 3,
    delayMs: options.delayMs || 1000,
    pastaId: options.pastaId,
    callbacks: options.callbacks
  });

  return {
    sucesso: resultado.sucesso,
    tempo_ms: resultado.tempo_ms,
    mensagem: resultado.sucesso
      ? '✅ Pasta processada com sucesso!'
      : `❌ Falha ao processar: ${resultado.erro?.mensagem || 'Erro desconhecido'}`,
    detalhes: resultado.sucesso
      ? resultado.resultado
      : resultado.erro
  };
}
