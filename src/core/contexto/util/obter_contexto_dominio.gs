/**
 * ============================================================
 * CONTEXTO DOMÍNIO — RESOLUÇÃO ÚNICA
 * ============================================================
 *
 * Resolve o contexto ativo (ADMIN, CLIENTE ou RELATORIOS)
 * com prioridade determinística.
 *
 * Ordem de resolução:
 * 1️⃣ ADMIN (ScriptProperties por ID)
 * 2️⃣ CLIENTE (DocumentProperties)
 * 3️⃣ RELATORIOS (DocumentProperties)
 *
 * Retorna contrato normalizado.
 */
function obterContextoDominio_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;

  const id = ss.getId();

  /* ============================================================
   * 1️⃣ ADMIN
   * ============================================================ */
  const rawAdmin = PropertiesService
    .getScriptProperties()
    .getProperty(CONTEXTO_KEYS.PREFIXO + id);

  if (rawAdmin) {
    return normalizarContexto_(
      JSON.parse(rawAdmin),
      'ADMIN',
      'SCRIPT_PROPERTIES'
    );
  }

  /* ============================================================
   * 2️⃣ CLIENTE
   * ============================================================ */
  const rawCliente = PropertiesService
    .getDocumentProperties()
    .getProperty(PROPRIEDADES_CLIENTE.CONTEXTO_CLIENTE);

  if (rawCliente) {
    return normalizarContexto_(
      JSON.parse(rawCliente),
      'CLIENTE',
      'DOCUMENT_PROPERTIES'
    );
  }

  /* ============================================================
   * 3️⃣ RELATÓRIOS
   * ============================================================ */
  const rawRelatorios = PropertiesService
    .getDocumentProperties()
    .getProperty(PROPRIEDADES_RELATORIOS.CONTEXTO_RELATORIOS);

  if (rawRelatorios) {
    return normalizarContexto_(
      JSON.parse(rawRelatorios),
      'RELATORIOS',
      'DOCUMENT_PROPERTIES'
    );
  }

  return null;
}

/**
 * ============================================================
 * NORMALIZADOR DE CONTEXTO
 * ============================================================
 */
function normalizarContexto_(dados, tipo, origem) {

  return {

    tipo,
    origem,

    nome: dados.nome || null,

    planilhaAdminId: dados.planilhaAdminId || null,
    planilhaClienteId: dados.planilhaClienteId || null,
    planilhaRelatoriosId: dados.planilhaRelatoriosId || null,
    planilhaGeralId: dados.planilhaGeralId || obterPlanilhaGeralId_() || null,

    pastaContextoId: dados.pastaContextoId || null,
    pastaPlanilhasId: dados.pastaPlanilhasId || null,
    pastaCSVAdminId: dados.pastaCSVAdminId || null,
    pastaLocalidadesId: dados.pastaLocalidadesId || null,

    localidadeAtivaId: dados.localidadeAtivaId || null,
    localidadeAtivaNome: dados.localidadeAtivaNome || null,

    emailOperador: dados.emailOperador || null,
    criadoEm: dados.criadoEm || null,
    ultimaAtualizacao: dados.ultimaAtualizacao || null
  };
}