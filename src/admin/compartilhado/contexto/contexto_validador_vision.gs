/**
 * ============================================================
 * VALIDADOR DE CONTEXTO - INTEGRAÇÃO COM VISION
 * ============================================================
 * Valida e padroniza contexto antes de chamar inventario-vision-core
 * Garante que todos os campos obrigatórios estão presentes.
 */

/**
 * Valida se o contexto está completo e pronto para Vision.
 * @param {Object} contexto - Contexto a validar
 * @return {Object} { valido: boolean, erros: string[], contexto_normalizado: Object }
 */
function validarContextoVision_(contexto) {
  const erros = [];
  const avisos = [];

  // Validação estrutural
  if (!contexto || typeof contexto !== 'object') {
    erros.push('Contexto ausente ou inválido (não é um objeto).');
    return { valido: false, erros, avisos, contexto_normalizado: null };
  }

  // Campos obrigatórios
  const camposObrigatorios = {
    'pastaTrabalhoId': 'ID da pasta de trabalho',
    'planilhaOperacionalId': 'ID da planilha operacional (alvo)',
    'planilhaGeralId': 'ID da planilha geral (mãe)'
  };

  Object.entries(camposObrigatorios).forEach(([campo, descricao]) => {
    if (!contexto[campo] || typeof contexto[campo] !== 'string') {
      erros.push(`${descricao} ausente ou inválido (campo: "${campo}")`);
    }
  });

  // Validar cor se presente
  if (contexto.corDestaque && !/^#[0-9A-Fa-f]{6}$/.test(contexto.corDestaque)) {
    avisos.push(`Cor de destaque inválida. Usando padrão: #1557B0`);
  }

  // Se há erros, retorna imediatamente
  if (erros.length > 0) {
    return { valido: false, erros, avisos, contexto_normalizado: null };
  }

  // Normalizar contexto para vision-core
  const contextoPadronizado = {
    planilhaContextoId: contexto.planilhaOperacionalId,
    planilhaGeralId: contexto.planilhaGeralId,
    planilhaControleId: contexto.planilhaControleId || contexto.planilhaOperacionalId,
    corDestaque: contexto.corDestaque || '#1557B0',
    ABA_CONTROLE: contexto.ABA_CONTROLE || '__CONTROLE_PROCESSAMENTO__'
  };

  return {
    valido: true,
    erros: [],
    avisos,
    contexto_normalizado: contextoPadronizado,
    metadata: {
      pastaTrabalhoId: contexto.pastaTrabalhoId,
      pastaTrabalhoNome: contexto.pastaTrabalhoNome || 'Sem nome'
    }
  };
}

/**
 * Testa se consegue acessar todas as planilhas do contexto.
 * @param {Object} contexto - Contexto validado
 * @return {Object} { acessivel: boolean, erros: string[] }
 */
function testarAcessoContextoVision_(contexto) {
  const erros = [];

  // Testar acesso às planilhas
  const planilhasTestar = [
    { id: contexto.planilhaContextoId, nome: 'Operacional (Alvo)' },
    { id: contexto.planilhaGeralId, nome: 'Geral (Mãe)' }
  ];

  planilhasTestar.forEach(({ id, nome }) => {
    try {
      SpreadsheetApp.openById(id);
    } catch (e) {
      erros.push(`Sem acesso à planilha ${nome} (${id}): ${e.message}`);
    }
  });

  // Testar acesso à pasta
  try {
    DriveApp.getFolderById(contexto.metadata.pastaTrabalhoId);
  } catch (e) {
    erros.push(`Sem acesso à pasta de trabalho: ${e.message}`);
  }

  return {
    acessivel: erros.length === 0,
    erros
  };
}

/**
 * Valida contexto + testa acesso + retorna resultado estruturado.
 * @param {Object} contexto - Contexto do patrimonio-lib
 * @return {Object} { sucesso: boolean, dados: {...}, erros: string[] }
 */
function prepararContextoVision_(contexto) {
  // Passo 1: Validar estrutura
  const validacao = validarContextoVision_(contexto);

  if (!validacao.valido) {
    return {
      sucesso: false,
      dados: null,
      erros: validacao.erros,
      avisos: validacao.avisos
    };
  }

  // Passo 2: Tesar acesso
  const acesso = testarAcessoContextoVision_({
    ...validacao.contexto_normalizado,
    metadata: validacao.metadata
  });

  if (!acesso.acessivel) {
    return {
      sucesso: false,
      dados: null,
      erros: acesso.erros,
      avisos: validacao.avisos
    };
  }

  // Passo 3: Sucesso
  return {
    sucesso: true,
    dados: {
      contexto_vision: validacao.contexto_normalizado,
      metadata: validacao.metadata
    },
    erros: [],
    avisos: validacao.avisos
  };
}

/**
 * TESTE: Valida o contexto atual da patrimonio-lib
 */
function teste_validarContextoVision() {
  const contextoAtual = obterContextoAtivo_();
  const resultado = prepararContextoVision_(contextoAtual);

  console.log('=== TESTE DE VALIDAÇÃO ===');
  console.log('Sucesso:', resultado.sucesso);
  console.log('Erros:', resultado.erros);
  console.log('Avisos:', resultado.avisos);

  if (resultado.sucesso) {
    console.log('Contexto normalizado:', JSON.stringify(resultado.dados.contexto_vision, null, 2));
  }

  return resultado;
}
