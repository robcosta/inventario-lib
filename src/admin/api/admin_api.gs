/**
 * ============================================================
 * API PÚBLICA — ADMIN (INVENTÁRIO)
 * ============================================================
 */

/** MENU */
function adminRenderMenu() {
  adminRenderMenu_();
}

/** CONTEXTO */
function criarContextoTrabalho() {
  criarContextoTrabalho_();
}

function selecionarContextoTrabalho() {
  selecionarContextoTrabalho_();
}

/** ACESSOS */
function gerenciarAcessosContexto() {
  _admin_acessosGerenciar();
}

/** CONFIGURAÇÃO */
function configurarPlanilhaBase() {
  _admin_planilhaBaseConfigurar();
}

/** CLIENTE */
function formatarPlanilhaCliente() {
  _admin_planilhaClienteFormatar();
}

/** CSV */
function enviarCSV() {
  _admin_csvAbrirUpload();
}

/** OPERACIONAL */
function popularPlanilhaOperacional() {
  _admin_planilhaOperacionalPopular();
}

function formatarPlanilhaOperacional() {
  _admin_planilhaOperacionalFormatar();
}

/** PASTAS */
function abrirPastasTrabalho() {
  _admin_pastasAbrir();
}

/** DIAGNÓSTICO */
function executarDiagnostico() {
  _admin_diagnosticoExecutar();
}
