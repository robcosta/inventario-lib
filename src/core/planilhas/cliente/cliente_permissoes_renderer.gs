/**
 * ============================================================
 * BLOCO — PERMISSÕES (ACESSOS)
 * ============================================================
 *
 * Renderiza bloco institucional de permissões.
 *
 * Estrutura padrão:
 *
 * ACESSOS:
 * PROPRIETÁRIO .......... :
 * EDITOR .................... :
 * LEITOR .................... :
 *
 * ⚠️ Mantém layout original da Cliente.
 * ⚠️ Pode ser reutilizado por Relatórios futuramente.
 *
 * Parâmetros:
 * - sheet: aba ativa
 * - linhaInicial: linha onde começa o bloco
 * - permissoes: objeto contendo
 *      {
 *        proprietario: string,
 *        editor: string,
 *        leitor: string (pode conter múltiplos emails separados por vírgula)
 *      }
 * ============================================================
 */
function blocoPermissoesRenderer_(sheet, linhaInicial, permissoes) {

  // Título ACESSOS
  sheet.getRange(`C${linhaInicial}`)
    .setValue("ACESSOS:")
    .setFontFamily("Arial")
    .setFontSize(12)
    .setFontWeight("bold")
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle");

  // Espaço visual após ACESSOS
  const linhaBase = linhaInicial + 1;

  const estrutura = [
    ["      PRORIETÁRIO .............. :", permissoes.proprietario],
    ["      EDITOR ......................... :", permissoes.editor],
    ["      LEITOR ......................... :", permissoes.leitor]
  ];

  estrutura.forEach((item, index) => {

    const linha = linhaBase + index;

    // Label
    sheet.getRange(`C${linha}`)
      .setValue(item[0])
      .setFontFamily("Arial")
      .setFontSize(12)
      .setFontWeight("bold")
      .setHorizontalAlignment("left")
      .setVerticalAlignment("middle");

    // Valor
    sheet.getRange(`E${linha}`)
      .setValue(item[1] || "-")
      .setFontFamily("Arial")
      .setFontSize(12)
      .setHorizontalAlignment("left")
      .setVerticalAlignment("middle")
      .setWrap(true);
  });
}
