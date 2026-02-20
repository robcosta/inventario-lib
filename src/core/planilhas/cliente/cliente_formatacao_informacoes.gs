/**
 * ============================================================
 * CLIENTE — MONTAR INFORMAÇÕES
 * ============================================================
 */
/**
 * ============================================================
 * CLIENTE — MONTAR INFORMAÇÕES (DEFINITIVO)
 * ============================================================
 */
function clienteMontarInformacoes_(contexto) {

  if (!contexto || !contexto.planilhaClienteId) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('INFORMAÇÕES');

  if (!sheet) return;

  clienteLimparAreaDinamica_(sheet);

  clienteRenderContextoBasico_(sheet, contexto);

  clienteRenderPermissoes_(sheet, contexto);

  clienteAtualizarRodape_(sheet);
}

function clienteLimparAreaDinamica_(sheet) {

  const maxRows = sheet.getMaxRows();

  sheet
    .getRange(11, 3, maxRows - 10, 3)
    .clearContent();
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

function clienteAtualizarRodape_(sheet) {

  const ultima = obterUltimaLinhaColunaE_(sheet);

  rodape_(sheet, ultima);
}

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

  return 11;
}

