/**
 * ============================================================
 * CLIENTE — MONTAR INFORMAÇÕES (VERSÃO DEFINITIVA ESTÁVEL)
 * ============================================================
 *
 * Responsabilidade:
 * - Atualizar dinamicamente a aba "INFORMAÇÕES"
 * - Exibir:
 *     • Nome do contexto
 *     • Pasta ativa
 *     • Proprietário
 *     • Editores
 *     • Leitores
 * - Calcular dinamicamente a última linha real usada
 * - Reconstruir o rodapé corretamente
 *
 * @param {Object} contexto - CONTEXTO_CLIENTE ativo
 * @param {boolean} modoCompleto - Se true, consulta permissões reais
 */
function clienteMontarInformacoes_(contexto, modoCompleto = false) {

  if (!contexto || !contexto.planilhaClienteId) return;

  const ss = SpreadsheetApp.openById(contexto.planilhaClienteId);
  const sheet = ss.getSheetByName('INFORMAÇÕES');
  if (!sheet) return;

  const maxRows = sheet.getMaxRows();

  // ============================================================
  // LIMPA SOMENTE CONTEÚDO DINÂMICO (colunas C:E a partir da linha 11)
  // ============================================================
  sheet.getRange(11, 3, maxRows - 10, 3).clearContent();

  // ============================================================
  // CONTEXTO
  // ============================================================
  sheet.getRange('E8')
    .setValue(contexto.nome || '')
    .setFontFamily('Arial')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('left');

  // ============================================================
  // PASTA ATIVA
  // ============================================================
  sheet.getRange('E9')
    .setValue(contexto.localidadeAtivaNome || '')
    .setFontFamily('Arial')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('left');

  if (!modoCompleto) {
    const ultimaLinha = obterUltimaLinhaColunaE_(sheet);
    rodape_(sheet, ultimaLinha);
    return;
  }

  const arquivo = DriveApp.getFileById(contexto.planilhaClienteId);

  const proprietario = arquivo.getOwner();
  const editores = arquivo.getEditors();
  const leitores = arquivo.getViewers();

  let linha = 11;

  const aplicarLabel = (range) => {
    range
      .setFontFamily('Arial')
      .setFontSize(12)
      .setFontWeight('bold')
      .setHorizontalAlignment('left');
  };

  const aplicarEmail = (range) => {
    range
      .setFontFamily('Arial')
      .setFontSize(12)
      .setFontWeight('normal')
      .setHorizontalAlignment('left');
  };

  // ============================================================
  // PROPRIETÁRIO
  // ============================================================
  if (proprietario) {

    const label = sheet.getRange(`C${linha}`);
    label.setValue('        PROPRIETÁRIO:');
    aplicarLabel(label);

    const email = sheet.getRange(`E${linha}`);
    email.setValue(proprietario.getEmail());
    aplicarEmail(email);

    linha += 2; // linha em branco após bloco
  }

  // ============================================================
  // EDITORES
  // ============================================================
  if (editores.length > 0) {

    const label = sheet.getRange(`C${linha}`);
    label.setValue('        EDITOR:');
    aplicarLabel(label);

    editores.forEach((user, i) => {
      const email = sheet.getRange(`E${linha + i}`);
      email.setValue(user.getEmail());
      aplicarEmail(email);
    });

    linha += editores.length + 1;
  }

  // ============================================================
  // LEITORES
  // ============================================================
  if (leitores.length > 0) {

    const label = sheet.getRange(`C${linha}`);
    label.setValue('        LEITOR:');
    aplicarLabel(label);

    leitores.forEach((user, i) => {
      const email = sheet.getRange(`E${linha + i}`);
      email.setValue(user.getEmail());
      aplicarEmail(email);
    });

    linha += leitores.length + 1;
  }

  // ============================================================
  // CALCULAR ÚLTIMA LINHA REAL DA COLUNA E
  // ============================================================
  const ultimaLinhaReal = obterUltimaLinhaColunaE_(sheet);

  // ============================================================
  // CRIAR RODAPÉ
  // ============================================================
  rodape_(sheet, ultimaLinhaReal);
}

/**
 * Retorna a última linha realmente preenchida na coluna E
 */
function obterUltimaLinhaColunaE_(sheet) {

  const colE = sheet
    .getRange(1, 5, sheet.getMaxRows(), 1)
    .getValues()
    .flat();

  for (let i = colE.length - 1; i >= 0; i--) {
    if (String(colE[i]).trim() !== '') {
      return i + 1;
    }
  }

  return 11; // fallback mínimo
}
