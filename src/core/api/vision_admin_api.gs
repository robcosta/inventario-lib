/**
 * ============================================================
 * PROCESSAR IMAGENS — INVENTÁRIO
 * ============================================================
 * Responsabilidade:
 * - Validar contexto
 * - Validar pasta ativa
 * - Adaptar contrato para Vision
 * - Delegar processamento
 * ============================================================
 */

function processarImagens_() {

  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!contexto) {
    ui.alert('❌ Contexto não encontrado.');
    return;
  }

  const pastaId = contexto.localidadeAtivaId;
  const pastaNome = contexto.localidadeAtivaNome;

  if (!pastaId) {
    ui.alert('⚠️ Nenhuma pasta de fotos selecionada.');
    return;
  }

  try {
    DriveApp.getFolderById(pastaId);
  } catch (e) {
    ui.alert('⚠️ A pasta selecionada não existe ou está inacessível.');
    return;
  }

  const confirmar = ui.alert(
    '🚀 Processar Fotos',
    `Processar imagens da pasta:\n"${pastaNome}"?`,
    ui.ButtonSet.YES_NO
  );

  if (confirmar !== ui.Button.YES) return;

  let contextoVision;

  try {
    contextoVision = montarContextoVision_(contexto);
  } catch (e) {
    ui.alert('❌ Erro de configuração:\n\n' + e.message);
    return;
  }

  try {

    const resultado = vision.batchProcessarPastaCompleta(
      pastaId,
      contextoVision
    );

    ui.alert(
      '🏁 Processamento Finalizado',
      `Total: ${resultado.total}\n` +
      `✅ Sucesso: ${resultado.sucesso}\n` +
      `❌ Erros: ${resultado.erro}`,
      ui.ButtonSet.OK
    );

  } catch (e) {

    ui.alert(
      '❌ Erro no Processamento',
      e.message,
      ui.ButtonSet.OK
    );
  }
}

