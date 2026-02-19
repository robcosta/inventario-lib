function rodape_(sheet, ultimaLinhaEscrita) {

  const maxRows = sheet.getMaxRows();
  const colB = sheet.getRange(1, 2, maxRows, 1).getValues().flat();

  for (let i = 0; i < colB.length; i++) {
    if (String(colB[i]).trim() === 'Inventário') {
      sheet.getRange(i + 1, 2, 1, 5).clearContent().clearFormat();
      sheet.getRange(i + 1, 5, 1, 2).breakApart();
      break;
    }
  }

  const linhaRodape = ultimaLinhaEscrita + 2;

  if (linhaRodape > maxRows) {
    sheet.insertRowsAfter(maxRows, linhaRodape - maxRows);
  }

  sheet.getRange(`B${linhaRodape}:F${linhaRodape}`)
    .setBackground('#f7d046');

  sheet.getRange(`B${linhaRodape}`)
    .setValue('     Inventário')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontColor('#666666')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  sheet.getRange(`E${linhaRodape}:F${linhaRodape}`).merge();

  const v = obterVersaoSistema_();

  sheet.getRange(`E${linhaRodape}`)
    .setValue(`${v.versao} (${v.build}) ${v.data}`)
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontColor('#999999')
    .setFontWeight('bold')
    .setHorizontalAlignment('right')
    .setVerticalAlignment('middle');
}
