/**
 * ============================================================
 * CONTEXTO — LIMPAR / REMOVER
 * ============================================================
 *
 * Responsabilidades:
 * - Confirmar explicitamente com o usuário
 * - Delegar a remoção do contexto ao contexto_admin_manager
 *
 * ❗ NÃO acessa ScriptProperties diretamente
 * ❗ NÃO contém lógica de persistência
 * ❗ NÃO decide regras de domínio
 */

function limparContextoTrabalho_() {
  const ui = SpreadsheetApp.getUi();

  // Validação básica
  if (!planilhaTemContexto_()) {
    ui.alert('Esta planilha não possui contexto configurado.');
    return;
  }

  const resp = ui.alert(
    'Remover Contexto',
    '⚠️ Esta ação irá remover o contexto associado a esta planilha.\n\n' +
    'Essa operação NÃO pode ser desfeita.\n\n' +
    'Deseja continuar?',
    ui.ButtonSet.YES_NO
  );

  if (resp !== ui.Button.YES) {
    return;
  }

  try {
    limparContextoAtivo_();
  } catch (e) {
    ui.alert(
      'Erro ao remover contexto:\n\n' + e.message
    );
    return;
  }

  ui.alert(
    'Contexto removido com sucesso.\n\n' +
    'Você pode criar ou selecionar um novo contexto.'
  );
}
