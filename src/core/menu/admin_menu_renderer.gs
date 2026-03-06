/**
 * ============================================================
 * MENU ADMIN — RENDERIZAÇÃO (CANÔNICO / ESTÁVEL)
 * ============================================================
 *
 * Regras oficiais:
 * - ADMIN:TEMPLATE → Criar Novo Contexto
 * - ADMIN:<CONTEXTO> inválido → Reparar Contexto
 * - ADMIN:<CONTEXTO> válido → Menu completo
 *
 * ❗ Fonte única da verdade:
 *    contextoAdminValido_()
 *
 * ❗ Diagnóstico NÃO interfere em decisão de menu
 * ❗ Nenhuma heurística baseada em nome/pasta/Drive
 */

/**
 * API pública — chamada pelo onOpen
 */
function adminRenderMenu() {
  adminRenderMenu_();
}

/**
 * Renderização interna do menu ADMIN
 */
function adminRenderMenu_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  const nomePlanilha = ss.getName();
  const nomeUpper = nomePlanilha.toUpperCase();
  const ehTemplate = nomeUpper.includes('TEMPLATE');

  // 🔎 DEBUG CONTROLADO
  Logger.log('=== MENU DEBUG ===');
  Logger.log('Planilha: ' + nomePlanilha);
  Logger.log('Contexto bruto:');
  Logger.log(JSON.stringify(obterContextoAtivo_(), null, 2));
  Logger.log('contextoAdminValido_(): ' + contextoAdminValido_());

  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('🏛️ Inventário – Administração');

  // ==========================================================
  // 1️⃣ ADMIN:TEMPLATE → Criar Novo Contexto
  // ==========================================================
  if (ehTemplate) {
    menu
      .addItem('➕ Criar Novo Contexto', 'criarContextoTrabalho')
      .addItem('ℹ️ Versão', 'mostrarVersaoSistema')
      .addToUi();
    return;
  }

  // ==========================================================
  // 2️⃣ ADMIN:<CONTEXTO> INVÁLIDO → Reparar
  // ==========================================================
  if (!contextoAdminRegistrado_()) {
    menu
      .addItem('🔧 Reparar Contexto', 'repararContextoAdmin')
      .addItem('ℹ️ Versão', 'mostrarVersaoSistema')
      .addToUi();
    return;
  }

  // ==========================================================
  // 3️⃣ ADMIN:<CONTEXTO> VÁLIDO → MENU COMPLETO
  // ==========================================================
  menu
    // Seleção
    .addItem('🔁 Selecionar Contexto', 'selecionarContextoTrabalho')

    // Acessos
    .addSubMenu(
      ui.createMenu('🔐 Gerenciar Acessos')
        .addItem('👑 Acesso SUPERVISOR', 'gerenciarAcessosSupervisor')
        .addItem('🛡️ Acesso ADMINISTRADOR', 'gerenciarAcessosAdministrador')
        .addItem('🧰 Acesso OPERADOR', 'gerenciarAcessosOperador')
        .addItem('👥 Acesso CLIENTE', 'gerenciarAcessosCliente')
        .addItem('🗑️ Retirar Acessos', 'gerenciarRetiradaAcessos')
    )
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
    .addItem('🖼️ Processar Imagem', 'processarImagens')
    .addSeparator()

    // Planilha Geral
    .addSubMenu(
      ui.createMenu('📘 Planilha Geral')
        .addItem('📂 Abrir Planilha', 'abrirPlanilhaGeral')
        .addItem('📤 Importar CSV', 'importarCSVGeral')
        .addItem('🎨 Formatar Planilha Geral', 'formatarPlanilhaGeral')
        .addItem('🧱 Criar / Recriar', 'criarOuRecriarPlanilhaGeral')
    )
    .addSeparator()

    // Planilha ADMIN
    .addSubMenu(
      ui.createMenu('📕 Planilha ADMIN')
        .addItem('📤 Importar CSV', 'importarCSVAdmin')
        .addItem('📊 Popular', 'popularPlanilhaAdmin')
        .addItem('🎨 Formatar', 'formatarPlanilhaAdmin')
    )
    .addSeparator()

    // Planilha CLIENTE
    .addSubMenu(
      ui.createMenu('📗 Planilha CLIENTE')
        .addItem('📂 Abrir Planilha', 'abrirPlanilhaCliente')
        .addItem('🎨 Formatar', 'formatarPlanilhaCliente')
    )
    .addSeparator()

    // Planilha RELATÓRIO
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
    .addSubMenu(
      ui.createMenu('🧪 Diagnóstico')
        .addItem('📊 Executar Diagnóstico', 'executarDiagnostico')
        .addItem('🧪 Testar Planilha Geral', 'runTestsPlanilhaGeral')
    )

    // Versão
    .addItem('ℹ️ Versão', 'mostrarVersaoSistema')

    .addToUi();
}
