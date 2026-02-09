/**
 * ============================================================
 * CONTEXTO — REPARAR (RECADASTRAR CONTEXTO EXISTENTE)
 * ============================================================
 * Usado para contextos antigos que:
 * - têm planilhas e pastas corretas no Drive
 * - mas não existem mais no ScriptProperties
 */
function repararContextoAdmin_() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nomePlanilha = ss.getName();

  if (!nomePlanilha || nomePlanilha.toUpperCase().indexOf('ADMIN:') !== 0) {
    ui.alert('Esta função só pode ser executada em uma planilha ADMIN.');
    return;
  }

  const nomeContexto = nomePlanilha.replace(/^ADMIN:\s*/i, '').toUpperCase();

  // 🔍 Inferir estrutura de pastas a partir da planilha ADMIN
  const fileAdmin = DriveApp.getFileById(ss.getId());
  const pastaPlanilhas = fileAdmin.getParents().hasNext()
    ? fileAdmin.getParents().next()
    : null;

  if (!pastaPlanilhas) {
    ui.alert('Não foi possível localizar a pasta PLANILHA do contexto.');
    return;
  }

  const pastaContexto = pastaPlanilhas.getParents().hasNext()
    ? pastaPlanilhas.getParents().next()
    : null;

  if (!pastaContexto) {
    ui.alert('Não foi possível localizar a pasta raiz do contexto.');
    return;
  }

  // Subpastas esperadas
  const pastaCSVAdmin = obterOuCriarSubpasta_(pastaPlanilhas, 'CSV_ADMIN');
  const pastaLocalidades = obterOuCriarSubpasta_(pastaContexto, 'LOCALIDADES');

  // 🔎 Tentar localizar planilha CLIENTE
  let planilhaClienteId = null;
  const files = pastaLocalidades.getFilesByType(MimeType.GOOGLE_SHEETS);
  if (files.hasNext()) {
    planilhaClienteId = files.next().getId();
  }

  const contextoAdmin = {
    nome: nomeContexto,
    planilhaAdminId: ss.getId(),
    planilhaClienteId: planilhaClienteId,
    pastaContextoId: pastaContexto.getId(),
    pastaPlanilhasId: pastaPlanilhas.getId(),
    pastaCSVAdminId: pastaCSVAdmin.getId(),
    pastaLocalidadesId: pastaLocalidades.getId(),
    planilhaGeralId: obterPlanilhaGeralId_(),
    emailOperador: Session.getActiveUser().getEmail(),
    reparadoEm: new Date().toISOString()
  };

  definirContextoAtivo_(contextoAdmin);

  adminRenderMenu_();

  ui.alert(
    '✅ Contexto "' + nomeContexto + '" reparado com sucesso!\n\n' +
    'Ele foi recadastrado no sistema.'
  );
}
