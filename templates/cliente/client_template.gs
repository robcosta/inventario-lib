/**
 * ============================================================
 * TEMPLATE CLIENT — INVENTÁRIO PATRIMONIAL (ID-BASED)
 * ============================================================
 * Responsabilidades:
 * - Inicializar menu CLIENT
 * - Atualizar informações automaticamente
 * - Apenas proxies → ZERO lógica de negócio
 * ============================================================
 */

/**
 * Disparado ao abrir a planilha CLIENTE
 */
function onOpen(e) {
  try {
    inventario.clientRenderMenu(); 
    SpreadsheetApp.getActiveSpreadsheet()
      .toast("🔄 Atualize as informações para sincronizar o contexto.", "📦 Inventário Patrimonial", 7);
  } catch (err) {
    Logger.log('[CLIENT][ONOPEN][ERRO]');
    Logger.log(err);
  }
}

/* ============================================================
 * PROXIES — CLIENT
 * ============================================================ */

function clientRenderMenu() {
  inventario.clientRenderMenu();
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

/* ============================================================
 * PROXIES — ARIR PLANILHA ADMIN
 * ============================================================ */
function adminAbrirPlanilha() {
  inventario.adminAbrirPlanilha();
}

/* ============================================================
 * PROXIES — ARIR PLANILHA GERAL
 * ============================================================ */
function clientAbrirPlanilhaGeral() {
  inventario.abrirPlanilhaGeral();
}

/* ============================================================
 * PROXIES — CLIENTE FORMATAÇÃO
 * ============================================================ */
function formatarPlanilhaCliente() {
  inventario.clientRenderizarInformacoes();
}

/* ============================================================
 * PROXIES — PLANILHA RELATÓRIO
 * ============================================================ */
function abrirPlanilhaRelatorio() {
  inventario.abrirPlanilhaRelatorio();
}

function relatorioGerarVisaoGeral() {
  inventario.relatorioGerarVisaoGeral();
}

function relatorioGerarBensPendentes() {
  inventario.relatorioGerarBensPendentes();
}

function relatorioGerarBensEncontrados() {
  inventario.relatorioGerarBensEncontrados();
}

/* ============================================================
 * PROXIES — DIAGNÓSTICO
 * ============================================================ */
function clientExecutarDiagnostico() {
  inventario.clientExecutarDiagnostico();
}

/* ============================================================
 * PROXIES — ATUALIZAR INFORMAÇÕES
 * ============================================================ */
function clientAtualizarInformacoes() {
  inventario.clientAtualizarInformacoes();
}

/* ============================================================
 * PROXIES — MOSTRAR VERSÃO
 * ============================================================ */
function mostrarVersaoSistema() {
  inventario.mostrarVersaoSistema();
}

function diagnosticarProtecoesCliente() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("INFORMAÇÕES");

  Logger.log("=== DIAGNÓSTICO DE PROTEÇÕES ===");

  const rangeProtections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  rangeProtections.forEach(p => {
    Logger.log("Range protegido: " + p.getRange().getA1Notation());
    Logger.log("Descrição: " + p.getDescription());
  });

  const sheetProtections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  sheetProtections.forEach(p => {
    Logger.log("Aba inteira protegida");
    Logger.log("Descrição: " + p.getDescription());
  });
}

function removerProtecoesBlocoInformacoes() {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("INFORMAÇÕES");

  const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);

  protections.forEach(p => {
    if (p.getDescription() === "Bloco protegido - Informações") {
      p.remove();
    }
  });

  SpreadsheetApp.getUi().alert("Proteções removidas.");
}
