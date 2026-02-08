/**
 * ============================================================
<<<<<<< HEAD
 * MÓDULO: PASTA UTIL — GESTÃO DE IDENTIDADE E DRIVE
=======
 * MÓDULO: PASTA UTIL — GESTÃO DE LOCALIDADES
>>>>>>> bugfix-contexto-persistencia
 * ============================================================
 */

/**
<<<<<<< HEAD
 * Gerencia Identidade garantindo CORES EXCLUSIVAS para cada pasta.
 * Usa CORES_DESTAQUE_LISTA (8 cores predefinidas).
 * Impede que duas pastas tenham a mesma cor.
 */
function gerenciarIdentidadePasta_(id, nome = null) {
  const props = PropertiesService.getScriptProperties();
  const CHAVE = "ID_PASTA_" + id;

  if (nome) {
    const todasProps = props.getProperties();
    
    // 1. Descobrir quais cores já estão sendo usadas por outras pastas
    const coresEmUso = Object.keys(todasProps)
      .filter(k => k.startsWith("ID_PASTA_") && k !== CHAVE)
      .map(k => todasProps[k].split("|")[1]);

    // 2. Encontrar a primeira cor de CORES_DESTAQUE_LISTA que NÃO está em uso
    let corEscolhida = CORES_DESTAQUE_LISTA.find(cor => !coresEmUso.includes(cor));

    // 3. Se não encontrou (todas as 8 cores usadas), usar a primeira (não deve acontecer com validação na criação)
    if (!corEscolhida) {
      corEscolhida = CORES_DESTAQUE_LISTA[0];
    }
    
    props.setProperty(CHAVE, `${nome.toUpperCase()}|${corEscolhida}`);
    return { nome: nome.toUpperCase(), cor: corEscolhida };
  }
  
  // Se não passou nome, apenas recupera os dados salvos
  const res = props.getProperty(CHAVE);
  return res ? { nome: res.split("|")[0], cor: res.split("|")[1] } : null;
}

/**
 * Retorna apenas as identidades das pastas que REALMENTE existem no Drive.
 * Faz a "faxina" automática de registros de pastas que foram apagadas manualmente.
 */
function obterPastasVivas_(contexto) {
  const props = PropertiesService.getScriptProperties();
  const todasProps = props.getProperties();
  const pastaRaiz = obterPastaRaizTrabalho_(contexto);
  
  // 1. Lista IDs das pastas que existem fisicamente no Drive
  const IDsNoDrive = [];
  const it = pastaRaiz.getFolders();
  while (it.hasNext()) {
    IDsNoDrive.push(it.next().getId());
  }

  const pastasVivas = [];
  
  // 2. Filtra o banco de dados e limpa o lixo
  Object.keys(todasProps).forEach(chave => {
    if (chave.startsWith("ID_PASTA_")) {
      const id = chave.replace("ID_PASTA_", "");
      
      if (IDsNoDrive.includes(id)) {
        const [nome, cor] = todasProps[chave].split("|");
        pastasVivas.push({ nome, cor });
      } else {
        props.deleteProperty(chave); // Deleta do banco (ScriptProperties) se não existir no Drive
      }
    }
  });
  
  return pastasVivas;
}

/**
 * Obtém a pasta raiz de trabalho a partir do contexto.
 */
function obterPastaRaizTrabalho_(contexto) {
  if (!contexto.pastaUnidadeId) {
    throw new Error('Pasta raiz de trabalho não configurada.');
  }
  return DriveApp.getFolderById(contexto.pastaUnidadeId);
}

/**
 * Define qual pasta de trabalho está ATIVA no contexto e persiste os dados.
 */
function definirPastaTrabalho_(pastaId, pastaNome) {
  if (!pastaId || !pastaNome) {
    throw new Error('ID ou nome da pasta de trabalho inválido.');
  }

  atualizarContexto_({
    pastaTrabalhoId: pastaId,
    pastaTrabalhoNome: pastaNome
  });

  try {
    SpreadsheetApp.getActive().toast(`📂 Pasta ativa: ${pastaNome}`, 'Inventário', 4);
  } catch (e) {}
=======
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
>>>>>>> bugfix-contexto-persistencia
}