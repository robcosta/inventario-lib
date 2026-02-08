/**
 * ============================================================
<<<<<<< HEAD
 * CONTEXTO — CRIAÇÃO
=======
 * CONTEXTO — CRIAÇÃO (NOVA LÓGICA - COPIA TEMPLATE)
>>>>>>> bugfix-contexto-persistencia
 * ============================================================
 */
function criarContextoTrabalho_() {
    Logger.log('[BOOTSTRAP][ADMIN] criarContextoTrabalho - INÍCIO');
    const ui = SpreadsheetApp.getUi();
<<<<<<< HEAD

    // 🔒 Bloqueio: esta planilha já tem contexto  
    if (planilhaTemContexto_()) {
      ui.alert(
        'Esta planilha já pertence a um contexto.\n' +
        'Não é permitido criar outro contexto nela.'
=======
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const nomeAtual = ss ? ss.getName() : '';
    const ehTemplate = nomeAtual.toUpperCase().indexOf('TEMPLATE') !== -1;

    // ⚠️ Validar se já existe contexto ativo
    const temContexto = planilhaTemContexto_();
    
    if (temContexto && !ehTemplate) {
      ui.alert(
        '⚠️ Contexto já existe',
        'Esta planilha já possui um contexto de trabalho configurado.\n\n' +
        '💡 Use "🔧 Reparar Contexto" se o menu não está aparecendo corretamente.\n\n' +
        '📝 Nome da planilha: ' + nomeAtual,
        ui.ButtonSet.OK
>>>>>>> bugfix-contexto-persistencia
      );
      return;
    }

<<<<<<< HEAD
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
      'Contexto criado com sucesso.\n\n' +
      'A planilha será reaberta para garantir consistência.'
    );

    SpreadsheetApp.openById(planilhaOperacional.getId());

    Logger.log('[BOOTSTRAP][ADMIN] criarContextoTrabalho - FIM');
  }
=======
    // 1️⃣ Solicitar nome do contexto
    const resp = ui.prompt(
      'Criar Novo Contexto de Trabalho',
      'Digite o nome do contexto (ex: DEL02 - FORTALEZA):',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (resp.getSelectedButton() !== ui.Button.OK) return;

    const nomeUsuario = (resp.getResponseText() || '').trim().toUpperCase();
    if (!nomeUsuario) {
      ui.alert('❌ O nome do contexto não pode estar vazio.');
      return;
    }

    const nomeContexto = nomeUsuario;

    // 2️⃣ Validar pasta raiz
    const raiz = obterPastaInventario_();
    if (!raiz) {
      ui.alert('❌ Pasta "Inventário Patrimonial" não encontrada.');
      return;
    }

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Copiando planilha template...',
      '📋 Criando',
      3
    );

    // 3️⃣ COPIAR planilha ativa (template) e manter cópia como nova TEMPLATE
    const ssTemplate = SpreadsheetApp.getActiveSpreadsheet();
    const fileTemplate = DriveApp.getFileById(ssTemplate.getId());
    const fileCopiaTemplate = fileTemplate.makeCopy('ADMIN: Template');
    const ssTemplateCopia = SpreadsheetApp.openById(fileCopiaTemplate.getId());
    // Garantir que a cópia (nova template) NÃO tenha contexto salvo
    SpreadsheetApp.setActiveSpreadsheet(ssTemplateCopia);
    PropertiesService.getDocumentProperties().deleteProperty('CONTEXTO_ADMIN');
    PropertiesService.getDocumentProperties().deleteProperty('CONTEXTO_CLIENTE');

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Criando estrutura de pastas...',
      '📁 Configurando',
      3
    );

    // 4️⃣ Criar estrutura de pastas CONTEXTO/nome/
    const pastaContextoMae = obterOuCriarSubpasta_(raiz, 'CONTEXTO');
    const pastaContextoDel = obterOuCriarSubpasta_(pastaContextoMae, nomeContexto);
    
    const pastaPlanilhas = obterOuCriarSubpasta_(pastaContextoDel, 'PLANILHA');
    const pastaCSVAdmin = obterOuCriarSubpasta_(pastaPlanilhas, 'CSV_ADMIN');
    const pastaLocalidades = obterOuCriarSubpasta_(pastaContextoDel, 'LOCALIDADES');

    // 5️⃣ Renomear a planilha ATIVA como ADMIN do novo contexto
    ssTemplate.rename('ADMIN: ' + nomeUsuario);
    const fileAdmin = DriveApp.getFileById(ssTemplate.getId());

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Organizando planilha ADMIN...',
      '📂 Movendo',
      3
    );

    // 6️⃣ MOVER planilha ADMIN para pasta PLANILHA
    fileAdmin.moveTo(pastaPlanilhas);

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Criando planilha cliente...',
      '📊 Criando',
      3
    );

    // 7️⃣ Criar planilha CLIENTE
    const planilhaCliente = SpreadsheetApp.create('CLIENTE: ' + nomeUsuario);
    DriveApp.getFileById(planilhaCliente.getId()).moveTo(pastaLocalidades);

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Salvando contexto admin...',
      '💾 Salvando',
      3
    );

    // 8️⃣ Criar e SALVAR CONTEXTO_ADMIN diretamente (não usar PENDING na criação)
    Logger.log('[CONTEXTO_ADMIN][CRIAR] Planilha ADMIN ID: ' + ssTemplate.getId());
    const contextoAdmin = criarContextoAdmin_({
      id: ssTemplate.getId(),
      nome: nomeContexto,
      emailOperador: Session.getActiveUser().getEmail(),
      pastaContextoDelId: pastaContextoDel.getId(),
      pastaPlanilhasId: pastaPlanilhas.getId(),
      pastaCSVAdminId: pastaCSVAdmin.getId(),
      pastaLocalidadesId: pastaLocalidades.getId(),
      planilhaClienteId: planilhaCliente.getId(),
      planilhaGeralId: obterPlanilhaGeralId_()
    });

    Logger.log('[CONTEXTO_ADMIN][CRIAR] Contexto gerado: ' + JSON.stringify(contextoAdmin));
    
    // Salvar DIRETAMENTE em ScriptProperties (não usar PENDING para criação)
    // PENDING é usado apenas para TROCA de contextos
    const props = PropertiesService.getScriptProperties();
    const chave = PROPRIEDADES_ADMIN.CONTEXTO_ADMIN + '_' + ssTemplate.getId();
    props.setProperty(chave, JSON.stringify(contextoAdmin));
    Logger.log('[CONTEXTO_ADMIN][CRIAR] Contexto salvo diretamente em: ' + chave);
    
    // Verificar se salvou
    const verificacao = props.getProperty(chave);
    if (!verificacao) {
      Logger.log('[CONTEXTO_ADMIN][CRIAR] ❌ ERRO: Contexto não foi salvo!');
      ui.alert('⚠️ Erro ao salvar contexto. Verifique os logs.');
      return;
    }
    Logger.log('[CONTEXTO_ADMIN][CRIAR] ✅ Contexto salvo com sucesso (' + verificacao.length + ' chars)');

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Configurando contexto cliente...',
      '⚙️ Configurando',
      3
    );

    // 9️⃣ Atualizar sistema global
    const sistemaGlobal = obterSistemaGlobal_();
    if (!sistemaGlobal.pastaContextoId) {
      atualizarSistemaGlobal_({
        pastaContextoId: pastaContextoMae.getId()
      });
    }

    // 9️⃣ Criar CONTEXTO_CLIENTE
    const ssCliente = SpreadsheetApp.openById(planilhaCliente.getId());
    SpreadsheetApp.setActiveSpreadsheet(ssCliente);
    
    criarContextoCliente_({
      id: planilhaCliente.getId(),
      nome: nomeContexto,
      emailOperador: Session.getActiveUser().getEmail(),
      pastaLocalidadesId: pastaLocalidades.getId(),
      planilhaAdminId: ssTemplate.getId(),
      planilhaGeralId: obterPlanilhaGeralId_()
    });

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Formatando planilha cliente...',
      '🎨 Finalizando',
      4
    );

    // 🔟 Formatar planilha cliente
    cliente_formatarPlanilhaInterface_(
      planilhaCliente.getId(),
      {
        nome: nomeContexto,
        planilhaClienteId: planilhaCliente.getId(),
        pastaLocalidadesId: pastaLocalidades.getId()
      }
    );

    cliente_montarInformacoes_({
      nome: nomeContexto
    });

    // 1️⃣1️⃣ Voltar para planilha ADMIN e renderizar menu imediatamente
    SpreadsheetApp.setActiveSpreadsheet(ssTemplate);
    
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Ativando menu admin...',
      '✅ Finalizando',
      2
    );
    
    // Renderizar menu imediatamente (sem precisar F5)
    adminRenderMenu_();
    
    // 1️⃣2️⃣ Mostrar confirmação
    ui.alert(
      '✅ Contexto "' + nomeContexto + '" criado com sucesso!\n\n' +
      '🎉 Menu admin já está ativo e pronto para uso.'
    );

    Logger.log('[BOOTSTRAP][ADMIN] criarContextoTrabalho - FIM');
  }
>>>>>>> bugfix-contexto-persistencia
