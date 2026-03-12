/**
 * ============================================================
 * CLIENTE — RENDERIZAÇÃO DA ABA "CAPA"
 * ============================================================
 *
 * Responsável por montar a capa institucional da planilha CLIENTE.
 *
 * Estrutura visual oficial:
 *  - Layout estrutural base (colunas e alturas)
 *  - Cabeçalho PRF institucional
 *  - Título principal
 *  - Bloco:
 *      • Contexto de Trabalho
 *      • Pasta de Fotos ativa
 *  - Bloco de Acessos:
 *      • Proprietário
 *      • Editor
 *      • Leitor
 *  - Rodapé institucional
 *
 * ❌ Não exibe IDs técnicos
 * ❌ Não exibe dados internos
 * ❌ Não altera padrão visual institucional
 *
 * Depende dos módulos:
 *  - layoutBaseEstrutura_
 *  - layoutCabecalhoPRF_
 *  - layoutTituloPrincipal_
 *  - blocoPermissoesRenderer_
 *  - layoutRodapeInstitucional_
 *
 * ============================================================
 */
function renderizarPlanilhaCliente_(contexto, ssOverride) {

  Logger.log(`renderizarPlanilhaCliente_: renderizando aba CAPA para o contexto ${contexto.nome || 'não definido'}`);

  if (!contexto) {
    throw new Error('renderizarPlanilhaCliente_: contexto inválido.');
  }

  const ss = ssOverride || SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw new Error('Nenhuma planilha ativa.');
  }

  // ==========================================================
  // 1️⃣ Garantir aba "CAPA"
  // ==========================================================

  const sheetInformacoes = ss.getSheetByName('INFORMAÇÕES');
  let sheet = ss.getSheetByName('CAPA');

  if (!sheet && sheetInformacoes) {
    sheetInformacoes.setName('CAPA');
    sheet = sheetInformacoes;
  }

  if (!sheet) {
    sheet = ss.insertSheet('CAPA');
  }

  if (sheetInformacoes && sheetInformacoes.getName() === 'INFORMAÇÕES') {
    if (ss.getSheets().length > 1) {
      ss.deleteSheet(sheetInformacoes);
    }
  }

  ss.setActiveSheet(sheet);
  sheet.clear();
  sheet.setHiddenGridlines(true);

  // ==========================================================
  // 2️⃣ Layout institucional
  // ==========================================================

  layoutBaseEstrutura_(sheet);
  layoutCabecalhoPRF_(sheet);
  layoutTituloPrincipal_(sheet, 'INFORMAÇÕES BÁSICAS');

  // ==========================================================
  // 3️⃣ Informações principais
  // ==========================================================

  sheet.getRange("C8")
    .setValue("CONTEXTO DE TRABALHO :")
    .setFontFamily("Arial")
    .setFontSize(12)
    .setFontWeight("bold");

  sheet.getRange("C9")
    .setValue("PASTA DE FOTOS ............... :")
    .setFontFamily("Arial")
    .setFontSize(12)
    .setFontWeight("bold");

  sheet.getRange("E8")
    .setValue(contexto.nome || "-")
    .setFontFamily("Arial")
    .setFontSize(12);

  sheet.getRange("E9")
    .setValue(contexto.localidadeAtivaNome || "-")
    .setFontFamily("Arial")
    .setFontSize(12);

  // ==========================================================
  // 4️⃣ Permissões
  // ==========================================================

  const permissoes = obterPermissoesCliente_(contexto);

  blocoPermissoesRenderer_(sheet, 10, permissoes);

  // ==========================================================
  // 5️⃣ Rodapé
  // ==========================================================

  layoutRodapeInstitucional_(sheet, 16);

  clienteRenderAbaManual_(ss.getId());

  const proteger = { CAPA: true, MANUAL: true };
  ss.getSheets().forEach(s => {
    const nome = s.getName();
    if (proteger[nome]) return;

    const range = s.getDataRange();
    if (
      range.getLastRow() === 1 &&
      range.getLastColumn() === 1 &&
      range.getValue() === '' &&
      ss.getSheets().length > 1
    ) {
      ss.deleteSheet(s);
    }
  });

  organizarOrdemAbasEstruturais_(ss, {
    abaAtivaFinal: 'CAPA'
  });
}

/**
 * Compatibilidade: mantém chamadas legadas para atualização de informações.
 */
function clienteMontarInformacoes_(contexto, usarPlanilhaAtiva) {
  if (!contexto) {
    throw new Error('clienteMontarInformacoes_: contexto inválido.');
  }

  let ss = null;

  if (usarPlanilhaAtiva) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss && contexto.planilhaClienteId) {
    ss = SpreadsheetApp.openById(contexto.planilhaClienteId);
  }

  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  renderizarPlanilhaCliente_(contexto, ss);
}
