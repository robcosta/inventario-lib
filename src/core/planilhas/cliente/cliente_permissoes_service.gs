/**
 * ============================================================
 * CLIENTE — SERVICE DE PERMISSÕES
 * ============================================================
 *
 * Responsável por obter as permissões reais da planilha Cliente.
 *
 * Retorna objeto padronizado:
 * {
 *   proprietario: string,
 *   editor: string,
 *   leitor: string
 * }
 *
 * ⚠️ Não renderiza.
 * ⚠️ Não manipula células.
 * ⚠️ Apenas consulta Drive.
 *
 * ============================================================
 */
function obterPermissoesCliente_(contexto) {

  if (!contexto || !contexto.planilhaClienteId) {
    return {
      proprietario: "-",
      editor: "-",
      leitor: "-"
    };
  }

  try {

    const file = DriveApp.getFileById(contexto.planilhaClienteId);

    const proprietario = file.getOwner();
    const editores = file.getEditors();
    const leitores = file.getViewers();

    return {

      proprietario: proprietario
        ? proprietario.getEmail()
        : "-",

      editor: editores.length > 0
        ? editores.map(u => u.getEmail()).join('\n')
        : "-",

      leitor: leitores.length > 0
        ? leitores.map(u => u.getEmail()).join('\n')
        : "-"
    };

  } catch (e) {

    Logger.log('[CLIENTE] Erro ao obter permissões: ' + e.message);

    return {
      proprietario: "-",
      editor: "-",
      leitor: "-"
    };
  }
}