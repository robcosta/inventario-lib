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
function clientAtualizarInformacoes() {
  clientAtualizarInformacoes_();
}


/* ============================================================
 * ÁREA DE FOTOS (IMAGENS)
 * ============================================================ 
function criarNovaPastaFotos() {
  criarNovaPastaFotos_();
}

function trocarPastaFotos() {
  trocarPastaFotos_();
}

function abrirPastaFotosAtual() {
  abrirPastaFotosAtual_();
}
*/

/* ============================================================
 * PROCESSAMENTO DE IMAGENS (VISION)
 * ============================================================ */

/**
 * Processa imagens da pasta ativa
 */
function clientProcessarImagens() {
  clientProcessarImagens_();
}


/* ============================================================
 * PLANILHAS
 * ============================================================ */

/**
 * Abre Planilha ADMIN (somente leitura)
 */
function clientAbrirPlanilhaAdmin() {
  clientAbrirPlanilhaAdmin_();
}

/**
 * Abre Planilha GERAL (somente leitura)
 */
function clientAbrirPlanilhaGeral() {
  clienteAbrirPlanilhaGeral_();
}


/* ============================================================
 * DIAGNÓSTICO / SUPORTE
 * ============================================================ */

/**
 * Mostra versão do sistema
 */
function mostrarVersaoSistema() {
  mostrarVersaoSistema_();
}
