/**
 * ============================================================
 * PROCESSAR IMAGENS — INVENTÁRIO
 * ============================================================
 * Responsabilidade:
 * - Validar contexto
 * - Validar pasta ativa
 * - Validar formatação das planilhas
 * - Adaptar contrato para Vision
 * - Delegar processamento
 * ============================================================
 */

function processarImagens_() {

  const ui = SpreadsheetApp.getUi();

  // ============================================================
  // 1️⃣ Resolver Contexto
  // ============================================================
  let contexto = resolverContextoAtual_();
  contexto = sincronizarLocalidadeAtiva_(contexto);

  if (!contexto || !contexto.pastaLocalidadesId) {
    ui.alert("❌ Nenhum contexto válido encontrado.");
    return;
  }

  // ============================================================
  // 2️⃣ Validar Pasta Ativa
  // ============================================================
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

  // ============================================================
  // 3️⃣ Validar Planilhas (ADMIN + GERAL)
  // ============================================================

  const planilhaAdminId = contexto.planilhaAdminId;
  const planilhaGeralId = obterPlanilhaGeralId_(); // 🔥 sempre global

  if (!planilhaAdminId || !planilhaGeralId) {
    ui.alert('❌ Planilhas obrigatórias não configuradas.');
    return;
  }

  const adminFormatada = validarPlanilhaFormatada_(planilhaAdminId);
  const geralFormatada = validarPlanilhaFormatada_(planilhaGeralId);

  if (!adminFormatada || !geralFormatada) {

    let mensagem = '⚠️ Antes de processar imagens, formate:\n\n';

    if (!adminFormatada) {
      mensagem += '• Planilha ADMIN\n';
    }

    if (!geralFormatada) {
      mensagem += '• Planilha GERAL\n';
    }

    mensagem += '\nUse o menu correspondente para formatar.';

    ui.alert('Formatação Necessária', mensagem, ui.ButtonSet.OK);
    return;
  }

  // ============================================================
  // 4️⃣ Confirmação do Usuário
  // ============================================================
  const confirmar = ui.alert(
    '🚀 Processar Fotos',
    `Processar imagens da pasta:\n"${pastaNome}"?`,
    ui.ButtonSet.YES_NO
  );

  if (confirmar !== ui.Button.YES) return;

  // ============================================================
  // 5️⃣ Montar Contexto Vision
  // ============================================================
  let contextoVision;

  try {

    contextoVision = montarContextoVision_({
      ...contexto,
      planilhaGeralId: planilhaGeralId // 🔥 FORÇA uso global
    });

    Logger.log('================ CONTEXTO VISION =================');
    Logger.log('planilhaContextoId: ' + contextoVision.planilhaContextoId);
    Logger.log('planilhaGeralId: ' + contextoVision.planilhaGeralId);
    Logger.log('pastaTrabalhoId: ' + contextoVision.pastaTrabalhoId);
    Logger.log('pastaTrabalhoNome: ' + contextoVision.pastaTrabalhoNome);
    Logger.log('corDestaque: ' + contextoVision.corDestaque);
    Logger.log('===================================================');

  } catch (e) {
    ui.alert('❌ Erro de configuração:\n\n' + e.message);
    return;
  }

  // ============================================================
  // 6️⃣ Delegar para Vision
  // ============================================================
  try {

    const resultado = vision.batchProcessarPastaCompleta(
      pastaId,
      contextoVision
    );

    Logger.log('[INVENTARIO] Processamento concluído.');
    Logger.log('[INVENTARIO] Resultado: ' + JSON.stringify(resultado));

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
