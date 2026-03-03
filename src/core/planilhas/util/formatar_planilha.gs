/**
 * ============================================================
 * FORMATA PLANILHA DE CONTEXTO — PROCESSAMENTO EM BLOCO
 * ============================================================
 */
function formatarPlanilha_(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);

  const sheets = ss.getSheets();
  const contexto = obterContextoAtivo_(); // Obtém contexto para a legenda
  const formatandoAdmin =
    !!contexto &&
    !!contexto.planilhaAdminId &&
    contexto.planilhaAdminId === ss.getId();

  ss.toast('Iniciando formatação do contexto…', '⏳ Formatação', 5);

  sheets.forEach(sheet => {
    const nomeAba = sheet.getName();
    if (nomeAba === '__CONTROLE_PROCESSAMENTO__') return;
    if (nomeAba === 'CAPA') return;

    ss.toast(`Processando aba: ${nomeAba}`, '🛠️ Formatação', 3);

    let range = sheet.getDataRange();
    let data = range.getValues();
    let totalRows = data.length;

    if (totalRows < 1) return;

    normalizarLayoutInventarioSemBrancos_(sheet, formatandoAdmin);
      range = sheet.getDataRange();
      data = range.getValues();
      totalRows = data.length;

    // 🔒 Preparações estruturais
    sheet.setFrozenRows(1);
    sheet.setHiddenGridlines(true);
    aplicarCabecalhoPrincipal_(sheet);
    const colunasLayout = 7;

    const blocos = {
      localidade: [],
      unidade: [],
      tombamentoHeader: [],
      pcasp: [],
      tombamento: [],
      totalGrupo: []
    };

    for (let i = 0; i < totalRows; i++) {
      const linha = i + 1;
      const valA = String(data[i][0] || '').trim();

      // (Bem de Terceiro)
      if (valA === '(Bem de Terceiro)' && i > 0) {
        data[i - 1][0] += ' (Bem de Terceiro)';
        data[i][0] = '';
        continue;
      }

      if (obterLocalidade_(valA, linha)) {
        blocos.localidade.push(linha);
        continue;
      }

      if (valA.startsWith('Unidade')) {
        blocos.unidade.push(linha);
        continue;
      }

      if (valA.startsWith('Tombamento')) {
        blocos.tombamentoHeader.push(linha);
        continue;
      }

      if (/^\d{4}$/.test(valA)) {
        const texto = data[i].map(v => String(v).trim()).filter(v => v !== '').join('  ');
        data[i].fill('');
        data[i][0] = texto;
        blocos.pcasp.push(linha);
        continue;
      }

      if (/^\d{10}/.test(valA)) {
        blocos.tombamento.push(linha);
        continue;
      }

      if (valA.includes('Total de Bens do Grupo de Material')) {
        blocos.totalGrupo.push(linha);
      }
    }

    range.setValues(data);

    // Aplica Estilos
    aplicarEstiloBloco_(sheet, blocos.localidade, { background: '#b45f06', fontColor: '#ffffff', fontWeight: 'bold', fontSize: 11, borderTop: true }, colunasLayout);
    aplicarEstiloBloco_(sheet, blocos.unidade, { background: '#666666', fontColor: '#ffffff', fontWeight: 'bold', fontSize: 11, borderTop: true }, colunasLayout);
    aplicarEstiloBloco_(sheet, blocos.tombamentoHeader, { background: '#b7b7b7', fontWeight: 'bold', fontSize: 10, borderTop: true }, colunasLayout);
    aplicarEstiloBloco_(sheet, blocos.pcasp, { borderTop: true }, colunasLayout);
    aplicarEstiloBloco_(sheet, blocos.tombamento, { borderTop: true }, colunasLayout);
    aplicarEstiloBloco_(sheet, blocos.totalGrupo, { borderTop: true }, colunasLayout);

    // Limpa sobras de formatação/conteúdo fora do layout A:G.
    const lastColApos = sheet.getLastColumn();
    if (lastColApos > colunasLayout) {
      try {
        sheet
          .getRange(1, colunasLayout + 1, totalRows, lastColApos - colunasLayout)
          .clearContent()
          .clearFormat();
      } catch (e) {}
    }
  });

  reconstruirCapaAdminAposFormatacao_(ss, contexto);

  // ✨ NOVIDADE: Reconstrói a legenda após toda a formatação pesada
  if (contexto) {
    try {
      atualizarLegendasPlanilhaAdmin_(contexto);
    } catch (e) {
      Logger.log('[FORMATAR][LEGENDA][ERRO] ' + e.message);
    }
  }

  ss.toast('Formatação concluída com sucesso', '✅ Concluído', 6);
}

function reconstruirCapaAdminAposFormatacao_(ss, contexto) {
  if (!ss) return;

  let subtitulo = null;

  if (contexto && contexto.nome) {
    subtitulo = contexto.nome;
  } else {
    const nomePlanilha = ss.getName() || '';
    subtitulo = nomePlanilha.replace(/^ADMIN\s*:\s*/i, '').trim() || 'ADMIN';
  }

  try {
    if (typeof garantirCapaPrimeiraAdmin_ === 'function') {
      garantirCapaPrimeiraAdmin_(ss, subtitulo);
    }
  } catch (e) {
    Logger.log('[FORMATAR][CAPA][ERRO] ' + e.message);
  }
}

/**
 * ============================================================
 * INVENTÁRIO — NORMALIZAÇÃO SEM COLUNAS EM BRANCO
 * ============================================================
 * Layout alvo:
 * A Tombamento
 * B Denominação
 * C Aquisição
 * D Marca/ Editora
 * E Situação
 * F Localização
 * G Termo
 */
function normalizarLayoutInventarioSemBrancos_(sheet, ehAdmin) {
  if (!sheet) return;

  let range = sheet.getDataRange();
  let data = range.getValues();
  if (!data || !data.length) return;

  let colunas = data[0].length;
  if (colunas < 7) {
    try {
      sheet.insertColumnsAfter(colunas, 7 - colunas);
    } catch (e) {
      return;
    }
    range = sheet.getDataRange();
    data = range.getValues();
    colunas = data[0].length;
  }

  const linhas = data.map(row => {
    const nova = row.slice(0, colunas);
    while (nova.length < colunas) nova.push('');
    return nova;
  });

  const headerOficial = [
    'Tombamento',
    'Denominação',
    'Aquisição',
    'Marca/ Editora',
    'Situação',
    'Localização',
    'Termo'
  ];

  let mapaAtual = { tomb: 0, den: 1, aq: 2, marca: 3, sit: 4, loc: 5, termo: 6 };

  for (let i = 0; i < linhas.length; i++) {
    const row = linhas[i];
    const normalizada = row.map(normalizarTextoAdminColuna_);

    if (ehLinhaCabecalhoInventario_(normalizada)) {
      mapaAtual = detectarMapaCabecalhoAdmin_(normalizada, mapaAtual);
      aplicarCabecalhoOficialAdmin_(row, headerOficial, colunas, ehAdmin);
      continue;
    }

    if (ehLinhaDetalheSerie_(normalizada)) {
      linhas[i] = normalizarLinhaDetalheSerie_(row, colunas);
      continue;
    }

    if (!ehLinhaPatrimonioComTombamento_(row, mapaAtual)) {
      continue;
    }

    linhas[i] = reorganizarLinhaPatrimonioAdmin_(row, mapaAtual, colunas, ehAdmin);
  }

  sheet.getRange(1, 1, linhas.length, colunas).setValues(linhas);
}

function normalizarTextoAdminColuna_(v) {
  return String(v || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function ehLinhaCabecalhoInventario_(normalizada) {
  const temTomb = normalizada.some(v => v.includes('TOMBAMENTO'));
  const temDen = normalizada.some(v => v.includes('DENOMINACAO'));
  return temTomb && temDen;
}

function detectarMapaCabecalhoAdmin_(normalizada, fallback) {
  const map = {
    tomb: encontrarIndiceAdmin_(normalizada, ['TOMBAMENTO'], fallback.tomb),
    den: encontrarIndiceAdmin_(normalizada, ['DENOMINACAO'], fallback.den),
    aq: encontrarIndiceAdmin_(normalizada, ['AQUISICAO'], fallback.aq),
    marca: encontrarIndiceAdmin_(normalizada, ['MARCA', 'EDITORA'], fallback.marca),
    sit: encontrarIndiceAdmin_(normalizada, ['SITUACAO'], fallback.sit),
    loc: encontrarIndiceAdmin_(normalizada, ['LOCALIZACAO'], fallback.loc),
    termo: encontrarIndiceAdmin_(normalizada, ['TERMO'], fallback.termo)
  };
  return map;
}

function encontrarIndiceAdmin_(normalizada, tokens, fallback) {
  for (let i = 0; i < normalizada.length; i++) {
    const ok = tokens.every(t => normalizada[i].includes(t));
    if (ok) return i;
  }
  return fallback;
}

function aplicarCabecalhoOficialAdmin_(row, headerOficial, colunas, ehAdmin) {
  for (let c = 0; c < Math.min(7, colunas); c++) {
    row[c] = headerOficial[c];
  }
  // ADMIN usa coluna Localização por alinhamento de layout, embora o dado venha por cor.
  if (ehAdmin) {
    row[5] = 'Localização';
  }

  // Limpa ruído de cabeçalho deslocado após o layout alvo.
  for (let c = 7; c < colunas; c++) {
    const val = normalizarTextoAdminColuna_(row[c]);
    if (
      val === 'TERMO' ||
      val === 'SITUACAO' ||
      val === 'AQUISICAO' ||
      val === 'DENOMINACAO' ||
      val === 'LOCALIZACAO' ||
      val === 'MARCA/ EDITORA'
    ) {
      row[c] = '';
    }
  }
}

function ehLinhaPatrimonioComTombamento_(row, mapa) {
  const normalizada = row.map(normalizarTextoAdminColuna_).join(' | ');
  const ehSerie = /N.? ?DE SERIE/.test(normalizada) || normalizada.includes('NUMERO DE SERIE');

  // Linhas de descrição técnica (ex.: Nº DE SERIE) não são itens patrimoniais.
  if (ehSerie) {
    return false;
  }

  const idxTomb = (mapa && typeof mapa.tomb === 'number') ? mapa.tomb : 0;
  const tombNoIndice = extrairTombamentoAdmin_(row[idxTomb]);
  if (tombNoIndice) return true;

  // Fallback restrito apenas à coluna A, nunca varrendo toda a linha.
  const tombColunaA = extrairTombamentoAdmin_(row[0]);
  return !!tombColunaA;
}

function ehLinhaDetalheSerie_(normalizadaRow) {
  const linha = normalizadaRow.join(' | ');
  return /N.? ?DE SERIE/.test(linha) || linha.includes('NUMERO DE SERIE');
}

function normalizarLinhaDetalheSerie_(row, colunas) {
  const nova = row.slice();
  while (nova.length < colunas) nova.push('');

  // Linha de detalhe nunca deve ter "tombamento" na coluna A.
  nova[0] = '';

  // Garante que não gere falso termo/situação/localização nessas linhas.
  if (colunas > 4) nova[4] = '';
  if (colunas > 5) nova[5] = '';
  if (colunas > 6) nova[6] = '';

  return nova;
}

function reorganizarLinhaPatrimonioAdmin_(row, mapa, colunas, ehAdmin) {
  const termoRegex = /^\d{1,8}\/\d{4}$/;
  const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  const tomb = extrairTombamentoAdmin_(row[mapa.tomb]) || extrairTombamentoAdmin_(row[0]);
  let den = obterTextoAdmin_(row[mapa.den]);
  let aq = formatarDataAdmin_(row[mapa.aq]);
  let marca = obterTextoAdmin_(row[mapa.marca]);
  let sit = obterTextoAdmin_(row[mapa.sit]);
  let loc = obterTextoAdmin_(row[mapa.loc]);
  let termo = obterTextoAdmin_(row[mapa.termo]);

  // Fallback de termo em qualquer coluna
  if (!termoRegex.test(termo)) {
    const termoDetectado = detectarTermoNaLinhaAdmin_(row, termoRegex);
    termo = termoDetectado || termo;
  }
  if (loc && termoRegex.test(loc)) {
    if (!termo) termo = loc;
    loc = '';
  }
  if (loc && termo && loc === termo) {
    loc = '';
  }

  // Se aquisição veio textual e marca vazia, move para marca
  if (aq && !dataRegex.test(aq) && !marca && /[A-Za-zÀ-ÿ]/.test(aq)) {
    marca = aq;
    aq = '';
  }

  // Fallback de aquisição na linha
  if (!aq) {
    aq = detectarDataNaLinhaAdmin_(row);
  }

  // Fallback simples de situação
  if (!sit) {
    sit = detectarSituacaoNaLinhaAdmin_(row);
  }

  if (!den) {
    den = detectarDenominacaoNaLinhaAdmin_(row, tomb, aq, marca, sit, loc, termo);
  }

  const nova = row.slice();
  while (nova.length < colunas) nova.push('');

  nova[0] = tomb || '';
  nova[1] = den || '';
  nova[2] = aq || '';
  nova[3] = marca || '';
  nova[4] = sit || '';
  nova[5] = ehAdmin ? '' : (loc || '');
  nova[6] = termoRegex.test(String(termo || '').trim()) ? termo : '';

  for (let c = 7; c < colunas; c++) {
    const texto = String(nova[c] || '').trim();
    if (!texto) continue;
    if (texto === nova[6]) {
      nova[c] = '';
      continue;
    }
    if (termoRegex.test(texto)) {
      if (!nova[6]) {
        nova[6] = texto;
      }
      nova[c] = '';
    }
  }

  return nova;
}

function extrairTombamentoAdmin_(valor) {
  const texto = String(valor || '').trim();
  const m = texto.match(/(\d{10})/);
  return m ? m[1] : '';
}

function obterTextoAdmin_(valor) {
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return String(valor).trim();
}

function formatarDataAdmin_(valor) {
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }

  const texto = String(valor || '').trim();
  if (!texto) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return texto;
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const dt = new Date(texto + 'T00:00:00');
    if (!isNaN(dt.getTime())) {
      return Utilities.formatDate(dt, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    }
  }
  const dt = new Date(texto);
  if (!isNaN(dt.getTime()) && /GMT|UTC|T\d{2}:\d{2}/i.test(texto)) {
    return Utilities.formatDate(dt, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return texto;
}

function detectarTermoNaLinhaAdmin_(row, termoRegex) {
  for (let i = 0; i < row.length; i++) {
    const v = String(row[i] || '').trim();
    if (termoRegex.test(v)) return v;
  }
  return '';
}

function detectarDataNaLinhaAdmin_(row) {
  for (let i = 0; i < row.length; i++) {
    const data = formatarDataAdmin_(row[i]);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return data;
  }
  return '';
}

function detectarSituacaoNaLinhaAdmin_(row) {
  const candidatos = row.map(c => normalizarTextoAdminColuna_(c));
  const palavras = ['USO', 'OCIOS', 'BAIX', 'INSERV', 'MANUT', 'DESAP', 'TRANSFER', 'ESTOQ', 'CEDI'];
  for (let i = 0; i < candidatos.length; i++) {
    const v = candidatos[i];
    if (!v) continue;
    if (palavras.some(p => v.includes(p))) {
      return String(row[i] || '').trim();
    }
  }
  return '';
}

function detectarDenominacaoNaLinhaAdmin_(row, tomb, aq, marca, sit, loc, termo) {
  const ignorar = new Set([
    String(tomb || '').trim(),
    String(aq || '').trim(),
    String(marca || '').trim(),
    String(sit || '').trim(),
    String(loc || '').trim(),
    String(termo || '').trim()
  ]);

  for (let i = 0; i < row.length; i++) {
    const texto = String(row[i] || '').trim();
    if (!texto) continue;
    if (ignorar.has(texto)) continue;
    if (/^\d{1,8}\/\d{4}$/.test(texto)) continue;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) continue;
    if (/\d{10}/.test(texto)) continue;
    return texto;
  }
  return '';
}
