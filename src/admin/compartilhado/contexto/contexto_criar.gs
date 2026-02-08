/**
 * ============================================================
 * CONTEXTO — CRIAÇÃO (NOVA LÓGICA - COPIA TEMPLATE)
 * ============================================================
 */
function criarContextoTrabalho_() {
    Logger.log('[BOOTSTRAP][ADMIN] criarContextoTrabalho - INÍCIO');
    const ui = SpreadsheetApp.getUi();

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

    // 8️⃣ Criar CONTEXTO_ADMIN e registrar pendente para a planilha ADMIN
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
    // Registrar pendente para aplicar quando a planilha ADMIN abrir
    salvarContextoAdminPendente_(ssTemplate.getId(), contextoAdmin);

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Configurando contexto cliente...',
      '⚙️ Configurando',
      3
    );

    // 8️⃣ Atualizar sistema global
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

    // 1️⃣1️⃣ Mostrar confirmação e orientar refresh
    ui.alert(
      '✅ Contexto criado com sucesso!\n\n' +
      'Recarregue a planilha (F5) para atualizar o menu.'
    );

    Logger.log('[BOOTSTRAP][ADMIN] criarContextoTrabalho - FIM');
  }
