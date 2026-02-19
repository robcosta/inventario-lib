/**
 * ============================================================
 * CLIENTE — PERMISSÕES
 * ============================================================
 */
function clienteRenderPermissoes_(sheet, contexto) {

  const arquivo = DriveApp.getFileById(contexto.planilhaClienteId);

  const proprietario = arquivo.getOwner();
  const editores = arquivo.getEditors();
  const leitores = arquivo.getViewers();

  let linha = 11;

  const aplicarLabel = (range) =>
    range.setFontFamily('Arial')
      .setFontSize(12)
      .setFontWeight('bold')
      .setHorizontalAlignment('left');

  const aplicarEmail = (range) =>
    range.setFontFamily('Arial')
      .setFontSize(12)
      .setHorizontalAlignment('left');

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
  }
}
