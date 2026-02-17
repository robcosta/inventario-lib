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
 * VERSÃO DO SISTEMA
 * ============================================================ */
function mostrarVersaoSistema() {
  mostrarVersaoSistema_();
}