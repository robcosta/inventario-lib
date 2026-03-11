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
    pastaLocalidadesId: pastaLocalidades.getId()
  };


  limparContextoAtivo_();
  definirContextoAtivo_(contextoAdmin);


  adminRenderMenu_();

  ui.alert(
    `✅ Contexto "${nomeContexto}" reparado com sucesso!\n\n` +
    'Ele foi recadastrado no sistema.'
  );
}
