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

  // Subpastas obrigatórias
  const pastaCSVAdmin = obterOuCriarSubpasta_(pastaPlanilhas, 'CSV_ADMIN');
  const pastaLocalidades = obterOuCriarSubpasta_(pastaContexto, 'LOCALIDADES');

  // Localizar planilha CLIENTE
  let planilhaClienteId = null;
  const filesCliente = pastaLocalidades.getFilesByType(MimeType.GOOGLE_SHEETS);
  if (filesCliente.hasNext()) {
    planilhaClienteId = filesCliente.next().getId();
  }

  const contextoAdmin = {
    nome: nomeContexto,

    planilhaAdminId: ss.getId(),
    planilhaClienteId,
    planilhaGeralId: obterPlanilhaGeralId_(),

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
