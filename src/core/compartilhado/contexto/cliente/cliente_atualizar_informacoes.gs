/**
 * ============================================================
 * CLIENTE — ATUALIZAR INFORMAÇÕES (DOMÍNIO CONSOLIDADO)
 * ============================================================
 *
 * Fluxo:
 * 1️⃣ Obtém contexto via domínio
 * 2️⃣ Se inválido, tenta reconstrução automática
 * 3️⃣ Sincroniza localidade ativa
 * 4️⃣ Renderiza informações
 * 5️⃣ Re-renderiza menu
 * 6️⃣ Exibe toast de sucesso
 */
function clientAtualizarInformacoes_() {

  const ui = SpreadsheetApp.getUi();

  // ==========================================================
  // 1️⃣ Obter contexto atual
  // ==========================================================
  let contexto = obterContextoDominio_();

  // ==========================================================
  // 2️⃣ Validar / reconstruir se necessário
  // ==========================================================
  if (!contexto || !contextoClienteValido_(contexto)) {

    contexto = descobrirContextoClienteAutomaticamente_();

    if (!contexto) {
      ui.alert('❌ Não foi possível reconstruir o contexto.');
      return;
    }

    salvarContextoCliente_(contexto);

    // Após salvar, obter novamente via domínio
    contexto = obterContextoDominio_();
  }

  // ==========================================================
  // 3️⃣ Sincronizar localidade ativa
  // ==========================================================
  try {
    contexto = sincronizarLocalidadeAtiva_(contexto);
  } catch (e) {
    Logger.log('[CLIENTE][SYNC][ERRO] ' + e.message);
  }

  // ==========================================================
  // 4️⃣ Renderizar informações visuais
  // ==========================================================
  try {
    clienteMontarInformacoes_(contexto);
  } catch (e) {
    ui.alert(
      '❌ Erro ao atualizar informações.\n\n' + e.message
    );
    return;
  }

  // ==========================================================
  // 5️⃣ Re-renderizar menu
  // ==========================================================
  try {
    renderMenuClient_(contexto);
  } catch (e) {
    Logger.log('[CLIENTE][MENU][ERRO] ' + e.message);
  }

  // ==========================================================
  // 6️⃣ Feedback visual
  // ==========================================================
  SpreadsheetApp.getActiveSpreadsheet()
    .toast(
      '✅ Informações atualizadas com sucesso.',
      '📦 Inventário',
      4
    );
}