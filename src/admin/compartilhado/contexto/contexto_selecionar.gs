/**
 * ============================================================
 * CONTEXTO — SELEÇÃO
 * ============================================================
 */

function selecionarContextoTrabalho_() {

  const ui = SpreadsheetApp.getUi();

  const contextoAtual = obterContextoAtivo_();
  let contextos = listarContextos_();

  // Remove o contexto atual da lista
  if (contextoAtual) {
    contextos = contextos.filter(
      ctx => ctx.nome !== contextoAtual.nome
    );
  }

  if (contextos.length === 0) {
    ui.alert('Não há outro contexto disponível para seleção.');
    return;
  }

  let mensagem =
    'Contexto atual: ' +
    (contextoAtual ? contextoAtual.nome : 'NENHUM') +
    '\n\nSelecione o contexto que deseja abrir:\n\n';

  contextos.forEach((ctx, i) => {
    mensagem += `${i + 1} - ${ctx.nome}\n`;
  });

  const resp = ui.prompt(
    'Selecionar Contexto de Trabalho',
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

  if (!escolhido.planilhaOperacionalId) {
    ui.alert(
      'O contexto "' + escolhido.nome + '" não possui planilha operacional associada.'
    );
    return;
  }

  abrirPlanilhaNoNavegador_(escolhido.planilhaOperacionalId);
}
