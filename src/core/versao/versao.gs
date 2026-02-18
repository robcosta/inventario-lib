/**
 * ============================================================
 * SISTEMA — VERSÃO ATUAL
 * ============================================================
 * Fonte única da verdade da versão do projeto.
 */

/**
 * Versão semântica (definida SOMENTE quando houver tag Git)
 * Ex: v1.0.0, v1.2.3
 */
const SISTEMA_VERSAO = 'v0.17.0';
const SISTEMA_BUILD = 'refatoracao-contexto-admin';
const SISTEMA_DATA = '2026-02-08';

/**
 * Retorna a versão atual do sistema.
 */
function obterVersaoSistema_() {
  return {
    versao: SISTEMA_VERSAO,
    build: SISTEMA_BUILD,
    data: SISTEMA_DATA
  };
}

/**
 * Mostra a versão do sistema em um alerta (diagnóstico)
 */
function  mostrarVersaoSistema_() {
  const v = obterVersaoSistema_();
  SpreadsheetApp.getUi().alert(
    'Versão do sistema\n\n' +
    v.versao +
    ' (' +
    v.build +
    ')\n' +
    v.data
  );
}
