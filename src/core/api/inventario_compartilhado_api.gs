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
  const ctx = resolverContextoAtual_();
  if (!ctx) return;
  const spreadsheetId = ctx.dados.planilhaClienteId;
  const contexto = ctx.dados;

  // 🟢 Caso a função seja chamada a partir da planilha ADMIN.
  if (ctx.tipo === "ADMIN") {
    formatarPlanilhaCliente_(spreadsheetId);
    return;
  }

  // 🟢 Caso a função seja chamada a partir da planilha CLIENTE
  formatarPlanilhaCliente_(spreadsheetId);
  clienteMontarInformacoes_(contexto, (modoCompleto = true));
}

/* ============================================================
 * VERSÃO DO SISTEMA
 * ============================================================ */
function mostrarVersaoSistema() {
  mostrarVersaoSistema_();
}
