/**
 * ============================================================
 * LAYOUT — RODAPÉ INSTITUCIONAL OFICIAL
 * ============================================================
 *
 * Reproduz exatamente o rodapé institucional original.
 *
 * Comportamento:
 *  - Remove rodapé anterior (se existir)
 *  - Garante espaço suficiente na planilha
 *  - Aplica faixa amarela institucional
 *  - Exibe:
 *      • "Inventário" à esquerda (cinza escuro)
 *      • Versão + build + data à direita (cinza claro)
 *
 * Visual fiel ao layout original.
 *
 * Parâmetros:
 *  - sheet: aba ativa
 *  - ultimaLinhaEscrita: última linha utilizada pelo conteúdo
 *
 * ============================================================
 */
function layoutRodapeInstitucional_(sheet, ultimaLinhaEscrita) {

  const maxRows = sheet.getMaxRows();

  // ==========================================================
  // 1️⃣ Remover rodapé anterior
  // ==========================================================

  const colB = sheet.getRange(1, 2, maxRows, 1)
    .getValues()
    .flat();

  for (let i = 0; i < colB.length; i++) {

    if (String(colB[i]).trim() === 'Inventário') {

      sheet.getRange(i + 1, 2, 1, 5)
        .clearContent()
        .clearFormat();

      sheet.getRange(i + 1, 5, 1, 2)
        .breakApart();

      break;
    }
  }

  // ==========================================================
  // 2️⃣ Calcular linha do rodapé
  // ==========================================================

  const linhaRodape = ultimaLinhaEscrita + 2;

  if (linhaRodape > maxRows) {
    sheet.insertRowsAfter(maxRows, linhaRodape - maxRows);
  }

  // ==========================================================
  // 3️⃣ Faixa amarela
  // ==========================================================

  sheet.getRange(`B${linhaRodape}:F${linhaRodape}`)
    .setBackground('#f7d046');

  // ==========================================================
  // 4️⃣ Texto esquerdo
  // ==========================================================

  sheet.getRange(`B${linhaRodape}`)
    .setValue('     Inventário')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontColor('#666666')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  // ==========================================================
  // 5️⃣ Texto direito (versão)
  // ==========================================================

  sheet.getRange(`E${linhaRodape}:F${linhaRodape}`)
    .merge();

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