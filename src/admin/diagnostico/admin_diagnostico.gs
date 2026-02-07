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

/**
 * Debug: Verificar estado do contexto na planilha atual
 */
function debugContextoPlanilhaAtual_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const planilhaId = ss.getId();
  const planilhaNome = ss.getName();
  
  Logger.log('=== DEBUG CONTEXTO PLANILHA ATUAL ===');
  Logger.log('Planilha ID: ' + planilhaId);
  Logger.log('Planilha Nome: ' + planilhaNome);
  
  const scriptProps = PropertiesService.getScriptProperties();
  const chave = PROPRIEDADES_ADMIN.CONTEXTO_ADMIN + '_' + planilhaId;
  const rawContexto = scriptProps.getProperty(chave);
  
  Logger.log('Chave buscada: ' + chave);
  Logger.log('Contexto encontrado? ' + (!!rawContexto));
  
  if (rawContexto) {
    try {
      const contexto = JSON.parse(rawContexto);
      Logger.log('Contexto parseado com sucesso:');
      Logger.log('  - id: ' + contexto.id);
      Logger.log('  - nome: ' + contexto.nome);
      Logger.log('  - planilhaClienteId: ' + contexto.planilhaClienteId);
      Logger.log('  - planilhaOperacionalId: ' + contexto.planilhaOperacionalId);
      
      const temContexto = planilhaTemContexto_();
      Logger.log('planilhaTemContexto_() retorna: ' + temContexto);
      
      SpreadsheetApp.getUi().alert(
        'DEBUG CONTEXTO\n\n' +
        'Planilha: ' + planilhaNome + '\n' +
        'ID: ' + planilhaId + '\n\n' +
        'Contexto encontrado: SIM\n' +
        '  - nome: ' + contexto.nome + '\n' +
        '  - planilhaClienteId: ' + (contexto.planilhaClienteId || 'NULO') + '\n' +
        '  - planilhaOperacionalId: ' + (contexto.planilhaOperacionalId || 'NULO') + '\n\n' +
        'planilhaTemContexto_(): ' + temContexto
      );
    } catch (e) {
      Logger.log('Erro ao parsear contexto: ' + e.message);
    }
  } else {
    Logger.log('Nenhum contexto encontrado em ScriptProperties para esta planilha');
    SpreadsheetApp.getUi().alert(
      'DEBUG CONTEXTO\n\n' +
      'Planilha: ' + planilhaNome + '\n' +
      'ID: ' + planilhaId + '\n\n' +
      'Contexto encontrado: NÃO\n\n' +
      'Chave buscada: ' + chave
    );
  }
}

