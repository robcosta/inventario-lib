/**
 * ============================================================
<<<<<<< HEAD
 * PASTAS DE TRABALHO — ESCOLHER
=======
 * PASTAS DE TRABALHO — ESCOLHER (LOCALIDADES)
>>>>>>> bugfix-contexto-persistencia
 * ============================================================
 */
function escolherPastaTrabalho_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

<<<<<<< HEAD
  if (!contexto) {
=======
  if (!contexto || !contexto.id) {
>>>>>>> bugfix-contexto-persistencia
    ui.alert('Nenhum contexto ativo.');
    return;
  }

<<<<<<< HEAD
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
=======
  const contextoAtualizado = sincronizarLocalidadesContexto_(contexto);
  const localidades = contextoAtualizado.localidades || [];
  if (localidades.length === 0) {
    ui.alert('Nenhuma localidade foi criada ainda.');
    return;
  }

  const localidadeAtivaId = contexto.localidadeAtivaId;
  const localidadeAtivaNome = contexto.localidadeAtivaNome;
  
  const localidadesTexto = [];
  const mapa = {};
  let index = 1;

  localidades.forEach(loc => {
    // Pular a localidade atual da listagem
    if (loc.id === localidadeAtivaId) {
      return;
    }
    localidadesTexto.push(`${index} - ${loc.nome}`);
    mapa[index] = loc;
    index++;
  });

  if (localidadesTexto.length === 0) {
    ui.alert('Nenhuma outra localidade disponível.');
    return;
  }

  // Montar mensagem com localidade atual no topo
  let mensagem = 'Localidade atual: ' + (localidadeAtivaNome || 'NENHUMA') + '\n\n';
  mensagem += 'Digite o NÚMERO da localidade:\n\n';
  mensagem += localidadesTexto.join('\n');

  const resp = ui.prompt(
    'Escolher Localidade',
    mensagem,
    ui.ButtonSet.OK_CANCEL
  );

  // Se cancelar, manter localidade atual
  if (resp.getSelectedButton() !== ui.Button.OK) {
    ui.alert(`Localidade atual mantida: ${localidadeAtivaNome || 'NENHUMA'}`);
    return;
  }

  const numero = parseInt((resp.getResponseText() || '').trim().toUpperCase(), 10);
  const localidade = mapa[numero];

  if (!localidade) {
>>>>>>> bugfix-contexto-persistencia
    ui.alert('Número inválido.');
    return;
  }

  // ✅ 1. DEFINE COMO ATIVA
<<<<<<< HEAD
  definirPastaTrabalho_(pasta.getId(), pasta.getName());

  // ✅ 2. ATUALIZA LEGENDA (Sincroniza IDs vivos, nomes e cores fortes)
  const contextoNovo = obterContextoAtivo_();
  atualizarLegendasPlanilhaContexto_(contextoNovo);

  // ✅ 3. ABRIR NO NAVEGADOR
  abrirPastaNoNavegador_(pasta.getId());

  ui.alert('Pasta ativa definida e legenda atualizada:\n\n' + pasta.getName());
=======
  setLocalidadeAtiva_(localidade.id);

  // ✅ 2. ATUALIZA LEGENDA
  const contextoNovo = obterContextoAtivo_();
  try {
    if (contextoNovo && contextoNovo.planilhaClienteId) {
      atualizarLegendasPlanilhaContexto_(contextoNovo);
    }
  } catch (e) {
    console.error('escolherPastaTrabalho_: Erro ao atualizar legendas:', e.message);
  }

  // ✅ 3. ABRIR NO NAVEGADOR (opcional)
  const abrir = ui.alert(
    'Abrir localidade no navegador?',
    `Localidade ativa definida:\n\n${localidade.nome}`,
    ui.ButtonSet.YES_NO
  );

  if (abrir === ui.Button.YES) {
    abrirPastaNoNavegador_(localidade.id);
  }
>>>>>>> bugfix-contexto-persistencia
}