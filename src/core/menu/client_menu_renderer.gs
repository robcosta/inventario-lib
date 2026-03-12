/**
 * ============================================================
 * MENU CLIENT — RENDERIZAÇÃO (ID-BASED / ESTÁVEL)
 * ============================================================
 */

function clientRenderMenu_(contextoOverride) {

  const ui = SpreadsheetApp.getUi();

  const contexto =
    contextoOverride ||
    obterContextoDominio_();

  const planilhaGeralId =
    (contexto && contexto.planilhaGeralId) ||
    resolverPlanilhaGeralIdSeguro_();

  const temContexto =
    !!contexto &&
    !!contexto.planilhaAdminId &&
    !!planilhaGeralId &&
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
  // Área de Fotos
  menu
    // Informações
    .addItem('🔄 Atualizar Informações', 'clientAtualizarInformacoes')
    .addSeparator()

    // Área de Fotos
    .addSubMenu(
      ui.createMenu('📂 Área de Fotos')
        .addItem('📂 Abrir Pasta Atual', 'abrirPastaFotosAtual')
        .addItem('🔁 Trocar Pasta', 'trocarPastaFotos')
        .addItem('➕ Criar Nova Pasta', 'criarNovaPastaFotos')
    )
    .addSeparator()

    // Vision
    .addItem('🖼️ Processar Imagem', 'processarImagens')
    .addItem('📣 Verificar Status do Processamento', 'clientVerificarStatusProcessamento')
    .addItem('🖥️ Acompanhar Processamento', 'clientAbrirPainelStatusProcessamento')
    .addSeparator()

    // Planilhas
    .addSubMenu(
      ui.createMenu('📖 Planilhas')
        .addItem('📕 Abrir Planilha Admin', 'adminAbrirPlanilha')
        .addItem('📘 Abrir Planilha Geral', 'clientAbrirPlanilhaGeral')
        .addItem('🎨 Formatar Planilha Cliente', 'formatarPlanilhaCliente')
    )
    .addSeparator()

    // Relatório
    .addSubMenu(
      ui.createMenu('📙 Planilha Relatório')
        .addItem('📂 Abrir Planilha', 'abrirPlanilhaRelatorio')
        .addItem('📈 Visão Geral', 'relatorioGerarVisaoGeral')
        .addItem('📌 Bens Pendentes', 'relatorioGerarBensPendentes')
        .addItem('✅ Bens Encontrados', 'relatorioGerarBensEncontrados')
        .addItem('📍 Bens de Outra Localidade', 'relatorioGerarBensOutraLocalidade')
        .addItem('🏷️ Bens para Nova Etiqueta', 'relatorioGerarBensEtiquetas')
    )
    .addSeparator()

    // Diagnóstico
    .addItem('🔎 Diagnóstico', 'clientExecutarDiagnostico')

    // Versão
    .addItem('ℹ️ Versão', 'mostrarVersaoSistema')
    .addToUi();

    
}
