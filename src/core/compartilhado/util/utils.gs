/**
 * ============================================================
 * UTILITÁRIOS ADMINISTRATIVOS
 * ============================================================
 */

/**
 * Obtém a pasta raiz do inventário.
 * Prioridade:
 * 1) ID global salvo em ScriptProperties
 * 2) Descoberta por ancestrais da planilha ativa (sem usar pasta direta cegamente)
 *
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function obterPastaInventario_() {
  const sistemaGlobal = obterSistemaGlobal_() || {};

  const pastaRaizSalva = obterPastaPorIdSeguro_(sistemaGlobal.pastaRaizId);
  if (pastaRaizSalva) {
    return pastaRaizSalva;
  }

  const pastaDescoberta = descobrirPastaRaizInventarioPelosAncestrais_();
  if (pastaDescoberta) {
    atualizarSistemaGlobal_({ pastaRaizId: pastaDescoberta.getId() });
    return pastaDescoberta;
  }

  return null;
}

/**
 * Busca pasta por ID de forma segura.
 * @param {string} id
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function obterPastaPorIdSeguro_(id) {
  const folderId = String(id || '').trim();
  if (!folderId) return null;

  try {
    return DriveApp.getFolderById(folderId);
  } catch (e) {
    return null;
  }
}

/**
 * Descobre a raiz do inventário subindo a árvore de pais da planilha ativa.
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function descobrirPastaRaizInventarioPelosAncestrais_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;

  try {
    const arquivo = DriveApp.getFileById(ss.getId());
    const paisDiretos = arquivo.getParents();

    while (paisDiretos.hasNext()) {
      let pastaAtual = paisDiretos.next();
      let profundidade = 0;

      while (pastaAtual && profundidade < 10) {
        if (pastaPareceRaizInventario_(pastaAtual)) {
          return pastaAtual;
        }

        const nomeAtual = String(pastaAtual.getName() || '').toUpperCase();
        if (
          nomeAtual === 'TEMPLATES' ||
          nomeAtual === 'TEMPLATE' ||
          nomeAtual === 'CONTEXTOS' ||
          nomeAtual === 'GERAL'
        ) {
          const pais = pastaAtual.getParents();
          if (pais.hasNext()) {
            const pai = pais.next();
            if (pastaPareceRaizInventario_(pai)) {
              return pai;
            }
          }
        }

        const pais = pastaAtual.getParents();
        if (!pais.hasNext()) break;
        pastaAtual = pais.next();
        profundidade++;
      }
    }
  } catch (e) {
    Logger.log('[UTILS] Falha ao descobrir raiz pelos ancestrais: ' + e.message);
  }

  return null;
}

/**
 * Heurística de identificação da pasta raiz do inventário.
 * @param {GoogleAppsScript.Drive.Folder} pasta
 * @return {boolean}
 */
function pastaPareceRaizInventario_(pasta) {
  if (!pasta) return false;

  try {
    return (
      pastaTemSubpasta_(pasta, 'CONTEXTOS') ||
      pastaTemSubpasta_(pasta, 'GERAL') ||
      pastaTemSubpasta_(pasta, 'TEMPLATES') ||
      pastaTemSubpasta_(pasta, 'TEMPLATE')
    );
  } catch (e) {
    return false;
  }
}

/**
 * Verifica se uma pasta contém subpasta com nome exato.
 * @param {GoogleAppsScript.Drive.Folder} pasta
 * @param {string} nome
 * @return {boolean}
 */
function pastaTemSubpasta_(pasta, nome) {
  if (!pasta || !nome) return false;
  return pasta.getFoldersByName(nome).hasNext();
}

/**
 * ============================================================
 * DRIVE — SUBPASTA (OBTER OU CRIAR)
 * ============================================================
 * Retorna uma subpasta existente ou cria se não existir.
 *
 * @param {GoogleAppsScript.Drive.Folder} pastaPai
 * @param {string} nomeSubpasta
 * @return {GoogleAppsScript.Drive.Folder}
 */
function obterOuCriarSubpasta_(pastaPai, nomeSubpasta) {
  if (!pastaPai) {
    throw new Error('obterOuCriarSubpasta_: pastaPai inválida.');
  }

  if (!nomeSubpasta || typeof nomeSubpasta !== 'string') {
    throw new Error('obterOuCriarSubpasta_: nomeSubpasta inválido.');
  }

  const it = pastaPai.getFoldersByName(nomeSubpasta);
  return it.hasNext()
    ? it.next()
    : pastaPai.createFolder(nomeSubpasta);
}
