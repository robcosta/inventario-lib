/**
 * ============================================================
 * WRAPPER DE INTEGRAÇÃO - VISION
 * ============================================================
 * Centraliza todas as chamadas ao inventario-vision-core.
 * Gerencia validação, tratamento de erros e callbacks.
 */

/**
 * Chama vision.batchProcessarPastaCompleta com contexto validado.
 * @param {Object} contextoAtivo - Contexto do patrimonio-lib
 * @param {Object} options - Opções { callbacks: {...}, pastaId: string }
 * @return {Object} { sucesso: boolean, resultado: {...}, erro: {...} }
 */
function chamarVisionBatch_(contextoAtivo, options = {}) {
  const startTime = new Date().getTime();

  // Passo 1: Preparar e validar contexto
  const preparo = prepararContextoVision_(contextoAtivo);

  if (!preparo.sucesso) {
    const erro = {
      tipo: 'VALIDACAO_FALHOU',
      mensagem: preparo.erros.join('; '),
      detalhes: preparo.erros,
      tempo_ms: new Date().getTime() - startTime
    };

    // Callback de erro
    if (options.callbacks?.onErro) {
      options.callbacks.onErro(erro);
    }

    return { sucesso: false, resultado: null, erro };
  }

  // Avisos
  if (preparo.avisos && preparo.avisos.length > 0) {
    console.warn('⚠️ Avisos na preparação:', preparo.avisos);
  }

  // Passo 2: Montar ID da pasta (pode vir em opções)
  const pastaTrabalhoId = options.pastaId || contextoAtivo.pastaTrabalhoId;

  if (!pastaTrabalhoId) {
    const erro = {
      tipo: 'PASTA_NAO_DEFINIDA',
      mensagem: 'ID da pasta de trabalho não fornecido',
      tempo_ms: new Date().getTime() - startTime
    };

    if (options.callbacks?.onErro) {
      options.callbacks.onErro(erro);
    }

    return { sucesso: false, resultado: null, erro };
  }

  // Passo 3: Chamar vision-core
  let resultadoVision = null;
  let erroVision = null;

  try {
    // Callback: início
    if (options.callbacks?.onInicio) {
      options.callbacks.onInicio({
        pasta: contextoAtivo.pastaTrabalhoNome || 'Sem nome',
        timestamp: new Date().toLocaleString()
      });
    }

    // CHAMADA REAL AO VISION-CORE
    resultadoVision = vision.batchProcessarPastaCompleta(
      pastaTrabalhoId,
      preparo.dados.contexto_vision
    );

    // Callback: sucesso
    if (options.callbacks?.onSucesso) {
      options.callbacks.onSucesso({
        pasta: preparo.dados.metadata.pastaTrabalhoNome,
        timestamp: new Date().toLocaleString(),
        tempo_ms: new Date().getTime() - startTime
      });
    }

  } catch (e) {
    erroVision = {
      tipo: 'VISION_EXCEPTION',
      mensagem: e.message,
      stack: e.stack,
      tempo_ms: new Date().getTime() - startTime
    };

    // Callback: erro
    if (options.callbacks?.onErro) {
      options.callbacks.onErro(erroVision);
    }

    return { sucesso: false, resultado: null, erro: erroVision };
  }

  // Sucesso
  return {
    sucesso: true,
    resultado: resultadoVision,
    erro: null,
    tempo_ms: new Date().getTime() - startTime
  };
}

/**
 * Wrapper com retry automático em caso de falha.
 * @param {Object} contextoAtivo - Contexto
 * @param {Object} options - { pastaId, callbacks, maxTentativas, delayMs }
 * @return {Object} Resultado do processamento
 */
function chamarVisionComRetry_(contextoAtivo, options = {}) {
  const maxTentativas = options.maxTentativas || 3;
  const delayMs = options.delayMs || 1000;

  let tentativa = 1;
  let resultado = null;

  while (tentativa <= maxTentativas) {
    console.log(`📊 Tentativa ${tentativa}/${maxTentativas}...`);

    // Callback: início tentativa
    if (options.callbacks?.onTentativa) {
      options.callbacks.onTentativa({ tentativa, total: maxTentativas });
    }

    // Chamar vision
    resultado = chamarVisionBatch_(contextoAtivo, {
      ...options,
      callbacks: {
        ...options.callbacks,
        onErro: (erro) => {
          // Não chamar callback onErro aqui se for retry
          console.warn(`❌ Tentativa ${tentativa} falhou:`, erro.mensagem);
        }
      }
    });

    if (resultado.sucesso) {
      console.log('✅ Sucesso na tentativa', tentativa);
      return resultado;
    }

    // Se foi última tentativa, chamar onErro agora
    if (tentativa === maxTentativas && options.callbacks?.onErro) {
      options.callbacks.onErro(resultado.erro);
    }

    // Aguardar antes de retentar
    if (tentativa < maxTentativas) {
      Utilities.sleep(delayMs * tentativa); // Backoff exponencial
    }

    tentativa++;
  }

  return resultado;
}

/**
 * Processa pasta com logging estruturado.
 * Retorna resumo executivo.
 * @param {Object} contextoAtivo - Contexto
 * @param {Object} options - Opções
 * @return {Object} Resumo { sucesso, tempo_ms, detalhes }
 */
function processarPastaComVision_(contextoAtivo, options = {}) {
  const resultado = chamarVisionComRetry_(contextoAtivo, {
    maxTentativas: options.maxTentativas || 3,
    delayMs: options.delayMs || 1000,
    pastaId: options.pastaId,
    callbacks: options.callbacks
  });

  // Resumo
  return {
    sucesso: resultado.sucesso,
    tempo_ms: resultado.tempo_ms,
    mensagem: resultado.sucesso
      ? '✅ Pasta processada com sucesso!'
      : `❌ Falha ao processar: ${resultado.erro.mensagem}`,
    detalhes: resultado.sucesso ? resultado.resultado : resultado.erro
  };
}

/**
 * TESTE: Simula processamento com callbacks.
 */
function teste_chamarVisionBatch() {
  const contexto = obterContextoAtivo_();

  const resultado = chamarVisionBatch_(contexto, {
    callbacks: {
      onInicio: (info) => console.log('🚀 Iniciou:', JSON.stringify(info)),
      onSucesso: (info) => console.log('✅ Sucesso:', JSON.stringify(info)),
      onErro: (erro) => console.error('❌ Erro:', JSON.stringify(erro))
    }
  });

  console.log('Resultado final:', JSON.stringify(resultado, null, 2));
  return resultado;
}
