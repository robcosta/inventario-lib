/**
 * ============================================================
 * RELATÓRIO — ABA DE CONTROLE
 * ============================================================
 *
 * Garante existência da aba técnica:
 * __CONTROLE_PROCESSAMENTO__
 *
 * Essa aba é:
 * - Técnica
 * - Oculta
 * - Protegida futuramente
 *
 * ============================================================
 */
function criarAbaControleRelatorio_(ss) {

  if (!ss) {
    throw new Error('criarAbaControleRelatorio_: Spreadsheet não informado.');
  }

  let sheet = ss.getSheetByName('__CONTROLE_PROCESSAMENTO__');

  if (!sheet) {
    sheet = ss.insertSheet('__CONTROLE_PROCESSAMENTO__');
    inicializarCabecalhoControleRelatorio_(sheet);
  } else if (sheet.getLastRow() < 1 || String(sheet.getRange('A1').getValue()).trim() === '') {
    inicializarCabecalhoControleRelatorio_(sheet);
  }

  sheet.setHiddenGridlines(true);
  protegerAbaControleRelatorio_(sheet);
}

function inicializarCabecalhoControleRelatorio_(sheet) {
  const cabecalho = [
    'DATA_HORA',
    'TIPO_EVENTO',
    'NOME_ABA',
    'LINHA_ABA',
    'COLUNA_ABA',
    'TOMBAMENTO',
    'VALOR_ANTERIOR',
    'VALOR_NOVO',
    'EMAIL_USUARIO',
    'ORIGEM',
    'OBSERVACAO'
  ];

  sheet.getRange(1, 1, 1, cabecalho.length)
    .setValues([cabecalho])
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontWeight('bold')
    .setBackground('#666666')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('left');

  sheet.setFrozenRows(1);
}

function obterAbaControleRelatorio_(ss) {
  if (!ss) return null;
  let sheet = ss.getSheetByName('__CONTROLE_PROCESSAMENTO__');

  if (!sheet) {
    criarAbaControleRelatorio_(ss);
    sheet = ss.getSheetByName('__CONTROLE_PROCESSAMENTO__');
  }

  return sheet;
}

function registrarEventoControleRelatorio_(ss, evento) {
  const sheet = obterAbaControleRelatorio_(ss);
  if (!sheet) return;

  const agora = new Date();
  const email = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'DESCONHECIDO';
  const linha = [
    Utilities.formatDate(agora, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'),
    evento?.tipoEvento || '',
    evento?.nomeAba || '',
    evento?.linhaAba || '',
    evento?.colunaAba || '',
    evento?.tombamento || '',
    evento?.valorAnterior || '',
    evento?.valorNovo || '',
    evento?.emailUsuario || email,
    evento?.origem || '',
    evento?.observacao || ''
  ];

  sheet.appendRow(linha);
}

function registrarEdicaoManualRelatorio_(e) {
  if (!e || !e.range) return;
  const ss = e.source || SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  const contexto = obterContextoDominio_();
  if (!contexto || !contexto.planilhaRelatorioId) return;
  if (ss.getId() !== contexto.planilhaRelatorioId) return;

  const sheet = e.range.getSheet();
  const nomeAba = sheet.getName();
  if (nomeAba === '__CONTROLE_PROCESSAMENTO__') return;
  if (nomeAba !== RELATORIO_ABA_VISAO_GERAL) return;

  const linhaAba = e.range.getRow();
  const colunaAba = e.range.getColumn();
  if (linhaAba <= 4) return;

  const valorNovo = Object.prototype.hasOwnProperty.call(e, 'value')
    ? e.value
    : e.range.getDisplayValue();
  const valorAnterior = Object.prototype.hasOwnProperty.call(e, 'oldValue')
    ? e.oldValue
    : '';
  const tombamento = String(sheet.getRange(linhaAba, 1).getDisplayValue() || '').trim();

  registrarEventoControleRelatorio_(ss, {
    tipoEvento: 'EDICAO_MANUAL',
    nomeAba,
    linhaAba,
    colunaAba: colunaToLetter_(colunaAba),
    tombamento,
    valorAnterior,
    valorNovo,
    origem: 'TRIGGER_ON_EDIT'
  });
}

function protegerAbaControleRelatorio_(sheet) {
  if (!sheet) return;

  try {
    const protecoes = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    protecoes.forEach(p => {
      if (p.getDescription() === 'Controle RELATÓRIO — protegido') {
        p.remove();
      }
    });

    const protecao = sheet.protect().setDescription('Controle RELATÓRIO — protegido');
    const meuEmail = Session.getEffectiveUser().getEmail();
    const editores = protecao.getEditors();
    if (editores && editores.length) {
      protecao.removeEditors(editores);
    }
    if (meuEmail) {
      protecao.addEditor(meuEmail);
    }
    if (protecao.canDomainEdit()) {
      protecao.setDomainEdit(false);
    }
  } catch (e) {
    Logger.log('[RELATORIO][CONTROLE][PROTECAO] ' + e.message);
  }
}

function colunaToLetter_(coluna) {
  let temp = coluna;
  let letra = '';
  while (temp > 0) {
    const resto = (temp - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    temp = Math.floor((temp - resto - 1) / 26);
  }
  return letra;
}
