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

function repararContextoAdmin() {
  inventario.repararContextoAdmin();
}

function selecionarContextoTrabalho() {
  inventario.selecionarContextoTrabalho();
}

/* ============================================================
 * PROXIES — ACESSOS
 * ============================================================ */
function gerenciarAcessosContexto() {
  inventario.gerenciarAcessosContexto();
}

/* ============================================================
 * PROXIES — ÁREA DE FOTOS
 * ============================================================ */
function criarNovaPastaFotos() {
  inventario.criarNovaPastaFotos();
}

function trocarPastaFotos() {
  inventario.trocarPastaFotos();
}

function abrirPastaFotosAtual() {
  inventario.abrirPastaFotosAtual();
}

/* ============================================================
 * PROXIES — PROCESSAMENTO DE IMAGENS (VISION)
 * ============================================================ */
function processarImagens() {
  inventario.processarImagens(); // teste/manual
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

function mostrarVersaoSistema() {
   inventario.mostrarVersaoSistema();  
}
/* ============================================================
 * CSV — ENTRYPOINT (HTML)
 * ============================================================ */
function receberCSV(tipo, nomeArquivo, dataUrl) {
  return inventario.receberCSV(tipo, nomeArquivo, dataUrl);
}

function verContextoScript() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const planilhaId = ss.getId();
  const chave = 'CONTEXTO_ADMIN_' + planilhaId;
  const props = PropertiesService.getScriptProperties();
  const contexto = props.getProperty(chave);
  
  if (contexto) {
    const obj = JSON.parse(contexto);
    Logger.log('Contexto encontrado: ' + Object.keys(obj).join(', '));
    SpreadsheetApp.getUi().alert('Contexto OK! IDs:\n' + 
      'pastaPlanilhas: ' + obj.pastaPlanilhasId + '\n' +
      'pastaLocalidades: ' + obj.pastaLocalidadesId);
  } else {
    SpreadsheetApp.getUi().alert('Contexto não encontrado! Chave: ' + chave);
  }
}

function runTestsPlanilhaGeral() {
  inventario.runTestsPlanilhaGeral();
}
