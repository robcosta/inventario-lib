/**
 * ============================================================
 * DEBUG — LISTAR IDs DAS PASTAS E PLANILHAS
 * ============================================================
 * Cole esta função em um script de teste para ver todos os IDs
 */

function debugListarContextosDisponiveis() {
  const sistema = obterSistemaGlobal_();
  
  let info = '📋 DEBUG: LISTAR CONTEXTOS\n';
  info += '════════════════════════════════════════\n\n';
  
  info += '🌐 SISTEMA GLOBAL\n';
  info += `├─ pastaContextoId: ${sistema.pastaContextoId || '(não configurado)'}\n`;
  info += `└─ pastaRaizId: ${sistema.pastaRaizId || '(não configurado)'}\n\n`;
  
  if (!sistema.pastaContextoId) {
    info += '❌ pastaContextoId não está configurado!\n';
    info += 'Execute configuração inicial do sistema.\n';
    SpreadsheetApp.getUi().alert(info);
    return;
  }
  
  try {
    const pastaContexto = DriveApp.getFolderById(sistema.pastaContextoId);
    info += `✅ Pasta CONTEXTO encontrada: ${pastaContexto.getName()}\n\n`;
    
    const pastasContextos = pastaContexto.getFolders();
    let count = 0;
    
    info += '📂 CONTEXTOS ENCONTRADOS:\n';
    
    while (pastasContextos.hasNext()) {
      const pasta = pastasContextos.next();
      count++;
      info += `\n${count}. ${pasta.getName()}\n`;
      info += `   ID: ${pasta.getId()}\n`;
      
      // Verifica planilha ADMIN em qualquer subpasta (sem usar nome)
      let encontrouPlanilha = false;
      const subpastas = pasta.getFolders();
      while (subpastas.hasNext() && !encontrouPlanilha) {
        const sub = subpastas.next();
        const planilhas = sub.getFilesByType(MimeType.GOOGLE_SHEETS);
        if (planilhas.hasNext()) {
          const planilha = planilhas.next();
          info += `   ✅ Tem planilha ADMIN na subpasta: ${planilha.getName()}\n`;
          encontrouPlanilha = true;
        }
      }

      if (!encontrouPlanilha) {
        const planilhasRaiz = pasta.getFilesByType(MimeType.GOOGLE_SHEETS);
        if (planilhasRaiz.hasNext()) {
          const planilha = planilhasRaiz.next();
          info += `   ✅ Tem planilha ADMIN na raiz: ${planilha.getName()}\n`;
          encontrouPlanilha = true;
        }
      }

      if (!encontrouPlanilha) {
        info += `   ❌ SEM planilha ADMIN (subpastas/raiz)\n`;
      }
    }
    
    info += `\n\n📊 Total: ${count} contextos\n`;
    
  } catch (e) {
    info += `\n❌ ERRO: ${e.message}\n`;
  }
  
  Logger.log(info);
  SpreadsheetApp.getUi().alert(info);
}

/**
 * Migra contextos antigos criando a pasta PLANILHAS
 * e movendo planilhas ADMIN da raiz para essa pasta.
 */
function debugMigrarContextosPlanilhas() {
  const sistema = obterSistemaGlobal_();
  const pastaContextoId = sistema.pastaContextoId;

  if (!pastaContextoId) {
    SpreadsheetApp.getUi().alert('❌ pastaContextoId não configurado no sistema global.');
    return;
  }

  let info = '🛠️ MIGRAÇÃO DE CONTEXTOS\n';
  info += '════════════════════════════════════════\n\n';

  try {
    const pastaContexto = DriveApp.getFolderById(pastaContextoId);
    const pastasContextos = pastaContexto.getFolders();
    let totalMigrados = 0;

    while (pastasContextos.hasNext()) {
      const pasta = pastasContextos.next();
      const nomeContexto = pasta.getName();

      const subpastas = pasta.getFolders();
      let temPlanilhaEmSubpasta = false;
      while (subpastas.hasNext() && !temPlanilhaEmSubpasta) {
        const sub = subpastas.next();
        const planilhas = sub.getFilesByType(MimeType.GOOGLE_SHEETS);
        if (planilhas.hasNext()) {
          temPlanilhaEmSubpasta = true;
        }
      }

      if (temPlanilhaEmSubpasta) {
        info += `✅ ${nomeContexto}: já possui planilha em subpasta\n`;
        continue;
      }

      const planilhasRaiz = pasta.getFilesByType(MimeType.GOOGLE_SHEETS);
      if (!planilhasRaiz.hasNext()) {
        info += `⚠️ ${nomeContexto}: sem planilhas na raiz\n`;
        continue;
      }

      const pastaPlanilhas = pasta.createFolder('PLANILHA');
      let movidas = 0;

      while (planilhasRaiz.hasNext()) {
        const planilha = planilhasRaiz.next();
        planilha.moveTo(pastaPlanilhas);
        movidas++;
      }

      totalMigrados++;
      info += `🔁 ${nomeContexto}: PLANILHA criada, ${movidas} planilha(s) movida(s)\n`;
    }

    info += `\n✅ Migração concluída. Contextos atualizados: ${totalMigrados}\n`;
  } catch (e) {
    info += `\n❌ ERRO: ${e.message}\n`;
  }

  Logger.log(info);
  SpreadsheetApp.getUi().alert(info);
}

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
