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
}