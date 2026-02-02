/**
 * ============================================================
 * DIAGNÓSTICO
 * ============================================================
 */

/**
 * Executa diagnóstico do sistema
 */
function executarDiagnostico_() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Verificar contexto admin
    const contextoAdmin = obterContextoAdmin_();
    
    if (!contextoAdmin) {
      ui.alert('⚠️ Nenhum contexto admin encontrado nesta planilha.');
      return;
    }
    
    // Verificar sistema global
    const sistemaGlobal = obterSistemaGlobal_();
    
    const resultado = `
✅ DIAGNÓSTICO DO SISTEMA

📊 CONTEXTO ADMIN:
- ID: ${contextoAdmin.id}
- Nome: ${contextoAdmin.nome}
- Email: ${contextoAdmin.emailOperador}

🌐 SISTEMA GLOBAL:
- Pasta Raiz ID: ${sistemaGlobal.pastaRaizId || 'não configurado'}
- Pasta Contexto ID: ${sistemaGlobal.pastaContextoId || 'não configurado'}
- Planilha Geral ID: ${sistemaGlobal.planilhaGeralId || 'não configurado'}

✓ Sistema funcionando corretamente!
    `;
    
    ui.alert(resultado);
    
  } catch (e) {
    ui.alert('❌ Erro no Diagnóstico: ' + e.message);
    Logger.log(e);
  }
}

