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