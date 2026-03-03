/**
 * ============================================================
 * RELATÓRIO — VISÃO GERAL
 * ============================================================
 * Consolida bens da ADMIN e complementa Localização pela GERAL.
 */

const RELATORIO_ABA_VISAO_GERAL = 'Visão Geral';
const RELATORIO_ABA_CONTROLE = '__CONTROLE_PROCESSAMENTO__';

function relatorioGerarVisaoGeral_() {
  const contexto = obterContextoDominio_();

  if (!contexto) {
    throw new Error('Nenhum contexto ativo.');
  }

  const planilhaRelatorioId = resolverPlanilhaRelatorioId_(contexto);

  if (!contexto.planilhaAdminId) {
    throw new Error('Planilha ADMIN não configurada no contexto.');
  }

  const planilhaGeralId = contexto.planilhaGeralId || obterPlanilhaGeralId_();
  if (!planilhaGeralId) {
    throw new Error('Planilha GERAL não configurada.');
  }

  const adminFormatada = validarPlanilhaFormatada_(contexto.planilhaAdminId);
  const geralFormatada = validarPlanilhaFormatada_(planilhaGeralId);
  if (!adminFormatada || !geralFormatada) {
    const faltantes = [];
    if (!adminFormatada) faltantes.push('ADMIN');
    if (!geralFormatada) faltantes.push('GERAL');
    throw new Error(
      'Antes de gerar o relatório, formate as planilhas: ' + faltantes.join(' e ') + '.'
    );
  }

  const ssRelatorio = SpreadsheetApp.openById(planilhaRelatorioId);
  const ssAdmin = SpreadsheetApp.openById(contexto.planilhaAdminId);
  const ssGeral = SpreadsheetApp.openById(planilhaGeralId);

  const localizacaoPorTombamento = mapearLocalizacaoPorTombamento_(ssGeral);
  const localizacaoPorCor = mapearLocalizacaoPorCor_(contexto);
  const corPorLocalizacao = mapearCorPorLocalizacao_(contexto);
  const registros = extrairBensAdminParaRelatorio_(
    ssAdmin,
    localizacaoPorTombamento,
    localizacaoPorCor,
    corPorLocalizacao
  );

  const abaExistente = ssRelatorio.getSheetByName(RELATORIO_ABA_VISAO_GERAL);
  const eventoTipo = abaExistente ? 'RECRIACAO_ABA' : 'CRIACAO_ABA';

  const sheet = abaExistente || ssRelatorio.insertSheet(RELATORIO_ABA_VISAO_GERAL);
  montarAbaVisaoGeralRelatorio_(sheet, registros, RELATORIO_ABA_VISAO_GERAL);
  ordenarAbasRelatorio_(ssRelatorio);
  atualizarLegendaRelatorio_(ssRelatorio, contexto);

  registrarEventoControleRelatorio_(ssRelatorio, {
    tipoEvento: eventoTipo,
    nomeAba: RELATORIO_ABA_VISAO_GERAL,
    origem: 'MENU',
    observacao: `Linhas geradas: ${registros.length}`
  });

  try {
    ssRelatorio.setActiveSheet(sheet);
  } catch (e) {}
}

function extrairBensAdminParaRelatorio_(ssAdmin, localizacaoPorTombamento, localizacaoPorCor, corPorLocalizacao) {
  const porTombamento = {};
  const sheets = ssAdmin.getSheets();

  sheets.forEach(sheet => {
    const nome = sheet.getName();
    if (nome === RELATORIO_ABA_CONTROLE || nome === 'CAPA' || nome === 'MANUAL') return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 1 || lastCol < 1) return;

    const valores = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const fundosColA = sheet.getRange(1, 1, lastRow, 1).getBackgrounds();
    const idx = detectarIndiceColunasInventario_(valores);

    valores.forEach((row, rowIndex) => {
      const tombamento = extrairTombamento_(row[idx.tombamento]);
      if (!tombamento) return;

      const localizacaoDaGeral = sanitizarTextoLocalizacao_(localizacaoPorTombamento[tombamento] || '');
      const corLinha = normalizarCorHex_(fundosColA[rowIndex][0]);
      const localizacaoDaCor = sanitizarTextoLocalizacao_(localizacaoPorCor[corLinha] || '');
      const termoBase = obterValorSeguro_(row[idx.termo]);

      let localizacao = localizacaoDaGeral || localizacaoDaCor || '';
      let termo = termoBase;

      // Termo nunca deve ocupar a coluna Localização.
      if (ehFormatoTermo_(localizacao)) {
        if (!termo) termo = localizacao;
        localizacao = '';
      }
      if (localizacao && termo && localizacao === termo) {
        localizacao = '';
      }

      let aquisicao = formatarDataAquisicao_(row[idx.aquisicao]);
      let marca = obterValorSeguro_(row[idx.marca]);
      const ajusteAquisicaoMarca = ajustarAquisicaoMarca_(aquisicao, marca);
      aquisicao = ajusteAquisicaoMarca.aquisicao;
      marca = ajusteAquisicaoMarca.marca;

      let corDestaque = '';
      if (localizacao) {
        const chaveLocalizacao = normalizarTextoComparacao_(localizacao);
        corDestaque = corPorLocalizacao[chaveLocalizacao] || '';
      }
      if (!corDestaque && localizacaoDaCor) {
        corDestaque = corLinha;
      }
      if (!corDestaque && localizacao && corLinha && corLinha !== '#ffffff') {
        corDestaque = corLinha;
      }

      const registro = [
        tombamento,
        obterValorSeguro_(row[idx.denominacao]),
        aquisicao,
        marca,
        obterValorSeguro_(row[idx.situacao]),
        localizacao,
        termo
      ];

      if (!porTombamento[tombamento]) {
        porTombamento[tombamento] = { dados: registro, cor: corDestaque };
        return;
      }

      // Se já existir, prioriza o registro com mais dados úteis.
      const atual = porTombamento[tombamento].dados;
      const scoreAtual = contarCamposPreenchidos_(atual);
      const scoreNovo = contarCamposPreenchidos_(registro);
      if (scoreNovo > scoreAtual) {
        porTombamento[tombamento] = { dados: registro, cor: corDestaque };
        return;
      }

      // Se empate, prioriza o que já possui localização e cor definida.
      if (scoreNovo === scoreAtual) {
        const atualTemLocalizacao = !!String(atual[5] || '').trim();
        const novoTemLocalizacao = !!String(registro[5] || '').trim();
        const atualTemCor = !!String(porTombamento[tombamento].cor || '').trim();
        const novoTemCor = !!String(corDestaque || '').trim();
        if ((!atualTemLocalizacao && novoTemLocalizacao) || (!atualTemCor && novoTemCor)) {
          porTombamento[tombamento] = { dados: registro, cor: corDestaque };
        }
      }
    });
  });

  const registros = Object.keys(porTombamento).map(k => porTombamento[k]);
  registros.sort((a, b) => String(a.dados[0]).localeCompare(String(b.dados[0])));
  return registros;
}

function mapearLocalizacaoPorTombamento_(ssGeral) {
  const mapa = {};
  const sheets = ssGeral.getSheets();

  sheets.forEach(sheet => {
    const nome = sheet.getName();
    if (nome === RELATORIO_ABA_CONTROLE || nome === 'CAPA' || nome === 'MANUAL') return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 1 || lastCol < 1) return;

    const valores = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const idx = detectarIndiceColunasInventario_(valores);
    if (idx.localizacao < 0) return;

    valores.forEach(row => {
      const tombamento = extrairTombamento_(row[idx.tombamento]);
      if (!tombamento) return;

      let localizacao = sanitizarTextoLocalizacao_(row[idx.localizacao]);
      if (!localizacao) return;
      if (idx.termo >= 0) {
        const termo = obterValorSeguro_(row[idx.termo]);
        if (termo && termo === localizacao) return;
      }
      if (ehFormatoTermo_(localizacao)) return;

      if (!mapa[tombamento]) {
        mapa[tombamento] = localizacao;
      }
    });
  });

  return mapa;
}

function mapearLocalizacaoPorCor_(contexto) {
  const mapa = {};
  let pastas = [];
  try {
    pastas = obterPastasVivas_(contexto) || [];
  } catch (e) {
    return mapa;
  }

  pastas.forEach(p => {
    const cor = normalizarCorHex_(p.cor);
    if (!cor) return;
    mapa[cor] = p.nome || '';
  });

  return mapa;
}

function mapearCorPorLocalizacao_(contexto) {
  const mapa = {};
  let pastas = [];
  try {
    pastas = obterPastasVivas_(contexto) || [];
  } catch (e) {
    return mapa;
  }

  pastas.forEach(p => {
    const nome = normalizarTextoComparacao_(p.nome || '');
    const cor = normalizarCorHex_(p.cor);
    if (!nome || !cor) return;
    mapa[nome] = cor;
  });

  return mapa;
}

function detectarIndiceColunasInventario_(valores) {
  const padrao = {
    headerRow: -1,
    tombamento: 0,
    denominacao: 1,
    aquisicao: 2,
    marca: 3,
    situacao: 4,
    localizacao: 5,
    termo: 6
  };

  for (let i = 0; i < valores.length; i++) {
    const row = valores[i];
    const normalizada = row.map(v => normalizarTextoColuna_(v));
    const contemTombamento = normalizada.some(v => v.includes('TOMBAMENTO'));
    const contemDenominacao = normalizada.some(v => v.includes('DENOMINACAO'));
    if (!contemTombamento || !contemDenominacao) continue;

    padrao.headerRow = i;
    padrao.tombamento = encontrarIndiceColuna_(normalizada, ['TOMBAMENTO'], 0);
    padrao.denominacao = encontrarIndiceColuna_(normalizada, ['DENOMINACAO'], 1);
    padrao.aquisicao = encontrarIndiceColuna_(normalizada, ['AQUISICAO'], 2);
    padrao.marca = encontrarIndiceColuna_(normalizada, ['MARCA', 'EDITORA'], 3);
    padrao.situacao = encontrarIndiceColuna_(normalizada, ['SITUACAO'], 4);
    padrao.localizacao = encontrarIndiceColuna_(normalizada, ['LOCALIZACAO'], 5);
    padrao.termo = encontrarIndiceColuna_(normalizada, ['TERMO'], 6);
    break;
  }

  return padrao;
}

function encontrarIndiceColuna_(rowNormalizada, tokens, fallback) {
  for (let i = 0; i < rowNormalizada.length; i++) {
    const val = rowNormalizada[i];
    const ok = tokens.every(t => val.includes(t));
    if (ok) return i;
  }
  return fallback;
}

function normalizarTextoColuna_(valor) {
  return String(valor || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function extrairTombamento_(valor) {
  const texto = String(valor || '').trim();
  const match = texto.match(/(\d{10})/);
  return match ? match[1] : '';
}

function obterValorSeguro_(valor) {
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return String(valor).trim();
}

function contarCamposPreenchidos_(registro) {
  let total = 0;
  for (let i = 0; i < registro.length; i++) {
    if (String(registro[i] || '').trim() !== '') {
      total++;
    }
  }
  return total;
}

function normalizarCorHex_(cor) {
  const texto = String(cor || '').trim().toLowerCase();
  if (!texto) return '';
  if (/^#[0-9a-f]{6}$/.test(texto)) return texto;
  return texto;
}

function sanitizarTextoLocalizacao_(valor) {
  return String(valor || '').trim();
}

function ehFormatoTermo_(texto) {
  const val = String(texto || '').trim();
  return /^\d{1,8}\/\d{4}$/.test(val);
}

function formatarDataAquisicao_(valor) {
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }

  const texto = String(valor || '').trim();
  if (!texto) return '';

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
    return texto;
  }

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

function ehDataValidaTexto_(texto) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(String(texto || '').trim());
}

function ajustarAquisicaoMarca_(aquisicao, marca) {
  let aq = String(aquisicao || '').trim();
  let mk = String(marca || '').trim();

  // Quando aquisição vier textual (ex.: MARELLI) e marca estiver vazia,
  // move para Marca/Editora.
  if (aq && !ehDataValidaTexto_(aq) && !mk && /[A-Za-z]/.test(aq)) {
    mk = aq;
    aq = '';
  }

  return { aquisicao: aq, marca: mk };
}

function normalizarTextoComparacao_(valor) {
  return String(valor || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function montarAbaVisaoGeralRelatorio_(sheet, registros, nomeRelatorio) {
  const tituloRelatorio = String(nomeRelatorio || RELATORIO_ABA_VISAO_GERAL).trim();

  sheet.clear();
  sheet.setHiddenGridlines(true);

  sheet.getRange('A1:G1')
    .merge()
    .setValue('Polícia Rodoviária Federal')
    .setFontFamily('Arial')
    .setFontSize(14)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  const dataGeracao = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'dd/MM/yyyy HH:mm'
  );
  const email = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'DESCONHECIDO';

  sheet.getRange('A2:G2')
    .merge()
    .setValue(`Relatório: ${tituloRelatorio} | Gerado em: ${dataGeracao} | Usuário: ${email}`)
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  const cabecalho = [
    'Tombamento',
    'Denominação',
    'Aquisição',
    'Marca/ Editora',
    'Situação',
    'Localização',
    'Termo'
  ];

  sheet.getRange(4, 1, 1, cabecalho.length)
    .setValues([cabecalho])
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontWeight('bold')
    .setBackground('#b7b7b7')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  if (registros.length > 0) {
    const dados = registros.map(r => r.dados);
    sheet.getRange(5, 1, dados.length, 7).setValues(dados);

    const fundos = registros.map(r => {
      const cor = r.cor || '#ffffff';
      return [cor, cor, cor, cor, cor, cor, cor];
    });
    sheet.getRange(5, 1, dados.length, 7).setBackgrounds(fundos);
  }

  const ultimaLinha = Math.max(5, registros.length + 4);
  sheet.getRange(4, 1, ultimaLinha - 3, 7).setBorder(true, true, true, true, true, true);

  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 320);
  sheet.setColumnWidth(3, 110);
  sheet.setColumnWidth(4, 200);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 220);
  sheet.setColumnWidth(7, 130);

  sheet.setFrozenRows(4);

  try {
    const filtroAtual = sheet.getFilter();
    if (filtroAtual) filtroAtual.remove();
  } catch (e) {}

  if (ultimaLinha >= 4) {
    sheet.getRange(4, 1, ultimaLinha - 3, 7).createFilter();
  }
}

function atualizarLegendaRelatorio_(ss, contexto) {
  if (!ss || !contexto) return;

  let pastas = [];
  try {
    pastas = obterPastasVivas_(contexto) || [];
  } catch (e) {
    return;
  }
  if (!pastas.length) return;

  pastas.sort((a, b) => a.nome.localeCompare(b.nome));

  let richTextFinal = null;
  try {
    const builder = SpreadsheetApp.newRichTextValue();
    let texto = '';
    pastas.forEach(p => {
      texto += ` ■ ${p.nome}    `;
    });
    builder.setText(texto);

    let pos = 0;
    pastas.forEach(p => {
      const bloco = ` ■ ${p.nome}    `;
      const estiloIcone = SpreadsheetApp.newTextStyle()
        .setForegroundColor(p.cor)
        .setBold(true)
        .setFontSize(14)
        .build();
      const estiloTexto = SpreadsheetApp.newTextStyle()
        .setForegroundColor('#202124')
        .setBold(true)
        .setFontSize(10)
        .build();

      builder.setTextStyle(pos, pos + 2, estiloIcone);
      builder.setTextStyle(pos + 2, pos + bloco.length, estiloTexto);
      pos += bloco.length;
    });

    richTextFinal = builder.build();
  } catch (e) {
    return;
  }

  ss.getSheets().forEach(sheet => {
    const nome = sheet.getName();
    if (nome === 'CAPA' || nome === 'MANUAL' || nome === '__CONTROLE_PROCESSAMENTO__') return;

    try {
      removerLegendaAntiga_(sheet);
      const ultimaLinha = sheet.getLastRow();
      const linhaDestino = ultimaLinha < 5 ? 10 : ultimaLinha + 2;
      const totalColunas = Math.max(sheet.getLastColumn(), 7);
      const range = sheet.getRange(linhaDestino, 1, 1, totalColunas);

      try { range.breakApart(); } catch (_) {}
      range
        .merge()
        .setBackground('#ffffff')
        .setRichTextValue(richTextFinal)
        .setHorizontalAlignment('left')
        .setVerticalAlignment('middle');
    } catch (e) {}
  });
}
