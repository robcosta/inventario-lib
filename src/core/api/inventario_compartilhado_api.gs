/**
 * ============================================================
 * API PÚBLICA — COMPARTILHADO (INVENTÁRIO)
 * ============================================================
 *
 * ❗ Funções compartilhadas entre ADMIN e CLIENT
 * ❗ ÚNICO ponto de entrada do menu ADMIN
 * ❗ NÃO contém lógica de negócio
 * ❗ Apenas delega chamadas para funções internas (_)
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
  processarImagens_(); // teste/manual
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

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const idAtivo = ss.getId();

  const contexto = resolverContextoAtual_();
  if (!contexto) return;

  let spreadsheetId;

  // 🔵 Se estiver na ADMIN
  if (contextoAdminRegistrado_()) {
    spreadsheetId = contexto.planilhaClienteId;
    formatarPlanilhaCliente_(spreadsheetId, null);
    return;
  }
  
  // 🟢 Se estiver na CLIENTE
  else {
    spreadsheetId = idAtivo;
  }

  if (!spreadsheetId) return;

  formatarPlanilhaCliente_(spreadsheetId, contexto);
}


function clientAtualizarInformacoesComContexto(contexto) {
  if (contexto) {
    cliente_montarInformacoes_(contexto);
    return;
  }
  clientAtualizarInformacoes();
}

/* ============================================================
 * VERSÃO DO SISTEMA
 * ============================================================ */
function mostrarVersaoSistema() {
  mostrarVersaoSistema_();
}