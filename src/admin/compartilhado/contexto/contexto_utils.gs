/**
 * ============================================================
 * CONTEXTO — UTILITÁRIOS (VERSÃO UNIFICADA E ROBUSTA)
 * ============================================================
 * * Centraliza a inteligência de memória do sistema.
 * Usa ScriptProperties para garantir que o Vision (Biblioteca)
 * e a Planilha (Admin) acessem os mesmos dados.
 */

/**
 * Retorna o objeto de contexto completo ou um objeto vazio se não existir.
 * Usa o novo gerenciador CONTEXTO_ADMIN
 */
function obterContextoAtivo_() {
  return obterContextoAdmin_() || {};
}

/**
 * Salva o objeto de contexto de forma centralizada.
 */
function salvarContextoAtivo_(contexto) {
  if (!contexto) return;
  salvarContextoAdmin_(contexto);
}

// ============================================================
// NOTA: atualizarContexto__() foi removida (versão obsoleta).
// Use atualizarContexto_() em contexto_atualizar.gs
// ============================================================

/**
 * Verifica se a planilha atual já possui um contexto configurado.
 * ✅ Valida usando planilhaOperacionalId (ID da planilha ADMIN atual)
 */
function planilhaTemContexto_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return false;
  
  const planilhaId = ss.getId();
  const contexto = obterContextoAtivo_();
  
  // Contexto válido se: existe E tem planilhaOperacionalId correspondente
  const valido = !!(contexto && contexto.planilhaOperacionalId === planilhaId);
  
  Logger.log('[CONTEXTO][VALIDACAO] Planilha: ' + planilhaId);
  Logger.log('[CONTEXTO][VALIDACAO] Contexto existe? ' + !!contexto);
  if (contexto) {
    Logger.log('[CONTEXTO][VALIDACAO] contexto.planilhaOperacionalId: ' + contexto.planilhaOperacionalId);
  }
  Logger.log('[CONTEXTO][VALIDACAO] Resultado: ' + valido);
  
  return valido;
}

/**
 * Lista as pastas de contexto disponíveis no Drive para seleção.
 * ✅ USANDO APENAS IDs - Lê ScriptProperties de cada planilha ADMIN
 * Não procura por nome, apenas valida se o ID está acessível
 */
function listarContextos_() {
  Logger.log('[LISTAR_CONTEXTOS] INÍCIO - Usando ScriptProperties (ID-based)');
  
  const sistema = obterSistemaGlobal_();
  const pastaContextoId = sistema.pastaContextoId;
  
  if (!pastaContextoId) {
    Logger.log('[LISTAR_CONTEXTOS] ❌ pastaContextoId não configurado');
    return [];
  }

  try {
    Logger.log('[LISTAR_CONTEXTOS] Acessando pasta CONTEXTO:', pastaContextoId);
    const pastaContexto = DriveApp.getFolderById(pastaContextoId);
    const pastasContextos = pastaContexto.getFolders();
    const lista = [];
    let count = 0;

    while (pastasContextos.hasNext()) {
      const pastaContextoDel = pastasContextos.next();
      const nomeContexto = pastaContextoDel.getName();
      count++;
      
      Logger.log('[LISTAR_CONTEXTOS] Processando contexto #' + count + ':', nomeContexto);

      // 1️⃣ Iterar subpastas para encontrar o CONTEXTO_ADMIN em ScriptProperties
      const subpastas = pastaContextoDel.getFolders();
      let planilhaAdminId = null;
      let contextoCompleto = null;

      while (subpastas.hasNext()) {
        const sub = subpastas.next();
        const planilhas = sub.getFilesByType(MimeType.GOOGLE_SHEETS);
        
        while (planilhas.hasNext()) {
          const planilha = planilhas.next();
          const idPlanilha = planilha.getId();
          const nomePlanilha = planilha.getName();
          const nomeSubpasta = sub.getName();
          
          Logger.log('[LISTAR_CONTEXTOS]   Verificando planilha: ' + nomePlanilha + ' (ID: ' + idPlanilha + ')');
          
          // 2️⃣ Verificar se este ID tem CONTEXTO_ADMIN no ScriptProperties
          const scriptProps = PropertiesService.getScriptProperties();
          const chaveContexto = PROPRIEDADES_ADMIN.CONTEXTO_ADMIN + '_' + idPlanilha;
          const rawContexto = scriptProps.getProperty(chaveContexto);
          
          if (rawContexto) {
            try {
              const contexto = JSON.parse(rawContexto);
              
              // ✅ Encontrou! Este é o ADMIN
              planilhaAdminId = idPlanilha;
              contextoCompleto = contexto;
              
              Logger.log('[LISTAR_CONTEXTOS]   ✅ CONTEXTO_ADMIN encontrado! ID: ' + idPlanilha);
              Logger.log('[LISTAR_CONTEXTOS]   Nome: ' + nomePlanilha);
              break;
            } catch (e) {
              Logger.log('[LISTAR_CONTEXTOS]   ⚠️ CONTEXTO_ADMIN inválido nesta planilha');
            }
          }
        }
        
        if (planilhaAdminId) break;
      }

      // 3️⃣ Se encontrou o ID, validar se a planilha ainda é acessível e adicionar o contexto COMPLETO
      if (planilhaAdminId && contextoCompleto) {
        try {
          const fileTest = DriveApp.getFileById(planilhaAdminId);
          Logger.log('[LISTAR_CONTEXTOS]   ✅ Planilha ADMIN acessível: ' + fileTest.getName());
          
          // ✅ Adiciona o CONTEXTO COMPLETO, não apenas 3 campos
          lista.push(contextoCompleto);
          
        } catch (e) {
          Logger.log('[LISTAR_CONTEXTOS]   ❌ Planilha ADMIN não acessível: ' + e.message);
          // Não adiciona à lista - contexto inacessível é ignorado
        }
      } else {
        Logger.log('[LISTAR_CONTEXTOS]   ❌ Nenhum CONTEXTO_ADMIN encontrado');
      }
    }

    Logger.log('[LISTAR_CONTEXTOS] ✅ Total de contextos encontrados: ' + lista.length);
    return lista;
  } catch (e) {
    Logger.log('[LISTAR_CONTEXTOS] ❌ Erro ao listar: ' + e.message);
    Logger.log('[LISTAR_CONTEXTOS] Stack:', e.stack);
    return [];
  }
}

/**
 * Verifica se um contexto com determinado nome já existe no Drive.
 */
function contextoComNomeExiste_(nomeContexto) {
  const raiz = obterPastaInventario_();
  if (!raiz) return false;

  const pastasPlanilhas = raiz.getFoldersByName('PLANILHAS');
  if (!pastasPlanilhas.hasNext()) return false;

  const contextosFolder = pastasPlanilhas.next().getFoldersByName('CONTEXTOS');
  if (!contextosFolder.hasNext()) return false;

  return contextosFolder.next().getFoldersByName(nomeContexto).hasNext();
}