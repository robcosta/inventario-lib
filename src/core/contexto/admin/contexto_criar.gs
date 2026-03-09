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
function garantirCapaPrimeiraAdmin_(ss, subtitulo) {
  let capa = ss.getSheetByName('CAPA');

  if (!capa) {
    capa = ss.insertSheet('CAPA');
  }

  ss.setActiveSheet(capa);
  ss.moveActiveSheet(1);

  capa.clear();
  capa.setHiddenGridlines(true);

  layoutBaseEstrutura_(capa);
  layoutCabecalhoPRF_(capa);
  layoutTituloPrincipal_(capa, (subtitulo || 'ADMIN').toUpperCase());

  capa.getRange('D9')
    .setValue('Para acessar as funcionalidades, utilize o menu "Inventário".')
    .setFontFamily('Arial')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  layoutRodapeInstitucional_(capa, 12);
}

function removerAbasEmBrancoAdmin_(ss) {
  const folhas = ss.getSheets();
  const preservar = {
    CAPA: true,
    '__CONTROLE_PROCESSAMENTO__': true
  };

  const paraRemover = [];

  folhas.forEach(sheet => {
    const nome = sheet.getName();
    if (preservar[nome]) return;

    const range = sheet.getDataRange();
    if (
      range.getLastRow() === 1 &&
      range.getLastColumn() === 1 &&
      range.getValue() === ''
    ) {
      paraRemover.push(sheet);
      return;
    }

    const values = range.getValues();
    let temDado = false;
    outer:
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values[i].length; j++) {
        const v = values[i][j];
        if (v !== '' && v !== null && v !== undefined) {
          temDado = true;
          break outer;
        }
      }
    }

    if (!temDado) {
      paraRemover.push(sheet);
    }
  });

  paraRemover.forEach(sheet => {
    if (ss.getSheets().length <= 1) return;
    ss.deleteSheet(sheet);
  });
}

function garantirPlanilhaGeralParaContexto_(pastaGeral) {
  try {
    return resolverPlanilhaGeralId_();
  } catch (e) {
    const mensagem = String((e && e.message) || e || '');
    if (!mensagem.includes('Planilha Geral ainda nao foi criada')) {
      throw e;
    }

    Logger.log('[FLUXO][CRIAR_CONTEXTO] Planilha Geral nao encontrada. Criando automaticamente.');

    const data = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm'
    );

    const ssGeral = SpreadsheetApp.create('GERAL: ' + data);
    const fileGeral = DriveApp.getFileById(ssGeral.getId());
    fileGeral.moveTo(pastaGeral);

    atualizarSistemaGlobal_({
      planilhaGeralId: ssGeral.getId()
    });

    return ssGeral.getId();
  }
}

function criarContextoTrabalho_() {
  const ui = SpreadsheetApp.getUi();
  const ssAdmin = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(1000)) {
    ui.alert('Já existe uma criação de contexto em andamento. Aguarde a finalização.');
    Logger.log('[FLUXO][CRIAR_CONTEXTO] BLOQUEADO POR DUPLICIDADE');
    return;
  }

  Logger.log('[FLUXO][CRIAR_CONTEXTO] INÍCIO');

  try {
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

    garantirCapaPrimeiraAdmin_(ssNovaTemplate, 'TEMPLATE');
    removerAbasEmBrancoAdmin_(ssNovaTemplate);

    limparContextoAtivo_();

    // ============================================================
    // 6️⃣ CRIAR ESTRUTURA DE PASTAS
    // ============================================================

    ssAdmin.toast('Criando estrutura de pastas...', '📁 Configurando', 3);

    const pastaContexto = pastaContextosMae.createFolder(nomeContexto);
    const pastaPlanilhas = pastaContexto.createFolder('PLANILHA');
    const pastaCSVAdmin = pastaPlanilhas.createFolder('CSV_ADMIN');
    const pastaLocalidades = pastaContexto.createFolder('LOCALIDADES');

    // Estrutura global da Planilha GERAL deve existir antes de resolver o ID.
    const pastaGeral = obterOuCriarSubpasta_(raiz, 'GERAL');
    const pastaCSVGeral = obterOuCriarSubpasta_(pastaGeral, 'CSV_GERAL');

    atualizarSistemaGlobal_({
      pastaRaizId: raiz.getId(),
      pastaContextoId: pastaContextosMae.getId(),
      pastaGeralId: pastaGeral.getId(),
      pastaCSVGeralId: pastaCSVGeral.getId()
    });

    // ============================================================
    // 7️⃣ RENOMEAR E MOVER ADMIN
    // ============================================================

    ssAdmin.rename('ADMIN: ' + nomeContexto);

    garantirCapaPrimeiraAdmin_(ssAdmin, nomeContexto);
    removerAbasEmBrancoAdmin_(ssAdmin);

    const fileAdmin = DriveApp.getFileById(ssAdmin.getId());
    ssAdmin.toast('Movendo planilha ADMIN...', '📂 Organizando', 3);
    fileAdmin.moveTo(pastaPlanilhas);

    // ============================================================
    // 8️⃣ GARANTIR TEMPLATES
    // ============================================================

    ssAdmin.toast('Verificando template CLIENTE...', '📦 Estrutura', 3);

    const templateClienteInfo = garantirTemplatePlanilhaComStatus_('CLIENTE');

    ssAdmin.toast(
      templateClienteInfo.criada
        ? 'Template CLIENTE criada e formatada.'
        : 'Template CLIENTE já existe.',
      '📦 Template',
      3
    );

    ssAdmin.toast('Verificando template RELATÓRIO...', '📦 Estrutura', 3);

    const templateRelatorioInfo = garantirTemplatePlanilhaComStatus_('RELATORIO');

    ssAdmin.toast(
      templateRelatorioInfo.criada
        ? 'Template RELATÓRIO criada e formatada.'
        : 'Template RELATÓRIO já existe.',
      '📦 Template',
      3
    );

    // ============================================================
    // 9️⃣ CRIAR E FORMATAR CLIENTE
    // ============================================================

    ssAdmin.toast('Copiando template CLIENTE para o contexto...', '📊 Criando', 3);

    const fileCliente = templateClienteInfo.file.makeCopy(
      'CLIENTE: ' + nomeContexto,
      pastaLocalidades
    );

    ssAdmin.toast('Planilha CLIENTE criada no contexto.', '📂 Organizando', 3);

    const ssCliente = SpreadsheetApp.openById(fileCliente.getId());

    renderizarPlanilhaCliente_(
      {
        nome: nomeContexto,
        localidadeAtivaNome: '-',
        planilhaClienteId: ssCliente.getId()
      },
      ssCliente
    );

    limparContextoAtivo_();

    // ============================================================
    // 🔟 CRIAR E FORMATAR RELATÓRIO
    // ============================================================

    ssAdmin.toast('Copiando template RELATÓRIO para o contexto...', '📊 Criando', 3);

    const fileRelatorio = templateRelatorioInfo.file.makeCopy(
      'RELATÓRIO: ' + nomeContexto,
      pastaLocalidades
    );

    ssAdmin.toast('Planilha RELATÓRIO criada no contexto.', '📂 Organizando', 3);

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

    const planilhaGeralId = garantirPlanilhaGeralParaContexto_(pastaGeral);

    const contextoAdmin = {
      nome: nomeContexto,
      planilhaAdminId: ssAdmin.getId(),
      planilhaClienteId: ssCliente.getId(),
      planilhaRelatorioId: ssRelatorio.getId(),
      pastaContextoId: pastaContexto.getId(),
      pastaPlanilhasId: pastaPlanilhas.getId(),
      pastaCSVAdminId: pastaCSVAdmin.getId(),
      pastaLocalidadesId: pastaLocalidades.getId(),
      planilhaGeralId: planilhaGeralId,
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
  } finally {
    lock.releaseLock();
  }
}