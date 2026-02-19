/**
 * ============================================================
 * CLIENTE — MONTAR INFORMAÇÕES (ARQUITETURA MODULAR)
 * ============================================================
 */
function clienteMontarInformacoes_(contexto, modoCompleto = false) {

  if (!contexto || !contexto.planilhaClienteId) return;

  const ss = SpreadsheetApp.openById(contexto.planilhaClienteId);
  const sheet = ss.getSheetByName('INFORMAÇÕES');
  if (!sheet) return;

  clienteLimparAreaDinamica_(sheet);

  clienteRenderContextoBasico_(sheet, contexto);

  if (modoCompleto) {
    clienteRenderPermissoes_(sheet, contexto);
  }

  clienteRenderRodape_(sheet);
}

function clienteLimparAreaDinamica_(sheet) {
  const maxRows = sheet.getMaxRows();
  sheet.getRange(11, 3, maxRows - 10, 3).clearContent();
}

function clienteRenderContextoBasico_(sheet, contexto) {

  sheet.getRange('E8')
    .setValue(contexto.nome || '')
    .setFontFamily('Arial')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('left');

  sheet.getRange('E9')
    .setValue(contexto.localidadeAtivaNome || '')
    .setFontFamily('Arial')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('left');
}

function clienteRenderPermissoes_(sheet, contexto) {

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

  if (proprietario) {

    const label = sheet.getRange(`C${linha}`);
    label.setValue('        PROPRIETÁRIO .......... :');
    aplicarLabel(label);

    const email = sheet.getRange(`E${linha}`);
    email.setValue(proprietario.getEmail());
    aplicarEmail(email);

    linha += 2;
  }

  if (editores.length > 0) {

    const label = sheet.getRange(`C${linha}`);
    label.setValue('        EDITOR ....................... :');
    aplicarLabel(label);

    editores.forEach((user, i) => {
      const email = sheet.getRange(`E${linha + i}`);
      email.setValue(user.getEmail());
      aplicarEmail(email);
    });

    linha += editores.length + 1;
  }

  if (leitores.length > 0) {

    const label = sheet.getRange(`C${linha}`);
    label.setValue('        LEITOR ....................... :');
    aplicarLabel(label);

    leitores.forEach((user, i) => {
      const email = sheet.getRange(`E${linha + i}`);
      email.setValue(user.getEmail());
      aplicarEmail(email);
    });

    linha += leitores.length + 1;
  }
}

function clienteRenderRodape_(sheet) {

  const ultimaLinhaReal = obterUltimaLinhaColunaE_(sheet);

  rodape_(sheet, ultimaLinhaReal);
}

/**
 * ============================================================
 * CLIENTE — UTIL: ÚLTIMA LINHA REAL DA COLUNA E
 * ============================================================
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

