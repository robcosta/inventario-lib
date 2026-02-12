/**
 * ============================================================
 * ÁREA DE FOTOS — UTILITÁRIOS
 * ============================================================
 * - Sincronização com Drive
 * - Abrir pasta ativa
 * - Recuperação se deletada
 */

function verificarSePastaExiste_(pastaId) {
  try {
    DriveApp.getFolderById(pastaId);
    return true;
  } catch (e) {
    return false;
  }
}
