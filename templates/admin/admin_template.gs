/**
 * ============================================================
 * TEMPLATE ADMIN — INVENTÁRIO PATRIMONIAL
 * ============================================================
 * Responsabilidades:
 * - Inicializar menu ADMIN
 * - Encaminhar comandos para a biblioteca inventario
 *
 * ❌ Não contém lógica de negócio
 * ❌ Não contém regras
 * ❌ Não acessa Drive / Sheets diretamente
 * ============================================================
 */

/* ============================================================
 * onOpen — ENTRADA DO ADMIN
 * ============================================================ */
function onOpen() {
  try {
    inventario.adminRenderMenu(); // API pública da biblioteca
  } catch (e) {
    Logger.log('[ADMIN][ONOPEN][ERRO]');
    Logger.log(e);
    SpreadsheetApp.getUi().alert(
      'Erro ao inicializar o menu de Administração.\n\n' + e.message
    );
  }
}

/* ============================================================
 * PROXIES — CONTEXTO
 * ============================================================ */
function criarContextoTrabalho() {
  inventario.criarContextoTrabalho();
}

function selecionarContextoTrabalho() {
  inventario.selecionarContextoTrabalho();
}

/* ============================================================
 * PROXIES — ACESSOS
 * ============================================================ */
function gerenciarAcessosAdmin() {
  inventario.gerenciarAcessosAdmin();
}

function gerenciarAcessosCliente() {
  inventario.gerenciarAcessosCliente();
}

/* ============================================================
 * PROXIES — PASTAS DE TRABALHO (IMAGENS)
 * ============================================================ */
function criarPastaTrabalho() {
  inventario.criarPastaTrabalho();
}

function escolherPastaTrabalho() {
  inventario.escolherPastaTrabalho();
}

function abrirPastasTrabalho() {
  // Abre somente a pasta de trabalho atual, sem alterar a pasta padrão
  inventario.abrirPastasTrabalho();
}

/* ============================================================
 * PROXIES — PROCESSAMENTO DE IMAGENS (VISION)
 * ============================================================ */
function processarImagem() {
  inventario.processarImagem(); // teste/manual
}

function processarImagensDaPasta() {
  inventario.processarImagensDaPasta(); // lote (quando ativar)
}

/* ============================================================
 * PROXIES — PLANILHA GERAL
 * ============================================================ */
function abrirPlanilhaGeral() {
  inventario.abrirPlanilhaGeral();
}

function importarCSVGeral() {
  inventario.importarCSVGeral();
}

function formatarPlanilhaGeral() {
  inventario.formatarPlanilhaGeral();
}

function criarOuRecriarPlanilhaGeral() {
  inventario.criarOuRecriarPlanilhaGeral();
}

/* ============================================================
 * PROXIES — PLANILHA CONTEXTO
 * ============================================================ */
function importarCSVContexto() {
  inventario.importarCSVContexto();
}

function popularPlanilhaContexto() {
  inventario.popularPlanilhaContexto();
}

function formatarPlanilhaContexto() {
  inventario.formatarPlanilhaContexto();
}

/* ============================================================
 * PROXIES — CLIENTE / SUPORTE
 * ============================================================ */
function formatarPlanilhaCliente() {
  inventario.formatarPlanilhaCliente();
}

function executarDiagnostico() {
  inventario.executarDiagnostico();
}

function debugContextoPlanilhaAtual() {
  inventario.debugContextoPlanilhaAtual();
}

/* ============================================================
 * CSV — ENTRYPOINT (HTML)
 * ============================================================ */
function receberCSV(tipo, nomeArquivo, dataUrl) {
  return inventario.receberCSV(tipo, nomeArquivo, dataUrl);
}
