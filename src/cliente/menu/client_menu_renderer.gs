/**
 * ============================================================
 * MENU CLIENT — ID-BASED (PADRÃO OFICIAL)
 * ============================================================
 */

function renderMenuClient(contextoOverride) {

  const ui = SpreadsheetApp.getUi();
  const contexto = contextoOverride || obterContextoCliente_();
  const temContexto = !!contexto;

  const menu = ui.createMenu('📦 Inventário Patrimonial');

  // ==========================================================
  // SEM CONTEXTO
  // ==========================================================
  if (!temContexto) {
    menu
      .addItem('ℹ️ Atualizar Informações', 'clientAtualizarInformacoes')
      .addToUi();
    return;
  }

  // ==========================================================
  // COM CONTEXTO
  // ==========================================================
  menu
    .addItem('🔄 Atualizar Informações', 'clientAtualizarInformacoes')
    .addSeparator()

    // 📸 ÁREA DE FOTOS (igual ADMIN)
    .addSubMenu(
      ui.createMenu('📂 Área de Fotos')
        .addItem('📂 Abrir Pasta Atual', 'clientAbrirPastaFotos')
        .addItem('➕ Criar Nova Pasta', 'clientCriarSubpastaFotos')
    )
    .addSeparator()

    // 🖼️ PROCESSAMENTO
    .addItem('🖼️ Processar Imagens', 'clientProcessarImagens')
    .addSeparator()

    // 📖 PLANILHAS
    .addSubMenu(
      ui.createMenu('📖 Planilhas')
        .addItem('📕 Abrir Planilha Admin', 'clientAbrirPlanilhaAdmin')
        .addItem('📘 Abrir Planilha Geral', 'clientAbrirPlanilhaGeral')
    )
    .addSeparator()

    .addItem('ℹ️ Versão', 'mostrarVersaoSistema')

    .addToUi();
}
