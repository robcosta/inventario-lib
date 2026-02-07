/**
 * ============================================================
 * API PÚBLICA — ADMIN (INVENTÁRIO)
 * ============================================================
 * 
 * ❗ Este arquivo é o ÚNICO ponto de entrada do menu.
 * ❗ Não contém lógica de negócio.
 * ❗ Apenas delega chamadas para funções internas (_).
 */

/* ============================================================
 * MENU
 * ============================================================ */
function adminRenderMenu() {
  adminRenderMenu_();
}

/* ============================================================
 * CONTEXTO
 * ============================================================ */
function criarContextoTrabalho() {
  criarContextoTrabalho_();
}

function selecionarContextoTrabalho() {
  selecionarContextoTrabalho_();
}

/* ============================================================
 * ACESSOS
 * ============================================================ */
function gerenciarAcessosAdmin() {
  gerenciarAcessosAdmin_();
}

function gerenciarAcessosCliente() {
  gerenciarAcessosCliente_();
}

/* ============================================================
 * PASTAS DE TRABALHO (IMAGENS)
 * ============================================================ */
function criarPastaTrabalho() {
  criarPastaTrabalho_();
}

function escolherPastaTrabalho() {
  escolherPastaTrabalho_();
}

function abrirPastasTrabalho() {
  abrirPastasTrabalho_();
}

/* ============================================================
 * PROCESSAMENTO DE IMAGENS (VISION)
 * ============================================================ */
function processarImagem() {
  processarImagem_(); // função de teste/manual
}

function processarImagensDaPasta() {
  processarImagensDaPasta_(); // futuro (lote)
}

/* ============================================================
 * PLANILHA GERAL
 * ============================================================ */
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

/* ============================================================
 * PLANILHA CONTEXTO
 * ============================================================ */
function importarCSVContexto() {
  importarCSVContexto_();
}

function popularPlanilhaContexto() {
  popularPlanilhaContexto_();
}

function formatarPlanilhaContexto() {
  formatarPlanilhaContexto_();
}

/* ============================================================
 * CLIENTE
 * ============================================================ */
function formatarPlanilhaCliente() {
  formatarPlanilhaCliente_();
}

/* ============================================================
 * DIAGNÓSTICO
 * ============================================================ */
function executarDiagnostico() {
  executarDiagnostico_();
}

function debugContextoPlanilhaAtual() {
  debugContextoPlanilhaAtual_();
}

/* ============================================================
 * HTML / UPLOAD CSV
 * ============================================================ */
/**
 * Chamado via google.script.run
 */
function receberCSV(tipo, nomeArquivo, dataUrl) {
  receberCSV_(tipo, nomeArquivo, dataUrl);
}
