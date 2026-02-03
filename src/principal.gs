/**
 * ============================================================
 * ENTRY POINT — INICIALIZAÇÃO DO SISTEMA
 * ============================================================
 * Responsabilidade: Detectar tipo de planilha e renderizar menu apropriado
 */

function onOpen() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const props = PropertiesService.getDocumentProperties();
    
    // Verifica se tem CONTEXTO_ADMIN (planilha admin)
    const rawContexto = props.getProperty('CONTEXTO_ADMIN');
    
    if (rawContexto) {
      // É planilha ADMIN - renderizar menu admin
      adminRenderMenu();
    } else {
      // Verifica se tem CONTEXTO_CLIENTE (planilha cliente)
      const rawCliente = props.getProperty('CONTEXTO_CLIENTE');
      if (rawCliente) {
        // É planilha CLIENTE - renderizar menu cliente
        clientRenderMenu();
      }
      // Senão, nenhum contexto - sem menu
    }
  } catch (e) {
    Logger.log('[PRINCIPAL][ONERROR]', e);
  }
}
