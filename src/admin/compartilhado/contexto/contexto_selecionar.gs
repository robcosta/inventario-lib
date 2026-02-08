/**
 * ============================================================
 * CONTEXTO — SELEÇÃO
 * ============================================================
 */

function selecionarContextoTrabalho_() {

  const ui = SpreadsheetApp.getUi();
  
  Logger.log('=== SELECIONANDO CONTEXTO ===');

  const contextoAtual = obterContextoAtivo_();
  const contextos = listarContextos_();
  
  Logger.log('Contexto atual:', JSON.stringify(contextoAtual));
  Logger.log('Contextos disponíveis:', contextos.length);
  Logger.log('Contextos:', JSON.stringify(contextos));

  if (contextos.length === 0) {
    ui.alert('Não há contexto disponível para seleção.');
    return;
  }

    const selecao = montarMensagemSelecaoContexto_(contextoAtual, contextos);
  
    Logger.log('ID Atual:', selecao.idAtual);
    Logger.log('Nome Atual:', selecao.nomeAtual);

    if (selecao.erro === 'sem_contextos') {
      ui.alert('Não há contexto disponível para seleção.');
      return;
    }

    if (selecao.erro === 'apenas_atual') {
      ui.alert('Não há outros contextos disponíveis além do atual.');
      return;
    }

    const outrosContextos = selecao.outrosContextos;
    const mensagem = selecao.mensagem;

  const resp = ui.prompt(
    'Selecionar Contexto de Trabalho',
    mensagem,
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const indice = Number((resp.getResponseText() || '').trim().toUpperCase());

  if (!indice || indice < 1 || indice > outrosContextos.length) {
    ui.alert('Seleção inválida.');
    return;
  }

  const escolhido = outrosContextos[indice - 1];

  if (!escolhido.planilhaAdminId) {
    ui.alert('❌ ERRO: O contexto "' + escolhido.nome + '" não possui planilha ADMIN válida.');
    return;
  }

  // Validação: verificar se planilha ainda existe
  try {
    const fileTest = DriveApp.getFileById(escolhido.planilhaAdminId);
    Logger.log('[SELECIONAR_CONTEXTO] Planilha validada: ' + fileTest.getName());
  } catch (e) {
    ui.alert(
      '❌ ERRO: Não é possível acessar a planilha ADMIN do contexto "' + escolhido.nome + '".\n\n' +
      'A planilha foi deletada ou as permissões foram revogadas.'
    );
    return;
  }

  // ✅ Salvar contexto PENDENTE para a planilha de destino (não na atual!)
  Logger.log('[SELECIONAR_CONTEXTO] Salvando contexto pendente para planilha: ' + escolhido.planilhaAdminId);
  salvarContextoAdminPendente_(escolhido.planilhaAdminId, escolhido);

  abrirPlanilhaNoNavegador_(escolhido.planilhaAdminId);
}

  /**
   * Monta a mensagem e a lista de contextos para seleção.
   * Função pura para facilitar testes automatizados.
   */
  function montarMensagemSelecaoContexto_(contextoAtual, contextos) {
    const lista = Array.isArray(contextos) ? contextos : [];

    // Descobrir qual é o contexto atual pelo ID da planilha ADMIN
    let idAtual = null;
    let nomeAtual = 'NENHUMA';

    if (contextoAtual && contextoAtual.id) {
      idAtual = contextoAtual.id;
      nomeAtual = contextoAtual.nome || 'NENHUMA';
    }

    const encontrado = lista.find(ctx => ctx.planilhaAdminId === idAtual);
    if (encontrado) {
      nomeAtual = encontrado.nome;
    }

    if (lista.length === 0) {
      return { erro: 'sem_contextos', idAtual, nomeAtual, outrosContextos: [] };
    }

    // Filtrar para remover o contexto atual da lista de opções
    const outrosContextos = lista.filter(ctx => ctx.planilhaAdminId !== idAtual);
    if (outrosContextos.length === 0) {
      return { erro: 'apenas_atual', idAtual, nomeAtual, outrosContextos };
    }

    let mensagem =
      'Contexto atual: ' + nomeAtual +
      '\n\nSelecione o contexto que deseja abrir:\n\n';

    // Listar apenas os OUTROS contextos (sem o atual)
    outrosContextos.forEach((ctx, i) => {
      const indiceEmoji = obterIndiceEmoji_(i);
      mensagem += `${indiceEmoji} - ${ctx.nome}\n`;
    });

    return { mensagem, idAtual, nomeAtual, outrosContextos };
  }

  /**
   * Retorna o índice com emoji (1️⃣ a 🔟). Fallback para número simples.
   */
  function obterIndiceEmoji_(indiceZeroBased) {
    const numerosEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    return numerosEmoji[indiceZeroBased] || String(indiceZeroBased + 1);
  }
