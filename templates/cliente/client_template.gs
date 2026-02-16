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

    // Novo padrão: CONTEXTO_CLIENTE
    const raw = PropertiesService
      .getDocumentProperties()
      .getProperty('CONTEXTO_CLIENTE');

    const contexto = raw ? JSON.parse(raw) : null;

    inventario.clientRenderMenuComContexto(contexto);

    if (contexto) {
      inventario.clientAtualizarInformacoesComContexto(contexto);
    }

  } catch (err) {
    Logger.log('[CLIENT][ONOPEN][ERRO]');
    Logger.log(err);
  }
}

/* ============================================================
 * PROXIES DE MENU — CLIENT
 * ============================================================
 */

/** MENU */
function clientRenderMenu() {
  inventario.clientRenderMenu();
}

/** INFORMAÇÕES */
function clientAtualizarInformacoes() {
  inventario.clientAtualizarInformacoes();
}

/** ÁREA DE FOTOS */
function clientAbrirPastaFotos() {
  inventario.clientAbrirPastaFotos();
}

function clientCriarSubpastaFotos() {
  inventario.clientCriarSubpastaFotos();
}

/** PROCESSAMENTO */
function clientProcessarImagens() {
  inventario.clientProcessarImagens();
}

/** PLANILHAS */
function clientAbrirPlanilhaAdmin() {
  inventario.clientAbrirPlanilhaAdmin();
}

function clientAbrirPlanilhaGeral() {
  inventario.clientAbrirPlanilhaGeral();
}

/** VERSÃO */
function mostrarVersaoSistema() {
  inventario.mostrarVersaoSistema();
}
