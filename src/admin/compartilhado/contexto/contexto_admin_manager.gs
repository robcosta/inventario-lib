/**
 * ============================================================
 * GERENCIADOR DE CONTEXTO ADMIN
 * ============================================================
 * Funções para gerenciar CONTEXTO_ADMIN (DocumentProperties da planilha admin)
 */

/**
 * Obtém o contexto admin completo
 * Usa APENAS ScriptProperties com chave por planilha ID.
 * @return {Object|null} Contexto ou null se não existir
 */
function obterContextoAdmin_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;
  
  const planilhaId = ss.getId();
  const scriptProps = PropertiesService.getScriptProperties();
  const chave = PROPRIEDADES_ADMIN.CONTEXTO_ADMIN + '_' + planilhaId;

  const raw = scriptProps.getProperty(chave);
  if (!raw) return null;
  
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao parsear CONTEXTO_ADMIN:', e.message);
    return null;
  }
}

/**
 * Salva o contexto admin completo
 * Usa APENAS ScriptProperties com chave por planilha ID.
 * @param {Object} contexto
 */
function salvarContextoAdmin_(contexto) {
  if (!contexto) {
    throw new Error('Contexto admin não pode ser nulo.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Nenhuma planilha ativa para salvar CONTEXTO_ADMIN.');
  }

  const planilhaId = ss.getId();
  const chave = PROPRIEDADES_ADMIN.CONTEXTO_ADMIN + '_' + planilhaId;
  const raw = JSON.stringify(contexto);

  // Salva em ScriptProperties (único storage válido para bibliotecas)
  PropertiesService.getScriptProperties().setProperty(chave, raw);
}

/**
 * Registra um CONTEXTO_ADMIN pendente para ser aplicado pela planilha ADMIN.
 * @param {string} planilhaId
 * @param {Object} contexto
 */
function salvarContextoAdminPendente_(planilhaId, contexto) {
  if (!planilhaId || !contexto) {
    throw new Error('ID da planilha e contexto são obrigatórios.');
  }

  const props = PropertiesService.getScriptProperties();
  const chave = 'PENDING_CONTEXTO_ADMIN_' + planilhaId;
  Logger.log('[CONTEXTO_ADMIN][PENDENTE] Salvando pendente em ScriptProperties: ' + chave);
  Logger.log('[CONTEXTO_ADMIN][PENDENTE] Payload: ' + JSON.stringify(contexto));
  props.setProperty(chave, JSON.stringify(contexto));
}

/**
 * Aplica o CONTEXTO_ADMIN pendente na planilha atual, se existir.
 * Usa APENAS ScriptProperties (DocumentProperties não funciona em bibliotecas).
 * @return {boolean} true se aplicou, false caso contrário
 */
function aplicarContextoAdminPendente_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return false;

  const planilhaId = ss.getId();
  const props = PropertiesService.getScriptProperties();
  const chave = 'PENDING_CONTEXTO_ADMIN_' + planilhaId;
  const chaveDestino = PROPRIEDADES_ADMIN.CONTEXTO_ADMIN + '_' + planilhaId;
  
  Logger.log('[CONTEXTO_ADMIN][APLICAR] Planilha ID: ' + planilhaId);

  // Tenta aplicar pendente
  const raw = props.getProperty(chave);
  Logger.log('[CONTEXTO_ADMIN][APLICAR] Chave pendente: ' + chave);
  Logger.log('[CONTEXTO_ADMIN][APLICAR] Encontrou pendente? ' + (!!raw));

  if (!raw) {
    Logger.log('[CONTEXTO_ADMIN][APLICAR] Nenhum pendente encontrado');
    return false;
  }

  // Aplicar pendente em ScriptProperties
  Logger.log('[CONTEXTO_ADMIN][APLICAR] Salvando em ScriptProperties: ' + chaveDestino);
  props.setProperty(chaveDestino, raw);
  
  // Verifica se salvou
  const verificacao = props.getProperty(chaveDestino);
  Logger.log('[CONTEXTO_ADMIN][APLICAR] ScriptProperties verificação: ' + (verificacao ? 'OK (' + verificacao.length + ' chars)' : 'FALHOU'));

  // Remove pendente
  props.deleteProperty(chave);
  Logger.log('[CONTEXTO_ADMIN][APLICAR] Pendente removido: ' + chave);
  
  return !!verificacao;
}

/**
 * Salva o contexto admin em uma planilha ESPECÍFICA por ID
 * @param {string} planilhaId - ID da planilha
 * @param {Object} contexto - Objeto contexto
 */
function salvarContextoAdminPorId_(planilhaId, contexto) {
  if (!planilhaId || !contexto) {
    throw new Error('ID da planilha e contexto são obrigatórios.');
  }
  
  const ss = SpreadsheetApp.openById(planilhaId);
  const tempProps = PropertiesService.getUserProperties();
  const chaveTemp = '_TEMP_CONTEXTO_SAVE_' + planilhaId;
  
  // Salvar temporariamente
  tempProps.setProperty(chaveTemp, JSON.stringify(contexto));
  
  // Forçar a planilha como ativa
  SpreadsheetApp.setActiveSpreadsheet(ss);
  SpreadsheetApp.flush();
  
  // Recuperar e salvar no DocumentProperties correto
  const contextoRecuperado = JSON.parse(tempProps.getProperty(chaveTemp));
  PropertiesService.getDocumentProperties().setProperty(
    PROPRIEDADES_ADMIN.CONTEXTO_ADMIN,
    JSON.stringify(contextoRecuperado)
  );
  
  // Limpar temporário
  tempProps.deleteProperty(chaveTemp);
  
  return contextoRecuperado;
}

/**
 * Atualiza campos específicos do contexto admin
 * @param {Object} atualizacoes
 */
function atualizarContextoAdmin_(atualizacoes) {
  const contexto = obterContextoAdmin_() || {};
  
  // Merge das atualizações
  Object.keys(atualizacoes).forEach(chave => {
    contexto[chave] = atualizacoes[chave];
  });
  
  salvarContextoAdmin_(contexto);
}

/**
 * Cria um novo contexto admin
 * @param {Object} dados - {id, nome, emailOperador, ...}
 * @return {Object} Contexto criado
 */
function criarContextoAdmin_(dados) {
  const contexto = {
    // Identificação
    id: dados.id,
    nome: dados.nome,
    emailOperador: dados.emailOperador || Session.getActiveUser().getEmail(),
    criadoEm: new Date().toISOString(),
    
    // Pastas
    pastaContextoDelId: dados.pastaContextoDelId || null,
    pastaPlanilhasId: dados.pastaPlanilhasId || null,
    pastaCSVAdminId: dados.pastaCSVAdminId || null,
    pastaLocalidadesId: dados.pastaLocalidadesId || null,
    
    // Planilhas
    planilhaClienteId: dados.planilhaClienteId || null,
    planilhaGeralId: dados.planilhaGeralId || obterPlanilhaGeralId_(),
    
    // Localidades
    localidades: [],
    localidadeAtivaId: null,
    localidadeAtivaNome: null,
    localidadeAtivaCor: null,
    
    // CSVs
    csvAdminImportados: [],
    
    // Estatísticas
    estatisticas: {
      totalImagens: 0,
      imagensProcessadas: 0,
      imagensComErro: 0,
      ultimoProcessamento: null,
      proximoAgendamento: null
    },
    
    // Acessos
    acessoLista: [
      {
        email: dados.emailOperador || Session.getActiveUser().getEmail(),
        papel: 'admin',
        adicionadoEm: new Date().toISOString()
      }
    ]
  };
  
  salvarContextoAdmin_(contexto);
  return contexto;
}

/**
 * Adiciona uma localidade ao contexto admin
 * @param {Object} localidade - {id, nome, cor, criadaEm}
 */
function adicionarLocalidade_(localidade) {
  const contexto = obterContextoAdmin_();
  
  if (!contexto) {
    throw new Error('Contexto admin não encontrado.');
  }
  
  // Evitar duplicatas
  const existe = contexto.localidades.find(l => l.id === localidade.id);
  if (existe) {
    console.warn('Localidade já existe:', localidade.nome);
    return;
  }
  
  contexto.localidades.push({
    id: localidade.id,
    nome: localidade.nome,
    cor: localidade.cor || '#CCCCCC',
    criadaEm: localidade.criadaEm || new Date().toISOString(),
    subpastas: localidade.subpastas || []
  });
  
  salvarContextoAdmin_(contexto);
}

/**
 * Define a localidade ativa
 * @param {string} localidadeId
 */
function setLocalidadeAtiva_(localidadeId) {
  const contexto = obterContextoAdmin_();
  
  if (!contexto) {
    throw new Error('Contexto admin não encontrado.');
  }
  
  const localidade = contexto.localidades.find(l => l.id === localidadeId);
  
  if (!localidade) {
    throw new Error('Localidade não encontrada: ' + localidadeId);
  }
  
  contexto.localidadeAtivaId = localidade.id;
  contexto.localidadeAtivaNome = localidade.nome;
  contexto.localidadeAtivaCor = localidade.cor;
  
  salvarContextoAdmin_(contexto);
}

/**
 * Adiciona um CSV ao registro do admin
 * @param {Object} csv - {nome, id, dataImportacao, linhas, tamanho}
 */
function adicionarCSVAdmin_(csv) {
  const contexto = obterContextoAdmin_();
  
  if (!contexto) {
    throw new Error('Contexto admin não encontrado.');
  }
  
  // Evitar duplicatas
  const existe = contexto.csvAdminImportados.find(c => c.id === csv.id);
  if (existe) {
    console.warn('CSV já registrado:', csv.nome);
    return;
  }
  
  contexto.csvAdminImportados.push({
    nome: csv.nome,
    id: csv.id,
    dataImportacao: csv.dataImportacao || new Date().toISOString(),
    linhas: csv.linhas || 0,
    tamanho: csv.tamanho || 0,
    status: csv.status || 'importado'
  });
  
  salvarContextoAdmin_(contexto);
}

/**
 * Atualiza estatísticas do contexto admin
 * @param {Object} stats - Objeto com estatísticas
 */
function atualizarEstatisticasAdmin_(stats) {
  const contexto = obterContextoAdmin_();
  
  if (!contexto) {
    throw new Error('Contexto admin não encontrado.');
  }
  
  contexto.estatisticas = {
    ...contexto.estatisticas,
    ...stats
  };
  
  salvarContextoAdmin_(contexto);
}

/**
 * Verifica se a planilha tem contexto admin
 * @return {boolean}
 */
function planilhaTemContextoAdmin_() {
  return !!PropertiesService
    .getDocumentProperties()
    .getProperty(PROPRIEDADES_ADMIN.CONTEXTO_ADMIN);
}

/**
 * Remove o contexto admin (usar com cuidado!)
 */
function removerContextoAdmin_() {
  PropertiesService
    .getDocumentProperties()
    .deleteProperty(PROPRIEDADES_ADMIN.CONTEXTO_ADMIN);
}
