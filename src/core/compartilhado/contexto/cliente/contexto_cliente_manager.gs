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
 * ============================================================
 * CONTEXTO DOMÍNIO — RESOLUÇÃO ÚNICA E NORMALIZAÇÃO
 * ============================================================
 *
 * Resolve o contexto ativo (ADMIN ou CLIENTE)
 * e retorna o contrato normalizado do sistema.
 *
 * Esta é a única porta de entrada para contexto.
 */
function obterContextoDominio_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const id = ss.getId();

  // ============================================================
  // 1️⃣ ADMIN (ScriptProperties)
  // ============================================================

  const rawAdmin = PropertiesService
    .getScriptProperties()
    .getProperty(CONTEXTO_KEYS.PREFIXO + id);

  if (rawAdmin) {

    const dados = JSON.parse(rawAdmin);

    return {
      tipo: 'ADMIN',
      origem: 'SCRIPT_PROPERTIES',

      nome: dados.nome || null,

      planilhaAdminId: dados.planilhaAdminId || null,
      planilhaClienteId: dados.planilhaClienteId || null,
      planilhaGeralId: obterPlanilhaGeralId_(),

      pastaContextoId: dados.pastaContextoId || null,
      pastaLocalidadesId: dados.pastaLocalidadesId || null,

      localidadeAtivaId: dados.localidadeAtivaId || null,
      localidadeAtivaNome: dados.localidadeAtivaNome || null
    };
  }

  // ============================================================
  // 2️⃣ CLIENTE (DocumentProperties)
  // ============================================================

  const rawCliente = PropertiesService
    .getDocumentProperties()
    .getProperty(PROPRIEDADES_CLIENTE.CONTEXTO_CLIENTE);

  if (rawCliente) {

    const dados = JSON.parse(rawCliente);

    return {
      tipo: 'CLIENTE',
      origem: 'DOCUMENT_PROPERTIES',

      nome: dados.nome || null,

      planilhaAdminId: dados.planilhaAdminId || null,
      planilhaClienteId: dados.planilhaClienteId || null,
      planilhaGeralId: obterPlanilhaGeralId_(),

      pastaContextoId: dados.pastaContextoId || null,
      pastaLocalidadesId: dados.pastaLocalidadesId || null,

      localidadeAtivaId: dados.localidadeAtivaId || null,
      localidadeAtivaNome: dados.localidadeAtivaNome || null
    };
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


