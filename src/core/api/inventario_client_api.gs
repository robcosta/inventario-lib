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
//Via onOpen (leve)
function clientAtualizarInformacoesLeve() {
  const contexto = obterContextoCliente_();
  clienteMontarInformacoes_(contexto, false);
}

//Via menu (completo) 
function clientAtualizarInformacoes() {
  const contexto = obterContextoCliente_();
  clienteMontarInformacoes_(contexto, true);
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

/* ============================================================
 * DIAGNÓSTICO / SUPORTE
 * ============================================================ */
function clientExecutarDiagnostico() {
  executarDiagnosticoCliente_();
}

