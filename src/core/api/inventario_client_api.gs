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
  clientRenderMenu_();
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

function clientAbrirPlanilhaRelatorio() {
  abrirPlanilhaRelatorio_();
}

function clientRelatorioGerarVisaoGeral() {
  relatorioGerarVisaoGeral_();
}

/* ============================================================
 * DIAGNÓSTICO / SUPORTE
 * ============================================================ */
function clientExecutarDiagnostico() {
  executarDiagnosticoCliente_();
}

function clientVerificarStatusProcessamento() {
  clientVerificarStatusProcessamento_();
}

function clientAbrirPainelStatusProcessamento() {
  clientAbrirPainelStatusProcessamento_();
}

function clientConsultarStatusProcessamentoPainel() {
  return clientConsultarStatusProcessamentoPainel_();
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

  if (!contexto.planilhaClienteId) {
    throw new Error('ID da planilha CLIENTE não encontrado no contexto.');
  }

  const ssAtual = SpreadsheetApp.getActiveSpreadsheet();

  // ==========================================================
  // Se já estiver na planilha CLIENTE
  // ==========================================================

  if (ssAtual.getId() === contexto.planilhaClienteId) {

    renderizarPlanilhaCliente_(contexto, ssAtual);
    return;
  }

  // ==========================================================
  // Se estiver na ADMIN ou outra planilha
  // ==========================================================

  const ssCliente = SpreadsheetApp.openById(contexto.planilhaClienteId);

  renderizarPlanilhaCliente_(contexto, ssCliente);
}

