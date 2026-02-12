/**
 * ============================================================
 * PROCESSADOR DE IMAGENS v4.0 — ID-BASED (LOCALIDADE)
 * ============================================================
 * Orquestra o processamento de imagens da pasta ativa
 * (localidade) utilizando inventario-vision-core.
 *
 * ✔ 100% ID-based
 * ✔ Sem uso de pastaTrabalhoId legado
 * ✔ Sem controle de cor (responsabilidade da Vision)
 * ============================================================
 */
function processarImagem() {

  const ui = SpreadsheetApp.getUi();
  const contextoAtivo = obterContextoAtivo_();

  // ============================================================
  // PASSO 1 — VALIDAR CONTEXTO
  // ============================================================

  if (!contextoAtivo || !contextoAtivo.localidadeAtivaId) {
    ui.alert(
      '⚠️ Nenhuma pasta de fotos ativa',
      'Selecione uma pasta em:\n\n📂 Área de Fotos > 🔁 Trocar Pasta',
      ui.ButtonSet.OK
    );
    return;
  }

  // Validar existência da pasta
  if (!verificarSePastaExiste_(contextoAtivo.localidadeAtivaId)) {
    ui.alert(
      '⚠️ Pasta de fotos inexistente',
      'A pasta ativa foi removida ou está na lixeira.\n\n' +
      'Selecione outra pasta.',
      ui.ButtonSet.OK
    );
    return;
  }

  const pastaId = contextoAtivo.localidadeAtivaId;
  const nomePasta = contextoAtivo.localidadeAtivaNome || 'Sem nome';

  // ============================================================
  // PASSO 2 — VALIDAR FORMATAÇÃO DAS PLANILHAS
  // ============================================================

  const contextoFormatado = validarPlanilhaContextoFormatada_();
  const geralFormatado = validarPlanilhaGeralFormatada_();

  if (!contextoFormatado || !geralFormatado) {

    let planilhasNaoFormatadas = [];
    if (!contextoFormatado) planilhasNaoFormatadas.push('📋 Contexto');
    if (!geralFormatado) planilhasNaoFormatadas.push('📋 Geral');

    const resposta = ui.alert(
      '⚠️ Planilhas Não Formatadas',
      'Processamento requer planilhas formatadas.\n\n' +
      'Planilha(s) pendente(s):\n' +
      planilhasNaoFormatadas.join('\n') +
      '\n\nDeseja formatar agora?',
      ui.ButtonSet.YES_NO
    );

    if (resposta !== ui.Button.YES) {
      ui.alert(
        '❌ Cancelado',
        'Formate as planilhas antes de processar.',
        ui.ButtonSet.OK
      );
      return;
    }

    try {
      if (!contextoFormatado) formatarPlanilhaContexto_();
      if (!geralFormatado) formatarPlanilhaGeral_();

      ui.alert(
        '✅ Formatação Concluída',
        'Planilhas formatadas.\n\n' +
        'Execute "Processar Imagens" novamente.',
        ui.ButtonSet.OK
      );

    } catch (e) {
      ui.alert(
        '❌ Erro na Formatação',
        e.message,
        ui.ButtonSet.OK
      );
    }

    return;
  }

  // ============================================================
  // PASSO 3 — VALIDAR PLANILHA GERAL CONFIGURADA
  // ============================================================

  if (!contextoAtivo.planilhaGeralId) {

    const planilhaGeralId = obterPlanilhaGeralId_();

    if (!planilhaGeralId) {
      ui.alert(
        '⚠️ Planilha Geral não configurada',
        'Menu:\n📘 Planilha Geral > 🧱 Criar / Recriar',
        ui.ButtonSet.OK
      );
      return;
    }

    try {
      SpreadsheetApp.openById(planilhaGeralId);
      contextoAtivo.planilhaGeralId = planilhaGeralId;
    } catch (e) {
      ui.alert(
        '⚠️ Planilha Geral inacessível',
        'Recrie pelo menu:\n📘 Planilha Geral > 🧱 Criar / Recriar',
        ui.ButtonSet.OK
      );
      return;
    }
  }

  // ============================================================
  // PASSO 4 — CONFIRMAÇÃO DO USUÁRIO
  // ============================================================

  const confirmacao = ui.alert(
    '🚀 Processar Imagens',
    `Contexto: ${contextoAtivo.nome}\n` +
    `Pasta: ${nomePasta}\n\n` +
    'Deseja continuar?',
    ui.ButtonSet.YES_NO
  );

  if (confirmacao !== ui.Button.YES) {
    ui.alert('❌ Cancelado pelo usuário.', ui.ButtonSet.OK);
    return;
  }

  // ============================================================
  // PASSO 5 — CHAMAR VISION VIA WRAPPER
  // ============================================================

  let resultado;

  try {

    resultado = processarPastaComVision_(contextoAtivo, {
      pastaId: pastaId,
      maxTentativas: 3,
      delayMs: 1500,
      callbacks: {
        onInicio: (info) =>
          console.log('🚀 Iniciado:', JSON.stringify(info)),
        onSucesso: (info) =>
          console.log('✅ Sucesso:', JSON.stringify(info)),
        onErro: (erro) =>
          console.error('❌ Erro:', erro.mensagem),
        onTentativa: (info) =>
          console.log(`🔁 Tentativa ${info.tentativa}/${info.total}`)
      }
    });

  } catch (e) {
    ui.alert(
      '❌ Erro no Processamento',
      e.message,
      ui.ButtonSet.OK
    );
    return;
  }

  // ============================================================
  // PASSO 6 — FEEDBACK FINAL
  // ============================================================

  let feedback;

  if (resultado.sucesso) {
    feedback = obterFeedbackCompleto_(
      resultado,
      contextoAtivo.planilhaAdminId
    );
  } else {
    feedback = {
      sucesso: false,
      titulo: '❌ Processamento Falhou',
      mensagem: resultado.detalhes?.mensagem || 'Erro desconhecido',
      tempo_ms: resultado.tempo_ms
    };
  }

  let mensagemFinal = feedback.titulo + '\n\n';

  if (feedback.resumo) {
    mensagemFinal += `✅ Sucesso: ${feedback.resumo.sucesso}\n`;
    mensagemFinal += `❌ Erro: ${feedback.resumo.erro}\n`;
    mensagemFinal += `📊 Taxa: ${feedback.resumo.percentual}%\n\n`;

    if (feedback.erros_amostra?.length > 0) {
      mensagemFinal += 'Erros encontrados:\n';
      mensagemFinal += feedback.erros_amostra.join('\n') + '\n';
    }
  } else {
    mensagemFinal += feedback.mensagem + '\n';
  }

  mensagemFinal += `\n⏱️ Tempo: ${feedback.tempo_ms}ms`;

  ui.alert(feedback.titulo, mensagemFinal, ui.ButtonSet.OK);

  console.log('=== PROCESSAMENTO COMPLETO ===');
  console.log(JSON.stringify(feedback, null, 2));
}
