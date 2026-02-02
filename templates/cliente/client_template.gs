/**
 * ============================================================
 * TEMPLATE CLIENT — INVENTÁRIO PATRIMONIAL
 * ============================================================
 * Responsabilidades:
 * - Inicializar menu CLIENT
 * - Atualizar informações automaticamente
 *
 * ❌ Não contém lógica de negócio
 * ============================================================
 */

/**
 * Disparado ao abrir a planilha CLIENTE
 */
function onOpen(e) {
  try {
    const raw = PropertiesService.getDocumentProperties().getProperty('CONTEXTO_TRABALHO');
    const contexto = raw ? JSON.parse(raw) : null;

    inventario.clientRenderMenuComContexto(contexto);

    // Atualiza informações automaticamente se houver contexto
    inventario.clientAtualizarInformacoesComContexto(contexto);
  } catch (err) {
    Logger.log('[CLIENT][ONOPEN][ERRO]');
    Logger.log(err);
  }
}

/* ============================================================
 * PROXIES DE MENU — CLIENT
 * ============================================================
 */

function clientRenderMenu() {
  inventario.clientRenderMenu();
}

function clientAtualizarInformacoes() {
  inventario.clientAtualizarInformacoes();
}

function clientAbrirPastaTrabalho() {
  inventario.clientAbrirPastaTrabalho();
}

function clientProcessarImagens() {
  inventario.clientProcessarImagens();
}

function clientEscolherPastaTrabalho() {
  inventario.clientEscolherPastaTrabalho();
}

function clientCriarPastaTrabalho() {
  inventario.clientCriarPastaTrabalho();
}

function clientAbrirPlanilhaGeral() {
  inventario.clientAbrirPlanilhaGeral();
}

function clientAbrirPlanilhaContexto() {
  inventario.clientAbrirPlanilhaContexto();
}
