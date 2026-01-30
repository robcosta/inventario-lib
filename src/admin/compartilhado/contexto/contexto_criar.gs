/**
 * ============================================================
 * CONTEXTO — CRIAÇÃO
 * ============================================================
 */
function criarContextoTrabalho_() {
    Logger.log('[BOOTSTRAP][ADMIN] criarContextoTrabalho - INÍCIO');
    const ui = SpreadsheetApp.getUi();

    // 🔒 Bloqueio: esta planilha já tem contexto  
    if (planilhaTemContexto_()) {
      ui.alert(
        'Esta planilha já pertence a um contexto.\n' +
        'Não é permitido criar outro contexto nela.'
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
      ui.alert('Nome inválido.');
      return;
    }

    const nomeContexto = nomeUsuario.toUpperCase();

    // 2️⃣ Verificar se já existe globalmente
    if ( contextoComNomeExiste_(nomeContexto)) {
      ui.alert(
        'O contexto "' + nomeContexto + '" já existe.\n\n' +
        'Utilize "Selecionar Contexto de Trabalho".'
      );
      return;
    }

    // 3️⃣ Criar estrutura de pastas
    const raiz = obterPastaInventario_();
    if (!raiz) {
      ui.alert('Pasta "Inventário Patrimonial" não encontrada.');
      return;
    }

    const pastaPlanilhas = obterOuCriarSubpasta_(raiz, 'PLANILHAS');
    const pastaContextos = obterOuCriarSubpasta_(pastaPlanilhas, 'CONTEXTOS');
    const pastaContexto = obterOuCriarSubpasta_(pastaContextos, nomeContexto);
    const pastaCSV = obterOuCriarSubpasta_(pastaContexto, 'CSV_CONTEXTO');

    const pastaUnidades = obterOuCriarSubpasta_(raiz, 'UNIDADES');
    const pastaUnidade = obterOuCriarSubpasta_(pastaUnidades, nomeContexto);

    ui.alert('Estrutura de pastas criada com sucesso.');

    const planilhaCliente = SpreadsheetApp.create('UI ' + nomeUsuario);
    DriveApp.getFileById(planilhaCliente.getId()).moveTo(pastaUnidade);

    const contextoCliente = {
      nome: nomeContexto,
      pastaUnidadeId: pastaUnidade.getId(),
      planilhaClienteId: planilhaCliente.getId(),
      emailAdmin: Session.getActiveUser().getEmail()
    };

    // 6️⃣ Gravar contexto na planilha CLIENTE (escopo correto)
    SpreadsheetApp.openById(planilhaCliente.getId());
    PropertiesService.getDocumentProperties().setProperty(
      'CONTEXTO_TRABALHO',
      JSON.stringify(contextoCliente)
    );

    // 7️⃣ Formatar e atualizar planilha cliente
    //cliente_formatarPlanilhaInterface_(planilhaCliente.getId());
    //cliente_atualizarInformacoes_(planilhaCliente.getId(), contextoCliente);
    cliente_formatarPlanilhaInterface_(
      contextoCliente.planilhaClienteId,
      contextoCliente
    );

    cliente_montarInformacoes_(contextoCliente);

    // 8️⃣ Planilha operacional (ADMIN)
    const planilhaOperacional = SpreadsheetApp.getActiveSpreadsheet();
    planilhaOperacional.rename(nomeUsuario);
    DriveApp.getFileById(planilhaOperacional.getId()).moveTo(pastaContexto);

    // 9️⃣ Gravar contexto no ADMIN
    PropertiesService.getDocumentProperties().setProperty(
      'ADMIN_CONTEXTO_ATIVO',
      JSON.stringify({
        nome: nomeContexto,
        pastaContextoId: pastaContexto.getId(),
        pastaCSVId: pastaCSV.getId(),
        pastaUnidadeId: pastaUnidade.getId(),
        planilhaOperacionalId: planilhaOperacional.getId(),
        planilhaClienteId: planilhaCliente.getId(),
        criadoEm: new Date().toISOString()
      })
    );

    // 🔟 Atualizar menu ADMIN
    adminRenderMenu_();

    ui.alert(
      'Contexto criado com sucesso!\n\n' +
      'Feche e reabra a planilha para ver o menu atualizado.'
    );

    Logger.log('[BOOTSTRAP][ADMIN] criarContextoTrabalho - FIM');
  }