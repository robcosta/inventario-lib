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

  // Descobrir qual é o contexto atual pelo ID da planilha ADMIN
  let idAtual = null;
  let nomeAtual = 'NENHUMA';
  
  if (contextoAtual && contextoAtual.id) {
    idAtual = contextoAtual.id;
    nomeAtual = contextoAtual.nome || 'NENHUMA';
  }
  
  Logger.log('ID Atual:', idAtual);
  Logger.log('Nome Atual:', nomeAtual);
  
  const encontrado = contextos.find(ctx => ctx.planilhaOperacionalId === idAtual);
  if (encontrado) {
    nomeAtual = encontrado.nome;
  }

  // Filtrar para remover o contexto atual da lista de opções
  const outrosContextos = contextos.filter(ctx => ctx.planilhaOperacionalId !== idAtual);
  
  if (outrosContextos.length === 0) {
    ui.alert('Não há outros contextos disponíveis além do atual.');
    return;
  }

  let mensagem =
    'Contexto atual: ' + nomeAtual +
    '\n\nSelecione o contexto que deseja abrir:\n\n';

  // Listar apenas os OUTROS contextos (sem o atual)
  const numerosEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
  outrosContextos.forEach((ctx, i) => {
    const indiceEmoji = numerosEmoji[i] || `${i + 1}`;
    mensagem += `${indiceEmoji} - ${ctx.nome}\n`;
  });

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

  if (!escolhido.planilhaOperacionalId) {
    ui.alert('❌ ERRO: O contexto "' + escolhido.nome + '" não possui planilha ADMIN válida.');
    return;
  }

  // Validação: verificar se planilha ainda existe
  try {
    const fileTest = DriveApp.getFileById(escolhido.planilhaOperacionalId);
    Logger.log('[SELECIONAR_CONTEXTO] Planilha validada: ' + fileTest.getName());
  } catch (e) {
    ui.alert(
      '❌ ERRO: Não é possível acessar a planilha ADMIN do contexto "' + escolhido.nome + '".\n\n' +
      'A planilha foi deletada ou as permissões foram revogadas.'
    );
    return;
  }

  // Salvar o nome do contexto
  atualizarContexto_({ nome: escolhido.nome });

  abrirPlanilhaNoNavegador_(escolhido.planilhaOperacionalId);
}
