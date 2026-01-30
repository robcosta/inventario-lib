/**
 * ============================================================
 * PASTAS DE TRABALHO — ESCOLHER
 * ============================================================
 */
function escolherPastaTrabalho_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!contexto) {
    ui.alert('Nenhum contexto ativo.');
    return;
  }

  if (!contexto.pastaUnidadeId) {
    ui.alert('Nenhuma pasta de trabalho foi criada ainda.');
    return;
  }

  const pastaRaiz = DriveApp.getFolderById(contexto.pastaUnidadeId);
  const pastaAtualId = contexto.pastaTrabalhoId; // ID da pasta atualmente ativa
  const pastaAtualNome = contexto.pastaTrabalhoNome; // Nome da pasta atualmente ativa
  
  const pastasTexto = [];
  const mapa = {};
  let index = 1;
  const it = pastaRaiz.getFolders();

  while (it.hasNext()) {
    const p = it.next();
    // Pular a pasta atual da listagem
    if (p.getId() === pastaAtualId) {
      continue;
    }
    pastasTexto.push(`${index} - ${p.getName()}`);
    mapa[index] = p;
    index++;
  }

  if (pastasTexto.length === 0) {
    ui.alert('Nenhuma outra pasta disponível.');
    return;
  }

  // Montar mensagem com pasta atual no topo
  let mensagem = 'Pasta atual: ' + (pastaAtualNome || 'NENHUMA') + '\n\n';
  mensagem += 'Digite o NÚMERO da pasta:\n\n';
  mensagem += pastasTexto.join('\n');

  const resp = ui.prompt(
    'Escolher pasta de trabalho',
    mensagem,
    ui.ButtonSet.OK_CANCEL
  );

  // Se cancelar ou deixar em branco, manter pasta atual
  if (resp.getSelectedButton() !== ui.Button.OK) {
    ui.alert(`Pasta atual mantida: ${pastaAtualNome || 'NENHUMA'}`);
    return;
  }

  const numero = parseInt(resp.getResponseText(), 10);
  const pasta = mapa[numero];

  if (!pasta) {
    ui.alert('Número inválido.');
    return;
  }

  // ✅ 1. DEFINE COMO ATIVA
  definirPastaTrabalho_(pasta.getId(), pasta.getName());

  // ✅ 2. ATUALIZA LEGENDA (Sincroniza IDs vivos, nomes e cores fortes)
  const contextoNovo = obterContextoAtivo_();
  atualizarLegendasPlanilhaContexto_(contextoNovo);

  // ✅ 3. ABRIR NO NAVEGADOR (opcional)
  const abrir = ui.alert(
    'Abrir pasta no navegador?',
    `Pasta ativa definida e legenda atualizada:\n\n${pasta.getName()}`,
    ui.ButtonSet.YES_NO
  );

  if (abrir === ui.Button.YES) {
    abrirPastaNoNavegador_(pasta.getId());
  }
}