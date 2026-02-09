/**
 * ============================================================
 * CONTEXTO — ADMIN MANAGER (FONTE ÚNICA DA VERDADE)
 * ============================================================
 *
 * Responsabilidades:
 * - Ler e salvar CONTEXTO_ADMIN
 * - Definir contexto ativo
 * - Validar vínculo com planilha ADMIN
 * - Listar contextos existentes
 *
 * ❗ ÚNICO módulo autorizado a acessar ScriptProperties
 * ❗ ID-based (planilhaAdminId)
 */

const CONTEXTO_KEYS = {
  ATIVO: 'CONTEXTO_ADMIN_ATIVO',
  PREFIXO: 'CONTEXTO_ADMIN_'
};

/* ============================================================
 * LEITURA
 * ============================================================ */

/**
 * Retorna o contexto ADMIN ativo da planilha atual.
 * Retorna {} se não existir ou se não for válido.
 */
function obterContextoAtivo_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return {};

    const planilhaId = ss.getId();
    const props = PropertiesService.getScriptProperties();
    const raw = props.getProperty(CONTEXTO_KEYS.PREFIXO + planilhaId);

    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    Logger.log('[CONTEXTO] Erro ao obter contexto ativo: ' + e.message);
    return {};
  }
}

/**
 * Verifica se a planilha atual possui um contexto válido.
 */
function planilhaTemContexto_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return false;

  const contexto = obterContextoAtivo_();
  return !!(
    contexto &&
    contexto.planilhaAdminId &&
    contexto.planilhaAdminId === ss.getId()
  );
}

/* ============================================================
 * ESCRITA
 * ============================================================ */

/**
 * Salva o contexto ADMIN para uma planilha específica.
 */
function salvarContextoAdmin_(planilhaAdminId, contexto) {
  if (!planilhaAdminId || !contexto) {
    throw new Error('salvarContextoAdmin_: parâmetros inválidos.');
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(
      CONTEXTO_KEYS.PREFIXO + planilhaAdminId,
      JSON.stringify(contexto)
    );
}

/**
 * Define o contexto como ativo na planilha ADMIN atual.
 */
function definirContextoAtivo_(contexto) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('definirContextoAtivo_: planilha ativa inexistente.');
  }

  contexto.planilhaAdminId = ss.getId();
  salvarContextoAdmin_(ss.getId(), contexto);
}

/**
 * Remove o contexto da planilha ADMIN atual.
 */
function limparContextoAtivo_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  PropertiesService
    .getScriptProperties()
    .deleteProperty(CONTEXTO_KEYS.PREFIXO + ss.getId());
}

/* ============================================================
 * CRIAÇÃO
 * ============================================================ */

/**
 * Cria um novo contexto ADMIN e o define como ativo.
 */
function criarContexto_(dadosContexto) {
  if (!dadosContexto || typeof dadosContexto !== 'object') {
    throw new Error('criarContexto_: dados inválidos.');
  }

  definirContextoAtivo_(dadosContexto);
  return dadosContexto;
}

/* ============================================================
 * LISTAGEM
 * ============================================================ */

/**
 * Lista apenas contextos ADMIN válidos.
 * Um contexto é válido somente se:
 * - existir no ScriptProperties
 * - a planilha ADMIN existir
 * - a pasta do contexto existir
 *
 * Contextos inválidos são removidos automaticamente.
 */
function listarContextos_() {
  const props = PropertiesService.getScriptProperties().getProperties();
  const lista = [];

  Object.keys(props).forEach(chave => {
    if (!chave.startsWith('CONTEXTO_ADMIN_')) return;

    try {
      const contexto = JSON.parse(props[chave]);
      if (!contexto || !contexto.planilhaAdminId || !contexto.pastaContextoId) {
        throw new Error('Contexto incompleto');
      }

      // 1️⃣ Validar planilha ADMIN
      try {
        DriveApp.getFileById(contexto.planilhaAdminId);
      } catch (e) {
        throw new Error('Planilha ADMIN inexistente');
      }

      // 2️⃣ Validar pasta do contexto
      try {
        DriveApp.getFolderById(contexto.pastaContextoId);
      } catch (e) {
        throw new Error('Pasta do contexto inexistente');
      }

      // 3️⃣ Contexto válido
      lista.push(contexto);

    } catch (e) {
      // ❌ Contexto inválido → remover definitivamente
      PropertiesService
        .getScriptProperties()
        .deleteProperty(chave);

      Logger.log(
        '[CONTEXTO] Contexto removido automaticamente: ' +
        chave +
        ' | Motivo: ' +
        e.message
      );
    }
  });

  return lista;
}


