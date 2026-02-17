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
        Logger.log("Mostrando contexto:" + JSON.stringify(contexto) + "\n Significa que está válido");
        return contexto;
      }

      // 🔥 Se inválido, remove e força reconstrução
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

  if (!contexto) {
    throw new Error('Contexto cliente inválido.');
  }

  PropertiesService
    .getDocumentProperties()
    .setProperty(
      'CONTEXTO_CLIENTE',
      JSON.stringify(contexto)
    );
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
    contexto.planilhaGeralId &&
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

  const contextoAtual = obterContextoCliente_();

  if (!contextoAtual) {
    throw new Error('Nenhum contexto cliente ativo para atualizar.');
  }

  const contextoAtualizado = {
    ...contextoAtual,
    ...atualizacoes
  };

  salvarContextoCliente_(contextoAtualizado);

  return contextoAtualizado;
}

