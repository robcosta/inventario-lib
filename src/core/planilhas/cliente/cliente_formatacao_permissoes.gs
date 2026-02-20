/**
 * ============================================================
 * CLIENTE — PERMISSÕES
 * ============================================================
 */
/**
 * ============================================================
 * CLIENTE — PERMISSÕES
 * ============================================================
 */
function clienteRenderPermissoes_(sheet, contexto) {

  const file = DriveApp.getFileById(contexto.planilhaClienteId);

  const proprietario = file.getOwner();
  const editores = file.getEditors();
  const leitores = file.getViewers();

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

  // PROPRIETÁRIO
  if (proprietario) {

    const label = sheet.getRange(`C${linha}`);
    label.setValue('        PROPRIETÁRIO .......... :');
    aplicarLabel(label);

    const email = sheet.getRange(`E${linha}`);
    email.setValue(proprietario.getEmail());
    aplicarEmail(email);

    linha += 2;
  }

  // EDITORES
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

  // LEITORES
  if (leitores.length > 0) {

    const label = sheet.getRange(`C${linha}`);
    label.setValue('        LEITOR ....................... :');
    aplicarLabel(label);

    leitores.forEach((user, i) => {
      const email = sheet.getRange(`E${linha + i}`);
      email.setValue(user.getEmail());
      aplicarEmail(email);
    });
  }
}