/**
 * ============================================================
 * CONTEXTO DOMÍNIO — RESOLUÇÃO ÚNICA E NORMALIZAÇÃO
 * ============================================================
 *
 * Resolve o contexto ativo (ADMIN, CLIENTE ou RELATORIOS)
 * e retorna o contrato normalizado do sistema.
 */
function obterContextoDominio_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const id = ss.getId();

  // ============================================================
  // 1️⃣ ADMIN (ScriptProperties por ID da planilha)
  // ============================================================

  const rawAdmin = PropertiesService
    .getScriptProperties()
    .getProperty(CONTEXTO_KEYS.PREFIXO + id);

  if (rawAdmin) {

    const dados = JSON.parse(rawAdmin);

    return normalizarContexto_({
      ...dados,
      tipo: 'ADMIN',
      origem: 'SCRIPT_PROPERTIES',
      planilhaGeralId: obterPlanilhaGeralId_()
    });
  }

  // ============================================================
  // 2️⃣ CLIENTE (DocumentProperties)
  // ============================================================

  const rawCliente = PropertiesService
    .getDocumentProperties()
    .getProperty(PROPRIEDADES_CLIENTE.CONTEXTO_CLIENTE);

  if (rawCliente) {

    const dados = JSON.parse(rawCliente);

    return normalizarContexto_({
      ...dados,
      tipo: 'CLIENTE',
      origem: 'DOCUMENT_PROPERTIES',
      planilhaGeralId: obterPlanilhaGeralId_()
    });
  }

  // ============================================================
  // 3️⃣ RELATORIOS (DocumentProperties)
  // ============================================================

  const rawRelatorios = PropertiesService
    .getDocumentProperties()
    .getProperty(PROPRIEDADES_RELATORIOS.CONTEXTO_RELATORIOS);

  if (rawRelatorios) {

    const dados = JSON.parse(rawRelatorios);

    return normalizarContexto_({
      ...dados,
      tipo: 'RELATORIOS',
      origem: 'DOCUMENT_PROPERTIES',
      planilhaGeralId: obterPlanilhaGeralId_()
    });
  }

  return null;
}

function normalizarContexto_(dados) {

  return {
    tipo: dados.tipo || null,
    origem: dados.origem || null,

    nome: dados.nome || null,

    planilhaAdminId: dados.planilhaAdminId || null,
    planilhaClienteId: dados.planilhaClienteId || null,
    planilhaRelatoriosId: dados.planilhaRelatoriosId || null,
    planilhaGeralId: dados.planilhaGeralId || null,

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