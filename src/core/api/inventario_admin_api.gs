/**
 * ============================================================
 * API PÚBLICA — ADMIN (INVENTÁRIO)
 * ============================================================
 *
 * ❗ ÚNICO ponto de entrada do menu ADMIN
 * ❗ NÃO contém lógica de negócio
 * ❗ Apenas delega chamadas para funções internas (_)
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

function repararContextoAdmin() {
  repararContextoAdmin_();
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
 * ÁREA DE FOTOS (IMAGENS)
 * ============================================================ */
function criarNovaPastaFotos() {
  criarNovaPastaFotos_();
}

function trocarPastaFotos() {
  trocarPastaFotos_();
}

function abrirPastaFotosAtual() {
  abrirPastaFotosAtual_();
}

/* ============================================================
 * PROCESSAMENTO DE IMAGENS (VISION)
 * ============================================================ */
function processarImagens() {
  processarImagens_(); // teste/manual
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
  formatarPlanilhaAdmin_();
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

function mostrarVersaoSistema() {
   mostrarVersaoSistema_();  
}

function debugContextoPlanilhaAtual() {
  debugContextoPlanilhaAtual_();
}

function corrigirContextoPlanilhaAtual() {
  corrigirContextoPlanilhaAtual_();
}

function runTestsPlanilhaGeral() {
  runTestsPlanilhaGeral_();
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

/* ============================================================
 * ADMIN TEMPLATE — LIMPEZA CONTROLADA
 * ============================================================ *
 * ⚠️ Uso restrito ao ADMIN: TEMPLATE
 * ⚠️ NÃO exposto no menu
 */
function limparContextoAdmin() {
  limparContextoAtivo_();
}
