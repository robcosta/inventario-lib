/**
 * ============================================================
 * UTILITÁRIOS ADMINISTRATIVOS
 * ============================================================
 */

/**
 * Obtém a pasta raiz do inventário
 * Prioridade: ScriptProperties -> Pasta mãe da planilha ativa
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function obterPastaInventario_() {
  // 1️⃣ Tentar via configuração global (ID)
  const sistemaGlobal = obterSistemaGlobal_();
  
  if (sistemaGlobal.pastaRaizId) {
    try {
      return DriveApp.getFolderById(sistemaGlobal.pastaRaizId);
    } catch (e) {
      Logger.log('[UTILS] ID salvo inválido, tentando obter pela planilha ativa...');
    }
  }

  // 2️⃣ Fallback: obter pasta mãe da planilha ativa (ID)
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;

  const arquivo = DriveApp.getFileById(ss.getId());
  const pais = arquivo.getParents();
  if (!pais.hasNext()) return null;

  const pasta = pais.next();

  // 3️⃣ Sincroniza o ID para uso futuro
  atualizarSistemaGlobal_({ pastaRaizId: pasta.getId() });
  
  return pasta;
}

/**
 * Obtém ou cria uma subpasta
 * @param {GoogleAppsScript.Drive.Folder} pai
 * @param {string} nome
 * @return {GoogleAppsScript.Drive.Folder}
 */
function obterOuCriarSubpasta_(pai, nome) {
  const it = pai.getFoldersByName(nome);
  return it.hasNext() ? it.next() : pai.createFolder(nome);
}

/**
 * Verifica se a planilha tem contexto admin
 * @return {boolean}
 */
function admin_planilhaTemContexto_() {
  return planilhaTemContextoAdmin_();
}

/**
 * ============================================================
 * ABRIR PLANILHA NO NAVEGADOR (NOVA ABA)
 * ============================================================
 */

function abrirPlanilhaNoNavegador_(spreadsheetId) {

  const url =
    'https://docs.google.com/spreadsheets/d/' + spreadsheetId;

  const html = `
    <script>
      window.open('${url}', '_blank');
      google.script.host.close();
    </script>
  `;

  const dialog = HtmlService
    .createHtmlOutput(html)
    .setWidth(10)
    .setHeight(10);

  SpreadsheetApp
    .getUi()
    .showModalDialog(dialog, 'Abrindo planilha...');
}

/**
 * ============================================================
 * UI — TOAST
 * ============================================================
 */

function toast_(mensagem, titulo, tempo) {
  const ss = SpreadsheetApp.getActive();
  ss.toast(
    mensagem,
    titulo || 'Inventário',
    tempo || 5
  );
}
