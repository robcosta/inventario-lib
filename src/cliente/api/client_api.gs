/**
 * ============================================================
 * API PÚBLICA — CLIENT (ID-BASED)
 * ============================================================
 */

/** MENU */
function clientRenderMenu() {
  renderMenuClient();
}

function clientRenderMenuComContexto(contexto) {
  renderMenuClient(contexto);
}

/** INFORMAÇÕES */
function clientAtualizarInformacoes() {
  const contexto = obterContextoCliente_();
  if (contexto) {
    cliente_montarInformacoes_(contexto);
  }
}

function clientAtualizarInformacoesComContexto(contexto) {
  if (contexto) {
    cliente_montarInformacoes_(contexto);
  }
}

/** ÁREA DE FOTOS */

function clientAbrirPastaFotos() {

  const contexto = obterContextoCliente_();

  if (!contexto?.pastaLocalidadeAtivaId) {
    SpreadsheetApp.getUi().alert('❌ Nenhuma pasta ativa.');
    return;
  }

  abrirPastaNoNavegador_(contexto.pastaLocalidadeAtivaId);
}

function clientCriarSubpastaFotos() {

  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoCliente_();

  if (!contexto?.pastaLocalidadeAtivaId) {
    ui.alert('❌ Nenhuma localidade ativa.');
    return;
  }

  const resp = ui.prompt(
    'Criar Nova Pasta de Fotos',
    'Digite o nome da nova subpasta:',
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const nome = (resp.getResponseText() || '').trim();
  if (!nome) {
    ui.alert('❌ Nome inválido.');
    return;
  }

  const pasta = DriveApp.getFolderById(contexto.pastaLocalidadeAtivaId);
  const nova = pasta.createFolder(nome);

  ui.alert('✅ Pasta criada com sucesso.');

  abrirPastaNoNavegador_(nova.getId());
}

/** PROCESSAMENTO */

function clientProcessarImagens() {

  const contexto = obterContextoCliente_();

  if (!contexto?.pastaLocalidadeAtivaId) {
    SpreadsheetApp.getUi().alert('❌ Nenhuma pasta ativa.');
    return;
  }

  const contextoVision = montarContextoVisionParaCliente_(contexto);

  vision.batchProcessarPastaCompleta(
    contexto.pastaLocalidadeAtivaId,
    contextoVision
  );
}

/** PLANILHAS */

function clientAbrirPlanilhaAdmin() {

  const contexto = obterContextoCliente_();

  if (!contexto?.planilhaAdminId) {
    SpreadsheetApp.getUi().alert('❌ Planilha Admin não configurada.');
    return;
  }

  abrirPlanilhaNoNavegador_(contexto.planilhaAdminId);
}

function clientAbrirPlanilhaGeral() {
  abrirPlanilhaGeral();
}
