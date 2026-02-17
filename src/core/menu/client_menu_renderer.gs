/**
 * ============================================================
 * MENU CLIENT — RENDERIZAÇÃO (ID-BASED / ESTÁVEL)
 * ============================================================
 */

function renderMenuClient_(contextoOverride) {

  const ui = SpreadsheetApp.getUi();

  const contexto =
    contextoOverride ||
    obterContextoCliente_();

  const temContexto =
    !!contexto &&
    !!contexto.planilhaAdminId &&
    !!contexto.planilhaGeralId &&
    !!contexto.pastaLocalidadesId;

  const menu = ui.createMenu('📦 Inventário Patrimonial');

  // ==========================================================
  // SEM CONTEXTO
  // ==========================================================
  if (!temContexto) {
    menu
      .addItem('🔄 Atualizar Informações', 'clientAtualizarInformacoes')
      .addToUi();
    return;
  }

  // ==========================================================
  // MENU COMPLETO
  // ==========================================================
  menu
    .addItem('🔄 Atualizar Informações', 'clientAtualizarInformacoes')
    .addSeparator()

    // Área de Fotos
  menu
    .addSubMenu(
      ui.createMenu('📂 Área de Fotos')
        .addItem('📂 Abrir Pasta Atual', 'abrirPastaFotosAtual')
        .addItem('🔁 Trocar Pasta', 'trocarPastaFotos')
        .addItem('➕ Criar Nova Pasta', 'criarNovaPastaFotos')
    )
    .addSeparator()

    // Vision
    .addItem('🖼️ Processar Imagens', 'clientProcessarImagens')
    .addSeparator()

    // Planilhas
    .addSubMenu(
      ui.createMenu('📖 Planilhas')
        .addItem('📕 Abrir Planilha Admin', 'clientAbrirPlanilhaAdmin')
        .addItem('📘 Abrir Planilha Geral', 'clientAbrirPlanilhaGeral')
    )
    .addSeparator()

    .addItem('ℹ️ Versão', 'mostrarVersaoSistema')
    .addToUi();
}
