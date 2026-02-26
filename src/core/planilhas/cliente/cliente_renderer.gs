/**
 * ============================================================
 * CLIENTE — RENDERIZAÇÃO DA ABA "INFORMAÇÕES"
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
function renderizarPlanilhaCliente_(contexto) {

  if (!contexto) {
    throw new Error('renderizarPlanilhaCliente_: contexto inválido.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Nenhuma planilha ativa.');
  }

  // ==========================================================
  // 1️⃣ Garantir aba "INFORMAÇÕES"
  // ==========================================================

  let sheet = ss.getSheetByName('INFORMAÇÕES');

  if (!sheet) {
    sheet = ss.insertSheet('INFORMAÇÕES');
  }

  ss.setActiveSheet(sheet);
  sheet.clear();
  sheet.setHiddenGridlines(true);

  // ==========================================================
  // 2️⃣ Aplicar Layout Institucional Base
  // ==========================================================

  layoutBaseEstrutura_(sheet);
  layoutCabecalhoPRF_(sheet);
  layoutTituloPrincipal_(sheet);

  // ==========================================================
  // 3️⃣ Bloco — Informações Principais
  // ==========================================================

  // Labels
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

  // Valores
  sheet.getRange("E8")
    .setValue(contexto.nome || "-")
    .setFontFamily("Arial")
    .setFontSize(12);

  sheet.getRange("E9")
    .setValue(contexto.localidadeAtivaNome || "-")
    .setFontFamily("Arial")
    .setFontSize(12);

  // ==========================================================
  // 4️⃣ Bloco — Permissões
  // ==========================================================

  const permissoes = obterPermissoesCliente_(contexto);

  blocoPermissoesRenderer_(sheet, 10, permissoes);

  // ==========================================================
  // 5️⃣ Rodapé Institucional
  // ==========================================================

  layoutRodapeInstitucional_(sheet, 16);
}