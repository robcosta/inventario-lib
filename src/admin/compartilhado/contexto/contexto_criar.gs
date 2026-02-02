/**
 * ============================================================
 * CONTEXTO — CRIAÇÃO
 * ============================================================
 */
function criarContextoTrabalho_() {
    Logger.log('[BOOTSTRAP][ADMIN] criarContextoTrabalho - INÍCIO');
    const ui = SpreadsheetApp.getUi();

    // 🔒 Bloqueio: esta planilha já tem contexto  
    if (planilhaTemContextoAdmin_()) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Esta planilha já pertence a um contexto. Não é permitido criar outro.',
        '⚠️ Contexto Existente',
        5
      );
      return;
    }

    // 🔎 Listar contextos existentes (informativo)
    const contextosExistentes = listarContextos_();
    let mensagemInfo = '';

    if (contextosExistentes.length > 0) {
      mensagemInfo += 'Contextos já existentes:\n\n';
      contextosExistentes.forEach(ctx => {
        mensagemInfo += '- ' + ctx.nome + '\n';
      });
      mensagemInfo += '\nInforme o nome do NOVO contexto:';
    } else {
      mensagemInfo =
        'Nenhum contexto foi criado até o momento.\n\n' +
        'Informe o nome do primeiro contexto:';
    }

    // 1️⃣ Solicitar nome do contexto
    const resp = ui.prompt(
      'Criar Contexto de Trabalho',
      mensagemInfo,
      ui.ButtonSet.OK_CANCEL
    );
    if (resp.getSelectedButton() !== ui.Button.OK) return;

    const nomeUsuario = (resp.getResponseText() || '').trim();
    if (!nomeUsuario) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'O nome do contexto não pode estar vazio.',
        '❌ Nome Inválido',
        4
      );
      return;
    }

    const nomeContexto = nomeUsuario.toUpperCase();

    // 2️⃣ Verificar se já existe globalmente
    if (contextoComNomeExiste_(nomeContexto)) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'O contexto "' + nomeContexto + '" já existe. Use "Selecionar Contexto de Trabalho".',
        '⚠️ Contexto Já Existe',
        5
      );
      return;
    }

    // 3️⃣ Criar estrutura de pastas
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Criando estrutura de pastas...',
      '📁 Configurando',
      3
    );
    
    const raiz = obterPastaInventario_();
    if (!raiz) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Pasta "Inventário Patrimonial" não encontrada. Verifique a configuração.',
        '❌ Erro',
        5
      );
      return;
    }

    // Nova estrutura: CONTEXTO/DEL01 - CAUCAIA/
    const pastaContextoMae = obterOuCriarSubpasta_(raiz, 'CONTEXTO');
    const pastaContextoDel = obterOuCriarSubpasta_(pastaContextoMae, nomeContexto);
    
    // Subpastas do contexto
    const pastaPlanilhas = obterOuCriarSubpasta_(pastaContextoDel, 'PLANILHA');
    const pastaCSVAdmin = obterOuCriarSubpasta_(pastaPlanilhas, 'CSV_ADMIN');
    const pastaLocalidades = obterOuCriarSubpasta_(pastaContextoDel, 'LOCALIDADES');

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Estrutura de pastas criada. Configurando planilhas...',
      '✅ Progresso',
      3
    );

    // 4️⃣ Criar planilha admin
    const planilhaAdmin = SpreadsheetApp.getActiveSpreadsheet();
    planilhaAdmin.rename('ADMIN: ' + nomeUsuario);
    DriveApp.getFileById(planilhaAdmin.getId()).moveTo(pastaPlanilhas);

    // 5️⃣ Criar planilha cliente
    const planilhaCliente = SpreadsheetApp.create('CLIENTE: ' + nomeUsuario);
    DriveApp.getFileById(planilhaCliente.getId()).moveTo(pastaLocalidades);

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Planilhas criadas. Salvando configurações...',
      '⚙️ Progresso',
      3
    );

    // 6️⃣ Criar CONTEXTO_ADMIN
    const contextoAdmin = criarContextoAdmin_({
      id: planilhaAdmin.getId(),
      nome: nomeContexto,
      emailOperador: Session.getActiveUser().getEmail(),
      pastaContextoDelId: pastaContextoDel.getId(),
      pastaPlanilhasId: pastaPlanilhas.getId(),
      pastaCSVAdminId: pastaCSVAdmin.getId(),
      pastaLocalidadesId: pastaLocalidades.getId(),
      planilhaClienteId: planilhaCliente.getId(),
      planilhaGeralId: obterPlanilhaGeralId_()
    });

    // 7️⃣ Atualizar sistema global com pasta CONTEXTO (se necessário)
    const sistemaGlobal = obterSistemaGlobal_();
    if (!sistemaGlobal.pastaContextoId) {
      atualizarSistemaGlobal_({
        pastaContextoId: pastaContextoMae.getId()
      });
    }

    // 8️⃣ Criar CONTEXTO_CLIENTE
    const ssAdmin = SpreadsheetApp.getActiveSpreadsheet();
    const ssCliente = SpreadsheetApp.openById(planilhaCliente.getId());
    
    SpreadsheetApp.setActiveSpreadsheet(ssCliente);
    
    criarContextoCliente_({
      id: planilhaCliente.getId(),
      nome: nomeContexto,
      emailOperador: Session.getActiveUser().getEmail(),
      pastaLocalidadesId: pastaLocalidades.getId(),
      planilhaAdminId: planilhaAdmin.getId(),
      planilhaGeralId: obterPlanilhaGeralId_()
    });
    
    SpreadsheetApp.setActiveSpreadsheet(ssAdmin);

    // 9️⃣ Formatar planilha cliente
    cliente_formatarPlanilhaInterface_(
      planilhaCliente.getId(),
      {
        nome: nomeContexto,
        planilhaClienteId: planilhaCliente.getId(),
        pastaUnidadeId: pastaLocalidades.getId()
      }
    );

    cliente_montarInformacoes_({
      nome: nomeContexto
    });

    // 🔟 Atualizar menu ADMIN
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Atualizando menu...',
      '🔄 Finalizando',
      2
    );
    
    adminRenderMenu_();

    ui.alert(
      'Contexto criado com sucesso!\n\n' +
      'Feche e reabra a planilha para ver o menu atualizado.'
    );

    Logger.log('[BOOTSTRAP][ADMIN] criarContextoTrabalho - FIM');
  }