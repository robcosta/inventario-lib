/**
 * ============================================================
 * MÓDULO: PASTA UTIL — GESTÃO DE IDENTIDADE E DRIVE
 * ============================================================
 */

/**
 * Gerencia Identidade garantindo CORES EXCLUSIVAS para cada pasta.
 * Usa CORES_DESTAQUE_LISTA (8 cores predefinidas).
 * Impede que duas pastas tenham a mesma cor.
 */
function obterPrefixoPasta_(contexto) {
  return (contexto && contexto.planilhaOperacionalId)
    ? `ID_PASTA_${contexto.planilhaOperacionalId}_`
    : 'ID_PASTA_';
}

function gerenciarIdentidadePasta_(id, nome = null, contexto = null) {
  const props = PropertiesService.getScriptProperties();
  const prefixo = obterPrefixoPasta_(contexto);
  const CHAVE = prefixo + id;

  if (nome) {
    const contextoAtual = contexto || obterContextoAtivo_();

    // 1. Descobrir quais cores já estão sendo usadas no contexto atual
    const coresEmUso = contextoAtual
      ? obterPastasVivas_(contextoAtual).map(p => p.cor).filter(Boolean)
      : [];

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
  let res = props.getProperty(CHAVE);

  // Compatibilidade: migra chave antiga (sem prefixo de contexto)
  if (!res && prefixo !== 'ID_PASTA_') {
    const chaveLegacy = 'ID_PASTA_' + id;
    const legacy = props.getProperty(chaveLegacy);
    if (legacy) {
      props.setProperty(CHAVE, legacy);
      props.deleteProperty(chaveLegacy);
      res = legacy;
    }
  }

  return res ? { nome: res.split("|")[0], cor: res.split("|")[1] } : null;
}

/**
 * Retorna apenas as identidades das pastas que REALMENTE existem no Drive.
 * Faz a "faxina" automática de registros de pastas que foram apagadas manualmente.
 */
function obterPastasVivas_(contexto) {
  const props = PropertiesService.getScriptProperties();
  const todasProps = props.getProperties();
  const prefixo = obterPrefixoPasta_(contexto);
  const pastaRaiz = obterPastaRaizTrabalho_(contexto);
  
  // 1. Lista IDs das pastas que existem fisicamente no Drive
  const IDsNoDrive = [];
  const nomesNoDrive = {};
  const it = pastaRaiz.getFolders();
  while (it.hasNext()) {
    const pasta = it.next();
    const id = pasta.getId();
    IDsNoDrive.push(id);
    nomesNoDrive[id] = pasta.getName().toUpperCase();
  }

  const pastasVivas = [];
  const idsComIdentidade = new Set();
  const coresEmUso = [];
  
  // 2. Recupera identidades existentes (com migração de legado)
  IDsNoDrive.forEach(id => {
    const chave = prefixo + id;
    let valor = todasProps[chave];

    if (!valor && prefixo !== 'ID_PASTA_') {
      const chaveLegacy = 'ID_PASTA_' + id;
      const legacy = todasProps[chaveLegacy];
      if (legacy) {
        props.setProperty(chave, legacy);
        props.deleteProperty(chaveLegacy);
        valor = legacy;
      }
    }

    if (valor) {
      const [nome, cor] = valor.split('|');
      pastasVivas.push({ nome, cor });
      idsComIdentidade.add(id);
      if (cor) coresEmUso.push(cor);
    }
  });

  // 3. Cria identidades faltantes (quando as props foram limpas)
  IDsNoDrive.forEach(id => {
    if (idsComIdentidade.has(id)) return;
    const nome = nomesNoDrive[id] || '';
    const cor = CORES_DESTAQUE_LISTA.find(c => !coresEmUso.includes(c)) || CORES_DESTAQUE_LISTA[0];
    coresEmUso.push(cor);
    props.setProperty(prefixo + id, `${nome}|${cor}`);
    pastasVivas.push({ nome, cor });
  });

  // 4. Limpa registros antigos desta planilha que não existem mais
  Object.keys(todasProps).forEach(chave => {
    if (chave.startsWith(prefixo)) {
      const id = chave.replace(prefixo, '');
      if (!IDsNoDrive.includes(id)) {
        props.deleteProperty(chave);
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
}

/**
 * Abre a pasta de trabalho ATUAL no navegador sem alterar o contexto.
 * Se a pasta foi deletada/enviada à lixeira, propõe escolher uma nova pasta.
 */
function abrirPastaTrabalhoAtual_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!contexto) {
    ui.alert('Nenhum contexto ativo.');
    return;
  }

  if (!contexto.pastaTrabalhoId) {
    ui.alert('Nenhuma pasta de trabalho ativa.');
    return;
  }

  // ✅ VALIDAÇÃO: Verificar se a pasta ainda existe no Drive
  const pastaExiste = verificarSePastaExiste_(contexto.pastaTrabalhoId);
  
  if (!pastaExiste) {
    // ❌ Pasta foi deletada/enviada à lixeira - Propor alternativas
    ui.alert(
      '⚠️ A pasta de trabalho ativa foi deletada ou está na lixeira.\n\n' +
      'A pasta ativa será resetada e você poderá escolher uma nova.'
    );
    
    // Limpar a pasta ativa do contexto
    atualizarContexto_({
      pastaTrabalhoId: null,
      pastaTrabalhoNome: null
    });
    
    // Oferecer ao usuário a escolha entre escolher uma pasta existente ou criar uma nova
    recuperarDaPastaDeleteda_();
    return;
  }

  // ✅ Pasta existe - Abrir normalmente
  abrirPastaNoNavegador_(contexto.pastaTrabalhoId);
}

/**
 * Verifica se uma pasta existe no Drive (não foi deletada/enviada à lixeira).
 */
function verificarSePastaExiste_(pastaId) {
  try {
    const pasta = DriveApp.getFolderById(pastaId);
    // Se conseguir acessar, a pasta existe
    return pasta !== null;
  } catch (e) {
    // Pasta não encontrada (deletada ou na lixeira)
    return false;
  }
}

/**
 * Fluxo de recuperação quando a pasta ativa foi deletada.
 * Oferece escolher uma pasta existente ou criar uma nova.
 */
function recuperarDaPastaDeleteda_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();
  
  if (!contexto || !contexto.pastaUnidadeId) {
    ui.alert('Nenhuma pasta raiz de trabalho configurada.');
    return;
  }

  try {
    const pastaRaiz = DriveApp.getFolderById(contexto.pastaUnidadeId);
    const pastas = [];
    const mapa = {};
    let index = 1;
    const it = pastaRaiz.getFolders();

    // Listar todas as pastas disponíveis
    while (it.hasNext()) {
      const p = it.next();
      pastas.push(`${index} - ${p.getName()}`);
      mapa[index] = { id: p.getId(), nome: p.getName() };
      index++;
    }

    // Nenhuma pasta disponível
    if (pastas.length === 0) {
      const criarNova = ui.alert(
        '📂 Nenhuma pasta de trabalho disponível\n\nDeseja criar uma nova?',
        ui.ButtonSet.YES_NO
      );
      
      if (criarNova === ui.Button.YES) {
        criarPastaTrabalho();
      }
      return;
    }

    // Montar mensagem com opções
    let mensagem = '📂 Nenhuma pasta ativa. Escolha uma:\n\n';
    mensagem += pastas.join('\n');

    const resp = ui.prompt(
      'Escolher Pasta de Trabalho',
      mensagem,
      ui.ButtonSet.OK_CANCEL
    );

    if (resp.getSelectedButton() !== ui.Button.OK) {
      // Usuário cancelou - perguntar se quer criar uma nova pasta
      const criarNova = ui.alert(
        'Deseja criar uma nova pasta de trabalho?',
        ui.ButtonSet.YES_NO
      );
      
      if (criarNova === ui.Button.YES) {
        criarPastaTrabalho();
      }
      return;
    }

    const numero = parseInt(resp.getResponseText(), 10);
    const pastaEscolhida = mapa[numero];

    if (!pastaEscolhida) {
      ui.alert('❌ Número inválido.');
      recuperarDaPastaDeleteda_(); // Tenta novamente
      return;
    }

    // Definir a pasta escolhida como ativa
    definirPastaTrabalho_(pastaEscolhida.id, pastaEscolhida.nome);
    
    // Atualizar legendas
    const contextoNovo = obterContextoAtivo_();
    atualizarLegendasPlanilhaContexto_(contextoNovo);
    
    ui.alert(`✅ Pasta de trabalho ativa definida:\n\n${pastaEscolhida.nome}`);

  } catch (e) {
    ui.alert(`❌ Erro ao recuperar pasta: ${e.message}`);
  }
}

/**
 * Abre somente a pasta de trabalho atual, sem alterar a pasta padrão.
 */
function abrirPastasTrabalho_() {
  abrirPastaTrabalhoAtual_();
}