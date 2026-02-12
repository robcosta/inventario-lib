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