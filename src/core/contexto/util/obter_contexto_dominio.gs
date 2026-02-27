/**
 * ============================================================
 * CONTEXTO DOMÍNIO — RESOLUÇÃO ÚNICA
 * ============================================================
 *
 * Resolve o contexto ativo (ADMIN, CLIENTE ou RELATORIO)
 * com prioridade determinística.
 *
 * Ordem de resolução:
 * 1️⃣ ADMIN (ScriptProperties por ID)
 * 2️⃣ CLIENTE (DocumentProperties)
 * 3️⃣ RELATORIO (DocumentProperties)
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
  const rawRelatorio = PropertiesService
    .getDocumentProperties()
    .getProperty(PROPRIEDADES_RELATORIO.CONTEXTO_RELATORIO);

  if (rawRelatorio) {
    return normalizarContexto_(
      JSON.parse(rawRelatorio),
      'RELATORIO',
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
    planilhaRelatorioId: dados.planilhaRelatorioId || null,
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