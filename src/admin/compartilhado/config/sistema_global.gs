/**
 * ============================================================
 * GERENCIADOR DE CONFIGURAÇÃO GLOBAL DO SISTEMA
 * ============================================================
 * Funções para gerenciar ScriptProperties (dados compartilhados)
 */

/**
 * Obtém todo o sistema de configuração global
 * @return {Object} Configuração completa
 */
function obterSistemaGlobal_() {
  const props = PropertiesService.getScriptProperties();
  
  return {
    // Pastas
    pastaRaizId: props.getProperty(PROPRIEDADES_GLOBAL.PASTA_RAIZ_ID),
    pastaSistemaId: props.getProperty(PROPRIEDADES_GLOBAL.PASTA_SISTEMA_ID),
    pastaGeralId: props.getProperty(PROPRIEDADES_GLOBAL.PASTA_GERAL_ID),
    pastaCSVGeralId: props.getProperty(PROPRIEDADES_GLOBAL.PASTA_CSV_GERAL_ID),
    pastaContextoId: props.getProperty(PROPRIEDADES_GLOBAL.PASTA_CONTEXTO_ID),
    
    // Planilha Geral
    planilhaGeralId: props.getProperty(PROPRIEDADES_GLOBAL.PLANILHA_GERAL_ID),
    
    // Bibliotecas
    libInventarioIdDev: props.getProperty(PROPRIEDADES_GLOBAL.LIB_INVENTARIO_ID_DEV),
    libVisionIdDev: props.getProperty(PROPRIEDADES_GLOBAL.LIB_VISION_ID_DEV),
    libInventarioIdProd: props.getProperty(PROPRIEDADES_GLOBAL.LIB_INVENTARIO_ID_PROD),
    libVisionIdProd: props.getProperty(PROPRIEDADES_GLOBAL.LIB_VISION_ID_PROD),
    
    // Configurações
    visionApiKey: props.getProperty(PROPRIEDADES_GLOBAL.VISION_API_KEY),
    ambienteAtivo: props.getProperty(PROPRIEDADES_GLOBAL.AMBIENTE_ATIVO) || 'DEV',
    
    // CSVs Gerais
    csvGeralRegistro: obterCSVGeralRegistro_()
  };
}

/**
 * Atualiza campos específicos da configuração global
 * @param {Object} atualizacoes - Objeto com campos a atualizar
 */
function atualizarSistemaGlobal_(atualizacoes) {
  const props = PropertiesService.getScriptProperties();
  
  // Pastas
  if (atualizacoes.pastaRaizId !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.PASTA_RAIZ_ID, atualizacoes.pastaRaizId);
  }
  if (atualizacoes.pastaSistemaId !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.PASTA_SISTEMA_ID, atualizacoes.pastaSistemaId);
  }
  if (atualizacoes.pastaGeralId !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.PASTA_GERAL_ID, atualizacoes.pastaGeralId);
  }
  if (atualizacoes.pastaCSVGeralId !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.PASTA_CSV_GERAL_ID, atualizacoes.pastaCSVGeralId);
  }
  if (atualizacoes.pastaContextoId !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.PASTA_CONTEXTO_ID, atualizacoes.pastaContextoId);
  }
  
  // Planilha Geral
  if (atualizacoes.planilhaGeralId !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.PLANILHA_GERAL_ID, atualizacoes.planilhaGeralId);
  }
  
  // Bibliotecas
  if (atualizacoes.libInventarioIdDev !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.LIB_INVENTARIO_ID_DEV, atualizacoes.libInventarioIdDev);
  }
  if (atualizacoes.libVisionIdDev !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.LIB_VISION_ID_DEV, atualizacoes.libVisionIdDev);
  }
  if (atualizacoes.libInventarioIdProd !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.LIB_INVENTARIO_ID_PROD, atualizacoes.libInventarioIdProd);
  }
  if (atualizacoes.libVisionIdProd !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.LIB_VISION_ID_PROD, atualizacoes.libVisionIdProd);
  }
  
  // Configurações
  if (atualizacoes.visionApiKey !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.VISION_API_KEY, atualizacoes.visionApiKey);
  }
  if (atualizacoes.ambienteAtivo !== undefined) {
    props.setProperty(PROPRIEDADES_GLOBAL.AMBIENTE_ATIVO, atualizacoes.ambienteAtivo);
  }
}

/**
 * Obtém ID da Planilha Geral (atalho)
 * @return {string|null}
 */
function obterPlanilhaGeralId_() {
  return PropertiesService
    .getScriptProperties()
    .getProperty(PROPRIEDADES_GLOBAL.PLANILHA_GERAL_ID);
}

/**
 * Define ID da Planilha Geral (atalho)
 * @param {string} id
 */
function setPlanilhaGeralId_(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('ID inválido para Planilha Geral.');
  }
  
  PropertiesService
    .getScriptProperties()
    .setProperty(PROPRIEDADES_GLOBAL.PLANILHA_GERAL_ID, id.trim());
}

/**
 * Obtém registro de CSVs Gerais
 * @return {Array}
 */
function obterCSVGeralRegistro_() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty(PROPRIEDADES_GLOBAL.CSV_GERAL_REGISTRO);
  
  if (!raw) return [];
  
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao parsear CSV_GERAL_REGISTRO:', e.message);
    return [];
  }
}

/**
 * Adiciona um CSV ao registro geral
 * @param {Object} csv - {nome, id, dataImportacao, linhas, tamanho}
 */
function adicionarCSVGeralRegistro_(csv) {
  const registro = obterCSVGeralRegistro_();
  
  // Evitar duplicatas
  const existe = registro.find(c => c.id === csv.id);
  if (existe) {
    console.warn('CSV já registrado:', csv.nome);
    return;
  }
  
  registro.push({
    nome: csv.nome,
    id: csv.id,
    dataImportacao: csv.dataImportacao || new Date().toISOString(),
    linhas: csv.linhas || 0,
    tamanho: csv.tamanho || 0
  });
  
  PropertiesService
    .getScriptProperties()
    .setProperty(PROPRIEDADES_GLOBAL.CSV_GERAL_REGISTRO, JSON.stringify(registro));
}

/**
 * Limpa todo o sistema global (usar com cuidado!)
 */
function limparSistemaGlobal_() {
  const props = PropertiesService.getScriptProperties();
  
  Object.values(PROPRIEDADES_GLOBAL).forEach(chave => {
    props.deleteProperty(chave);
  });
}
