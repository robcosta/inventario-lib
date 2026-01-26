/**
 * ============================================================
 * MÓDULO: PASTA UTIL — GESTÃO DE IDENTIDADE E DRIVE
 * ============================================================
 */

/**
 * Gerencia Identidade garantindo CORES EXCLUSIVAS e FORTES para cada pasta.
 * Impede que duas pastas tenham a mesma cor na legenda.
 */
function gerenciarIdentidadePasta_(id, nome = null) {
  const props = PropertiesService.getScriptProperties();
  const CHAVE = "ID_PASTA_" + id;
  
  // Paleta de 8 cores sólidas (High Contrast)
  const paletaForte = [
    "#0D652D", // Verde Floresta
    "#1557B0", // Azul Royal
    "#B06000", // Laranja Queimado
    "#A50E0E", // Vermelho Carmim
    "#6A1B9A", // Roxo Profundo
    "#007A82", // Teal (Azul Petróleo)
    "#C71585", // Rosa Escuro
    "#3C4043"  // Grafite
  ];

  if (nome) {
    const todasProps = props.getProperties();
    
    // 1. Descobrir quais cores já estão sendo usadas por outras pastas ativas no banco
    const coresEmUso = Object.keys(todasProps)
      .filter(k => k.startsWith("ID_PASTA_") && k !== CHAVE)
      .map(k => todasProps[k].split("|")[1]);

    // 2. Encontrar a primeira cor da paleta que NÃO está em uso
    let corEscolhida = paletaForte.find(cor => !coresEmUso.includes(cor));

    // 3. Segurança: Se as 8 cores acabarem, ele reinicia o ciclo por ordem de criação
    if (!corEscolhida) {
      const total = Object.keys(todasProps).filter(k => k.startsWith("ID_PASTA_")).length;
      corEscolhida = paletaForte[total % paletaForte.length];
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