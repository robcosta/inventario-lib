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
 * Obtém contexto cliente válido.
 * Se não existir → executa auto-discovery.
 */
function obterContextoCliente_() {

  const docProps = PropertiesService.getDocumentProperties();
  const raw = docProps.getProperty('CONTEXTO_CLIENTE');

  if (raw) {

    try {

      const contexto = JSON.parse(raw);

      if (contextoClienteValido_(contexto)) {
        return contexto;
      }

      docProps.deleteProperty('CONTEXTO_CLIENTE');

    } catch (e) {
      docProps.deleteProperty('CONTEXTO_CLIENTE');
    }
  }

  // 🔄 Auto discovery
  const reconstruido = descobrirContextoClienteAutomaticamente_();

  if (contextoClienteValido_(reconstruido)) {
    salvarContextoCliente_(reconstruido);
    return reconstruido;
  }

  return null;
}

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
    contexto.id &&
    contexto.nome &&
    contexto.pastaLocalidadesId &&
    contexto.planilhaAdminId &&
    contexto.planilhaClienteId
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

  const contextoAtual = obterContextoCliente_();

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


