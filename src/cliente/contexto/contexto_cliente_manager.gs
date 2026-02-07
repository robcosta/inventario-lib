/**
 * ============================================================
 * GERENCIADOR DE CONTEXTO CLIENTE
 * ============================================================
 * Funções para gerenciar CONTEXTO_CLIENTE (DocumentProperties da planilha cliente)
 */

/**
 * Obtém o contexto cliente completo
 * @return {Object|null} Contexto ou null se não existir
 */
function obterContextoCliente_() {
  const docProps = PropertiesService.getDocumentProperties();
  const raw = docProps.getProperty(PROPRIEDADES_CLIENTE.CONTEXTO_CLIENTE);
  
  if (!raw) return null;
  
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao parsear CONTEXTO_CLIENTE:', e.message);
    return null;
  }
}

/**
 * Salva o contexto cliente completo
 * @param {Object} contexto
 */
function salvarContextoCliente_(contexto) {
  if (!contexto) {
    throw new Error('Contexto cliente não pode ser nulo.');
  }
  
  PropertiesService
    .getDocumentProperties()
    .setProperty(PROPRIEDADES_CLIENTE.CONTEXTO_CLIENTE, JSON.stringify(contexto));
}

/**
 * Atualiza campos específicos do contexto cliente
 * @param {Object} atualizacoes
 */
function atualizarContextoCliente_(atualizacoes) {
  const contexto = obterContextoCliente_() || {};
  
  // Merge das atualizações
  Object.keys(atualizacoes).forEach(chave => {
    contexto[chave] = atualizacoes[chave];
  });
  
  salvarContextoCliente_(contexto);
}

/**
 * Cria um novo contexto cliente
 * @param {Object} dados - {id, nome, emailOperador, ...}
 * @return {Object} Contexto criado
 */
function criarContextoCliente_(dados) {
  const contexto = {
    // Identificação
    id: dados.id,
    nome: dados.nome,
    emailOperador: dados.emailOperador || Session.getActiveUser().getEmail(),
    
    // Pastas
    pastaLocalidadesId: dados.pastaLocalidadesId || null,
    pastaLocalidadeAtivaId: dados.pastaLocalidadeAtivaId || null,
    
    // Planilhas
    planilhaAdminId: dados.planilhaAdminId || null,
    planilhaGeralId: dados.planilhaGeralId || obterPlanilhaGeralId_(),
    
    // Localidade Ativa
    localidadeAtiva: dados.localidadeAtiva || {
      id: null,
      nome: null,
      cor: null,
      ultimoAcesso: null
    }
  };
  
  salvarContextoCliente_(contexto);
  return contexto;
}

/**
 * Define a localidade ativa no cliente
 * @param {Object} localidade - {id, nome, cor}
 */
function setLocalidadeAtivaCliente_(localidade) {
  const contexto = obterContextoCliente_();
  
  if (!contexto) {
    throw new Error('Contexto cliente não encontrado.');
  }
  
  contexto.pastaLocalidadeAtivaId = localidade.id;
  contexto.localidadeAtiva = {
    id: localidade.id,
    nome: localidade.nome,
    cor: localidade.cor || '#CCCCCC',
    ultimoAcesso: new Date().toISOString()
  };
  
  salvarContextoCliente_(contexto);
}

/**
 * Verifica se a planilha tem contexto cliente
 * @return {boolean}
 */
function planilhaTemContextoCliente_() {
  return !!PropertiesService
    .getDocumentProperties()
    .getProperty(PROPRIEDADES_CLIENTE.CONTEXTO_CLIENTE);
}

/**
 * Remove o contexto cliente (usar com cuidado!)
 */
function removerContextoCliente_() {
  PropertiesService
    .getDocumentProperties()
    .deleteProperty(PROPRIEDADES_CLIENTE.CONTEXTO_CLIENTE);
}
