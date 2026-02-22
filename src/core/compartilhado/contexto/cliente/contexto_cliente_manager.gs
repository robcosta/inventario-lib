/**
 * ============================================================
 * CONTEXTO CLIENTE — CORE (ID-BASED)
 * ============================================================
 * - Totalmente automático
 * - Sem modo manual
 * - Baseado na estrutura oficial:
 *
 * CONTEXTOS/
 *   └── TESTE1 - DEV/
 *        ├── LOCALIDADES/
 *        │     └── planilha CLIENTE
 *        └── PLANILHA/
 *              └── planilha ADMIN
 * ============================================================
 */
/**
 * Salva contexto cliente.
 */
function salvarContextoCliente_(contexto) {

  Logger.log('[CLIENTE] Persistindo CONTEXTO_CLIENTE...');
  Logger.log('[CLIENTE] Dados persistidos: ' + JSON.stringify(contexto));

  PropertiesService
    .getDocumentProperties()
    .setProperty(
      'CONTEXTO_CLIENTE',
      JSON.stringify(contexto)
    );

  Logger.log('[CLIENTE] CONTEXTO_CLIENTE salvo com sucesso.');
}



/**
 * Remove contexto salvo.
 */
function removerContextoCliente() {

  PropertiesService
    .getDocumentProperties()
    .deleteProperty('CONTEXTO_CLIENTE');
}

/**
 * ============================================================
 * Valida estrutura mínima do CONTEXTO_CLIENTE
 * ============================================================
 * @param {Object} contexto
 * @return {boolean}
 */
function contextoClienteValido_(contexto) {

  if (!contexto) return false;

  return !!(
    contexto.nome &&
    contexto.pastaLocalidadesId &&
    contexto.planilhaAdminId &&
    contexto.planilhaClienteId &&
    contexto.tipo === 'CLIENTE'
  );
}

/**
 * ============================================================
 * Atualiza parcialmente o CONTEXTO_CLIENTE
 * ============================================================
 * @param {Object} atualizacoes
 */
function atualizarContextoCliente_(atualizacoes) {

  Logger.log('[CLIENTE] Atualizando contexto cliente...');
  Logger.log('[CLIENTE] Atualizações recebidas: ' + JSON.stringify(atualizacoes));

  const contextoAtual = obterContextoDominio_();

  Logger.log('[CLIENTE] Contexto antes da atualização: ' + JSON.stringify(contextoAtual));

  if (!contextoAtual) {
    throw new Error('Nenhum contexto cliente ativo para atualizar.');
  }

  const contextoAtualizado = {
    ...contextoAtual,
    ...atualizacoes
  };

  salvarContextoCliente_(contextoAtualizado);

  Logger.log('[CLIENTE] Contexto salvo: ' + JSON.stringify(contextoAtualizado));

  return contextoAtualizado;
}


