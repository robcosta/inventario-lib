/**
 * ============================================================
 * MONTA AS INFORMAÇÕES DINÂMICAS DA PLANILHA CLIENTE
 * + AJUSTES DE PROTEÇÃO E FORMATAÇÃO
 * ============================================================
 * Regras:
 * - Contexto em E8
 * - Link da pasta em E9 (texto: "Clique aqui")
 * - Dados dinâmicos iniciam em E11
 * - Proprietário → Editores → Leitores
 * - Fonte: Arial, 13
 * - E-mails SEM negrito
 * - Bloco B4:E16 da aba INFORMAÇÕES protegido
 * - Célula B2 da aba MANUAL protegida
 */
function cliente_montarInformacoes_(contexto) {
  if (!contexto || !contexto.planilhaClienteId) return;

  // ============================================================
  // ABRE A PLANILHA CLIENTE
  // ============================================================
  const ss = SpreadsheetApp.openById(contexto.planilhaClienteId);
  const infoSheet = ss.getSheetByName('INFORMAÇÕES');
  if (!infoSheet) return;

  // ============================================================
  // CONTEXTO (E8)
  // ============================================================
  infoSheet.getRange('E8')
    .setValue(contexto.nome || '')
    .setFontFamily('Arial')
    .setFontSize(13)
    .setFontWeight('bold');

  // ============================================================
  // LINK DA PASTA (E9) → TEXTO FIXO "Clique aqui"
  // ============================================================
  if (contexto.pastaUnidadeId) {
    const pasta = DriveApp.getFolderById(contexto.pastaUnidadeId);
    const richLink = SpreadsheetApp.newRichTextValue()
      .setText('Clique aqui')
      .setLinkUrl(0, 'Clique aqui'.length, pasta.getUrl())
      .build();

    infoSheet.getRange('E9')
      .setRichTextValue(richLink)
      .setFontFamily('Arial')
      .setFontSize(13);
  } else {
    infoSheet.getRange('E9').clearContent();
  }

  // ============================================================
  // LIMPA ÁREA DINÂMICA (A PARTIR DA LINHA 11)
  // ============================================================
  infoSheet.getRange('E11:E200').clearContent();

  let linha = 11;

  // ============================================================
  // ARQUIVO DA PLANILHA (PERMISSÕES REAIS)
  // ============================================================
  const arquivo = DriveApp.getFileById(contexto.planilhaClienteId);

  // ============================================================
  // PROPRIETÁRIO
  // ============================================================
  const proprietario = arquivo.getOwner();
  if (proprietario) {
    infoSheet.getRange(`E${linha}`)
      .setValue(proprietario.getEmail())
      .setFontFamily('Arial')
      .setFontSize(13)
      .setFontWeight('normal');
    linha++;
  }

  // ============================================================
  // EDITORES
  // ============================================================
  const editores = arquivo.getEditors().map(u => u.getEmail());
  editores.forEach(email => {
    infoSheet.getRange(`E${linha}`)
      .setValue(email)
      .setFontFamily('Arial')
      .setFontSize(13)
      .setFontWeight('normal');
    linha++;
  });

  // ============================================================
  // LEITORES
  // ============================================================
  const leitores = arquivo.getViewers().map(u => u.getEmail());
  leitores.forEach(email => {
    infoSheet.getRange(`E${linha}`)
      .setValue(email)
      .setFontFamily('Arial')
      .setFontSize(13)
      .setFontWeight('normal');
    linha++;
  });

  // ============================================================
  // PROTEÇÃO DE EDIÇÃO — ABA INFORMAÇÕES
  // ============================================================
  const protecaoInfo = infoSheet.getRange('B4:E16').protect();
  protecaoInfo.setDescription('Bloco protegido - Informações');
  protecaoInfo.removeEditors(protecaoInfo.getEditors());

  // ============================================================
  // PROTEÇÃO DE EDIÇÃO — ABA MANUAL (B2)
  // ============================================================
  const manualSheet = ss.getSheetByName('MANUAL');
  if (manualSheet) {
    const protecaoManual = manualSheet.getRange('B2').protect();
    protecaoManual.setDescription('Manual protegido');
    protecaoManual.removeEditors(protecaoManual.getEditors());
  }
}
