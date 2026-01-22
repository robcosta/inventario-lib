/**
 * ============================================================
 * MONTA INFORMAÇÕES DINÂMICAS DA PLANILHA CLIENTE
 * ============================================================
 */
function cliente_montarInformacoes_(contexto) {
  if (!contexto) return;

  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('INFORMAÇÕES');
  if (!sheet) return;

  // ============================================================
  // CONTEXTO / NOME
  // ============================================================
  sheet.getRange('E8').setValue(contexto.nome || '');

  // ============================================================
  // PASTA DE TRABALHO (LINK)
  // ============================================================
  if (contexto.pastaUnidadeId) {
    const pasta = DriveApp.getFolderById(contexto.pastaUnidadeId);
    sheet.getRange('E9')
      .setValue(pasta.getUrl())
      .setFontColor('#1a73e8')
      .setFontWeight('normal');
  }

  // ============================================================
  // LIMPA ÁREA DINÂMICA (COLUNA E A PARTIR DA LINHA 10)
  // ============================================================
  sheet.getRange('E10:E50').clearContent();

  let linhaAtual = 10;

  // ============================================================
  // ADMINISTRADORES
  // ============================================================
  const admins = Array.isArray(contexto.admins)
    ? contexto.admins
    : (contexto.emailAdmin ? [contexto.emailAdmin] : []);

  admins.forEach(email => {
    sheet.getRange(`E${linhaAtual}`)
      .setValue(email)
      .setFontWeight('bold');
    linhaAtual++;
  });

  // ============================================================
  // EDITORES (DA PASTA)
  // ============================================================
  let editores = [];
  if (contexto.pastaUnidadeId) {
    const pasta = DriveApp.getFolderById(contexto.pastaUnidadeId);
    editores = pasta.getEditors().map(u => u.getEmail());
  }

  editores.forEach(email => {
    sheet.getRange(`E${linhaAtual}`)
      .setValue(email)
      .setFontWeight('normal');
    linhaAtual++;
  });

  // ============================================================
  // LEITORES (SE EXISTIR NO CONTEXTO)
  // ============================================================
  const leitores = Array.isArray(contexto.leitores)
    ? contexto.leitores
    : [];

  leitores.forEach(email => {
    sheet.getRange(`E${linhaAtual}`)
      .setValue(email)
      .setFontStyle('italic');
    linhaAtual++;
  });
}
