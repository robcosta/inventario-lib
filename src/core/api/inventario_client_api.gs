/**
 * ============================================================
 * API PÚBLICA — CLIENT (INVENTÁRIO)
 * ============================================================
 *
 * ❗ ÚNICO ponto de entrada do menu CLIENT
 * ❗ NÃO contém lógica de negócio
 * ❗ Apenas delega chamadas para funções internas (_)
 * ❗ Totalmente ID-based (CONTEXTO_CLIENTE)
 * ============================================================
 */


/* ============================================================
 * MENU
 * ============================================================ */

/**
 * Renderiza menu CLIENT
 */
function clientRenderMenu() {
  renderMenuClient_();
}


/* ============================================================
 * INFORMAÇÕES
 * ============================================================ */
/**
 * Atualiza bloco de informações da planilha CLIENTE
 */
//
function clientAtualizarInformacoes() {
  clientAtualizarInformacoes_();
}


/* ============================================================
 * PLANILHAS
 * ============================================================ */

/**
 * Abre Planilha ADMIN (somente leitura)
 */
function adminAbrirPlanilha() {
  adminAbrirPlanilha_();
}

/* ============================================================
 * DIAGNÓSTICO / SUPORTE
 * ============================================================ */
function clientExecutarDiagnostico() {
  executarDiagnosticoCliente_();
}

/**
 * ============================================================
 * CLIENT API — RENDERIZAR PLANILHA CLIENTE
 * ============================================================
 */
function clientRenderizarInformacoes() {

  const contexto = obterContextoDominio_();

  if (!contexto) {
    throw new Error('Nenhum contexto ativo.');
  }

  if (contexto.tipo !== 'CLIENTE') {
    throw new Error('Contexto inválido para CLIENTE.');
  }

  renderizarPlanilhaCliente_(contexto);
}

