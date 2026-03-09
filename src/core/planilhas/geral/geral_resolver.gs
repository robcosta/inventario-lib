/**
 * ============================================================
 * RESOLVE ID DA PLANILHA GERAL (DINAMICO)
 * ============================================================
 * - Prioridade: ScriptProperties
 * - Fallback: redescoberta na pasta GERAL
 * ============================================================
 */
function resolverPlanilhaGeralId_() {
  const mensagemErro = 'Planilha Geral ainda nao foi criada.';
  const sistemaGlobal = obterSistemaGlobal_() || {};
  const props = PropertiesService.getScriptProperties();

  function validarIdPlanilha_(idPossivel) {
    const id = String(idPossivel || '').trim();
    if (!id) return null;

    try {
      SpreadsheetApp.openById(id);
      return id;
    } catch (e) {
      return null;
    }
  }

  // 1) Prioridade: ID salvo em ScriptProperties
  const idSalvo = validarIdPlanilha_(sistemaGlobal.planilhaGeralId);
  if (idSalvo) {
    return idSalvo;
  }

  // 1.1) Compatibilidade: chave canonica fixa em ScriptProperties
  const idCanonico = validarIdPlanilha_(props.getProperty('PLANILHA_GERAL_ID'));
  if (idCanonico) {
    atualizarSistemaGlobal_({ planilhaGeralId: idCanonico });
    return idCanonico;
  }

  // 1.2) Compatibilidade: se a constante foi preenchida com um ID por engano
  const valorConstante = String(PROPRIEDADES_GLOBAL.PLANILHA_GERAL_ID || '').trim();
  const idNaConstante = validarIdPlanilha_(valorConstante);
  if (idNaConstante) {
    Logger.log('[GERAL] Detectado ID de planilha no valor da constante PLANILHA_GERAL_ID. Sincronizando ScriptProperties.');
    atualizarSistemaGlobal_({ planilhaGeralId: idNaConstante });
    return idNaConstante;
  }

  Logger.log('[GERAL] PLANILHA_GERAL_ID nao encontrado ou invalido. Tentando redescobrir no Drive.');

  // 2) Fallback: localizar pasta GERAL e escolher planilha candidata
  const pastaGeral = resolverPastaGeralFallback_(sistemaGlobal);
  if (!pastaGeral) {
    throw new Error(mensagemErro);
  }

  const planilha = localizarPlanilhaGeralNaPasta_(pastaGeral);
  if (!planilha) {
    throw new Error(mensagemErro);
  }

  // 3) Sincroniza para as proximas execucoes
  atualizarSistemaGlobal_({
    pastaGeralId: pastaGeral.getId(),
    planilhaGeralId: planilha.getId()
  });

  return planilha.getId();
}

/**
 * Resolve a pasta GERAL usando IDs globais disponiveis.
 * Nao cria pastas novas (fallback de leitura apenas).
 *
 * @param {Object} sistemaGlobal
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function resolverPastaGeralFallback_(sistemaGlobal) {
  // 1) Tenta ID direto da pasta GERAL
  const pastaGeralId = String(sistemaGlobal.pastaGeralId || '').trim();
  if (pastaGeralId) {
    try {
      return DriveApp.getFolderById(pastaGeralId);
    } catch (e) {
      Logger.log('[GERAL] PASTA_GERAL_ID invalido/inacessivel.');
    }
  }

  // 2) Tenta derivar a pasta GERAL a partir da pasta CSV_GERAL
  const pastaCSVGeralId = String(sistemaGlobal.pastaCSVGeralId || '').trim();
  if (pastaCSVGeralId) {
    try {
      const pastaCSV = DriveApp.getFolderById(pastaCSVGeralId);
      const pais = pastaCSV.getParents();
      if (pais.hasNext()) {
        const pastaPai = pais.next();
        if (String(pastaPai.getName() || '').toUpperCase() === 'GERAL') {
          return pastaPai;
        }
      }
    } catch (e) {
      Logger.log('[GERAL] Nao foi possivel usar PASTA_CSV_GERAL_ID para redescobrir a pasta GERAL.');
    }
  }

  // 3) Tenta localizar "GERAL" a partir da pasta raiz global
  const pastaRaizId = String(sistemaGlobal.pastaRaizId || '').trim();
  if (pastaRaizId) {
    try {
      const pastaRaiz = DriveApp.getFolderById(pastaRaizId);
      const pastaGeralPorRaiz = localizarSubpastaPorNome_(pastaRaiz, 'GERAL');
      if (pastaGeralPorRaiz) {
        return pastaGeralPorRaiz;
      }
    } catch (e) {
      Logger.log('[GERAL] Nao foi possivel usar PASTA_RAIZ_ID para localizar a pasta GERAL.');
    }
  }

  // 4) Ultimo fallback: procurar "GERAL" nos ancestrais da planilha ativa
  const pastaGeralPorEstrutura = localizarPastaGeralNosAncestraisDaPlanilhaAtiva_();
  if (pastaGeralPorEstrutura) {
    return pastaGeralPorEstrutura;
  }

  return null;
}

/**
 * Seleciona a melhor candidata de Planilha Geral dentro da pasta GERAL.
 * Prioriza nomes iniciando com "GERAL"; em empate, usa a mais recente.
 *
 * @param {GoogleAppsScript.Drive.Folder} pastaGeral
 * @return {GoogleAppsScript.Drive.File|null}
 */
function localizarPlanilhaGeralNaPasta_(pastaGeral) {
  const files = pastaGeral.getFilesByType(MimeType.GOOGLE_SHEETS);
  let melhor = null;

  while (files.hasNext()) {
    const atual = files.next();
    try {
      SpreadsheetApp.openById(atual.getId()); // valida acesso/existencia
    } catch (e) {
      Logger.log('[GERAL] Ignorando planilha inacessivel: ' + atual.getId());
      continue;
    }

    if (!melhor) {
      melhor = atual;
      continue;
    }

    const nomeAtual = String(atual.getName() || '').toUpperCase();
    const nomeMelhor = String(melhor.getName() || '').toUpperCase();
    const atualEhGeral = nomeAtual.startsWith('GERAL');
    const melhorEhGeral = nomeMelhor.startsWith('GERAL');

    if (atualEhGeral && !melhorEhGeral) {
      melhor = atual;
      continue;
    }

    if (atualEhGeral === melhorEhGeral && atual.getLastUpdated() > melhor.getLastUpdated()) {
      melhor = atual;
    }
  }

  return melhor;
}

/**
 * Retorna subpasta por nome sem criar.
 *
 * @param {GoogleAppsScript.Drive.Folder} pastaPai
 * @param {string} nome
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function localizarSubpastaPorNome_(pastaPai, nome) {
  if (!pastaPai || !nome) return null;
  const it = pastaPai.getFoldersByName(nome);
  return it.hasNext() ? it.next() : null;
}

/**
 * Procura pasta "GERAL" nos ancestrais da planilha ativa.
 * Nao cria pasta nova.
 *
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function localizarPastaGeralNosAncestraisDaPlanilhaAtiva_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return null;

    const arquivo = DriveApp.getFileById(ss.getId());
    const paisDiretos = arquivo.getParents();

    while (paisDiretos.hasNext()) {
      let pastaAtual = paisDiretos.next();
      let profundidade = 0;

      while (pastaAtual && profundidade < 10) {
        const candidata = localizarSubpastaPorNome_(pastaAtual, 'GERAL');
        if (candidata) {
          return candidata;
        }

        const pais = pastaAtual.getParents();
        if (!pais.hasNext()) break;
        pastaAtual = pais.next();
        profundidade++;
      }
    }
  } catch (e) {
    Logger.log('[GERAL] Nao foi possivel localizar pasta GERAL pelos ancestrais da planilha ativa.');
  }

  return null;
}
