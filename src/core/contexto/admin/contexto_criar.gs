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

function solicitarPastaRaizCriacaoContexto_(ui) {
  const sistemaGlobal = obterSistemaGlobal_() || {};
  const idSalvo = String(sistemaGlobal.pastaRaizId || '').trim();

  const textoPrompt =
    'Informe o ID da pasta RAIZ do Inventário.' +
    '\n\nA estrutura será criada/reutilizada automaticamente: CONTEXTOS, GERAL e TEMPLATES.' +
    (idSalvo
      ? '\n\nID salvo atualmente:\n' + idSalvo + '\n\nDeixe em branco para reutilizar o ID salvo.'
      : '');

  const resp = ui.prompt(
    'Pasta Raiz do Inventário',
    textoPrompt,
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return null;

  const informado = String(resp.getResponseText() || '').trim();
  const raizId = informado || idSalvo;

  if (!raizId) {
    ui.alert('❌ ID da pasta raiz não informado.');
    return null;
  }

  try {
    return DriveApp.getFolderById(raizId);
  } catch (e) {
    ui.alert('❌ Não foi possível acessar a pasta raiz pelo ID informado.\n\n' + e.message);
    return null;
  }
}

function garantirEstruturaGlobalInventario_(pastaRaiz) {
  const pastaContextosMae = obterOuCriarSubpasta_(pastaRaiz, 'CONTEXTOS');
  const pastaGeral = obterOuCriarSubpasta_(pastaRaiz, 'GERAL');
  const pastaCSVGeral = obterOuCriarSubpasta_(pastaGeral, 'CSV_GERAL');
  const pastaTemplates = obterOuCriarSubpasta_(pastaRaiz, 'TEMPLATES');

  atualizarSistemaGlobal_({
    pastaRaizId: pastaRaiz.getId(),
    pastaContextoId: pastaContextosMae.getId(),
    pastaGeralId: pastaGeral.getId(),
    pastaCSVGeralId: pastaCSVGeral.getId(),
    pastaTemplatesId: pastaTemplates.getId()
  });

  return {
    pastaContextosMae: pastaContextosMae,
    pastaGeral: pastaGeral,
    pastaCSVGeral: pastaCSVGeral,
    pastaTemplates: pastaTemplates
  };
}

function nomePlanilhaGeralMinimoValido_(nome) {
  return /^GERAL:\s*\S+/i.test(String(nome || '').trim());
}

function localizarPlanilhaGeralNomeValidoNaPasta_(pastaGeral) {
  const files = pastaGeral.getFilesByType(MimeType.GOOGLE_SHEETS);
  let melhor = null;

  while (files.hasNext()) {
    const atual = files.next();
    if (!nomePlanilhaGeralMinimoValido_(atual.getName())) continue;

    if (!melhor || atual.getLastUpdated() > melhor.getLastUpdated()) {
      melhor = atual;
    }
  }

  return melhor;
}

function arquivoPertenceAPasta_(arquivo, pasta) {
  if (!arquivo || !pasta) return false;

  const pastaId = pasta.getId();
  const pais = arquivo.getParents();

  while (pais.hasNext()) {
    if (pais.next().getId() === pastaId) {
      return true;
    }
  }

  return false;
}

function garantirPlanilhaGeralParaContexto_(pastaGeral) {
  let planilhaGeralId = null;

  try {
    const idResolvido = resolverPlanilhaGeralId_();
    if (idResolvido) {
      const fileResolvido = DriveApp.getFileById(idResolvido);
      if (
        nomePlanilhaGeralMinimoValido_(fileResolvido.getName()) &&
        arquivoPertenceAPasta_(fileResolvido, pastaGeral)
      ) {
        planilhaGeralId = idResolvido;
      }
    }
  } catch (e) {
    // continua para fallback estrutural
  }

  if (!planilhaGeralId) {
    const fileEncontrado = localizarPlanilhaGeralNomeValidoNaPasta_(pastaGeral);
    if (fileEncontrado) {
      planilhaGeralId = fileEncontrado.getId();
    }
  }

  if (!planilhaGeralId) {
    Logger.log('[FLUXO][CRIAR_CONTEXTO] Planilha Geral nao encontrada. Criando GERAL: NOVA PLANILHA.');

    const ssGeral = SpreadsheetApp.create('GERAL: NOVA PLANILHA');
    const fileGeral = DriveApp.getFileById(ssGeral.getId());
    fileGeral.moveTo(pastaGeral);
    planilhaGeralId = ssGeral.getId();
  }

  atualizarSistemaGlobal_({
    planilhaGeralId: planilhaGeralId
  });

  return planilhaGeralId;
}

function localizarArquivoPorNomeExato_(pasta, nomeArquivo) {
  if (!pasta || !nomeArquivo) return null;
  const itens = pasta.getFilesByName(nomeArquivo);
  return itens.hasNext() ? itens.next() : null;
}

function obterTemplateClienteEmTemplates_(pastaTemplates) {
  return localizarArquivoPorNomeExato_(pastaTemplates, 'CLIENTE: TEMPLATE');
}

function obterTemplateRelatoriosEmTemplates_(pastaTemplates) {
  return localizarArquivoPorNomeExato_(pastaTemplates, 'RELATÓRIOS: TEMPLATE');
}

function criarPlanilhaClienteNoContexto_(nomeContexto, pastaLocalidades) {
  const ssCliente = SpreadsheetApp.create('CLIENTE: ' + nomeContexto);
  const fileCliente = DriveApp.getFileById(ssCliente.getId());
  fileCliente.moveTo(pastaLocalidades);

  renderizarPlanilhaCliente_(
    {
      nome: nomeContexto,
      localidadeAtivaNome: '-',
      planilhaClienteId: ssCliente.getId()
    },
    ssCliente
  );

  return {
    file: fileCliente,
    ss: ssCliente
  };
}

function criarPlanilhaRelatorioNoContexto_(nomeContexto, pastaLocalidades) {
  const ssRelatorio = SpreadsheetApp.create('RELATÓRIOS: ' + nomeContexto);
  const fileRelatorio = DriveApp.getFileById(ssRelatorio.getId());
  fileRelatorio.moveTo(pastaLocalidades);

  renderizarPlanilhaRelatorio_(
    { nome: nomeContexto },
    ssRelatorio
  );

  return {
    file: fileRelatorio,
    ss: ssRelatorio
  };
}

function gerarTemplateAPartirDePlanilhaContexto_(fileContexto, pastaTemplates, nomeTemplate) {
  const existente = localizarArquivoPorNomeExato_(pastaTemplates, nomeTemplate);
  if (existente) return existente;
  return fileContexto.makeCopy(nomeTemplate, pastaTemplates);
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

    const raiz = solicitarPastaRaizCriacaoContexto_(ui);
    if (!raiz) {
      return;
    }

    const estruturaGlobal = garantirEstruturaGlobalInventario_(raiz);
    const pastaContextosMae = estruturaGlobal.pastaContextosMae;
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
    const fileNovaTemplate = fileAdminAtual.makeCopy(
      'ADMIN: TEMPLATE',
      estruturaGlobal.pastaTemplates
    );
    const ssNovaTemplate = SpreadsheetApp.openById(fileNovaTemplate.getId());

    garantirCapaPrimeiraAdmin_(ssNovaTemplate, 'TEMPLATE');
    removerAbasEmBrancoAdmin_(ssNovaTemplate);

    atualizarSistemaGlobal_({
      planilhaTemplateAdminId: fileNovaTemplate.getId()
    });

    limparContextoAtivo_();

    // ============================================================
    // 6️⃣ CRIAR ESTRUTURA DE PASTAS
    // ============================================================

    ssAdmin.toast('Criando estrutura de pastas...', '📁 Configurando', 3);

    const pastaContexto = pastaContextosMae.createFolder(nomeContexto);
    const pastaPlanilhas = pastaContexto.createFolder('PLANILHA');
    const pastaCSVAdmin = pastaPlanilhas.createFolder('CSV_ADMIN');
    const pastaLocalidades = pastaContexto.createFolder('LOCALIDADES');

    // Estrutura global compartilhada.
    const pastaGeral = estruturaGlobal.pastaGeral;

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
    // 8️⃣ CLIENTE/RELATÓRIOS: REUSAR TEMPLATE OU CRIAR NO CONTEXTO
    // ============================================================

    const pastaTemplates = estruturaGlobal.pastaTemplates;

    ssAdmin.toast('Verificando template CLIENTE em TEMPLATES...', '📦 Estrutura', 3);
    let templateClienteFile = obterTemplateClienteEmTemplates_(pastaTemplates);
    let fileCliente;
    let ssCliente;

    if (templateClienteFile) {
      fileCliente = templateClienteFile.makeCopy('CLIENTE: ' + nomeContexto, pastaLocalidades);
      ssCliente = SpreadsheetApp.openById(fileCliente.getId());
      renderizarPlanilhaCliente_(
        {
          nome: nomeContexto,
          localidadeAtivaNome: '-',
          planilhaClienteId: ssCliente.getId()
        },
        ssCliente
      );
      ssAdmin.toast('Template CLIENTE reutilizada no contexto.', '📦 Template', 3);
    } else {
      ssAdmin.toast('Template CLIENTE ausente. Criando no contexto...', '📦 Template', 3);
      const criadoCliente = criarPlanilhaClienteNoContexto_(nomeContexto, pastaLocalidades);
      fileCliente = criadoCliente.file;
      ssCliente = criadoCliente.ss;
      templateClienteFile = gerarTemplateAPartirDePlanilhaContexto_(
        fileCliente,
        pastaTemplates,
        'CLIENTE: TEMPLATE'
      );
      ssAdmin.toast('Template CLIENTE criada em TEMPLATES.', '📦 Template', 3);
    }

    limparContextoAtivo_();

    ssAdmin.toast('Verificando template RELATÓRIOS em TEMPLATES...', '📦 Estrutura', 3);
    let templateRelatorioFile = obterTemplateRelatoriosEmTemplates_(pastaTemplates);
    let fileRelatorio;
    let ssRelatorio;

    if (templateRelatorioFile) {
      fileRelatorio = templateRelatorioFile.makeCopy('RELATÓRIOS: ' + nomeContexto, pastaLocalidades);
      ssRelatorio = SpreadsheetApp.openById(fileRelatorio.getId());
      renderizarPlanilhaRelatorio_(
        { nome: nomeContexto },
        ssRelatorio
      );
      ssAdmin.toast('Template RELATÓRIOS reutilizada no contexto.', '📦 Template', 3);
    } else {
      ssAdmin.toast('Template RELATÓRIOS ausente. Criando no contexto...', '📦 Template', 3);
      const criadoRelatorio = criarPlanilhaRelatorioNoContexto_(nomeContexto, pastaLocalidades);
      fileRelatorio = criadoRelatorio.file;
      ssRelatorio = criadoRelatorio.ss;
      templateRelatorioFile = gerarTemplateAPartirDePlanilhaContexto_(
        fileRelatorio,
        pastaTemplates,
        'RELATÓRIOS: TEMPLATE'
      );
      ssAdmin.toast('Template RELATÓRIOS criada em TEMPLATES.', '📦 Template', 3);
    }

    atualizarSistemaGlobal_({
      planilhaTemplateClienteId: templateClienteFile.getId(),
      planilhaTemplateRelatorioId: templateRelatorioFile.getId()
    });

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
