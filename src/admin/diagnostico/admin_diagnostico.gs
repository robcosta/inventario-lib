/**
 * ============================================================
 * DIAGNÓSTICO
 * ============================================================
 */

/**
 * Reparar contexto (com UI amigável)
 */
function repararContextoAdmin_() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const planilhaId = ss.getId();
  const scriptProps = PropertiesService.getScriptProperties();
  const chave = PROPRIEDADES_ADMIN.CONTEXTO_ADMIN + '_' + planilhaId;
  const rawContexto = scriptProps.getProperty(chave);
  
  if (!rawContexto) {
    ui.alert(
      '❌ Nenhum contexto encontrado',
      'Esta planilha não possui contexto salvo.\n\n' +
      '💡 Use "Criar Contexto de Trabalho" se esta for uma planilha Template.',
      ui.ButtonSet.OK
    );
    return;
  }
  
  // Confirmar antes de reparar
  const resposta = ui.alert(
    '🔧 Reparar Contexto',
    'Esta ação vai atualizar o contexto desta planilha:\n\n' +
    '• Corrige campo planilhaAdminId\n' +
    '• Atualiza ID baseado na planilha atual\n' +
    '• Extrai nome do título da planilha\n\n' +
    'Deseja continuar?',
    ui.ButtonSet.YES_NO
  );
  
  if (resposta !== ui.Button.YES) {
    return;
  }
  
  try {
    corrigirContextoPlanilhaAtual_();
    
    // Verificar se corrigiu
    const rawCorrigido = scriptProps.getProperty(chave);
    const contextoCorrigido = rawCorrigido ? JSON.parse(rawCorrigido) : null;
    
    if (contextoCorrigido && contextoCorrigido.planilhaAdminId) {
      ui.alert(
        '✅ Contexto reparado!',
        'O contexto foi atualizado com sucesso.\n\n' +
        '📋 Contexto: ' + contextoCorrigido.nome + '\n' +
        '🔑 ID: ' + contextoCorrigido.id + '\n\n' +
        '🔄 Recarregue a planilha (F5) para ver o menu completo.',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert('⚠️ Correção concluída, mas recomenda-se verificar os logs.');
    }
    
  } catch (e) {
    ui.alert('❌ Erro ao reparar contexto:\n\n' + e.message);
    Logger.log('[REPARAR] Erro: ' + e.message);
  }
}

/**
 * Executa diagnóstico do sistema
 */
function executarDiagnostico_() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Sempre ler os IDs diretamente das ScriptProperties (sistema global)
    const sistemaGlobal = obterSistemaGlobal_();
    // Tentar obter contexto admin detalhado
    let contextoAdmin = null;
    try {
      contextoAdmin = obterContextoAdmin_();
    } catch (e) {}

    const totalLocalidades = (contextoAdmin && contextoAdmin.localidades) ? contextoAdmin.localidades.length : 0;
    const totalAcessos = (contextoAdmin && contextoAdmin.acessoLista) ? contextoAdmin.acessoLista.length : 0;
    const totalCSVs = (contextoAdmin && contextoAdmin.csvAdminImportados) ? contextoAdmin.csvAdminImportados.length : 0;

    const resultado = `
✅ DIAGNÓSTICO DO SISTEMA

📋 CONTEXTO ADMIN:
- ID: ${contextoAdmin?.id || 'não definido'}
- Nome: ${contextoAdmin?.nome || 'não definido'}
- Email Operador: ${contextoAdmin?.emailOperador || 'não definido'}
- Criado Em: ${contextoAdmin?.criadoEm || 'não definido'}

🆔 IDS DAS PLANILHAS:
- Planilha ADMIN: ${contextoAdmin?.planilhaAdminId || 'não definido'}
- Planilha Cliente: ${contextoAdmin?.planilhaClienteId || 'não definido'}
- Planilha Geral (Global): ${sistemaGlobal.planilhaGeralId || 'não definido'}

📁 IDS DAS PASTAS:
- Pasta Contexto (DEL): ${contextoAdmin?.pastaContextoDelId || 'não definido'}
- Pasta Planilhas: ${contextoAdmin?.pastaPlanilhasId || 'não definido'}
- Pasta CSV Admin: ${contextoAdmin?.pastaCSVAdminId || 'não definido'}
- Pasta Localidades: ${contextoAdmin?.pastaLocalidadesId || 'não definido'}
- Pasta Raiz (Global): ${sistemaGlobal.pastaRaizId || 'não configurado'}
- Pasta Contextos (Global): ${sistemaGlobal.pastaContextoId || 'não configurado'}
- Pasta PLANILHAS (Global): ${sistemaGlobal.pastaPlanilhasId || 'não configurado'}
- Pasta GERAL (Global): ${sistemaGlobal.pastaGeralId || 'não configurado'}
- Pasta CSV_GERAL (Global): ${sistemaGlobal.pastaCSVGeralId || 'não configurado'}

📍 LOCALIDADES:
- Total: ${totalLocalidades}
- Ativa: ${contextoAdmin?.localidadeAtivaNome || 'nenhuma'}
${totalLocalidades > 0 ? '- IDs: ' + contextoAdmin.localidades.map(l => l.id).join(', ') : ''}

👥 ACESSOS:
- Total: ${totalAcessos}
${totalAcessos > 0 ? '- Usuários: ' + contextoAdmin.acessoLista.map(a => a.email).join(', ') : ''}

📊 CSVs IMPORTADOS (Contexto):
- Total: ${totalCSVs}
${totalCSVs > 0 ? '- Arquivos: ' + contextoAdmin.csvAdminImportados.map(c => c.nome).join(', ') : ''}

📊 CSVs Gerais (registro global):
- Total: ${(sistemaGlobal.csvGeralRegistro && sistemaGlobal.csvGeralRegistro.length) || 0}
- IDs: ${(sistemaGlobal.csvGeralRegistro && sistemaGlobal.csvGeralRegistro.map(c=>c.id).join(', ')) || 'nenhum'}

✅ Diagnóstico concluído!
    `;
    ui.alert(resultado);
    
  } catch (e) {
    ui.alert('❌ Erro no Diagnóstico:\n\n' + e.message);
    Logger.log('[DIAGNOSTICO] Erro: ' + e.message);
    Logger.log(e.stack);
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

