/**
 * ============================================================
 * DEBUG — LISTAR IDs DAS PASTAS E PLANILHAS
 * ============================================================
 * Cole esta função em um script de teste para ver todos os IDs
 */

function debugListarIds() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();
  
  if (!contexto || !contexto.id) {
    ui.alert('❌ Nenhum contexto ativo.');
    return;
  }

  let info = '📋 IDs DO CONTEXTO ATIVO\n';
  info += '════════════════════════════════════════\n\n';
  
  // Contexto
  info += '🏗️ CONTEXTO\n';
  info += `├─ ID: ${contexto.id}\n`;
  info += `└─ Nome: ${contexto.nome}\n\n`;
  
  // Pastas
  info += '📁 PASTAS\n';
  info += `├─ pastaContextoDelId: ${contexto.pastaContextoDelId || '(null)'}\n`;
  info += `├─ pastaPlanilhasId: ${contexto.pastaPlanilhasId || '(null)'}\n`;
  info += `├─ pastaLocalidadesId: ${contexto.pastaLocalidadesId || '(null)'}\n`;
  info += `└─ pastaCSVAdminId: ${contexto.pastaCSVAdminId || '(null)'}\n\n`;
  
  // Planilhas
  info += '📊 PLANILHAS\n';
  info += `├─ planilhaClienteId: ${contexto.planilhaClienteId || '(null)'}\n`;
  info += `└─ planilhaGeralId: ${contexto.planilhaGeralId || '(null)'}\n\n`;
  
  // Localidades
  info += '🗂️ LOCALIDADES\n';
  const localidades = contexto.localidades || [];
  if (localidades.length === 0) {
    info += '└─ (nenhuma criada)\n\n';
  } else {
    localidades.forEach((loc, idx) => {
      const isLast = idx === localidades.length - 1;
      const prefix = isLast ? '└─' : '├─';
      const subPrefix = isLast ? '   ' : '│  ';
      
      info += `${prefix} ${loc.nome}\n`;
      info += `${subPrefix}├─ ID: ${loc.id}\n`;
      info += `${subPrefix}├─ Cor: ${loc.cor}\n`;
      info += `${subPrefix}└─ Criada: ${loc.criadaEm?.substring(0, 10) || 'N/A'}\n`;
    });
    info += '\n';
  }
  
  // Localidade ativa
  info += '🎯 LOCALIDADE ATIVA\n';
  info += `├─ ID: ${contexto.localidadeAtivaId || '(nenhuma)'}\n`;
  info += `├─ Nome: ${contexto.localidadeAtivaNome || '(nenhuma)'}\n`;
  info += `└─ Cor: ${contexto.localidadeAtivaCor || '(nenhuma)'}\n\n`;
  
  // Sistema Global
  info += '🌐 SISTEMA GLOBAL\n';
  const sistema = obterSistemaGlobal_();
  info += `├─ pastaRaizId: ${sistema.pastaRaizId || '(null)'}\n`;
  info += `├─ pastaContextoId: ${sistema.pastaContextoId || '(null)'}\n`;
  info += `└─ planilhaGeralId: ${sistema.planilhaGeralId || '(null)'}\n`;

  // Mostrar em alerta
  ui.alert(info);
  
  // Também logar para console
  Logger.log(info);
}

/**
 * Função para copiar IDs para o clipboard (auxiliar)
 */
function debugCopiarIdsParaClipboard() {
  const contexto = obterContextoAtivo_();
  
  if (!contexto || !contexto.id) {
    SpreadsheetApp.getUi().alert('❌ Nenhum contexto ativo.');
    return;
  }

  const ids = {
    contextoId: contexto.id,
    pastaContextoDelId: contexto.pastaContextoDelId,
    pastaPlanilhasId: contexto.pastaPlanilhasId,
    pastaLocalidadesId: contexto.pastaLocalidadesId,
    pastaCSVAdminId: contexto.pastaCSVAdminId,
    planilhaClienteId: contexto.planilhaClienteId,
    planilhaGeralId: contexto.planilhaGeralId,
    localidades: contexto.localidades,
    localidadeAtivaId: contexto.localidadeAtivaId
  };

  const json = JSON.stringify(ids, null, 2);
  Logger.log('IDs em JSON:');
  Logger.log(json);
  
  // Copiar para clipboard via sheet
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.insertSheet('_DEBUG_IDS');
  sheet.getRange('A1').setValue(json);
  
  SpreadsheetApp.getUi().alert(
    '✅ IDs copiados para a aba "_DEBUG_IDS"\n\n' +
    'Também estão visíveis no console (Ctrl+Shift+J)'
  );
}
