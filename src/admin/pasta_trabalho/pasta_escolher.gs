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
  const pastasTexto = [];
  const mapa = {};
  let index = 1;
  const it = pastaRaiz.getFolders();

  while (it.hasNext()) {
    const p = it.next();
    pastasTexto.push(`${index} - ${p.getName()}`);
    mapa[index] = p;
    index++;
  }

  if (pastasTexto.length === 0) {
    ui.alert('Nenhuma pasta disponível.');
    return;
  }

  const resp = ui.prompt(
    'Escolher pasta de trabalho',
    'Digite o NÚMERO da pasta:\n\n' + pastasTexto.join('\n'),
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

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

  // ✅ 3. ABRIR NO NAVEGADOR
  abrirPastaNoNavegador_(pasta.getId());

  ui.alert('Pasta ativa definida e legenda atualizada:\n\n' + pasta.getName());
}