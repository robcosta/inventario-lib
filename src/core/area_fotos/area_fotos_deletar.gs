/**
 * ============================================================
 * ÁREA DE FOTOS — DELETAR/ARQUIVAR PASTA (DOMÍNIO)
 * ============================================================
 *
 * ✔ Compatível com ADMIN e CLIENTE
 * ✔ Bloqueia CLIENTE se já houver imagens processadas
 * ✔ Move pasta para a LIXEIRA (não apaga definitivamente)
 * ✔ Limpa destaques da cor da localidade nas planilhas ADMIN/GERAL
 * ✔ Cancela filas pendentes da pasta e atualiza contexto
 */
function deletarPastaFotos_() {

  const ui = SpreadsheetApp.getUi();
  let contexto = obterContextoDominio_();

  if (!contexto) {
    ui.alert("❌ Nenhum contexto ativo.");
    return;
  }

  // Sincroniza localidade ativa e valida pasta raiz
  contexto = sincronizarLocalidadeAtiva_(contexto);
  if (!contexto || !contexto.pastaLocalidadesId) {
    ui.alert("❌ Contexto inválido.");
    return;
  }

  if (!contexto.localidadeAtivaId) {
    ui.alert(
      "⚠️ Nenhuma pasta ativa.\n\n" +
      'Use "Trocar Pasta" ou "Criar Nova Pasta" antes de deletar.'
    );
    return;
  }

  // Carrega pasta e valida vínculo
  let pasta;
  try {
    pasta = DriveApp.getFolderById(contexto.localidadeAtivaId);
  } catch (e) {
    ui.alert("❌ A pasta ativa não foi encontrada no Drive.");
    return;
  }

  if (pasta.isTrashed()) {
    ui.alert("❌ A pasta ativa já está na lixeira.");
    return;
  }

  // Confirma se pertence ao contexto
  if (!pastaPertenceAoContexto_(pasta, contexto.pastaLocalidadesId)) {
    ui.alert("❌ A pasta ativa não pertence ao contexto de localidades.");
    return;
  }

  const pastaId = pasta.getId();
  const pastaNome = pasta.getName();

  // Lista arquivos de imagem para contagem e log
  const arquivosImagens = listarArquivosImagemDaPasta_(pasta);

  // Contagens
  const totalImagens = arquivosImagens.length;
  const processadas = contarImagensProcessadasNaPasta_(pastaId, contexto.planilhaAdminId, arquivosImagens);

  // Regra de bloqueio para CLIENTE
  if (contexto.tipo === 'CLIENTE' && processadas > 0) {
    ui.alert(
      "❌ Deleção bloqueada no CLIENTE",
      `A pasta "${pastaNome}" já possui ${processadas} imagem(ns) processada(s).\n\n` +
      "Solicite ao ADMIN a exclusão dessa pasta.",
      ui.ButtonSet.OK
    );
    return;
  }

  // Mensagem de confirmação
  const mensagem =
    `Pasta: ${pastaNome}\n` +
    `Imagens na pasta: ${totalImagens}\n` +
    `Imagens já processadas: ${processadas}\n\n` +
    "Antes de deletar, o sistema irá:\n" +
    "• Cancelar filas pendentes da pasta\n" +
    "• Remover destaques dessa localidade nas planilhas ADMIN e GERAL\n" +
    "• Atualizar o contexto e a legenda de cores\n" +
    "• Colocar a pasta na LIXEIRA (permite recuperação)\n\n" +
    "Depois, refaça os relatórios (Visão Geral, Pendentes, Encontrados, Outra Localidade, Etiquetas).\n\n" +
    "Deseja continuar?";

  const confirmar = ui.alert(
    "🗑️ Deletar Pasta de Fotos",
    mensagem,
    ui.ButtonSet.YES_NO
  );
  if (confirmar !== ui.Button.YES) return;

  // Cor (pode ser necessária para limpeza)
  const corLocalidade = obterCorDaPastaNoContexto_(contexto, pastaId);

  // Cancela filas pendentes dessa pasta
  try {
    cancelarFilasPorPasta_(contexto, pastaId);
  } catch (e) {
    Logger.log('[AREA_FOTOS][DELETE][FILA][AVISO] ' + e.message);
  }

  // Limpa destaques + coluna F (Localização) nas planilhas
  if (corLocalidade) {
    try {
      limparDestaquesELocalizacaoPorCorPlanilha_(contexto.planilhaAdminId, corLocalidade, null, contexto.localidadeAtivaNome);
    } catch (e) {
      Logger.log('[AREA_FOTOS][DELETE][ADMIN_DESTAQUE][AVISO] ' + e.message);
    }

    try {
      const planilhaGeralId = resolverPlanilhaGeralIdParaLimpeza_(contexto);
      if (!planilhaGeralId) {
        Logger.log('[AREA_FOTOS][DELETE][GERAL_DESTAQUE][AVISO] Planilha GERAL não encontrada para limpeza.');
      } else {
        limparDestaquesELocalizacaoPorCorPlanilha_(planilhaGeralId, corLocalidade, null, contexto.localidadeAtivaNome);
      }
    } catch (e) {
      Logger.log('[AREA_FOTOS][DELETE][GERAL_DESTAQUE][AVISO] ' + e.message);
    }
  }

  // Deleta (lixeira) a pasta — com fallback Drive API (suporta Shared Drives)
  try {
    moverPastaParaLixeira_(pastaId);
    // Confirma que foi para a lixeira
    const pastaCheck = DriveApp.getFolderById(pastaId);
    if (!pastaCheck.isTrashed()) {
      throw new Error('A pasta não pôde ser movida para a lixeira (verifique permissões ou Drive API).');
    }
  } catch (e) {
    ui.alert(
      "❌ Falha ao mover pasta para a lixeira",
      e.message +
      "\n\nVerifique se você tem permissão de edição na pasta ou se o serviço Drive avançado está habilitado.",
      ui.ButtonSet.OK
    );
    return;
  }

  // Registra no CONTROLE os bens (imagens) deletados.
  try {
    registrarBensDeletadosControle_(contexto.planilhaAdminId, arquivosImagens, pastaNome);
  } catch (e) {
    Logger.log('[AREA_FOTOS][DELETE][CONTROLE][AVISO] ' + e.message);
  }

  // Atualiza contexto (limpa localidade ativa)
  const patchContexto = {
    localidadeAtivaId: null,
    localidadeAtivaNome: null,
    ultimaAtualizacao: new Date().toISOString()
  };

  let contextoAtualizado = contexto;

  try {
    if (contexto.tipo === 'ADMIN') {
      contextoAtualizado = atualizarContextoAdmin_(patchContexto);
      atualizarLegendasPlanilhaAdmin_(contextoAtualizado);
    } else if (contexto.tipo === 'CLIENTE') {
      contextoAtualizado = atualizarContextoCliente_(patchContexto);
      clienteMontarInformacoes_(contextoAtualizado, true);
    }
  } catch (e) {
    Logger.log('[AREA_FOTOS][DELETE][CTX][AVISO] ' + e.message);
  }

  // Recalcula mapa de cores/bloqueio de cor (persistência automática)
  try {
    obterPastasVivas_(contextoAtualizado || contexto);
  } catch (e) {
    Logger.log('[AREA_FOTOS][DELETE][CORES][AVISO] ' + e.message);
  }

  // Se CLIENTE, dispara sincronização para ADMIN
  if (contexto.tipo === 'CLIENTE') {
    try {
      const sync = solicitarSincronizacaoLocalidadesCliente_(contextoAtualizado || contexto, {
        versaoLocalidades: calcularVersaoLocalidadesDoDrive_(contextoAtualizado || contexto),
        motivo: 'REMOVER_PASTA'
      });
      if (sync && sync.requestId) {
        SpreadsheetApp.getActiveSpreadsheet().toast(
          `Sincronização com ADMIN solicitada (#${sync.requestId}).`,
          '⏳ Sincronização',
          6
        );
      }
    } catch (e) {
      Logger.log('[AREA_FOTOS][DELETE][SYNC][AVISO] ' + e.message);
    }
  }

  ui.alert(
    "✅ Pasta enviada para a lixeira",
    `Pasta: ${pastaNome}\n` +
    `Imagens: ${totalImagens}\n` +
    `Processadas: ${processadas}\n\n` +
    "Destaques removidos (ADMIN/GERAL). Refaça os relatórios para refletir a mudança.",
    ui.ButtonSet.OK
  );
}

/**
 * Move pasta para a lixeira com fallback para Drive API (suporta Shared Drives).
 */
function moverPastaParaLixeira_(pastaId) {
  const id = String(pastaId || '').trim();
  if (!id) throw new Error('ID da pasta inválido para mover à lixeira.');

  // Tentativa padrão (DriveApp)
  try {
    const pasta = DriveApp.getFolderById(id);
    pasta.setTrashed(true);
    return;
  } catch (e) {
    Logger.log('[AREA_FOTOS][DELETE][TRASH][DriveApp] ' + e.message);
  }

  // Fallback com Drive avançado
  if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.update) {
    try {
      Drive.Files.update({ trashed: true }, id, null, { supportsAllDrives: true });
      return;
    } catch (e) {
      Logger.log('[AREA_FOTOS][DELETE][TRASH][DriveAPI] ' + e.message);
      throw new Error('Acesso negado ao mover para a lixeira (permite Shared Drives).');
    }
  }

  throw new Error('Drive API não disponível para mover a pasta à lixeira.');
}

/**
 * Confere se a pasta é filha da pasta de localidades do contexto.
 */
function pastaPertenceAoContexto_(pasta, pastaLocalidadesId) {
  if (!pasta || !pastaLocalidadesId) return false;
  const pais = pasta.getParents();
  while (pais.hasNext()) {
    if (pais.next().getId() === pastaLocalidadesId) return true;
  }
  return false;
}

/**
 * Conta apenas arquivos de imagem em uma pasta.
 */
function contarImagensNaPasta_(pasta) {
  if (!pasta) return 0;
  let total = 0;
  const it = pasta.getFiles();
  while (it.hasNext()) {
    const f = it.next();
    const mime = String(f.getMimeType() || '').toLowerCase();
    if (mime.startsWith('image/')) total++;
  }
  return total;
}

/**
 * Conta quantas imagens da pasta já aparecem como processadas no CONTROLE.
 * Critério: status diferente de ERRO ou PENDENTE.
 */
function contarImagensProcessadasNaPasta_(pastaId, planilhaAdminId, arquivosImagensOpcional) {
  const id = String(pastaId || '').trim();
  const planilhaId = String(planilhaAdminId || '').trim();

  if (!id || !planilhaId) return 0;

  const fileIds = {};
  const idsNaPasta = Array.isArray(arquivosImagensOpcional) && arquivosImagensOpcional.length
    ? arquivosImagensOpcional.map(f => String(f.id || '').trim()).filter(Boolean)
    : (function() {
        try {
          const pasta = DriveApp.getFolderById(id);
          const it = pasta.getFiles();
          while (it.hasNext()) {
            const fileId = String(it.next().getId() || '').trim();
            if (fileId) fileIds[fileId] = true;
          }
          return Object.keys(fileIds);
        } catch (e) {
          return [];
        }
      })();

  idsNaPasta.forEach(fid => { if (fid) fileIds[fid] = true; });
  if (!idsNaPasta.length) return 0;

  let sheet;
  try {
    sheet = SpreadsheetApp.openById(planilhaId).getSheetByName('__CONTROLE_PROCESSAMENTO__');
  } catch (e) {
    return 0;
  }
  if (!sheet) return 0;

  const dados = sheet.getDataRange().getValues();
  if (dados.length < 2) return 0;

  const processadas = {};

  for (let i = 1; i < dados.length; i++) { // pula cabeçalho
    const row = dados[i];
    const fileId = String(row[1] || '').trim();
    if (!fileIds[fileId]) continue;

    const status = String(row[4] || '').trim().toUpperCase();
    if (status === 'ERRO' || status === 'PENDENTE') continue;
    processadas[fileId] = true;
  }

  return Object.keys(processadas).length;
}

/**
 * Retorna lista de imagens (id + nome) dentro da pasta.
 */
function listarArquivosImagemDaPasta_(pasta) {
  const lista = [];
  if (!pasta) return lista;

  const it = pasta.getFiles();
  while (it.hasNext()) {
    const f = it.next();
    const mime = String(f.getMimeType() || '').toLowerCase();
    if (!mime.startsWith('image/')) continue;
    lista.push({
      id: String(f.getId() || '').trim(),
      nome: String(f.getName() || '').trim()
    });
  }
  return lista;
}

/**
 * Registra no __CONTROLE_PROCESSAMENTO__ da ADMIN os bens (imagens) removidos junto com a pasta.
 */
function registrarBensDeletadosControle_(planilhaAdminId, arquivosImagens, pastaNome) {
  const planilhaId = String(planilhaAdminId || '').trim();
  if (!planilhaId) return;
  if (!Array.isArray(arquivosImagens) || !arquivosImagens.length) return;

  let sheet;
  try {
    sheet = SpreadsheetApp.openById(planilhaId).getSheetByName('__CONTROLE_PROCESSAMENTO__');
  } catch (e) {
    return;
  }
  if (!sheet) return;

  const dataHora = formatarDataHoraLocal_(new Date());
  const email = String(Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || '').trim();
  const linhas = arquivosImagens.map(arq => [
    dataHora,
    arq.id || '',
    arq.nome || '',
    arq.nome || '',
    'DELETADO',
    'ADMIN',
    '',
    'PASTA',
    pastaNome || '',
    'DELETE_PASTA',
    'REMOVIDO',
    0,
    email,
    'Pasta de fotos deletada'
  ]);

  try {
    sheet.getRange(sheet.getLastRow() + 1, 1, linhas.length, linhas[0].length).setValues(linhas);
  } catch (e) {
    Logger.log('[AREA_FOTOS][DELETE][CONTROLE][ERRO] ' + e.message);
  }
}

function formatarDataHoraLocal_(data) {
  const tz = Session.getScriptTimeZone() || 'America/Sao_Paulo';
  return Utilities.formatDate(data instanceof Date ? data : new Date(data), tz, 'dd/MM/yyyy HH:mm:ss');
}

/**
 * Resolve o ID da planilha GERAL para limpeza, sem validar o padrão do nome.
 */
function resolverPlanilhaGeralIdParaLimpeza_(contexto) {
  const candidatos = [];

  if (contexto && contexto.planilhaGeralId) candidatos.push(contexto.planilhaGeralId);

  try {
    const sistema = typeof obterSistemaGlobal_ === 'function' ? obterSistemaGlobal_() : null;
    if (sistema && sistema.planilhaGeralId) candidatos.push(sistema.planilhaGeralId);
  } catch (e) {}

  try {
    const props = PropertiesService.getScriptProperties();
    const propId = props.getProperty('PLANILHA_GERAL_ID');
    if (propId) candidatos.push(propId);
  } catch (e) {}

  // Fallback seguro (com validação de nome)
  try {
    const resolvido = resolverPlanilhaGeralIdSeguro_();
    if (resolvido) candidatos.push(resolvido);
  } catch (e) {}

  for (let i = 0; i < candidatos.length; i++) {
    const id = String(candidatos[i] || '').trim();
    if (!id) continue;
    try {
      SpreadsheetApp.openById(id);
      return id;
    } catch (e) {}
  }

  return null;
}

/**
 * Obtém a cor oficial da pasta a partir do mapa de cores do contexto.
 */
function obterCorDaPastaNoContexto_(contexto, pastaId) {
  if (!contexto || !pastaId) return null;
  const mapa = contexto.mapaCoresPastas || {};
  let cor = mapa[pastaId];

  // Se não houver cor registrada, força sincronização de cores
  if (!cor) {
    try {
      const pastas = obterPastasVivas_(contexto) || [];
      const alvo = pastas.find(p => p.id === pastaId);
      if (alvo && alvo.cor) {
        cor = alvo.cor;
      }
    } catch (e) {
      Logger.log('[AREA_FOTOS][DELETE][COR][AVISO] ' + e.message);
    }
  }

  return normalizarCorHexLocalidades_(cor);
}

/**
 * Limpa a cor informada em todas as abas (exceto técnicas) e apaga coluna F (Localização) das linhas destacadas.
 */
function limparDestaquesELocalizacaoPorCorPlanilha_(planilhaId, corHex, colLocalizacao, localidadeNome) {
  const alvo = normalizarCorHexLocalidades_(corHex);
  const normalizarTexto = (typeof normalizarTextoComparacao_ === 'function')
    ? normalizarTextoComparacao_
    : function(v) {
        return String(v || '')
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      };
  const alvoNome = normalizarTexto(localidadeNome || '');

  if (!planilhaId || (!alvo && !alvoNome)) return;

  const ss = SpreadsheetApp.openById(planilhaId);
  const sheets = ss.getSheets();
  const colLoc = Math.max(1, Number(colLocalizacao || 6)); // coluna F padrão

  sheets.forEach(sheet => {
    const nome = sheet.getName();
    if (ehAbaTecnicaParaLimpeza_(nome)) return;

    const range = sheet.getDataRange();
    const fundos = range.getBackgrounds();
    const valores = range.getValues();

    let alterouBg = false;
    let alterouVal = false;
    // Quando um bem ocupa mais de uma linha (continuações com coluna A vazia),
    // propagamos a limpeza para as linhas imediatamente abaixo do tombamento.
    let propagarBemAtual = false;

    for (let i = 0; i < fundos.length; i++) {
      const valorColA = valores[i] ? String(valores[i][0] || '').trim() : '';

      // Se iniciou um novo bloco (coluna A preenchida), encerra propagação anterior.
      if (propagarBemAtual && valorColA) {
        propagarBemAtual = false;
      }

      let linhaTemCorAlvo = false;
      for (let j = 0; j < fundos[i].length; j++) {
        const corCel = normalizarCorHexLocalidades_(fundos[i][j]);
        if (alvo && corCel && corCel === alvo) {
          fundos[i][j] = '#ffffff';
          alterouBg = true;
          linhaTemCorAlvo = true;
        }
      }

      const localizacaoBruta = valores[i] ? valores[i][colLoc - 1] : '';
      const localizacaoNormalizada = normalizarTexto(localizacaoBruta);
      const linhaPorNome = !!(alvoNome && localizacaoNormalizada && localizacaoNormalizada === alvoNome);
      const devePropagar = propagarBemAtual && !valorColA; // continuações do mesmo bem

      if (devePropagar && fundos[i]) {
        for (let j = 0; j < fundos[i].length; j++) {
          if (fundos[i][j] !== '#ffffff') {
            fundos[i][j] = '#ffffff';
            alterouBg = true;
          }
        }
      } else if (linhaPorNome && !linhaTemCorAlvo && fundos[i]) {
        for (let j = 0; j < fundos[i].length; j++) {
          if (fundos[i][j] !== '#ffffff') {
            fundos[i][j] = '#ffffff';
            alterouBg = true;
          }
        }
      }

      const deveLimparLoc = linhaTemCorAlvo || linhaPorNome || devePropagar;
      if (deveLimparLoc && valores[i] && valores[i][colLoc - 1] !== '') {
        valores[i][colLoc - 1] = '';
        alterouVal = true;
      }

      // Ativa propagação a partir da linha do tombamento que sofreu limpeza.
      if ((linhaTemCorAlvo || linhaPorNome) && valorColA) {
        propagarBemAtual = true;
      }
    }

    if (alterouBg) {
      range.setBackgrounds(fundos);
    }
    if (alterouVal) {
      const colRange = sheet.getRange(1, colLoc, valores.length, 1);
      const colVals = valores.map(r => [r[colLoc - 1]]);
      colRange.setValues(colVals);
    }
  });
}

function ehAbaTecnicaParaLimpeza_(nomeAba) {
  if (!nomeAba) return false;
  const n = nomeAba.toUpperCase();
  return n === 'CAPA' ||
    n === 'MANUAL' ||
    n === '__CONTROLE_PROCESSAMENTO__' ||
    n === '__FILA_PROCESSAMENTO__' ||
    n === '__FILA_SINCRONIZACAO__' ||
    n === 'CONTROLE_PROCESSAMENTO';
}

/**
 * Marca solicitações pendentes da pasta como canceladas nas filas do CLIENTE.
 */
function cancelarFilasPorPasta_(contexto, pastaId) {
  if (!contexto || !pastaId || !contexto.planilhaClienteId) return;

  const pastaAlvo = String(pastaId || '').trim();
  const ssCliente = SpreadsheetApp.openById(contexto.planilhaClienteId);

  // Fila de processamento
  const filaProc = ssCliente.getSheetByName(FILA_PROCESSAMENTO_ABA);
  if (filaProc && filaProc.getLastRow() >= 2) {
    const dados = filaProc.getRange(2, 1, filaProc.getLastRow() - 1, FILA_CABECALHO.length).getValues();
    dados.forEach((row, idx) => {
      const status = String(row[FILA_COL.STATUS - 1] || '').toUpperCase();
      const pastaRow = String(row[FILA_COL.PASTA_TRABALHO_ID - 1] || '').trim();
      if (pastaRow === pastaAlvo && status === FILA_STATUS.PENDENTE) {
        const linha = idx + 2;
        filaProc.getRange(linha, FILA_COL.STATUS).setValue('CANCELADO');
        filaProc.getRange(linha, FILA_COL.MENSAGEM_ERRO).setValue('Pasta de fotos deletada.');
      }
    });
  }

  // Fila de sincronização
  const filaSync = ssCliente.getSheetByName(FILA_SINCRONIZACAO_ABA);
  if (filaSync && filaSync.getLastRow() >= 2) {
    const dadosSync = filaSync.getRange(2, 1, filaSync.getLastRow() - 1, FILA_SYNC_CABECALHO.length).getValues();
    dadosSync.forEach((row, idx) => {
      const status = String(row[FILA_SYNC_COL.STATUS - 1] || '').toUpperCase();
      const pastaRow = String(row[FILA_SYNC_COL.PASTA_LOCALIDADES_ID - 1] || '').trim();
      if (pastaRow === contexto.pastaLocalidadesId && status === FILA_SYNC_STATUS.PENDENTE) {
        const linha = idx + 2;
        filaSync.getRange(linha, FILA_SYNC_COL.STATUS).setValue(FILA_SYNC_STATUS.ERRO);
        filaSync.getRange(linha, FILA_SYNC_COL.MENSAGEM_ERRO).setValue('Pasta de fotos deletada.');
      }
    });
  }
}
