/**
 * ============================================================
 * ENTRY POINT — INICIALIZAÇÃO DO SISTEMA
 * ============================================================
 * Responsabilidade: Detectar tipo de planilha e renderizar menu apropriado
 */

function onOpen() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const planilhaId = ss.getId();
    const propsScript = PropertiesService.getScriptProperties();
    
    // 1️⃣ VERIFICAR CONTEXTO_ADMIN (ScriptProperties com chave por planilha)
    const chaveAdmin = 'CONTEXTO_ADMIN_' + planilhaId;
    const temContextoAdmin = !!propsScript.getProperty(chaveAdmin);
    
    Logger.log('[PRINCIPAL][ONOPEN] Planilha ID: ' + planilhaId);
    Logger.log('[PRINCIPAL][ONOPEN] Tem CONTEXTO_ADMIN? ' + temContextoAdmin);
    
    if (temContextoAdmin) {
      Logger.log('[PRINCIPAL][ONOPEN] Renderizando menu ADMIN');
      adminRenderMenu();
      return;
    }
    
    const propsDoc = PropertiesService.getDocumentProperties();
    const rawCliente = propsDoc.getProperty('CONTEXTO_CLIENTE');
    if (rawCliente) {
      Logger.log('[PRINCIPAL][ONOPEN] Renderizando menu CLIENTE');
      clientRenderMenu();
      return;
    }
    
    Logger.log('[PRINCIPAL][ONOPEN] Nenhum contexto encontrado - sem menu');
  } catch (e) {
    Logger.log('[PRINCIPAL][ONERROR] ' + e.message);
  }
}
