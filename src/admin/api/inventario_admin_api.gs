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
  gerenciarAcessosContexto_();
}

/** ===========================
 * PLANILHA GERAL
 * =========================== */

function abrirPlanilhaGeral() {
  abrirPlanilhaGeral_();
}

function importarCSVGeral() {
  importarCSVGeral_();
}

function formatarPlanilhaGeral() {
  formatarPlanilhaGeral_();  
}

function criarOuRecriarPlanilhaGeral() {
  criarOuRecriarPlanilhaGeral_();
}

/** ===========================
 * PLANILHA CONTEXTO
 * =========================== */
function importarCSVContexto() {
  importarCSVContexto_();
}

function popularPlanilhaContexto() {
  popularPlanilhaContexto_();
}

function formatarPlanilhaContexto() {
 formatarPlanilhaContexto_();
}

/** CLIENTE */
function formatarPlanilhaCliente() {
  formatarPlanilhaCliente_();
}

/** PASTAS */
function abrirPastasTrabalho() {
  abrirPastasTrabalho_();
}

/** DIAGNÓSTICO */
function executarDiagnostico() {
  executarDiagnostico_();
}

/**
 * Chamado pelo HTML (google.script.run)
 */
function receberCSV(tipo, nomeArquivo, dataUrl) {
  receberCSV_(tipo, nomeArquivo, dataUrl);
}
