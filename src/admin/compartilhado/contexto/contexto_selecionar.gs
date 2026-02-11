/**
 * ============================================================
 * CONTEXTO — SELEÇÃO
 * ============================================================
 *
 * Responsabilidades:
 * - Exibir UI de seleção de contexto
 * - Validar escolha do usuário
 * - Delegar ativação ao contexto_admin_manager
 *
 * ❗ NÃO acessa ScriptProperties
 * ❗ NÃO salva contexto diretamente
 * ❗ NÃO contém lógica de persistência
 */
function selecionarContextoTrabalho_() {
  const ui = SpreadsheetApp.getUi();

  const contextoAtual = obterContextoAtivo_();
  const contextos = listarContextos_();

  if (!Array.isArray(contextos) || contextos.length === 0) {
    ui.alert('Não há contextos disponíveis para seleção.');
    return;
  }

  const selecao = montarMensagemSelecaoContexto_(contextoAtual, contextos);

  if (selecao.erro === 'sem_outros') {
    ui.alert('Não há outros contextos disponíveis além do atual.');
    return;
  }

  const resp = ui.prompt(
    'Selecionar Contexto de Trabalho',
    selecao.mensagem,
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const indice = Number((resp.getResponseText() || '').trim());

  if (!indice || indice < 1 || indice > selecao.outrosContextos.length) {
    ui.alert('Seleção inválida.');
    return;
  }

  const escolhido = selecao.outrosContextos[indice - 1];

  if (!escolhido.planilhaAdminId) {
    ui.alert(
      '❌ O contexto selecionado não possui planilha ADMIN válida.'
    );
    return;
  }

  try {
    DriveApp.getFileById(escolhido.planilhaAdminId);
  } catch (e) {
    ui.alert(
      '❌ Não é possível acessar a planilha ADMIN do contexto selecionado.\n\n' +
      'A planilha pode ter sido removida ou você não tem permissão.'
    );
    return;
  }

  // 🚀 MODELO CORRETO:
  // NÃO altera contexto da planilha atual
  // Apenas abre a planilha do outro contexto

  abrirPlanilhaNoNavegador_(escolhido.planilhaAdminId);
}


/* ============================================================
 * FUNÇÕES AUXILIARES (PUROS)
 * ============================================================ */

/**
 * Monta a mensagem e separa os contextos selecionáveis.
 */
function montarMensagemSelecaoContexto_(contextoAtual, contextos) {
  const idAtual = contextoAtual && contextoAtual.planilhaAdminId
    ? contextoAtual.planilhaAdminId
    : null;

  const outrosContextos = contextos.filter(
    ctx => ctx.planilhaAdminId !== idAtual
  );

  if (outrosContextos.length === 0) {
    return { erro: 'sem_outros' };
  }

  outrosContextos.sort((a, b) => {
    const nomeA = (a.nome || '').toUpperCase();
    const nomeB = (b.nome || '').toUpperCase();
    return nomeA.localeCompare(nomeB);
  });

  let mensagem = 'Contexto atual: ' +
    (contextoAtual.nome || 'NENHUM') +
    '\n\nSelecione o contexto que deseja abrir:\n\n';

  outrosContextos.forEach((ctx, i) => {
    mensagem += `${i + 1} - ${ctx.nome}\n`;
  });

  return {
    mensagem,
    outrosContextos
  };
}
