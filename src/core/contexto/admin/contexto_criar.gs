/**
 * ============================================================
 * CONTEXTO — CRIAÇÃO COMPLETA (ADMIN + CLIENTE + RELATÓRIO)
 * ============================================================
 *
 * Fluxo oficial:
 *
 * 1️⃣ Validar execução no ADMIN: TEMPLATE
 * 2️⃣ Listar contextos existentes
 * 3️⃣ Solicitar nome (CAIXA ALTA)
 * 4️⃣ Bloquear duplicidade
 * 5️⃣ Renovar TEMPLATE ADMIN
 * 6️⃣ Criar estrutura de pastas
 * 7️⃣ Renomear e mover ADMIN
 * 8️⃣ Garantir templates CLIENTE e RELATÓRIO
 * 9️⃣ Criar e formatar CLIENTE
 * 🔟 Criar e formatar RELATÓRIO
 * 1️⃣1️⃣ Salvar CONTEXTO_ADMIN
 * 1️⃣2️⃣ Finalizar UX
 *
 * Modelo 100% ID-based
 * ============================================================
 */

function criarContextoTrabalho_() {

  Logger.log('[FLUXO][CRIAR_CONTEXTO] INÍCIO');

  const ui = SpreadsheetApp.getUi();
  const ssAdmin = SpreadsheetApp.getActiveSpreadsheet();

  if (!ssAdmin) {
    ui.alert('Nenhuma planilha ativa.');
    return;
  }

  const nomeAtual = ssAdmin.getName().toUpperCase();

  // ============================================================
  // 1️⃣ VALIDAR TEMPLATE
  // ============================================================

  if (!nomeAtual.includes('TEMPLATE')) {
    ui.alert(
      'Criação de contexto só pode ser feita a partir da planilha:\n\nADMIN: TEMPLATE'
    );
    return;
  }

  // ============================================================
  // 2️⃣ LISTAR CONTEXTOS EXISTENTES
  // ============================================================

  const raiz = obterPastaInventario_();
  if (!raiz) {
    ui.alert('❌ Pasta raiz do Inventário não encontrada.');
    return;
  }

  const pastaContextosMae = obterOuCriarSubpasta_(raiz, 'CONTEXTOS');

  const it = pastaContextosMae.getFolders();
  const nomesExistentes = [];

  while (it.hasNext()) {
    nomesExistentes.push(it.next().getName());
  }

  nomesExistentes.sort((a, b) => a.localeCompare(b));

  const listaFormatada = nomesExistentes.length
    ? '\n\n📂 Contextos existentes:\n\n' +
      nomesExistentes.map((n, i) => `${i + 1} - ${n}`).join('\n')
    : '\n\n📂 Nenhum contexto existente ainda.';

  // ============================================================
  // 3️⃣ SOLICITAR NOME
  // ============================================================

  const resp = ui.prompt(
    'Criar Novo Contexto de Trabalho',
    'Digite o nome do contexto (ex: DEL02 - FORTALEZA):' + listaFormatada,
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const nomeContexto = (resp.getResponseText() || '').trim().toUpperCase();

  if (!nomeContexto) {
    ui.alert('❌ O nome do contexto não pode estar vazio.');
    return;
  }

  // ============================================================
  // 4️⃣ BLOQUEAR DUPLICIDADE
  // ============================================================

  if (nomesExistentes.some(n => n.toUpperCase() === nomeContexto)) {
    ui.alert(
      '❌ Contexto já existente',
      `Já existe um contexto chamado:\n\n"${nomeContexto}"\n\nEscolha outro nome.`,
      ui.ButtonSet.OK
    );
    return;
  }

  // ============================================================
  // 5️⃣ RENOVAR TEMPLATE ADMIN
  // ============================================================

  ssAdmin.toast('Renovando template ADMIN...', '📋 Criando', 3);

  const fileAdminAtual = DriveApp.getFileById(ssAdmin.getId());
  const fileNovaTemplate = fileAdminAtual.makeCopy('ADMIN: TEMPLATE');
  const ssNovaTemplate = SpreadsheetApp.openById(fileNovaTemplate.getId());

  limparContextoAtivo_();

  // ============================================================
  // 6️⃣ CRIAR ESTRUTURA DE PASTAS
  // ============================================================

  ssAdmin.toast('Criando estrutura de pastas...', '📁 Configurando', 3);

  const pastaContexto = pastaContextosMae.createFolder(nomeContexto);
  const pastaPlanilhas = pastaContexto.createFolder('PLANILHA');
  const pastaCSVAdmin = pastaPlanilhas.createFolder('CSV_ADMIN');
  const pastaLocalidades = pastaContexto.createFolder('LOCALIDADES');

  // ============================================================
  // 7️⃣ RENOMEAR E MOVER ADMIN
  // ============================================================

  ssAdmin.rename('ADMIN: ' + nomeContexto);

  const fileAdmin = DriveApp.getFileById(ssAdmin.getId());
  ssAdmin.toast('Movendo planilha ADMIN...', '📂 Organizando', 3);
  fileAdmin.moveTo(pastaPlanilhas);

  // ============================================================
  // 8️⃣ GARANTIR TEMPLATES
  // ============================================================

  ssAdmin.toast('Verificando templates...', '📦 Estrutura', 3);

  const templateCliente = garantirTemplatePlanilha_('CLIENTE');
  const templateRelatorio = garantirTemplatePlanilha_('RELATORIO');

  // ============================================================
  // 9️⃣ CRIAR E FORMATAR CLIENTE
  // ============================================================

  ssAdmin.toast('Gerando planilha CLIENTE...', '📊 Criando', 3);

  const fileCliente = templateCliente.makeCopy(
    'CLIENTE: ' + nomeContexto,
    pastaLocalidades
  );

  const ssCliente = SpreadsheetApp.openById(fileCliente.getId());

  renderizarPlanilhaCliente_(
    { nome: nomeContexto, localidadeAtivaNome: '-' },
    ssCliente
  );

  limparContextoAtivo_();

  // ============================================================
  // 🔟 CRIAR E FORMATAR RELATÓRIO
  // ============================================================

  ssAdmin.toast('Gerando planilha RELATÓRIO...', '📊 Criando', 3);

  const fileRelatorio = templateRelatorio.makeCopy(
    'RELATÓRIO: ' + nomeContexto,
    pastaLocalidades
  );

  const ssRelatorio = SpreadsheetApp.openById(fileRelatorio.getId());

  renderizarPlanilhaRelatorio_(
    { nome: nomeContexto },
    ssRelatorio
  );

  limparContextoAtivo_();

  // ============================================================
  // 1️⃣1️⃣ SALVAR CONTEXTO ADMIN
  // ============================================================

  ssAdmin.toast('Salvando contexto ADMIN...', '💾 Salvando', 3);

  const contextoAdmin = {
    nome: nomeContexto,
    planilhaAdminId: ssAdmin.getId(),
    planilhaClienteId: ssCliente.getId(),
    planilhaRelatorioId: ssRelatorio.getId(),
    pastaContextoId: pastaContexto.getId(),
    pastaPlanilhasId: pastaPlanilhas.getId(),
    pastaCSVAdminId: pastaCSVAdmin.getId(),
    pastaLocalidadesId: pastaLocalidades.getId(),
    planilhaGeralId: obterPlanilhaGeralId_(),
    emailOperador: Session.getActiveUser().getEmail(),
    criadoEm: new Date().toISOString(),
    ultimaAtualizacao: new Date().toISOString()
  };

  definirContextoAtivo_(contextoAdmin);

  // ============================================================
  // 1️⃣2️⃣ FINALIZAÇÃO
  // ============================================================

  ssAdmin.toast(
    'Contexto "' + nomeContexto + '" criado com sucesso!',
    '✅ Finalizado',
    4
  );

  adminRenderMenu_();

  ui.alert(
    '✅ Contexto "' + nomeContexto + '" criado com sucesso!\n\n' +
    '🎉 ADMIN, CLIENTE e RELATÓRIO prontos para uso.'
  );

  Logger.log('[FLUXO][CRIAR_CONTEXTO] FIM');
}