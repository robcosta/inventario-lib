/**
 * ============================================================
 * API PÚBLICA — CLIENT (INVENTÁRIO)
 * ============================================================
 */

/** MENU */
function clientRenderMenu() {
  renderMenuClient();
}

/** INFORMAÇÕES */
function clientAtualizarInformacoes() {
  _client_montarInformacoes();
}

/** PASTA */
function clientAbrirPastaTrabalho() {
  abrirPastasTrabalho();
}

function clientEscolherPastaTrabalho() {
  escolherPastaTrabalho();
}

function clientCriarPastaTrabalho() {
  criarPastaTrabalho();
}

/** PROCESSAMENTO */
function clientProcessarImagens() {
  processarImagem();
}

/** PLANILHAS */
function clientAbrirPlanilhaGeral() {
  abrirPlanilhaGeral();
}

function clientAbrirPlanilhaContexto() {
  abrirPlanilhaContexto_();
}

