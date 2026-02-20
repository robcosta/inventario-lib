/**
 * ============================================================
 * CONTEXTO — FLUXO DE CRIAÇÃO (RENOVA TEMPLATE)
 * ============================================================
 *
 * Fluxo canônico:
 * 1. Executado SOMENTE a partir do ADMIN: Template
 * 2. Lista contextos existentes
 * 3. Solicita nome do contexto (CAIXA ALTA)
 * 4. Bloqueia duplicidade
 * 5. Copia a planilha ativa para gerar um NOVO ADMIN: Template
 * 6. Limpa qualquer resíduo de contexto da nova Template
 * 7. Cria estrutura de pastas CONTEXTOS/<NOME>/
 * 8. Renomeia a planilha ativa para ADMIN: <NOME>
 * 9. Move a planilha ADMIN para PLANILHA
 * 10. Cria planilha CLIENTE e move para LOCALIDADES
 * 11. Cria e ativa CONTEXTO_ADMIN via contexto_admin_manager
 * 12. Finaliza UX
 *
 * ❗ Modelo 100% ID-based
 */

function criarContextoTrabalho_() {

  Logger.log('[FLUXO][CRIAR_CONTEXTO] INÍCIO');

  const ui = SpreadsheetApp.getUi();
  const ssAtiva = SpreadsheetApp.getActiveSpreadsheet();

  if (!ssAtiva) {
    ui.alert('Nenhuma planilha ativa.');
    return;
  }

  const nomePlanilhaAtual = ssAtiva.getName().toUpperCase();

  // 0️⃣ Garantir execução apenas no TEMPLATE
  if (!nomePlanilhaAtual.includes('TEMPLATE')) {
    ui.alert(
      'Criação de contexto só pode ser feita a partir da planilha:\n\nADMIN: TEMPLATE'
    );
    return;
  }

  // ============================================================
  // 1️⃣ LISTAR CONTEXTOS EXISTENTES (Drive físico)
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
  // 2️⃣ SOLICITAR NOME
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
  // 3️⃣ BLOQUEAR DUPLICIDADE
  // ============================================================

  const jaExiste = nomesExistentes
    .some(nome => nome.toUpperCase() === nomeContexto);

  if (jaExiste) {
    ui.alert(
      '❌ Contexto já existente',
      `Já existe um contexto chamado:\n\n"${nomeContexto}"\n\nEscolha outro nome.`,
      ui.ButtonSet.OK
    );
    return;
  }

  // ============================================================
  // 4️⃣ COPIAR TEMPLATE
  // ============================================================

  ssAtiva.toast('Copiando planilha template...', '📋 Criando', 3);

  const fileAtivo = DriveApp.getFileById(ssAtiva.getId());
  const fileNovaTemplate = fileAtivo.makeCopy('ADMIN: TEMPLATE');
  const ssNovaTemplate = SpreadsheetApp.openById(fileNovaTemplate.getId());

  SpreadsheetApp.setActiveSpreadsheet(ssNovaTemplate);
  limparContextoAtivo_();

  SpreadsheetApp.setActiveSpreadsheet(ssAtiva);

  // ============================================================
  // 5️⃣ CRIAR ESTRUTURA DE PASTAS
  // ============================================================

  ssAtiva.toast('Criando estrutura de pastas...', '📁 Configurando', 3);

  const pastaContexto = pastaContextosMae.createFolder(nomeContexto);

  const pastaPlanilhas = pastaContexto.createFolder('PLANILHA');
  const pastaCSVAdmin = pastaPlanilhas.createFolder('CSV_ADMIN');
  const pastaLocalidades = pastaContexto.createFolder('LOCALIDADES');

  // ============================================================
  // 6️⃣ RENOMEAR ADMIN
  // ============================================================

  ssAtiva.rename('ADMIN: ' + nomeContexto);
  const fileAdmin = DriveApp.getFileById(ssAtiva.getId());

  ssAtiva.toast('Organizando planilha ADMIN...', '📂 Movendo', 3);
  fileAdmin.moveTo(pastaPlanilhas);

  // ============================================================
  // 7️⃣ CRIAR PLANILHA CLIENTE (A PARTIR DO TEMPLATE)
  // ============================================================

  ssAtiva.toast('Gerando planilha CLIENTE...', '📊 Criando', 3);

  const templateClienteFile = obterTemplateCliente_();

  if (!templateClienteFile) {
    ui.alert(
      '❌ Template CLIENTE não encontrado.\n\nVerifique a pasta TEMPLATES.'
    );
    return;
  }

  const fileCliente = templateClienteFile.makeCopy(
    'CLIENTE: ' + nomeContexto,
    pastaLocalidades
  );

  const planilhaCliente = SpreadsheetApp.openById(fileCliente.getId());

  // 🔄 Limpa qualquer contexto antigo herdado
  SpreadsheetApp.setActiveSpreadsheet(planilhaCliente);
  limparContextoAtivo_();

  SpreadsheetApp.setActiveSpreadsheet(ssAtiva);

  // ============================================================
  // 8️⃣ SALVAR CONTEXTO ADMIN
  // ============================================================

  ssAtiva.toast('Salvando contexto ADMIN...', '💾 Salvando', 3);

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

  // ============================================================
  // 9️⃣ FINALIZAÇÃO
  // ============================================================

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

function obterTemplateCliente_() {

  const raiz = obterPastaInventario_();
  if (!raiz) return null;

  const pastaTemplates = raiz.getFoldersByName('TEMPLATES');
  if (!pastaTemplates.hasNext()) return null;

  const pasta = pastaTemplates.next();
  const arquivos = pasta.getFilesByName('CLIENTE: TEMPLATE');

  if (!arquivos.hasNext()) return null;

  return arquivos.next();
}
