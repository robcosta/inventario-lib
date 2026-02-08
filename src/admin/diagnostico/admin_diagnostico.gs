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
      Logger.log('  - planilhaAdminId: ' + contexto.planilhaAdminId);
      
      const temContexto = planilhaTemContexto_();
      Logger.log('planilhaTemContexto_() retorna: ' + temContexto);
      Logger.log('[DEBUG] Análise completa finalizada.');
    } catch (e) {
      Logger.log('Erro ao parsear contexto: ' + e.message);
    }
  } else {
    Logger.log('Nenhum contexto encontrado em ScriptProperties para esta planilha');
    Logger.log('[DEBUG] Análise completa finalizada.');
  }
}

/**
 * Corrigir contexto da planilha atual usando seus próprios dados
 */
function corrigirContextoPlanilhaAtual_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const planilhaId = ss.getId();
  const planilhaNome = ss.getName();
  
  Logger.log('=== CORRIGIR CONTEXTO PLANILHA ATUAL ===');
  Logger.log('Planilha ID: ' + planilhaId);
  Logger.log('Planilha Nome: ' + planilhaNome);
  
  const scriptProps = PropertiesService.getScriptProperties();
  const chave = PROPRIEDADES_ADMIN.CONTEXTO_ADMIN + '_' + planilhaId;
  const rawContexto = scriptProps.getProperty(chave);
  
  if (!rawContexto) {
    Logger.log('[CORRIGIR] ❌ Nenhum contexto encontrado para corrigir');
    return;
  }
  
  try {
    const contexto = JSON.parse(rawContexto);
    Logger.log('[CORRIGIR] Contexto atual: ' + JSON.stringify(contexto));
    
    // Corrigir campos essenciais baseado no ID da planilha
    contexto.id = planilhaId;
    contexto.planilhaAdminId = planilhaId;  // ✅ Atualizado para novo nome
    
    // O nome deve ser extraído do nome da planilha (remove "ADMIN: ")
    const nomeExtraido = planilhaNome.replace(/^ADMIN:\s*/i, '').trim();
    if (nomeExtraido) {
      contexto.nome = nomeExtraido;
    }
    
    Logger.log('[CORRIGIR] Contexto corrigido: ' + JSON.stringify(contexto));
    Logger.log('[CORRIGIR] Salvando...');
    
    scriptProps.setProperty(chave, JSON.stringify(contexto));
    
    Logger.log('[CORRIGIR] ✅ Contexto corrigido com sucesso!');
    Logger.log('[CORRIGIR] Recarregue a planilha (F5) para aplicar.');
    
  } catch (e) {
    Logger.log('[CORRIGIR] ❌ Erro: ' + e.message);
  }
}

