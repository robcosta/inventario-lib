/**
 * ============================================================
 * TEMPLATE RELATÓRIO — INVENTÁRIO PATRIMONIAL
 * ============================================================
 */

function onOpen() {
  try {
    inventario.relatorioRenderMenu();
  } catch (e) {
    Logger.log('[RELATORIO][ONOPEN][ERRO]');
    Logger.log(e);
  }
}

function relatorioGerarVisaoGeral() {
  inventario.relatorioGerarVisaoGeral();
}

function relatorioGerarBensPendentes() {
  inventario.relatorioGerarBensPendentes();
}
