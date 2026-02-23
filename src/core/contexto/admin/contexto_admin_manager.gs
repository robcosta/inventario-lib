/**
 * ============================================================
 * CONTEXTO — ADMIN MANAGER (FONTE ÚNICA DA VERDADE)
 * ============================================================
 *
 * ❗ ÚNICO módulo autorizado a acessar ScriptProperties
 * ❗ Modelo 100% ID-based
 * ❗ Contrato canônico:
 *    - pastaContextoId
 *    - pastaPlanilhasId
 *    - pastaCSVAdminId
 *    - pastaLocalidadesId
 */

const CONTEXTO_KEYS = {
  PREFIXO: 'CONTEXTO_ADMIN_'
};

/* ============================================================
 * LEITURA
 * ============================================================ */

/**
 * Retorna o contexto ADMIN da planilha atual
 */
function obterContextoAtivo_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return {};

    const raw = PropertiesService
      .getScriptProperties()
      .getProperty(CONTEXTO_KEYS.PREFIXO + ss.getId());

    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    Logger.log('[CONTEXTO] Erro ao obter contexto: ' + e.message);
    return {};
  }
}

/**
 * Verifica se a planilha atual possui um contexto ADMIN válido
 */
function contextoAdminValido_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return false;

  const c = obterContextoAtivo_();
  if (!c) return false;

  const obrigatorios = [
    'planilhaAdminId',
    'pastaContextoId',
    'pastaPlanilhasId',
    'pastaCSVAdminId',
    'pastaLocalidadesId'
  ];

  for (const campo of obrigatorios) {
    if (!c[campo] || typeof c[campo] !== 'string') {
      return false;
    }
  }

  if (c.planilhaAdminId !== ss.getId()) return false;

  try {
    DriveApp.getFileById(c.planilhaAdminId);
    DriveApp.getFolderById(c.pastaContextoId);
    DriveApp.getFolderById(c.pastaPlanilhasId);
    DriveApp.getFolderById(c.pastaCSVAdminId);
    DriveApp.getFolderById(c.pastaLocalidadesId);
  } catch (e) {
    return false;
  }

  return true;
}

/* ============================================================
 * ESCRITA
 * ============================================================ */

function salvarContextoAdmin_(planilhaAdminId, contexto) {

  const obrigatorios = [
    'planilhaAdminId',
    'pastaContextoId',
    'pastaPlanilhasId',
    'pastaCSVAdminId',
    'pastaLocalidadesId'
  ];

  obrigatorios.forEach(campo => {
    if (!contexto[campo] || typeof contexto[campo] !== 'string') {
      throw new Error(
        `Contexto inválido para persistência: campo "${campo}" ausente`
      );
    }
  });

  PropertiesService
    .getScriptProperties()
    .setProperty(
      CONTEXTO_KEYS.PREFIXO + planilhaAdminId,
      JSON.stringify(contexto)
    );
}


function definirContextoAtivo_(contexto) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Planilha ativa inexistente.');

  contexto.planilhaAdminId = ss.getId();
  salvarContextoAdmin_(ss.getId(), contexto);
}

function limparContextoAtivo_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  PropertiesService
    .getScriptProperties()
    .deleteProperty(CONTEXTO_KEYS.PREFIXO + ss.getId());
}

/* ============================================================
 * LISTAGEM (AUTO-CLEAN)
 * ============================================================ */
function listarContextos_() {

  const props = PropertiesService.getScriptProperties().getProperties();
  const lista = [];

  Object.keys(props).forEach(chave => {

    if (!chave.startsWith(CONTEXTO_KEYS.PREFIXO)) return;

    try {

      const c = JSON.parse(props[chave]);

      if (!validarEstruturaContexto_(c)) {
        throw new Error('Estrutura inválida');
      }

      lista.push(c);

    } catch (e) {

      // 🔥 AUTO-LIMPEZA DE ÓRFÃO
      PropertiesService.getScriptProperties().deleteProperty(chave);
      Logger.log('[AUTO-CLEAN] Contexto removido automaticamente: ' + chave);
    }
  });

  return lista;
}


/* ============================================================
 * Validador contexto para onOpen () - Não usa DriveApp
 * ============================================================ */
function contextoAdminRegistrado_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return false;

  const c = obterContextoAtivo_();
  if (!c) return false;

  return (
    c.planilhaAdminId === ss.getId() &&
    typeof c.pastaContextoId === 'string' &&
    typeof c.pastaPlanilhasId === 'string' &&
    typeof c.pastaCSVAdminId === 'string' &&
    typeof c.pastaLocalidadesId === 'string'
  );
}

/**
 * ============================================================
 * ATUALIZA PARCIALMENTE O CONTEXTO ADMIN (PATCH)
 * ============================================================
 * - Mantém campos obrigatórios intactos
 * - Atualiza apenas campos informados
 * - Revalida antes de salvar
 */

function atualizarContextoAdmin_(patch) {

  if (!patch || typeof patch !== 'object') {
    throw new Error('atualizarContextoAdmin_: patch inválido.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Planilha ativa inexistente.');
  }

  const contextoAtual = obterContextoAtivo_();

  if (!contextoAtual || !contextoAtual.planilhaAdminId) {
    throw new Error('Nenhum contexto ativo para atualizar.');
  }

  const contextoAtualizado = {
    ...contextoAtual,
    ...patch,
    ultimaAtualizacao: new Date().toISOString()
  };

  salvarContextoAdmin_(ss.getId(), contextoAtualizado);

  return contextoAtualizado;
}
