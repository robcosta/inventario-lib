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
  const registros = extrairBensAdminParaRelatorio_(
    ssAdmin,
    localizacaoPorTombamento,
    localizacaoPorCor
  );

  const abaExistente = ssRelatorio.getSheetByName(RELATORIO_ABA_VISAO_GERAL);
  const eventoTipo = abaExistente ? 'RECRIACAO_ABA' : 'CRIACAO_ABA';

  const sheet = abaExistente || ssRelatorio.insertSheet(RELATORIO_ABA_VISAO_GERAL);
  montarAbaVisaoGeralRelatorio_(sheet, registros);
  ordenarAbasRelatorio_(ssRelatorio);

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

function extrairBensAdminParaRelatorio_(ssAdmin, localizacaoPorTombamento, localizacaoPorCor) {
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

      const localizacaoDaGeral = localizacaoPorTombamento[tombamento] || '';
      const corLinha = normalizarCorHex_(fundosColA[rowIndex][0]);
      const localizacaoDaCor = localizacaoPorCor[corLinha] || '';
      const localizacao = localizacaoDaGeral || localizacaoDaCor || '';

      const registro = [
        tombamento,
        obterValorSeguro_(row[idx.denominacao]),
        '',
        obterValorSeguro_(row[idx.aquisicao]),
        obterValorSeguro_(row[idx.marca]),
        '',
        obterValorSeguro_(row[idx.situacao]),
        localizacao,
        obterValorSeguro_(row[idx.termo])
      ];

      if (!porTombamento[tombamento]) {
        porTombamento[tombamento] = registro;
        return;
      }

      // Se já existir, prioriza o registro com mais dados úteis.
      const atual = porTombamento[tombamento];
      const scoreAtual = contarCamposPreenchidos_(atual);
      const scoreNovo = contarCamposPreenchidos_(registro);
      if (scoreNovo > scoreAtual) {
        porTombamento[tombamento] = registro;
      }
    });
  });

  const registros = Object.keys(porTombamento).map(k => porTombamento[k]);
  registros.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
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

      const localizacao = obterValorSeguro_(row[idx.localizacao]);
      if (!localizacao) return;
      if (idx.termo >= 0) {
        const termo = obterValorSeguro_(row[idx.termo]);
        if (termo && termo === localizacao) return;
      }

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

function detectarIndiceColunasInventario_(valores) {
  const padrao = {
    headerRow: -1,
    tombamento: 0,
    denominacao: 1,
    aquisicao: 3,
    marca: 4,
    situacao: 6,
    localizacao: -1,
    termo: 8
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
    padrao.aquisicao = encontrarIndiceColuna_(normalizada, ['AQUISICAO'], 3);
    padrao.marca = encontrarIndiceColuna_(normalizada, ['MARCA', 'EDITORA'], 4);
    padrao.situacao = encontrarIndiceColuna_(normalizada, ['SITUACAO'], 6);
    padrao.localizacao = encontrarIndiceColuna_(normalizada, ['LOCALIZACAO'], -1);
    padrao.termo = encontrarIndiceColuna_(normalizada, ['TERMO'], padrao.localizacao >= 0 ? padrao.localizacao + 1 : 7);
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

function montarAbaVisaoGeralRelatorio_(sheet, registros) {
  sheet.clear();
  sheet.setHiddenGridlines(true);

  sheet.getRange('A1:I1')
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

  sheet.getRange('A2:I2')
    .merge()
    .setValue(`Relatório: ${RELATORIO_ABA_VISAO_GERAL} | Gerado em: ${dataGeracao} | Usuário: ${email}`)
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  const cabecalho = [
    'Tombamento',
    'Denominação',
    '',
    'Aquisição',
    'Marca/ Editora',
    '',
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
    sheet.getRange(5, 1, registros.length, 9).setValues(registros);
  }

  const ultimaLinha = Math.max(5, registros.length + 4);
  sheet.getRange(4, 1, ultimaLinha - 3, 9).setBorder(true, true, true, true, true, true);

  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 320);
  sheet.setColumnWidth(3, 30);
  sheet.setColumnWidth(4, 110);
  sheet.setColumnWidth(5, 200);
  sheet.setColumnWidth(6, 30);
  sheet.setColumnWidth(7, 120);
  sheet.setColumnWidth(8, 220);
  sheet.setColumnWidth(9, 130);

  sheet.setFrozenRows(4);

  try {
    const filtroAtual = sheet.getFilter();
    if (filtroAtual) filtroAtual.remove();
  } catch (e) {}

  if (ultimaLinha >= 4) {
    sheet.getRange(4, 1, ultimaLinha - 3, 9).createFilter();
  }
}
