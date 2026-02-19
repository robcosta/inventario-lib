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

  const ctx = resolverContextoAtual_();

  if (!ctx) {
    SpreadsheetApp.getUi().alert("❌ Nenhum contexto ativo.");
    return;
  }

  const { tipo, dados: contexto } = ctx;

  if (!contexto.planilhaClienteId) {
    SpreadsheetApp.getUi().alert("❌ Planilha CLIENTE não configurada.");
    return;
  }

  // Sempre formata a planilha cliente correta
  formatarPlanilhaCliente_(contexto.planilhaClienteId);

  // Se chamado a partir da CLIENTE → re-renderiza informações
  if (tipo === 'CLIENTE') {
    clienteMontarInformacoes_(contexto, true);
  }
}

/* ============================================================
 * VERSÃO DO SISTEMA
 * ============================================================ */
function mostrarVersaoSistema() {
  mostrarVersaoSistema_();
}
