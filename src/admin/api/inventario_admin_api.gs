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
  criarContextoFluxoTemplate_();
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
  processarImagem_(); // teste/manual
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
