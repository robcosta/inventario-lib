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
    clientRenderMenu(); // biblioteca

    // Atualiza informações automaticamente se houver contexto
    clientAtualizarInformacoes();
  } catch (err) {
    Logger.log('[CLIENT][ONOPEN][ERRO]');
    Logger.log(err);
  }
}

/* ============================================================
 * PROXIES DE MENU — CLIENT
 * ============================================================
 */

function clientAtualizarInformacoes() {
  clientAtualizarInformacoes();
}

function clientAbrirPastaTrabalho() {
  clientAbrirPastaTrabalho();
}

function clientProcessarImagens() {
  clientProcessarImagens();
}
