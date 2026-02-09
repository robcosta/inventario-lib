/**
 * ============================================================
 * CONTEXTO — FLUXO DE CRIAÇÃO (RENOVA TEMPLATE)
 * ============================================================
 *
 * Fluxo canônico:
 * 1. Executado SOMENTE a partir do ADMIN: Template
 * 2. Solicita nome do contexto (CAIXA ALTA)
 * 3. Copia a planilha ativa para gerar um NOVO ADMIN: Template
 * 4. Limpa qualquer resíduo de contexto da nova Template
 * 5. Cria estrutura de pastas CONTEXTO/<NOME>/
 * 6. Renomeia a planilha ativa para ADMIN: <NOME>
 * 7. Move a planilha ADMIN para CONTEXTO/<NOME>/PLANILHA
 * 8. Cria planilha CLIENTE e move para LOCALIDADES
 * 9. Cria e ativa CONTEXTO_ADMIN via contexto_admin_manager
 * 10. Finaliza UX (menu, alertas)
 *
 * ❗ NÃO acessa ScriptProperties diretamente
 * ❗ NÃO contém lógica de domínio (delegada ao manager)
 */

function criarContextoFluxoTemplate_() {
  Logger.log('[FLUXO][CRIAR_CONTEXTO] INÍCIO');

  const ui = SpreadsheetApp.getUi();
  const ssAtiva = SpreadsheetApp.getActiveSpreadsheet();

  if (!ssAtiva) {
    ui.alert('Nenhuma planilha ativa.');
    return;
  }

  const nomePlanilhaAtual = ssAtiva.getName().toUpperCase();

  // 0️⃣ Garantir execução apenas no TEMPLATE
  if (nomePlanilhaAtual.indexOf('TEMPLATE') === -1) {
    ui.alert(
      'Criação de contexto só pode ser feita a partir da planilha:\n\n' +
      'ADMIN: TEMPLATE'
    );
    return;
  }

  // 1️⃣ Solicitar nome do contexto
  const resp = ui.prompt(
    'Criar Novo Contexto de Trabalho',
    'Digite o nome do contexto (ex: DEL02 - FORTALEZA):',
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const nomeContexto = (resp.getResponseText() || '').trim().toUpperCase();
  if (!nomeContexto) {
    ui.alert('❌ O nome do contexto não pode estar vazio.');
    return;
  }

  ssAtiva.toast('Copiando planilha template...', '📋 Criando', 3);

  // 2️⃣ Copiar planilha ativa → NOVA TEMPLATE
  const fileAtivo = DriveApp.getFileById(ssAtiva.getId());
  const fileNovaTemplate = fileAtivo.makeCopy('ADMIN: TEMPLATE');
  const ssNovaTemplate = SpreadsheetApp.openById(fileNovaTemplate.getId());

  // Garantir que a nova TEMPLATE não possui contexto
  SpreadsheetApp.setActiveSpreadsheet(ssNovaTemplate);
  limparContextoAtivo_();

  // Voltar para a planilha original (que virará ADMIN)
  SpreadsheetApp.setActiveSpreadsheet(ssAtiva);

  ssAtiva.toast('Criando estrutura de pastas...', '📁 Configurando', 3);

  // 3️⃣ Criar estrutura de pastas correta
  const raiz = obterPastaInventario_();
  if (!raiz) {
    ui.alert('❌ Pasta raiz do Inventário não encontrada.');
    return;
  }

  const pastaContextoMae = obterOuCriarSubpasta_(raiz, 'CONTEXTO');
  const pastaContexto = obterOuCriarSubpasta_(pastaContextoMae, nomeContexto);

  const pastaPlanilhas = obterOuCriarSubpasta_(pastaContexto, 'PLANILHA');
  const pastaCSVAdmin = obterOuCriarSubpasta_(pastaPlanilhas, 'CSV_ADMIN');
  const pastaLocalidades = obterOuCriarSubpasta_(pastaContexto, 'LOCALIDADES');

  // 4️⃣ Renomear planilha ativa → ADMIN
  ssAtiva.rename('ADMIN: ' + nomeContexto);
  const fileAdmin = DriveApp.getFileById(ssAtiva.getId());

  ssAtiva.toast('Organizando planilha ADMIN...', '📂 Movendo', 3);

  // 5️⃣ Mover planilha ADMIN
  fileAdmin.moveTo(pastaPlanilhas);

  ssAtiva.toast('Criando planilha CLIENTE...', '📊 Criando', 3);

  // 6️⃣ Criar planilha CLIENTE
  const planilhaCliente = SpreadsheetApp.create('CLIENTE: ' + nomeContexto);
  DriveApp.getFileById(planilhaCliente.getId()).moveTo(pastaLocalidades);

  ssAtiva.toast('Salvando contexto ADMIN...', '💾 Salvando', 3);

  // 7️⃣ Criar objeto de contexto ADMIN (modelo novo)
  const contextoAdmin = {
    nome: nomeContexto,
    planilhaAdminId: ssAtiva.getId(),
    planilhaClienteId: planilhaCliente.getId(),
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

  // 8️⃣ Finalização UX
  ssAtiva.toast(
    'Contexto "' + nomeContexto + '" criado com sucesso!',
    '✅ Finalizado',
    4
  );

  adminRenderMenu_();

  ui.alert(
    '✅ Contexto "' + nomeContexto + '" criado com sucesso!\n\n' +
    '🎉 Menu admin já está ativo e pronto para uso.'
  );

  Logger.log('[FLUXO][CRIAR_CONTEXTO] FIM');
}
