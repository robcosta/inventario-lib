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
function gerenciarAcessosSupervisor() {
  gerenciarAcessosSupervisor_();
}

function gerenciarAcessosAdministrador() {
  gerenciarAcessosAdministrador_();
}

function gerenciarAcessosOperador() {
  gerenciarAcessosOperador_();
}

function gerenciarAcessosAdmin() {
  gerenciarAcessosAdmin_();
}

function gerenciarAcessosCliente() {
  gerenciarAcessosCliente_();
}

function gerenciarRetiradaAcessos() {
  gerenciarRetiradaAcessos_();
}

/* ============================================================
 * PLANILHA GERAL
 * ============================================================ */
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
 * PLANILHA ADMIN
 * ============================================================ */
function importarCSVAdmin() {
  importarCSVAdmin_();
}

function popularPlanilhaAdmin() {
  popularPlanilhaAdmin_();
}

function formatarPlanilhaAdmin() {
  formatarPlanilhaAdmin_();
}

/* ============================================================
 * PLANILHA CLIENTE
 * ============================================================ */
function abrirPlanilhaCliente() {
  abrirPlanilhaCliente_();
}

function formatarPlanilhaCliente() {
  clientRenderizarInformacoes();
}

function adminAbrirPlanilhaRelatorio() {
  abrirPlanilhaRelatorio_();
}

function adminRelatorioGerarVisaoGeral() {
  relatorioGerarVisaoGeral_();
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
