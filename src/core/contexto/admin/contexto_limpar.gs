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

  if (!contextoAdminValido_()) {
    ui.alert('Esta planilha não possui contexto configurado.');
    return;
  }

  const resp = ui.alert(
    'Remover Contexto',
    '⚠️ Esta ação é irreversível.\n\nDeseja continuar?',
    ui.ButtonSet.YES_NO
  );

  if (resp !== ui.Button.YES) return;

  limparContextoAtivo_();

  ui.alert(
    'Contexto removido com sucesso.\n\n' +
    'Recarregue a planilha (F5).'
  );
}
