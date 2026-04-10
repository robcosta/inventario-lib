/**
 * ============================================================
 * CONTEXTO — REPARAR CONTEXTO ADMIN
 * ============================================================
 * - Reconstrói o contexto a partir do Drive
 * - Regrava em ScriptProperties
 * - NÃO cria contexto novo
 */

function repararContextoAdmin_() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nomePlanilha = ss.getName();

  if (!/^ADMIN:/i.test(nomePlanilha)) {
    ui.alert('Esta função só pode ser executada em uma planilha ADMIN.');
    return;
  }

  const nomeContexto = nomePlanilha.replace(/^ADMIN:\s*/i, '').trim();
  const contextoAnterior = obterContextoAtivo_() || {};

  // 📂 PLANILHA → pasta PLANILHA
  const fileAdmin = DriveApp.getFileById(ss.getId());
  if (!fileAdmin.getParents().hasNext()) {
    ui.alert('Pasta PLANILHA não encontrada.');
    return;
  }

  const pastaPlanilhas = fileAdmin.getParents().next();

  // 📂 CONTEXTO → pasta mãe
  if (!pastaPlanilhas.getParents().hasNext()) {
    ui.alert('Pasta do CONTEXTO não encontrada.');
    return;
  }

  const pastaContexto = pastaPlanilhas.getParents().next();

  // 🌍 Reconstroi estrutura global a partir do contexto atual:
  // CONTEXTOS -> RAIZ -> GERAL -> CSV_GERAL.
  let pastaContextosGlobal = null;
  let pastaRaiz = null;

  const paisContexto = pastaContexto.getParents();
  if (paisContexto.hasNext()) {
    pastaContextosGlobal = paisContexto.next();

    const paisContextos = pastaContextosGlobal.getParents();
    if (paisContextos.hasNext()) {
      pastaRaiz = paisContextos.next();
    }
  }

  let pastaGeral = null;
  let pastaCSVGeral = null;

  if (pastaRaiz) {
    pastaGeral = obterOuCriarSubpasta_(pastaRaiz, 'GERAL');
    pastaCSVGeral = obterOuCriarSubpasta_(pastaGeral, 'CSV_GERAL');

    atualizarSistemaGlobal_({
      pastaRaizId: pastaRaiz.getId(),
      pastaContextoId: pastaContextosGlobal ? pastaContextosGlobal.getId() : undefined,
      pastaGeralId: pastaGeral.getId(),
      pastaCSVGeralId: pastaCSVGeral.getId()
    });
  }

  // Subpastas obrigatórias
  const pastaCSVAdmin = obterOuCriarSubpasta_(pastaPlanilhas, 'CSV_ADMIN');
  const pastaLocalidades = obterOuCriarSubpasta_(pastaContexto, 'LOCALIDADES');

  // Localizar planilhas CLIENTE e RELATÓRIO
  let planilhaClienteId = null;
  let planilhaRelatorioId = null;
  let fallbackPrimeiraPlanilhaId = null;

  const filesLocalidades = pastaLocalidades.getFilesByType(MimeType.GOOGLE_SHEETS);
  while (filesLocalidades.hasNext()) {
    const file = filesLocalidades.next();
    const nome = String(file.getName() || '').toUpperCase();

    if (!fallbackPrimeiraPlanilhaId) {
      fallbackPrimeiraPlanilhaId = file.getId();
    }

    if (!planilhaClienteId && nome.startsWith('CLIENTE:')) {
      planilhaClienteId = file.getId();
      continue;
    }

    if (
      !planilhaRelatorioId &&
      (
        nome.startsWith('RELATÓRIOS:') ||
        nome.startsWith('RELATÓRIOS:') ||
        nome.startsWith('RELATORIO:') ||
        nome.startsWith('RELATORIOS:')
      )
    ) {
      planilhaRelatorioId = file.getId();
      continue;
    }
  }

  // Fallback legado: se só existir uma planilha na pasta LOCALIDADES
  if (!planilhaClienteId && !planilhaRelatorioId && fallbackPrimeiraPlanilhaId) {
    planilhaClienteId = fallbackPrimeiraPlanilhaId;
  }

  const contextoAdmin = {
    nome: nomeContexto,

    planilhaAdminId: ss.getId(),
    planilhaClienteId,
    planilhaRelatorioId,
    planilhaGeralId: resolverPlanilhaGeralId_(),

    pastaContextoId: pastaContexto.getId(),
    pastaPlanilhasId: pastaPlanilhas.getId(),
    pastaCSVAdminId: pastaCSVAdmin.getId(),
    pastaLocalidadesId: pastaLocalidades.getId(),
    localidadeAtivaId: contextoAnterior.localidadeAtivaId || null,
    localidadeAtivaNome: contextoAnterior.localidadeAtivaNome || null,
    mapaCoresPastas: (contextoAnterior.mapaCoresPastas && typeof contextoAnterior.mapaCoresPastas === 'object')
      ? contextoAnterior.mapaCoresPastas
      : {},
    coresBanidasPastas: Array.isArray(contextoAnterior.coresBanidasPastas)
      ? contextoAnterior.coresBanidasPastas
      : []
  };


  limparContextoAtivo_();
  definirContextoAtivo_(contextoAdmin);


  adminRenderMenu_();

  ui.alert(
    `✅ Contexto "${nomeContexto}" reparado com sucesso!\n\n` +
    'Ele foi recadastrado no sistema.'
  );
}

/**
 * Repara o contexto ADMIN sem UI (modo worker / silencioso).
 * - Usa apenas o ID da planilha ADMIN.
 * - Reconstrói as pastas obrigatórias e persiste em ScriptProperties.
 * - Retorna o contexto reconstruído ou null em caso de falha.
 */
function repararContextoAdminSilencioso_(planilhaAdminId) {
  const id = String(planilhaAdminId || '').trim();
  if (!id) return null;

  try {
    let contextoAnterior = null;
    try {
      const raw = PropertiesService
        .getScriptProperties()
        .getProperty(CONTEXTO_KEYS.PREFIXO + id);
      contextoAnterior = raw ? JSON.parse(raw) : null;
    } catch (eCtx) {}

    const ss = SpreadsheetApp.openById(id);
    const nomePlanilha = ss.getName();
    const nomeContexto = nomePlanilha.replace(/^ADMIN:\s*/i, '').trim() || nomePlanilha;

    const fileAdmin = DriveApp.getFileById(id);
    const paisPlanilha = fileAdmin.getParents();
    if (!paisPlanilha.hasNext()) return null;
    const pastaPlanilhas = paisPlanilha.next();

    const paisContexto = pastaPlanilhas.getParents();
    if (!paisContexto.hasNext()) return null;
    const pastaContexto = paisContexto.next();

    // 🌍 Reconstrói hierarquia global (quando possível)
    let pastaContextosGlobal = null;
    let pastaRaiz = null;
    const paisContextoMae = pastaContexto.getParents();
    if (paisContextoMae.hasNext()) {
      pastaContextosGlobal = paisContextoMae.next();
      const paisRaiz = pastaContextosGlobal.getParents();
      if (paisRaiz.hasNext()) {
        pastaRaiz = paisRaiz.next();
      }
    }

    if (pastaRaiz) {
      const pastaGeral = obterOuCriarSubpasta_(pastaRaiz, 'GERAL');
      const pastaCSVGeral = obterOuCriarSubpasta_(pastaGeral, 'CSV_GERAL');
      atualizarSistemaGlobal_({
        pastaRaizId: pastaRaiz.getId(),
        pastaContextoId: pastaContextosGlobal ? pastaContextosGlobal.getId() : undefined,
        pastaGeralId: pastaGeral.getId(),
        pastaCSVGeralId: pastaCSVGeral.getId()
      });
    }

    const pastaCSVAdmin = obterOuCriarSubpasta_(pastaPlanilhas, 'CSV_ADMIN');
    const pastaLocalidades = obterOuCriarSubpasta_(pastaContexto, 'LOCALIDADES');

    // Localizar planilhas CLIENTE e RELATÓRIO
    let planilhaClienteId = null;
    let planilhaRelatorioId = null;
    let fallbackPrimeiraPlanilhaId = null;

    const filesLocalidades = pastaLocalidades.getFilesByType(MimeType.GOOGLE_SHEETS);
    while (filesLocalidades.hasNext()) {
      const file = filesLocalidades.next();
      const nome = String(file.getName() || '').toUpperCase();

      if (!fallbackPrimeiraPlanilhaId) {
        fallbackPrimeiraPlanilhaId = file.getId();
      }

      if (!planilhaClienteId && nome.startsWith('CLIENTE:')) {
        planilhaClienteId = file.getId();
        continue;
      }

      if (
        !planilhaRelatorioId &&
        (
          nome.startsWith('RELATÓRIOS:') ||
          nome.startsWith('RELATÓRIOS:') ||
          nome.startsWith('RELATORIO:') ||
          nome.startsWith('RELATORIOS:')
        )
      ) {
        planilhaRelatorioId = file.getId();
        continue;
      }
    }

    // Fallback legado: se só existir uma planilha na pasta LOCALIDADES
    if (!planilhaClienteId && !planilhaRelatorioId && fallbackPrimeiraPlanilhaId) {
      planilhaClienteId = fallbackPrimeiraPlanilhaId;
    }

    const contextoAdmin = {
      nome: nomeContexto,
      planilhaAdminId: id,
      planilhaClienteId,
      planilhaRelatorioId,
      planilhaGeralId: typeof resolverPlanilhaGeralIdSeguro_ === 'function'
        ? resolverPlanilhaGeralIdSeguro_()
        : resolverPlanilhaGeralId_(),
      pastaContextoId: pastaContexto.getId(),
      pastaPlanilhasId: pastaPlanilhas.getId(),
      pastaCSVAdminId: pastaCSVAdmin.getId(),
      pastaLocalidadesId: pastaLocalidades.getId(),
      localidadeAtivaId: contextoAnterior ? (contextoAnterior.localidadeAtivaId || null) : null,
      localidadeAtivaNome: contextoAnterior ? (contextoAnterior.localidadeAtivaNome || null) : null,
      mapaCoresPastas: (contextoAnterior && contextoAnterior.mapaCoresPastas && typeof contextoAnterior.mapaCoresPastas === 'object')
        ? contextoAnterior.mapaCoresPastas
        : {},
      coresBanidasPastas: (contextoAnterior && Array.isArray(contextoAnterior.coresBanidasPastas))
        ? contextoAnterior.coresBanidasPastas
        : []
    };

    salvarContextoAdmin_(id, contextoAdmin);
    return contextoAdmin;

  } catch (e) {
    Logger.log('[CONTEXTO][REPARAR][SILENCIOSO] ' + e.message);
    return null;
  }
}
