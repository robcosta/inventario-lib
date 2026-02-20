/**
 * ============================================================
 * API PÚBLICA — COMPARTILHADO (INVENTÁRIO)
 * ============================================================
 *
 * ❗ Funções compartilhadas entre ADMIN e CLIENT
 * ❗ Apenas delegação
 * ❗ Decisão baseada em contexto tipado
 * ============================================================
 */

/* ============================================================
 * ÁREA DE FOTOS (IMAGENS)
 * ============================================================ */
function criarNovaPastaFotos() {
  criarNovaPastaFotos_();
}

function trocarPastaFotos() {
  trocarPastaFotos_();
}

function abrirPastaFotosAtual() {
  abrirPastaFotosAtual_();
}

/* ============================================================
 * PROCESSAMENTO DE IMAGENS (VISION)
 * ============================================================ */
function processarImagens() {
  processarImagens_();
}

/* ============================================================
 * PLANILHA GERAL
 * ============================================================ */
function abrirPlanilhaGeral() {
  abrirPlanilhaGeral_();
}

/* ============================================================
 * FORMATAÇÃO PLANILHA CLIENTE
 * ============================================================ */
function formatarPlanilhaCliente() {

  const contexto = obterContextoDominio_();

  if (!contexto) {
    SpreadsheetApp.getUi().alert("❌ Nenhum contexto ativo.");
    return;
  }

  if (!contexto.planilhaClienteId) {
    SpreadsheetApp.getUi().alert("❌ Planilha CLIENTE não configurada.");
    return;
  }

  // Sempre formata a planilha cliente correta
  formatarPlanilhaCliente_(contexto.planilhaClienteId);

  // Se chamado a partir da CLIENTE → re-renderiza informações
  if (contexto.tipo === 'CLIENTE') {
    clienteMontarInformacoes_(contexto, true);
  }
}

/* ============================================================
 * VERSÃO DO SISTEMA
 * ============================================================ */
function mostrarVersaoSistema() {
  mostrarVersaoSistema_();
}
