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

  // Descobrir qual é a pasta atual pelo ID
  // Tentar primeiro planilhaContextoId (é o campo que sempre existe)
  let idAtual = null;
  if (contextoAtual && contextoAtual.planilhaContextoId) {
    idAtual = contextoAtual.planilhaContextoId;
  } else if (contextoAtual && contextoAtual.planilhaOperacionalId) {
    idAtual = contextoAtual.planilhaOperacionalId;
  }
  let nomeAtual = 'NENHUMA';
  
  Logger.log('ID Atual:', idAtual);
  
  const encontrado = contextos.find(ctx => ctx.planilhaOperacionalId === idAtual || ctx.planilhaContextoId === idAtual);
  if (encontrado) {
    nomeAtual = encontrado.nome;
  }
  
  Logger.log('Nome Atual:', nomeAtual);

  let mensagem =
    'Pasta atual: ' + nomeAtual +
    '\n\nSelecione o contexto que deseja abrir:\n\n';

  // Listar TODAS as pastas, marcando a atual com ✓
  contextos.forEach((ctx, i) => {
    const marcador = (ctx.planilhaOperacionalId === idAtual || ctx.planilhaContextoId === idAtual) ? '✓ ' : '';
    mensagem += `${i + 1} - ${marcador}${ctx.nome}\n`;
  });

  const resp = ui.prompt(
    'Escolher pasta de trabalho',
    mensagem,
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const indice = Number(resp.getResponseText());

  if (!indice || indice < 1 || indice > contextos.length) {
    ui.alert('Seleção inválida.');
    return;
  }

  const escolhido = contextos[indice - 1];

  // Se escolheu a atual, apenas avisa
  if (escolhido.planilhaOperacionalId === idAtual || escolhido.planilhaContextoId === idAtual) {
    ui.alert(`Você já está na pasta "${escolhido.nome}".`);
    return;
  }

  if (!escolhido.planilhaOperacionalId) {
    ui.alert(
      'O contexto "' + escolhido.nome + '" não possui planilha operacional associada.'
    );
    return;
  }

  // Salvar o nome do contexto
  atualizarContexto_({ nome: escolhido.nome });

  abrirPlanilhaNoNavegador_(escolhido.planilhaOperacionalId);
}
