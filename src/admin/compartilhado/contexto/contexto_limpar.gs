/**
 * ============================================================
 * CONTEXTO — LIMPAR (UTILITÁRIO)
 * ============================================================
 */

/**
 * Remove CONTEXTO_ADMIN da planilha atual
 * Útil para limpar templates ou planilhas corrompidas
 */
function limparContextoAdmin_() {
  const ui = SpreadsheetApp.getUi();
  
  const confirma = ui.alert(
    '⚠️ Limpar Contexto',
    'Tem certeza que deseja REMOVER o contexto desta planilha?\n\n' +
    'Esta ação não pode ser desfeita.',
    ui.ButtonSet.YES_NO
  );
  
  if (confirma !== ui.Button.YES) {
    return;
  }
  
  try {
    PropertiesService.getDocumentProperties().deleteProperty('CONTEXTO_ADMIN');
    ui.alert('✅ Contexto removido com sucesso.\n\nRecarregue a planilha (F5).');
  } catch (e) {
    ui.alert('❌ Erro ao remover contexto:\n\n' + e.message);
  }
}

/**
 * Remove CONTEXTO_CLIENTE da planilha atual
 */
function limparContextoCliente_() {
  const ui = SpreadsheetApp.getUi();
  
  const confirma = ui.alert(
    '⚠️ Limpar Contexto Cliente',
    'Tem certeza que deseja REMOVER o contexto cliente desta planilha?\n\n' +
    'Esta ação não pode ser desfeita.',
    ui.ButtonSet.YES_NO
  );
  
  if (confirma !== ui.Button.YES) {
    return;
  }
  
  try {
    PropertiesService.getDocumentProperties().deleteProperty('CONTEXTO_CLIENTE');
    ui.alert('✅ Contexto cliente removido com sucesso.\n\nRecarregue a planilha (F5).');
  } catch (e) {
    ui.alert('❌ Erro ao remover contexto:\n\n' + e.message);
  }
}
