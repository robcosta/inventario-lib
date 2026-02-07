/**
 * ============================================================
 * MÓDULO: PASTA UTIL — GESTÃO DE LOCALIDADES
 * ============================================================
 */

/**
 * Sincroniza localidades do Drive com o CONTEXTO_ADMIN.
 * - Adiciona pastas existentes que ainda não estão no contexto
 * - Mantém cores consistentes
 * @param {Object} contexto
 * @return {Object} Contexto atualizado
 */
function sincronizarLocalidadesContexto_(contexto) {
  if (!contexto || !contexto.pastaLocalidadesId) {
    return contexto || {};
  }

  const pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);
  const it = pastaRaiz.getFolders();
  const pastas = [];

  while (it.hasNext()) {
    const p = it.next();
    pastas.push({
      id: p.getId(),
      nome: (p.getName() || '').toUpperCase()
    });
  }

  const existentes = Array.isArray(contexto.localidades) ? contexto.localidades : [];
  const existentesPorId = {};
  const coresEmUso = [];

  existentes.forEach(loc => {
    if (!loc || !loc.id) return;
    existentesPorId[loc.id] = loc;
    if (loc.cor) coresEmUso.push(loc.cor);
  });

  pastas.forEach(p => {
    if (existentesPorId[p.id]) return;
    const cor = CORES_DESTAQUE_LISTA.find(c => !coresEmUso.includes(c)) || CORES_DESTAQUE_LISTA[0];
    coresEmUso.push(cor);
    adicionarLocalidade_({
      id: p.id,
      nome: p.nome,
      cor: cor,
      criadaEm: new Date().toISOString()
    });
  });

  return obterContextoAtivo_();
}

/**
 * Abre a localidade ATUAL no navegador sem alterar o contexto.
 * Se a pasta foi deletada, propõe escolher uma nova localidade.
 */
function abrirPastaTrabalhoAtual_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!contexto || !contexto.id) {
    ui.alert('Nenhum contexto ativo.');
    return;
  }

  if (!contexto.localidadeAtivaId) {
    ui.alert('Nenhuma localidade ativa.');
    return;
  }

  // Valida se a pasta ainda existe
  const pastaExiste = verificarSePastaExiste_(contexto.localidadeAtivaId);
  
  if (!pastaExiste) {
    ui.alert(
      '⚠️ A localidade ativa foi deletada ou está na lixeira.\n\n' +
      'A localidade será resetada e você poderá escolher uma nova.'
    );
    
    // Remove localidade ativa
    atualizarContextoAdmin_({
      localidadeAtivaId: null,
      localidadeAtivaNome: null,
      localidadeAtivaCor: null
    });
    
    recuperarDaLocalidadeDeleteda_();
    return;
  }

  // Abrir normalm
  abrirPastaNoNavegador_(contexto.localidadeAtivaId);
}

/**
 * Verifica se uma pasta existe no Drive.
 */
function verificarSePastaExiste_(pastaId) {
  try {
    const pasta = DriveApp.getFolderById(pastaId);
    return pasta !== null;
  } catch (e) {
    return false;
  }
}

/**
 * Fluxo de recuperação quando a localidade ativa foi deletada.
 */
function recuperarDaLocalidadeDeleteda_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();
  
  if (!contexto || !contexto.pastaLocalidadesId) {
    ui.alert('Nenhuma pasta de localidades configurada.');
    return;
  }

  try {
    const pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);
    const localidades = [];
    const mapa = {};
    let index = 1;
    const it = pastaRaiz.getFolders();

    while (it.hasNext()) {
      const p = it.next();
      localidades.push(`${index} - ${p.getName()}`);
      mapa[index] = { id: p.getId(), nome: p.getName() };
      index++;
    }

    if (localidades.length === 0) {
      const criarNova = ui.alert(
        '📂 Nenhuma localidade disponível\n\nDeseja criar uma nova?',
        ui.ButtonSet.YES_NO
      );
      
      if (criarNova === ui.Button.YES) {
        criarPastaTrabalho_();
      }
      return;
    }

    let mensagem = '📂 Escolha uma localidade:\n\n';
    mensagem += localidades.join('\n');

    const resp = ui.prompt(
      'Escolher Localidade',
      mensagem,
      ui.ButtonSet.OK_CANCEL
    );

    if (resp.getSelectedButton() !== ui.Button.OK) {
      const criarNova = ui.alert(
        'Deseja criar uma nova localidade?',
        ui.ButtonSet.YES_NO
      );
      
      if (criarNova === ui.Button.YES) {
        criarPastaTrabalho_();
      }
      return;
    }

    const numero = parseInt((resp.getResponseText() || '').trim().toUpperCase(), 10);
    const localidadeEscolhida = mapa[numero];

    if (!localidadeEscolhida) {
      ui.alert('❌ Número inválido.');
      recuperarDaLocalidadeDeleteda_();
      return;
    }

    // Define localidade como ativa
    setLocalidadeAtiva_(localidadeEscolhida.id);
    
    ui.alert(`✅ Localidade ativa definida:\n\n${localidadeEscolhida.nome}`);

  } catch (e) {
    ui.alert(`❌ Erro ao recuperar localidade: ${e.message}`);
  }
}

/**
 * Abre a localidade atual no navegador
 */
function abrirPastasTrabalho_() {
  abrirPastaTrabalhoAtual_();
}