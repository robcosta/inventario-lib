/**
 * ============================================================
 * CONFIGURAÇÃO GLOBAL — CONTEXTO
 * ============================================================
 * Define as constantes e estruturas de dados para criação
 * e gerenciamento de contextos no sistema de inventário.
 */

const CONTEXTO_CONFIG = {
  // ============================================================
  // 📁 ESTRUTURA DE PASTAS
  // ============================================================
  PASTAS: {
    raiz: 'Inventário Patrimonial',
    planilhas: 'PLANILHAS',
    admin: 'ADMIN',
    csvContexto: 'CSV_CONTEXTO',
    contextos: 'CONTEXTOS'
  },

  // ============================================================
  // 📝 PREFIXOS E TÍTULOS
  // ============================================================
  PREFIXOS: {
    planilhaCliente: 'UI ',
    logBootstrap: '[BOOTSTRAP][ADMIN]'
  },

  TITULOS: {
    promptCriarContexto: 'Criar Contexto de Trabalho'
  },

  // ============================================================
  // ⏱️ DURAÇÕES DE TOAST (em segundos)
  // ============================================================
  TOAST: {
    erro: 5,
    aviso: 5,
    nomeInvalido: 4,
    progresso: 3,
    finalizacao: 2
  },

  // ============================================================
  // 💬 MENSAGENS DE CRIAÇÃO
  // ============================================================
  MENSAGENS: {
    // Erros e avisos
    contextoJaExiste: 
      'Esta planilha já pertence a um contexto. Não é permitido criar outro.',
    
    nomeVazio: 
      'O nome do contexto não pode estar vazio.',
    
    contextoDuplicado: (nome) => 
      `O contexto "${nome}" já existe. Use "Selecionar Contexto de Trabalho".`,
    
    pastaRaizNaoEncontrada: 
      'Pasta "Inventário Patrimonial" não encontrada. Verifique a configuração.',

    // Prompts de entrada
    listaContextosExistentes: 
      'Contextos já existentes:\n\n',
    
    informeNovoContexto: 
      '\nInforme o nome do NOVO contexto:',
    
    primeiroContexto: 
      'Nenhum contexto foi criado até o momento.\n\nInforme o nome do primeiro contexto:',

    // Progresso
    criandoPastas: 
      'Criando estrutura de pastas...',
    
    pastasConfiguradas: 
      'Estrutura de pastas criada. Configurando planilhas...',
    
    clienteConfigurada: 
      'Planilha cliente configurada. Finalizando...',
    
    atualizandoMenu: 
      'Atualizando menu...',

    // Sucesso
    sucessoFinal: 
      'Contexto criado com sucesso!\n\nFeche e reabra a planilha para ver o menu atualizado.'
  },

  // ============================================================
  // 🏷️ TÍTULOS DE TOAST
  // ============================================================
  TITULOS_TOAST: {
    contextoExistente: '⚠️ Contexto Existente',
    nomeInvalido: '❌ Nome Inválido',
    contextoDuplicado: '⚠️ Contexto Já Existe',
    erro: '❌ Erro',
    configurando: '📁 Configurando',
    progresso: '✅ Progresso',
    progressoConfig: '⚙️ Progresso',
    finalizando: '🔄 Finalizando'
  },

  // ============================================================
  // ⚙️ COMPORTAMENTOS
  // ============================================================
  COMPORTAMENTO: {
    normalizarNomeUpperCase: true,
    permitirDuplicacao: false,
    mostrarAlertFinal: true,
    atualizarMenuAposCriar: true
  },

  // ============================================================
  // 📋 ESTRUTURA: CONTEXTO_CLIENTE
  // ============================================================
  // Gravado na planilha CLIENTE
  // Usado para acesso/configuração no lado do cliente
  CONTEXTO_CLIENTE_SCHEMA: {
    nome: 'string',                      // Nome do contexto (UPPERCASE)
    pastaContextoId: 'string',           // ID da pasta admin do contexto
    planilhaClienteId: 'string',         // ID da própria planilha cliente (UI)
    planilhaContextoId: 'string',        // ID da planilha de contexto
    planilhaGeralId: 'string',           // ID da planilha geral
    emailOperador: 'string'              // Email do criador
  },

  // ============================================================
  // ⚙️ ESTRUTURA: CONTEXTO_ADMIN
  // ============================================================
  // Gravado na planilha ADMIN
  // Usado para gerenciamento administrativo
  CONTEXTO_ADMIN_SCHEMA: {
    // ⚠️ DEPRECATED: Use contexto_admin_manager.gs e criarContextoAdmin_()
    // Este schema é mantido apenas para referência histórica
    nome: 'string',
    pastaLocalidadesId: 'string',        // ID da pasta onde as localidades estão
    planilhaClienteId: 'string',
    criadoEm: 'string'
  }
};

// ============================================================
// 🔧 FUNÇÕES AUXILIARES PARA CONFIG
// ============================================================

/**
 * Cria um novo objeto CONTEXTO_CLIENTE com valores iniciais
 * @param {Object} params - Parâmetros do contexto
 * @param {string} params.nome - Nome do contexto
 * @param {string} params.pastaContextoId - ID da pasta contexto
 * @param {string} params.planilhaClienteId - ID da planilha cliente
 * @param {string} params.planilhaContextoId - ID da planilha contexto
 * @param {string} params.planilhaGeralId - ID da planilha geral
 * @param {string} params.emailOperador - Email do operador
 * @returns {Object} Objeto CONTEXTO_CLIENTE
 */
function criarContextoCliente_(params) {
  return {
    nome: params.nome,
    pastaContextoId: params.pastaContextoId,
    planilhaClienteId: params.planilhaClienteId,
    planilhaContextoId: params.planilhaContextoId,
    planilhaGeralId: params.planilhaGeralId,
    emailOperador: params.emailOperador
  };
}

/**
 * Cria um novo objeto CONTEXTO_ADMIN com valores iniciais
 * @param {Object} params - Parâmetros do contexto
 * @param {string} params.nome - Nome do contexto
 * @param {string} params.pastaContextoId - ID da pasta contexto
 * @param {string} params.pastaCSVId - ID da pasta CSV
 * @param {string} params.pastaUnidadeId - ID da pasta unidade
 * @param {string} params.planilhaAdminId - ID da planilha ADMIN
 * @param {string} params.planilhaClienteId - ID da planilha cliente
 * @returns {Object} Objeto CONTEXTO_ADMIN
 */
function criarContextoAdmin_(params) {
  return {
    nome: params.nome,
    pastaContextoId: params.pastaContextoId,
    pastaCSVId: params.pastaCSVId,
    pastaUnidadeId: params.pastaUnidadeId,
    planilhaAdminId: params.planilhaAdminId,
    planilhaClienteId: params.planilhaClienteId,
    criadoEm: new Date().toISOString()
  };
}

/**
 * Valida se um objeto CONTEXTO_CLIENTE possui todos os campos obrigatórios
 * @param {Object} contexto - Objeto a validar
 * @returns {boolean} true se válido, false caso contrário
 */
function validarContextoCliente_(contexto) {
  const campos = Object.keys(CONTEXTO_CONFIG.CONTEXTO_CLIENTE_SCHEMA);
  return campos.every(campo => contexto.hasOwnProperty(campo) && contexto[campo]);
}

/**
 * Valida se um objeto CONTEXTO_ADMIN possui todos os campos obrigatórios
 * @param {Object} contexto - Objeto a validar
 * @returns {boolean} true se válido, false caso contrário
 */
function validarContextoAdmin_(contexto) {
  const campos = Object.keys(CONTEXTO_CONFIG.CONTEXTO_ADMIN_SCHEMA);
  return campos.every(campo => contexto.hasOwnProperty(campo) && contexto[campo]);
}
