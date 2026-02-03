/**
 * ============================================================
 * PASTAS DE TRABALHO — ESCOLHER (LOCALIDADES)
 * ============================================================
 */
function escolherPastaTrabalho_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!contexto || !contexto.id) {
    ui.alert('Nenhum contexto ativo.');
    return;
  }

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
    ui.alert('Número inválido.');
    return;
  }

  // ✅ 1. DEFINE COMO ATIVA
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
}