/**
 * ============================================================
 * CONTEXTO — SELEÇÃO
 * ============================================================
 */

function selecionarContextoTrabalho_() {

  const ui = SpreadsheetApp.getUi();

  const contextoAtual = obterContextoAtivo_();
  const contextos = listarContextos_();

  if (contextos.length === 0) {
    ui.alert('Nenhum contexto encontrado.');
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
      'Não foi possível localizar a planilha operacional do contexto "' +
      escolhido.nome + '".'
    );
    return;
  }


  if (contextoAtual && escolhido.nome === contextoAtual.nome) {
    ui.alert('Este já é o contexto atual.');
    return;
  }

  SpreadsheetApp.openById(escolhido.planilhaOperacionalId);

  ui.alert(
    'O contexto "' + escolhido.nome + '" foi aberto.\n\n' +
    'Você pode fechar esta aba se desejar.'
  );
}

/*
  const ui = SpreadsheetApp.getUi();
  const contextos = _admin_listarContextos();

  if (!contextos.length) {
    ui.alert('Nenhum contexto encontrado.');
    return;
  }


  let msg = 'Selecione o contexto:\n\n';
  contextos.forEach((c, i) => msg += `${i + 1} - ${c.nome}\n`);

  const resp = ui.prompt('Selecionar Contexto', msg, ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const idx = Number(resp.getResponseText());
  if (!idx || idx < 1 || idx > contextos.length) {
    ui.alert('Seleção inválida.');
    return;
  }

  SpreadsheetApp.openById(contextos[idx - 1].planilhaOperacionalId);
}
*/
