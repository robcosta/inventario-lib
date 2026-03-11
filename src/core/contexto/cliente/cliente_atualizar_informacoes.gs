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
  Logger.log('[CLIENTE][ATUALIZAR] Início');

  // ==========================================================
  // 1️⃣ Obter contexto atual
  // ==========================================================
  let contexto = obterContextoDominio_();
  Logger.log('[CLIENTE][ATUALIZAR] Contexto inicial: ' + JSON.stringify(contexto));

  // ==========================================================
  // 2️⃣ Validar / reconstruir se necessário
  // ==========================================================
  if (!contexto || !contextoClienteValido_(contexto)) {
    Logger.log('[CLIENTE][ATUALIZAR] Contexto inválido. Tentando auto-discovery...');

    contexto = descobrirContextoClienteAutomaticamente_();

    if (!contexto) {
      Logger.log('[CLIENTE][ATUALIZAR][ERRO] Auto-discovery falhou.');
      ui.alert('❌ Não foi possível reconstruir o contexto.');
      return;
    }

    salvarContextoCliente_(contexto);

    // Após salvar, obter novamente via domínio
    contexto = obterContextoDominio_();
    Logger.log('[CLIENTE][ATUALIZAR] Contexto após auto-discovery: ' + JSON.stringify(contexto));
  }

  // ==========================================================
  // 2.1️⃣ Garantir planilha GERAL no contexto, quando possível
  // ==========================================================
  if (!contexto.planilhaGeralId) {
    const planilhaGeralId = resolverPlanilhaGeralIdSeguro_();
    if (planilhaGeralId) {
      try {
        contexto = atualizarContextoCliente_({ planilhaGeralId: planilhaGeralId });
      } catch (e) {
        Logger.log('[CLIENTE][ATUALIZAR][AVISO] Nao foi possivel persistir planilhaGeralId no contexto: ' + e.message);
      }
    }
  }

  // ==========================================================
  // 3️⃣ Sincronizar localidade ativa
  // ==========================================================
  try {
    contexto = sincronizarLocalidadeAtiva_(contexto);
    Logger.log('[CLIENTE][ATUALIZAR] Localidade sincronizada.');
  } catch (e) {
    Logger.log('[CLIENTE][SYNC][ERRO] ' + e.message);
  }

  // ==========================================================
  // 4️⃣ Renderizar informações visuais
  // ==========================================================
  try {
    clienteMontarInformacoes_(contexto);
    Logger.log('[CLIENTE][ATUALIZAR] Renderização concluída.');
  } catch (e) {
    Logger.log('[CLIENTE][ATUALIZAR][ERRO_RENDER] ' + e.message);
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
  // 5.1️⃣ Notificar status da fila de processamento (quando houver)
  // ==========================================================
  try {
    notificarResultadosFilaProcessamentoCliente_(contexto);
  } catch (e) {
    Logger.log('[CLIENTE][FILA][NOTIFICACAO][ERRO] ' + e.message);
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

  Logger.log('[CLIENTE][ATUALIZAR] Fim com sucesso');
}
