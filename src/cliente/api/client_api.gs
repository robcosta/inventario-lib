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
  _client_abrirPastaTrabalho();
}

/** IMAGENS */
function clientProcessarImagens() {
  _client_processarImagens();
}
