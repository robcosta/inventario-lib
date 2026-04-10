/**
 * ============================================================
 * PROCESSAMENTO DE IMAGENS — FILA (CLIENTE -> WORKER ADMIN)
 * ============================================================
 */

const FILA_PROCESSAMENTO_ABA = '__FILA_PROCESSAMENTO__';
const FILA_SINCRONIZACAO_ABA = '__FILA_SINCRONIZACAO__';
const CHAVE_LEMBRETE_TRIGGER_FILA_ULTIMO_AVISO = 'LEMBRETE_TRIGGER_FILA_ULTIMO_AVISO';
const INTERVALO_MINIMO_LEMBRETE_TRIGGER_MIN = 240;
const INTERVALO_PAINEL_STATUS_FILA_MS = 4000;

const FILA_STATUS = {
  PENDENTE: 'PENDENTE',
  PROCESSANDO: 'PROCESSANDO',
  SUCESSO: 'SUCESSO',
  ERRO: 'ERRO'
};

const FILA_CABECALHO = [
  'REQUEST_ID',
  'STATUS',
  'CRIADO_EM_ISO',
  'INICIADO_EM_ISO',
  'FINALIZADO_EM_ISO',
  'SOLICITANTE_EMAIL',
  'CONTEXTO_NOME',
  'PLANILHA_ADMIN_ID',
  'PLANILHA_CLIENTE_ID',
  'PLANILHA_GERAL_ID',
  'PASTA_TRABALHO_ID',
  'PASTA_TRABALHO_NOME',
  'TOTAL',
  'SUCESSO',
  'ERRO',
  'MENSAGEM_ERRO',
  'RESULTADO_JSON',
  'NOTIFICADO_EM_ISO',
  'TENTATIVAS',
  'PROCESSADO_POR'
];

const FILA_COL = {
  REQUEST_ID: 1,
  STATUS: 2,
  CRIADO_EM: 3,
  INICIADO_EM: 4,
  FINALIZADO_EM: 5,
  SOLICITANTE_EMAIL: 6,
  CONTEXTO_NOME: 7,
  PLANILHA_ADMIN_ID: 8,
  PLANILHA_CLIENTE_ID: 9,
  PLANILHA_GERAL_ID: 10,
  PASTA_TRABALHO_ID: 11,
  PASTA_TRABALHO_NOME: 12,
  TOTAL: 13,
  SUCESSO: 14,
  ERRO: 15,
  MENSAGEM_ERRO: 16,
  RESULTADO_JSON: 17,
  NOTIFICADO_EM: 18,
  TENTATIVAS: 19,
  PROCESSADO_POR: 20
};

const FILA_SYNC_STATUS = {
  PENDENTE: 'PENDENTE',
  PROCESSANDO: 'PROCESSANDO',
  SUCESSO: 'SUCESSO',
  ERRO: 'ERRO'
};

const FILA_SYNC_CABECALHO = [
  'REQUEST_ID',
  'STATUS',
  'CRIADO_EM_ISO',
  'INICIADO_EM_ISO',
  'FINALIZADO_EM_ISO',
  'SOLICITANTE_EMAIL',
  'CONTEXTO_NOME',
  'PLANILHA_ADMIN_ID',
  'PLANILHA_CLIENTE_ID',
  'PASTA_LOCALIDADES_ID',
  'VERSAO_LOCALIDADES',
  'VERSAO_SINCRONIZADA',
  'MENSAGEM_ERRO',
  'MAPA_CORES_JSON',
  'CORES_BANIDAS_JSON',
  'PROCESSADO_POR',
  'NOTIFICADO_EM_ISO'
];

const FILA_SYNC_COL = {
  REQUEST_ID: 1,
  STATUS: 2,
  CRIADO_EM: 3,
  INICIADO_EM: 4,
  FINALIZADO_EM: 5,
  SOLICITANTE_EMAIL: 6,
  CONTEXTO_NOME: 7,
  PLANILHA_ADMIN_ID: 8,
  PLANILHA_CLIENTE_ID: 9,
  PASTA_LOCALIDADES_ID: 10,
  VERSAO_LOCALIDADES: 11,
  VERSAO_SINCRONIZADA: 12,
  MENSAGEM_ERRO: 13,
  MAPA_CORES_JSON: 14,
  CORES_BANIDAS_JSON: 15,
  PROCESSADO_POR: 16,
  NOTIFICADO_EM: 17
};

// Fila de criação de pastas solicitada pelo CLIENTE (processada pelo ADMIN)
const FILA_CRIAR_PASTA_ABA = '__FILA_CRIAR_PASTA__';
const FILA_CRIAR_PASTA_STATUS = {
  PENDENTE: 'PENDENTE',
  PROCESSANDO: 'PROCESSANDO',
  SUCESSO: 'SUCESSO',
  ERRO: 'ERRO'
};

function dataHoraPlanilha_() {
  const tz = Session.getScriptTimeZone() || 'America/Sao_Paulo';
  return Utilities.formatDate(new Date(), tz, 'dd/MM/yyyy HH:mm:ss');
}
const FILA_CRIAR_PASTA_CABECALHO = [
  'REQUEST_ID',
  'STATUS',
  'CRIADO_EM_ISO',
  'INICIADO_EM_ISO',
  'FINALIZADO_EM_ISO',
  'SOLICITANTE_EMAIL',
  'NOME_PASTA',
  'CONTEXTO_NOME',
  'PLANILHA_ADMIN_ID',
  'PLANILHA_CLIENTE_ID',
  'PASTA_LOCALIDADES_ID',
  'MENSAGEM_ERRO',
  'PASTA_ID_CRIADA'
];
const FILA_CRIAR_PASTA_COL = {
  REQUEST_ID: 1,
  STATUS: 2,
  CRIADO_EM: 3,
  INICIADO_EM: 4,
  FINALIZADO_EM: 5,
  SOLICITANTE_EMAIL: 6,
  NOME_PASTA: 7,
  CONTEXTO_NOME: 8,
  PLANILHA_ADMIN_ID: 9,
  PLANILHA_CLIENTE_ID: 10,
  PASTA_LOCALIDADES_ID: 11,
  MENSAGEM_ERRO: 12,
  PASTA_ID_CRIADA: 13
};

function enfileirarProcessamentoImagensCliente_(contextoEntrada) {
  const ui = SpreadsheetApp.getUi();
  const ssAtiva = SpreadsheetApp.getActiveSpreadsheet();

  let contexto = contextoEntrada;
  try {
    contexto = sincronizarLocalidadeAtiva_(contexto);

    const validacaoSync = garantirSincronizacaoLocalidadesClienteProntaParaProcessamento_(contexto);
    if (!validacaoSync.ok) {
      const msg = validacaoSync.mensagem || 'Sincronização de localidades pendente.';
      ui.alert('⏳ Sincronização Necessária', msg, ui.ButtonSet.OK);
      toast_(msg, '⏳ Sincronização', 8);
      return {
        enfileirado: false,
        bloqueadoSincronizacao: true,
        detalhesSincronizacao: validacaoSync
      };
    }

    if (validacaoSync.contexto) {
      contexto = validacaoSync.contexto;
    }

    const pre = prepararProcessamentoVisionSemUi_(contexto);

    const confirmar = ui.alert(
      '🖼️ Processamento em Fila',
      `Enviar para processamento as imagens da pasta:\n"${pre.pastaNome}"?\n\n` +
      'O processamento será executado em segundo plano e o status será exibido por toast.',
      ui.ButtonSet.YES_NO
    );
    if (confirmar !== ui.Button.YES) {
      toast_('Solicitação cancelada.', 'Processamento em Fila', 4);
      return { enfileirado: false, cancelado: true };
    }

    const ssCliente = SpreadsheetApp.openById(pre.contexto.planilhaClienteId);
    const fila = obterOuCriarAbaFilaProcessamento_(ssCliente);
    const emailsUsuario = obterEmailsUsuarioAtualFila_();
    const solicitanteEmail = emailsUsuario[0] || 'DESCONHECIDO';

    const existente = obterSolicitacaoAbertaPorSolicitante_(fila, emailsUsuario);
    if (existente) {
      toast_(
        `Já existe solicitação em andamento (#${existente.requestId}).`,
        'Processamento em Fila',
        6
      );
      return {
        enfileirado: false,
        existente: true,
        requestId: existente.requestId,
        status: existente.status
      };
    }

    const requestId = gerarRequestIdFila_();
    const agoraIso = dataHoraPlanilha_();

    fila.appendRow([
      requestId,
      FILA_STATUS.PENDENTE,
      agoraIso,
      '',
      '',
      solicitanteEmail,
      pre.contexto.nome || '',
      pre.planilhaAdminId || '',
      pre.contexto.planilhaClienteId || '',
      pre.planilhaGeralId || '',
      pre.pastaId || '',
      pre.pastaNome || '',
      '',
      '',
      '',
      '',
      '',
      '',
      0,
      ''
    ]);

    toast_(
      `Solicitação #${requestId} enviada para fila.`,
      '⏳ Processamento em Fila',
      6
    );

    // Se houver planilha ativa aberta, reforça feedback para o cliente.
    try {
      ssAtiva.toast(
        'Acompanhe o status pelo menu CLIENTE ou em "Atualizar Informações".',
        '📦 Inventário',
        6
      );
    } catch (e) {}

    return {
      enfileirado: true,
      requestId: requestId
    };
  } catch (e) {
    ui.alert('❌ Não foi possível enfileirar o processamento:\n\n' + e.message);
    throw e;
  }
}

function clientVerificarStatusProcessamento_() {
  const contexto = obterContextoDominio_();

  if (!contexto || contexto.tipo !== 'CLIENTE') {
    toast_('Esta ação está disponível apenas no contexto CLIENTE.', 'Inventário', 5);
    return null;
  }

  const fila = obterAbaFilaClientePorContexto_(contexto);
  if (!fila) {
    toast_('Nenhuma solicitação de processamento foi registrada.', 'Inventário', 5);
    return null;
  }

  const emailsUsuario = obterEmailsUsuarioAtualFila_();
  const ultima = obterUltimaSolicitacaoDoUsuario_(fila, emailsUsuario);

  if (!ultima) {
    toast_('Nenhuma solicitação encontrada para seu usuário.', 'Inventário', 5);
    return null;
  }

  toast_(formatarMensagemStatusFila_(ultima), '📣 Status do Processamento', 8);

  if (
    (ultima.status === FILA_STATUS.SUCESSO || ultima.status === FILA_STATUS.ERRO) &&
    !ultima.notificadoEm
  ) {
    marcarSolicitacaoNotificada_(fila, ultima.rowNumber);
  }

  return ultima;
}

function notificarResultadosFilaProcessamentoCliente_(contexto) {
  if (!contexto || contexto.tipo !== 'CLIENTE') return null;

  const fila = obterAbaFilaClientePorContexto_(contexto);
  if (!fila) return null;

  const emailsUsuario = obterEmailsUsuarioAtualFila_();
  const pendenteNotificacao = obterUltimaSolicitacaoFinalizadaNaoNotificada_(fila, emailsUsuario);
  if (!pendenteNotificacao) return null;

  toast_(
    formatarMensagemStatusFila_(pendenteNotificacao),
    '📣 Status do Processamento',
    8
  );

  marcarSolicitacaoNotificada_(fila, pendenteNotificacao.rowNumber);
  return pendenteNotificacao;
}

function clientAbrirPainelStatusProcessamento_() {
  const contexto = obterContextoDominio_();
  if (!contexto || contexto.tipo !== 'CLIENTE') {
    toast_('Esta ação está disponível apenas no contexto CLIENTE.', 'Inventário', 5);
    return;
  }

  const template = HtmlService.createTemplateFromFile(
    'core/processamento/processamento_status_dialog'
  );
  template.intervaloPollingMs = INTERVALO_PAINEL_STATUS_FILA_MS;

  const html = template
    .evaluate()
    .setWidth(520)
    .setHeight(420);

  SpreadsheetApp
    .getUi()
    .showModelessDialog(html, 'Acompanhamento do Processamento');
}

function clientConsultarStatusProcessamentoPainel_() {
  const contexto = obterContextoDominio_();

  if (!contexto || contexto.tipo !== 'CLIENTE') {
    return {
      ok: false,
      encontrado: false,
      mensagem: 'Contexto CLIENTE não encontrado para acompanhamento.'
    };
  }

  const fila = obterAbaFilaClientePorContexto_(contexto);
  if (!fila) {
    return {
      ok: true,
      encontrado: false,
      mensagem: 'Nenhuma solicitação de processamento registrada.'
    };
  }

  const emailsUsuario = obterEmailsUsuarioAtualFila_();
  const req = obterUltimaSolicitacaoDoUsuario_(fila, emailsUsuario);
  if (!req) {
    return {
      ok: true,
      encontrado: false,
      mensagem: 'Nenhuma solicitação encontrada para o usuário atual.'
    };
  }

  const finalizado = req.status === FILA_STATUS.SUCESSO || req.status === FILA_STATUS.ERRO;
  if (finalizado && !req.notificadoEm) {
    marcarSolicitacaoNotificada_(fila, req.rowNumber);
  }

  return {
    ok: true,
    encontrado: true,
    requestId: req.requestId,
    status: req.status,
    criadoEm: req.criadoEm,
    iniciadoEm: req.iniciadoEm,
    finalizadoEm: req.finalizadoEm,
    total: req.total || 0,
    sucesso: req.sucesso || 0,
    erro: req.erro || 0,
    mensagemErro: req.mensagemErro || '',
    processadoPor: req.processadoPor || '',
    finalizado: finalizado,
    mensagem: formatarMensagemStatusFila_(req)
  };
}

function processarFilaImagensPendentes_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    Logger.log('[FILA][WORKER] Outro worker já está em execução.');
    return { processados: 0, erros: 0, sincronizados: 0, errosSincronizacao: 0, bloqueado: true };
  }

  const inicio = Date.now();
  let totalProcessados = 0;
  let totalErros = 0;
  let totalCriadas = 0;
  let totalErrosCriacao = 0;
  let totalSincronizados = 0;
  let totalErrosSync = 0;

  try {
    const contextos = resolverContextosAdminParaWorker_();
    if (!contextos.length) {
      Logger.log('[FILA][WORKER] Nenhum contexto ADMIN disponível para processamento.');
      return { processados: 0, erros: 0, sincronizados: 0, errosSincronizacao: 0, contextos: 0 };
    }

    contextos.forEach(ctx => {
      const parcialSync = processarUmaSincronizacaoLocalidadesPorContexto_(ctx);
      totalSincronizados += parcialSync.sincronizados || 0;
      totalErrosSync += parcialSync.erros || 0;

      const parcialCriacao = processarUmaSolicitacaoCriarPastaPorContexto_(ctx);
      totalCriadas += parcialCriacao.criadas || 0;
      totalErrosCriacao += parcialCriacao.erros || 0;

      const parcial = processarUmaSolicitacaoFilaPorContexto_(ctx);
      totalProcessados += parcial.processados || 0;
      totalErros += parcial.erros || 0;
    });

    Logger.log(
      '[FILA][WORKER] Concluído. contextos=' + contextos.length +
      ', sincronizados=' + totalSincronizados +
      ', errosSync=' + totalErrosSync +
      ', processados=' + totalProcessados +
      ', erros=' + totalErros +
      ', criadas=' + totalCriadas +
      ', errosCriacao=' + totalErrosCriacao +
      ', tempo_ms=' + (Date.now() - inicio)
    );

    return {
      sincronizados: totalSincronizados,
      errosSincronizacao: totalErrosSync,
      processados: totalProcessados,
      erros: totalErros,
      criadas: totalCriadas,
      errosCriacao: totalErrosCriacao,
      contextos: contextos.length,
      tempo_ms: Date.now() - inicio
    };
  } finally {
    lock.releaseLock();
  }
}

function instalarTriggerFilaProcessamento_() {
  const ui = SpreadsheetApp.getUi();
  const handler = 'processarFilaImagensPendentes';

  try {
    const existentes = obterTriggersProjetoSeguro_()
      .filter(t => t.getHandlerFunction && t.getHandlerFunction() === handler);
    existentes.forEach(t => ScriptApp.deleteTrigger(t));

    ScriptApp.newTrigger(handler)
      .timeBased()
      .everyMinutes(1)
      .create();

    registrarDataLembreteTriggerFila_(new Date());
    limparLembreteTriggerFilaNaCapaAdmin_(SpreadsheetApp.getActiveSpreadsheet());
    toast_('Trigger da fila instalado (a cada 1 minuto).', '✅ Worker', 6);
    ui.alert('✅ Trigger instalado com sucesso.\n\nFunção: ' + handler + '\nPeriodicidade: 1 minuto');
  } catch (e) {
    ui.alert('❌ Falha ao instalar trigger da fila:\n\n' + e.message);
    throw e;
  }
}

function removerTriggerFilaProcessamento_() {
  const ui = SpreadsheetApp.getUi();
  const handlers = {
    processarFilaImagensPendentes: true,
    processarFilaImagensPendentes_: true
  };

  const triggers = obterTriggersProjetoSeguro_()
    .filter(t => t.getHandlerFunction && handlers[t.getHandlerFunction()]);

  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  aplicarLembreteTriggerFilaNaCapaAdmin_(SpreadsheetApp.getActiveSpreadsheet());
  toast_('Trigger(s) da fila removido(s): ' + triggers.length, '🧹 Worker', 6);
  ui.alert('✅ Trigger(s) removido(s): ' + triggers.length);
}

function existeTriggerFilaProcessamento_() {
  const handlers = {
    processarFilaImagensPendentes: true,
    processarFilaImagensPendentes_: true
  };

  const triggers = obterTriggersProjetoSeguro_();
  return triggers.some(t => t.getHandlerFunction && handlers[t.getHandlerFunction()]);
}

function verificarLembreteTriggerFilaNoContextoAdmin_(ss) {
  const planilha = ss || SpreadsheetApp.getActiveSpreadsheet();
  if (!planilha) return;
  if (!contextoAdminRegistrado_()) return;

  let triggerInstalado = false;
  try {
    triggerInstalado = existeTriggerFilaProcessamento_();
  } catch (e) {
    Logger.log('[FILA][LEMBRETE][AVISO] Não foi possível validar trigger: ' + e.message);
    triggerInstalado = false;
  }

  if (triggerInstalado) {
    limparLembreteTriggerFilaNaCapaAdmin_(planilha);
    return;
  }

  aplicarLembreteTriggerFilaNaCapaAdmin_(planilha);

  if (!deveExibirToastLembreteTriggerFilaAgora_()) return;

  toast_(
    'Worker da fila sem trigger. Configure em: ⚙️ Worker da Fila > ⏱️ Instalar Trigger (1 min).',
    '⚠️ Configuração Pendente',
    8
  );
  registrarDataLembreteTriggerFila_(new Date());
}

function obterTriggersProjetoSeguro_() {
  try {
    return ScriptApp.getProjectTriggers();
  } catch (e) {
    Logger.log('[TRIGGER][PERM] ' + e.message);
    return [];
  }
}

function processarUmaSolicitacaoFilaPorContexto_(contextoAdmin) {
  if (!contextoAdmin || !contextoAdmin.planilhaClienteId) {
    return { processados: 0, erros: 0 };
  }

  let ssCliente;
  try {
    ssCliente = SpreadsheetApp.openById(contextoAdmin.planilhaClienteId);
  } catch (e) {
    Logger.log('[FILA][WORKER] Falha ao abrir planilha CLIENTE: ' + e.message);
    return { processados: 0, erros: 1 };
  }

  const fila = ssCliente.getSheetByName(FILA_PROCESSAMENTO_ABA);
  if (!fila) {
    return { processados: 0, erros: 0 };
  }

  const solicitacao = obterProximaSolicitacaoPendente_(fila);
  if (!solicitacao) {
    return { processados: 0, erros: 0 };
  }

  const processorEmail = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase();
  marcarSolicitacaoProcessando_(fila, solicitacao.rowNumber, processorEmail, solicitacao.tentativas + 1);

  try {
    sincronizarContextoAdminLocalidades_(contextoAdmin, { atualizarLegenda: false });

    const contextoExecucao = {
      ...contextoAdmin,
      tipo: 'ADMIN',
      localidadeAtivaId: solicitacao.pastaTrabalhoId,
      localidadeAtivaNome: solicitacao.pastaTrabalhoNome,
      planilhaGeralId: solicitacao.planilhaGeralId || contextoAdmin.planilhaGeralId
    };

    const exec = executarProcessamentoVisionSemUi_(contextoExecucao, {
      operadorEmail: solicitacao.solicitanteEmail,
      requestId: solicitacao.requestId,
      origem: 'FILA_TRIGGER'
    });

    const resumo = exec && exec.resultado ? exec.resultado : {};

    marcarSolicitacaoSucesso_(fila, solicitacao.rowNumber, resumo, processorEmail);
    return { processados: 1, erros: 0 };
  } catch (e) {
    marcarSolicitacaoErro_(fila, solicitacao.rowNumber, e, processorEmail);
    return { processados: 0, erros: 1 };
  }
}

function resolverContextosAdminParaWorker_() {
  const mapa = {};

  try {
    const ativo = obterContextoAtivo_();
    if (ativo && ativo.planilhaAdminId) {
      mapa[ativo.planilhaAdminId] = ativo;
    }
  } catch (e) {}

  try {
    const lista = listarContextos_() || [];
    lista.forEach(ctx => {
      if (!ctx || !ctx.planilhaAdminId) return;
      mapa[ctx.planilhaAdminId] = ctx;
    });
  } catch (e) {}

  return Object.keys(mapa).map(id => mapa[id]);
}

function obterOuCriarAbaFilaProcessamento_(ssCliente) {
  let sheet = ssCliente.getSheetByName(FILA_PROCESSAMENTO_ABA);
  if (!sheet) {
    sheet = ssCliente.insertSheet(FILA_PROCESSAMENTO_ABA);
  }

  const precisaCabecalho =
    sheet.getLastRow() < 1 ||
    String(sheet.getRange(1, 1).getValue() || '').trim() !== FILA_CABECALHO[0];

  if (precisaCabecalho) {
    sheet.clear();
    sheet.getRange(1, 1, 1, FILA_CABECALHO.length).setValues([FILA_CABECALHO]);
    sheet.getRange(1, 1, 1, FILA_CABECALHO.length)
      .setFontFamily('Arial')
      .setFontSize(10)
      .setFontWeight('bold')
      .setBackground('#455a64')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('left');

    sheet.setFrozenRows(1);
    sheet.setHiddenGridlines(true);
  }

  organizarOrdemAbasEstruturais_(ssCliente, {
    abaAtivaFinal: 'CAPA'
  });

  return sheet;
}

function obterAbaFilaClientePorContexto_(contexto) {
  if (!contexto || !contexto.planilhaClienteId) return null;

  try {
    const ssCliente = SpreadsheetApp.openById(contexto.planilhaClienteId);
    return ssCliente.getSheetByName(FILA_PROCESSAMENTO_ABA);
  } catch (e) {
    return null;
  }
}

function obterProximaSolicitacaoPendente_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const dados = sheet.getRange(2, 1, lastRow - 1, FILA_CABECALHO.length).getValues();

  for (let i = 0; i < dados.length; i++) {
    const req = mapearLinhaFila_(dados[i], i + 2);
    if (req.status !== FILA_STATUS.PENDENTE) continue;
    return req;
  }

  return null;
}

function obterSolicitacaoAbertaPorSolicitante_(sheet, emailsUsuario) {
  const mapaEmails = {};
  (emailsUsuario || []).forEach(e => {
    if (e) mapaEmails[String(e).toLowerCase()] = true;
  });
  if (!Object.keys(mapaEmails).length) return null;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const dados = sheet.getRange(2, 1, lastRow - 1, FILA_CABECALHO.length).getValues();
  for (let i = dados.length - 1; i >= 0; i--) {
    const req = mapearLinhaFila_(dados[i], i + 2);
    const solicitante = String(req.solicitanteEmail || '').toLowerCase();
    if (!mapaEmails[solicitante]) continue;
    if (req.status === FILA_STATUS.PENDENTE || req.status === FILA_STATUS.PROCESSANDO) {
      return req;
    }
  }

  return null;
}

function obterUltimaSolicitacaoDoUsuario_(sheet, emailsUsuario) {
  const mapaEmails = {};
  (emailsUsuario || []).forEach(e => {
    if (e) mapaEmails[String(e).toLowerCase()] = true;
  });
  if (!Object.keys(mapaEmails).length) return null;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const dados = sheet.getRange(2, 1, lastRow - 1, FILA_CABECALHO.length).getValues();
  for (let i = dados.length - 1; i >= 0; i--) {
    const req = mapearLinhaFila_(dados[i], i + 2);
    const solicitante = String(req.solicitanteEmail || '').toLowerCase();
    if (mapaEmails[solicitante]) {
      return req;
    }
  }

  return null;
}

function obterUltimaSolicitacaoFinalizadaNaoNotificada_(sheet, emailsUsuario) {
  const mapaEmails = {};
  (emailsUsuario || []).forEach(e => {
    if (e) mapaEmails[String(e).toLowerCase()] = true;
  });
  if (!Object.keys(mapaEmails).length) return null;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const dados = sheet.getRange(2, 1, lastRow - 1, FILA_CABECALHO.length).getValues();
  for (let i = dados.length - 1; i >= 0; i--) {
    const req = mapearLinhaFila_(dados[i], i + 2);
    const solicitante = String(req.solicitanteEmail || '').toLowerCase();
    if (!mapaEmails[solicitante]) continue;
    if (req.notificadoEm) continue;
    if (req.status === FILA_STATUS.SUCESSO || req.status === FILA_STATUS.ERRO) {
      return req;
    }
  }

  return null;
}

function marcarSolicitacaoProcessando_(sheet, rowNumber, processorEmail, tentativas) {
  sheet.getRange(rowNumber, FILA_COL.STATUS).setValue(FILA_STATUS.PROCESSANDO);
  sheet.getRange(rowNumber, FILA_COL.INICIADO_EM).setValue(dataHoraPlanilha_());
  sheet.getRange(rowNumber, FILA_COL.FINALIZADO_EM).setValue('');
  sheet.getRange(rowNumber, FILA_COL.MENSAGEM_ERRO).setValue('');
  sheet.getRange(rowNumber, FILA_COL.RESULTADO_JSON).setValue('');
  sheet.getRange(rowNumber, FILA_COL.PROCESSADO_POR).setValue(processorEmail || '');
  sheet.getRange(rowNumber, FILA_COL.TENTATIVAS).setValue(Number(tentativas || 0));
}

function marcarSolicitacaoSucesso_(sheet, rowNumber, resumo, processorEmail) {
  sheet.getRange(rowNumber, FILA_COL.STATUS).setValue(FILA_STATUS.SUCESSO);
  sheet.getRange(rowNumber, FILA_COL.FINALIZADO_EM).setValue(dataHoraPlanilha_());
  sheet.getRange(rowNumber, FILA_COL.TOTAL).setValue(Number(resumo.total || 0));
  sheet.getRange(rowNumber, FILA_COL.SUCESSO).setValue(Number(resumo.sucesso || 0));
  sheet.getRange(rowNumber, FILA_COL.ERRO).setValue(Number(resumo.erro || 0));
  sheet.getRange(rowNumber, FILA_COL.MENSAGEM_ERRO).setValue('');
  sheet.getRange(rowNumber, FILA_COL.RESULTADO_JSON).setValue(serializarResumoFila_(resumo));
  sheet.getRange(rowNumber, FILA_COL.NOTIFICADO_EM).setValue('');
  sheet.getRange(rowNumber, FILA_COL.PROCESSADO_POR).setValue(processorEmail || '');
}

function marcarSolicitacaoErro_(sheet, rowNumber, erro, processorEmail) {
  const mensagem = (erro && erro.message) ? erro.message : String(erro || 'Erro desconhecido');

  sheet.getRange(rowNumber, FILA_COL.STATUS).setValue(FILA_STATUS.ERRO);
  sheet.getRange(rowNumber, FILA_COL.FINALIZADO_EM).setValue(dataHoraPlanilha_());
  sheet.getRange(rowNumber, FILA_COL.MENSAGEM_ERRO).setValue(mensagem);
  sheet.getRange(rowNumber, FILA_COL.RESULTADO_JSON).setValue('');
  sheet.getRange(rowNumber, FILA_COL.NOTIFICADO_EM).setValue('');
  sheet.getRange(rowNumber, FILA_COL.PROCESSADO_POR).setValue(processorEmail || '');
}

function marcarSolicitacaoNotificada_(sheet, rowNumber) {
  sheet.getRange(rowNumber, FILA_COL.NOTIFICADO_EM).setValue(dataHoraPlanilha_());
}

function mapearLinhaFila_(row, rowNumber) {
  function col(idx) {
    return row[idx - 1];
  }

  return {
    rowNumber: rowNumber,
    requestId: String(col(FILA_COL.REQUEST_ID) || '').trim(),
    status: String(col(FILA_COL.STATUS) || '').trim().toUpperCase(),
    criadoEm: String(col(FILA_COL.CRIADO_EM) || '').trim(),
    iniciadoEm: String(col(FILA_COL.INICIADO_EM) || '').trim(),
    finalizadoEm: String(col(FILA_COL.FINALIZADO_EM) || '').trim(),
    solicitanteEmail: String(col(FILA_COL.SOLICITANTE_EMAIL) || '').trim().toLowerCase(),
    contextoNome: String(col(FILA_COL.CONTEXTO_NOME) || '').trim(),
    planilhaAdminId: String(col(FILA_COL.PLANILHA_ADMIN_ID) || '').trim(),
    planilhaClienteId: String(col(FILA_COL.PLANILHA_CLIENTE_ID) || '').trim(),
    planilhaGeralId: String(col(FILA_COL.PLANILHA_GERAL_ID) || '').trim(),
    pastaTrabalhoId: String(col(FILA_COL.PASTA_TRABALHO_ID) || '').trim(),
    pastaTrabalhoNome: String(col(FILA_COL.PASTA_TRABALHO_NOME) || '').trim(),
    total: Number(col(FILA_COL.TOTAL) || 0),
    sucesso: Number(col(FILA_COL.SUCESSO) || 0),
    erro: Number(col(FILA_COL.ERRO) || 0),
    mensagemErro: String(col(FILA_COL.MENSAGEM_ERRO) || '').trim(),
    resultadoJson: String(col(FILA_COL.RESULTADO_JSON) || '').trim(),
    notificadoEm: String(col(FILA_COL.NOTIFICADO_EM) || '').trim(),
    tentativas: Number(col(FILA_COL.TENTATIVAS) || 0),
    processadoPor: String(col(FILA_COL.PROCESSADO_POR) || '').trim()
  };
}

function formatarMensagemStatusFila_(req) {
  const id = req && req.requestId ? req.requestId : '-';
  const status = req && req.status ? req.status : '-';

  if (status === FILA_STATUS.SUCESSO) {
    return (
      `Solicitação #${id} concluída.\n` +
      `Total: ${req.total || 0} | Sucesso: ${req.sucesso || 0} | Erros: ${req.erro || 0}`
    );
  }

  if (status === FILA_STATUS.ERRO) {
    return `Solicitação #${id} falhou.\n${req.mensagemErro || 'Erro não informado.'}`;
  }

  if (status === FILA_STATUS.PROCESSANDO) {
    return `Solicitação #${id} está em processamento.`;
  }

  if (status === FILA_STATUS.PENDENTE) {
    return `Solicitação #${id} está na fila e será processada em breve.`;
  }

  return `Solicitação #${id} — status: ${status}`;
}

function serializarResumoFila_(resumo) {
  try {
    return JSON.stringify(resumo || {});
  } catch (e) {
    return '';
  }
}

function gerarRequestIdFila_() {
  const agora = new Date();
  const base = Utilities.formatDate(agora, Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  const rnd = Math.floor(Math.random() * 9000) + 1000;
  return 'REQ-' + base + '-' + rnd;
}

function obterEmailsUsuarioAtualFila_() {
  const ativo = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  const efetivo = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase();
  const mapa = {};
  [ativo, efetivo].forEach(email => {
    if (email) mapa[email] = true;
  });
  return Object.keys(mapa);
}

function deveExibirToastLembreteTriggerFilaAgora_() {
  const props = PropertiesService.getDocumentProperties();
  const ultimoIso = String(props.getProperty(CHAVE_LEMBRETE_TRIGGER_FILA_ULTIMO_AVISO) || '').trim();
  if (!ultimoIso) return true;

  const ultimo = new Date(ultimoIso);
  if (isNaN(ultimo.getTime())) return true;

  const diffMs = Date.now() - ultimo.getTime();
  return diffMs >= INTERVALO_MINIMO_LEMBRETE_TRIGGER_MIN * 60 * 1000;
}

function registrarDataLembreteTriggerFila_(data) {
  const props = PropertiesService.getDocumentProperties();
  const valor = (data instanceof Date ? data : new Date()).toISOString();
  props.setProperty(CHAVE_LEMBRETE_TRIGGER_FILA_ULTIMO_AVISO, valor);
}

function solicitarSincronizacaoLocalidadesCliente_(contextoEntrada, opcoes) {
  const contexto = contextoEntrada || obterContextoDominio_();
  const cfg = opcoes || {};

  if (!contexto || contexto.tipo !== 'CLIENTE') {
    throw new Error('Sincronização de localidades disponível apenas no contexto CLIENTE.');
  }

  const versaoAtual = String(
    cfg.versaoLocalidades || calcularVersaoLocalidadesDoDrive_(contexto) || ''
  ).trim();

  if (!versaoAtual) {
    throw new Error('Não foi possível calcular a versão atual das pastas de localidades.');
  }

  const planilhaClienteId = String(contexto.planilhaClienteId || SpreadsheetApp.getActiveSpreadsheet().getId() || '').trim();
  if (!planilhaClienteId) {
    throw new Error('Planilha CLIENTE não identificada para fila de sincronização.');
  }

  const ssCliente = SpreadsheetApp.openById(planilhaClienteId);
  const filaSync = obterOuCriarAbaFilaSincronizacao_(ssCliente);
  const emailsUsuario = obterEmailsUsuarioAtualFila_();
  let solicitanteEmail = emailsUsuario[0] || 'DESCONHECIDO';
  if (cfg.solicitanteEmail) {
    solicitanteEmail = cfg.solicitanteEmail;
  } else if (contexto.tipo !== 'CLIENTE' && contexto.emailOperador) {
    solicitanteEmail = contexto.emailOperador;
  }
  solicitanteEmail = String(solicitanteEmail || 'DESCONHECIDO').trim().toLowerCase();

  const aberta = obterSolicitacaoSyncAbertaPorVersao_(filaSync, versaoAtual);
  if (aberta) {
    const contextoAtualizado = atualizarEstadoSincronizacaoLocalidadesCliente_(
      contexto,
      {
        syncLocalidadesStatus: aberta.status,
        syncLocalidadesVersaoAtual: versaoAtual,
        syncLocalidadesErro: '',
        syncLocalidadesAtualizadoEm: new Date().toISOString()
      }
    );

    return {
      enfileirado: false,
      requestId: aberta.requestId,
      status: aberta.status,
      versaoLocalidades: versaoAtual,
      contexto: contextoAtualizado
    };
  }

  const requestId = gerarRequestIdFila_();
  const agoraIso = dataHoraPlanilha_();

  filaSync.appendRow([
    requestId,
    FILA_SYNC_STATUS.PENDENTE,
    agoraIso,
    '',
    '',
    solicitanteEmail,
    contexto.nome || '',
    contexto.planilhaAdminId || '',
    planilhaClienteId,
    contexto.pastaLocalidadesId || '',
    versaoAtual,
    '',
    '',
    '',
    '',
    '',
    ''
  ]);

  const contextoAtualizado = atualizarEstadoSincronizacaoLocalidadesCliente_(
    contexto,
    {
      syncLocalidadesStatus: FILA_SYNC_STATUS.PENDENTE,
      syncLocalidadesVersaoAtual: versaoAtual,
      syncLocalidadesErro: '',
      syncLocalidadesAtualizadoEm: new Date().toISOString()
    }
  );

  return {
    enfileirado: true,
    requestId: requestId,
    status: FILA_SYNC_STATUS.PENDENTE,
    versaoLocalidades: versaoAtual,
    contexto: contextoAtualizado
  };
}

function garantirSincronizacaoLocalidadesClienteProntaParaProcessamento_(contextoEntrada) {
  let contexto = contextoEntrada || obterContextoDominio_();
  if (!contexto || contexto.tipo !== 'CLIENTE') {
    return { ok: true, contexto: contexto };
  }

  const versaoAtual = String(calcularVersaoLocalidadesDoDrive_(contexto) || '').trim();
  if (!versaoAtual) {
    return {
      ok: false,
      contexto: contexto,
      mensagem: 'Não foi possível validar as pastas de localidades no Drive.'
    };
  }

  if (
    contexto.syncLocalidadesStatus === FILA_SYNC_STATUS.SUCESSO &&
    contexto.syncLocalidadesVersaoSincronizada === versaoAtual
  ) {
    return { ok: true, contexto: contexto };
  }

  let filaSync = null;
  try {
    filaSync = obterAbaFilaSincronizacaoClientePorContexto_(contexto);
  } catch (e) {}

  const ultimaDaVersao = filaSync
    ? obterUltimaSolicitacaoSyncPorVersao_(filaSync, versaoAtual)
    : null;

  if (ultimaDaVersao && ultimaDaVersao.status === FILA_SYNC_STATUS.SUCESSO) {
    const patch = {
      syncLocalidadesStatus: FILA_SYNC_STATUS.SUCESSO,
      syncLocalidadesVersaoAtual: versaoAtual,
      syncLocalidadesVersaoSincronizada: ultimaDaVersao.versaoSincronizada || versaoAtual,
      syncLocalidadesErro: '',
      syncLocalidadesAtualizadoEm: new Date().toISOString()
    };

    const mapa = parseJsonSeguroFila_(ultimaDaVersao.mapaCoresJson, {});
    const banidas = parseJsonSeguroFila_(ultimaDaVersao.coresBanidasJson, []);

    if (mapa && typeof mapa === 'object') {
      patch.mapaCoresPastas = mapa;
    }
    if (Array.isArray(banidas)) {
      patch.coresBanidasPastas = banidas;
    }

    contexto = atualizarEstadoSincronizacaoLocalidadesCliente_(contexto, patch);
    return { ok: true, contexto: contexto };
  }

  if (
    ultimaDaVersao &&
    (ultimaDaVersao.status === FILA_SYNC_STATUS.PENDENTE ||
      ultimaDaVersao.status === FILA_SYNC_STATUS.PROCESSANDO)
  ) {
    contexto = atualizarEstadoSincronizacaoLocalidadesCliente_(
      contexto,
      {
        syncLocalidadesStatus: ultimaDaVersao.status,
        syncLocalidadesVersaoAtual: versaoAtual,
        syncLocalidadesErro: '',
        syncLocalidadesAtualizadoEm: new Date().toISOString()
      }
    );

    return {
      ok: false,
      contexto: contexto,
      requestId: ultimaDaVersao.requestId,
      mensagem:
        `A sincronização da ADMIN ainda não terminou (solicitação #${ultimaDaVersao.requestId}). ` +
        'Aguarde alguns instantes e tente novamente.'
    };
  }

  const fila = solicitarSincronizacaoLocalidadesCliente_(
    contexto,
    {
      versaoLocalidades: versaoAtual,
      motivo: 'PRE_PROCESSAMENTO'
    }
  );

  return {
    ok: false,
    contexto: fila.contexto || contexto,
    requestId: fila.requestId || null,
    mensagem:
      'A sincronização da ADMIN foi iniciada e precisa finalizar antes do processamento. ' +
      (fila.requestId ? `Solicitação #${fila.requestId}.` : '')
  };
}

function atualizarEstadoSincronizacaoLocalidadesCliente_(contexto, patch) {
  if (!contexto || contexto.tipo !== 'CLIENTE') return contexto;
  if (!patch || typeof patch !== 'object') return contexto;

  const chaves = Object.keys(patch);
  let alterou = false;
  chaves.forEach(chave => {
    const antes = JSON.stringify(contexto[chave] === undefined ? null : contexto[chave]);
    const depois = JSON.stringify(patch[chave] === undefined ? null : patch[chave]);
    if (antes !== depois) alterou = true;
  });

  if (!alterou) return contexto;

  try {
    return atualizarContextoCliente_(patch);
  } catch (e) {
    Logger.log('[SYNC][CLIENTE][PERSISTENCIA][AVISO] ' + e.message);
    return {
      ...contexto,
      ...patch
    };
  }
}

function processarUmaSincronizacaoLocalidadesPorContexto_(contextoAdmin) {
  if (!contextoAdmin || !contextoAdmin.planilhaClienteId) {
    return { sincronizados: 0, erros: 0 };
  }

  let ssCliente;
  try {
    ssCliente = SpreadsheetApp.openById(contextoAdmin.planilhaClienteId);
  } catch (e) {
    Logger.log('[SYNC][WORKER] Falha ao abrir planilha CLIENTE: ' + e.message);
    return { sincronizados: 0, erros: 1 };
  }

  const filaSync = ssCliente.getSheetByName(FILA_SINCRONIZACAO_ABA);
  if (!filaSync) {
    return { sincronizados: 0, erros: 0 };
  }

  const solicitacao = obterProximaSolicitacaoSyncPendente_(filaSync);
  if (!solicitacao) {
    return { sincronizados: 0, erros: 0 };
  }

  // Repara o contexto ADMIN de forma silenciosa para garantir
  // que novas pastas criadas no CLIENTE sejam reconhecidas.
  const reparado = repararContextoAdminSilencioso_(contextoAdmin.planilhaAdminId);
  if (reparado) {
    contextoAdmin = { ...contextoAdmin, ...reparado };
  }

  const processorEmail = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase();
  marcarSolicitacaoSyncProcessando_(filaSync, solicitacao.rowNumber, processorEmail);

  try {
    const resultado = sincronizarContextoAdminLocalidades_(contextoAdmin, {
      atualizarLegenda: true
    });

    marcarSolicitacaoSyncSucesso_(filaSync, solicitacao.rowNumber, resultado, processorEmail);
    return { sincronizados: 1, erros: 0 };
  } catch (e) {
    marcarSolicitacaoSyncErro_(filaSync, solicitacao.rowNumber, e, processorEmail);
    return { sincronizados: 0, erros: 1 };
  }
}

function sincronizarContextoAdminLocalidades_(contextoAdmin, opcoes) {
  if (!contextoAdmin || !contextoAdmin.pastaLocalidadesId) {
    throw new Error('Contexto ADMIN inválido para sincronização de localidades.');
  }

  const cfg = opcoes || {};
  const planilhaAdminId = String(contextoAdmin.planilhaAdminId || '').trim();
  if (!planilhaAdminId) {
    throw new Error('Planilha ADMIN não informada para sincronização.');
  }

  // Força sincronização do mapa de cores (imutável e com banimento).
  const pastas = obterPastasVivas_(contextoAdmin) || [];

  if (cfg.atualizarLegenda !== false) {
    atualizarLegendasPlanilhaAdmin_(contextoAdmin);
  }

  const versaoLocalidades = calcularVersaoLocalidadesDoDrive_(contextoAdmin);
  const contextoSalvo = lerContextoAdminPorPlanilhaIdFila_(planilhaAdminId) || contextoAdmin;
  const mapaCores = (contextoSalvo && contextoSalvo.mapaCoresPastas) ? contextoSalvo.mapaCoresPastas : {};
  const coresBanidas = (contextoSalvo && contextoSalvo.coresBanidasPastas) ? contextoSalvo.coresBanidasPastas : [];

  if (contextoAdminComCamposMinimos_(contextoSalvo)) {
    const base = { ...contextoSalvo };
    delete base.tipo;
    delete base.origem;

    salvarContextoAdmin_(planilhaAdminId, {
      ...base,
      syncLocalidadesStatus: FILA_SYNC_STATUS.SUCESSO,
      syncLocalidadesVersaoAtual: versaoLocalidades,
      syncLocalidadesVersaoSincronizada: versaoLocalidades,
      syncLocalidadesErro: '',
      syncLocalidadesAtualizadoEm: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString()
    });
  }

  return {
    versaoLocalidades: versaoLocalidades,
    versaoSincronizada: versaoLocalidades,
    totalPastas: pastas.length,
    mapaCoresPastas: mapaCores,
    coresBanidasPastas: coresBanidas
  };
}

function lerContextoAdminPorPlanilhaIdFila_(planilhaAdminId) {
  const id = String(planilhaAdminId || '').trim();
  if (!id) return null;

  try {
    const chave = CONTEXTO_KEYS.PREFIXO + id;
    const raw = PropertiesService.getScriptProperties().getProperty(chave);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    Logger.log('[SYNC][WORKER][CTX][AVISO] ' + e.message);
    return null;
  }
}

function obterOuCriarAbaFilaSincronizacao_(ssCliente) {
  let sheet = ssCliente.getSheetByName(FILA_SINCRONIZACAO_ABA);
  if (!sheet) {
    sheet = ssCliente.insertSheet(FILA_SINCRONIZACAO_ABA);
  }

  const precisaCabecalho =
    sheet.getLastRow() < 1 ||
    String(sheet.getRange(1, 1).getValue() || '').trim() !== FILA_SYNC_CABECALHO[0];

  if (precisaCabecalho) {
    sheet.clear();
    sheet.getRange(1, 1, 1, FILA_SYNC_CABECALHO.length).setValues([FILA_SYNC_CABECALHO]);
    sheet.getRange(1, 1, 1, FILA_SYNC_CABECALHO.length)
      .setFontFamily('Arial')
      .setFontSize(10)
      .setFontWeight('bold')
      .setBackground('#455a64')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('left');

    sheet.setFrozenRows(1);
    sheet.setHiddenGridlines(true);
  }

  organizarOrdemAbasEstruturais_(ssCliente, {
    abaAtivaFinal: 'CAPA'
  });

  return sheet;
}

function obterAbaFilaSincronizacaoClientePorContexto_(contexto) {
  if (!contexto || !contexto.planilhaClienteId) return null;

  try {
    const ssCliente = SpreadsheetApp.openById(contexto.planilhaClienteId);
    return ssCliente.getSheetByName(FILA_SINCRONIZACAO_ABA);
  } catch (e) {
    return null;
  }
}

function obterProximaSolicitacaoSyncPendente_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const dados = sheet.getRange(2, 1, lastRow - 1, FILA_SYNC_CABECALHO.length).getValues();
  for (let i = 0; i < dados.length; i++) {
    const req = mapearLinhaFilaSync_(dados[i], i + 2);
    if (req.status === FILA_SYNC_STATUS.PENDENTE) return req;
  }

  return null;
}

function obterSolicitacaoSyncAbertaPorVersao_(sheet, versaoLocalidades) {
  const versao = String(versaoLocalidades || '').trim();
  if (!versao) return null;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const dados = sheet.getRange(2, 1, lastRow - 1, FILA_SYNC_CABECALHO.length).getValues();
  for (let i = dados.length - 1; i >= 0; i--) {
    const req = mapearLinhaFilaSync_(dados[i], i + 2);
    if (req.versaoLocalidades !== versao) continue;
    if (req.status === FILA_SYNC_STATUS.PENDENTE || req.status === FILA_SYNC_STATUS.PROCESSANDO) {
      return req;
    }
  }

  return null;
}

function obterUltimaSolicitacaoSyncPorVersao_(sheet, versaoLocalidades) {
  const versao = String(versaoLocalidades || '').trim();
  if (!versao) return null;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const dados = sheet.getRange(2, 1, lastRow - 1, FILA_SYNC_CABECALHO.length).getValues();
  for (let i = dados.length - 1; i >= 0; i--) {
    const req = mapearLinhaFilaSync_(dados[i], i + 2);
    if (req.versaoLocalidades === versao) {
      return req;
    }
  }

  return null;
}

function mapearLinhaFilaSync_(row, rowNumber) {
  function col(idx) {
    return row[idx - 1];
  }

  return {
    rowNumber: rowNumber,
    requestId: String(col(FILA_SYNC_COL.REQUEST_ID) || '').trim(),
    status: String(col(FILA_SYNC_COL.STATUS) || '').trim().toUpperCase(),
    criadoEm: String(col(FILA_SYNC_COL.CRIADO_EM) || '').trim(),
    iniciadoEm: String(col(FILA_SYNC_COL.INICIADO_EM) || '').trim(),
    finalizadoEm: String(col(FILA_SYNC_COL.FINALIZADO_EM) || '').trim(),
    solicitanteEmail: String(col(FILA_SYNC_COL.SOLICITANTE_EMAIL) || '').trim().toLowerCase(),
    contextoNome: String(col(FILA_SYNC_COL.CONTEXTO_NOME) || '').trim(),
    planilhaAdminId: String(col(FILA_SYNC_COL.PLANILHA_ADMIN_ID) || '').trim(),
    planilhaClienteId: String(col(FILA_SYNC_COL.PLANILHA_CLIENTE_ID) || '').trim(),
    pastaLocalidadesId: String(col(FILA_SYNC_COL.PASTA_LOCALIDADES_ID) || '').trim(),
    versaoLocalidades: String(col(FILA_SYNC_COL.VERSAO_LOCALIDADES) || '').trim(),
    versaoSincronizada: String(col(FILA_SYNC_COL.VERSAO_SINCRONIZADA) || '').trim(),
    mensagemErro: String(col(FILA_SYNC_COL.MENSAGEM_ERRO) || '').trim(),
    mapaCoresJson: String(col(FILA_SYNC_COL.MAPA_CORES_JSON) || '').trim(),
    coresBanidasJson: String(col(FILA_SYNC_COL.CORES_BANIDAS_JSON) || '').trim(),
    processadoPor: String(col(FILA_SYNC_COL.PROCESSADO_POR) || '').trim(),
    notificadoEm: String(col(FILA_SYNC_COL.NOTIFICADO_EM) || '').trim()
  };
}

function marcarSolicitacaoSyncProcessando_(sheet, rowNumber, processorEmail) {
  sheet.getRange(rowNumber, FILA_SYNC_COL.STATUS).setValue(FILA_SYNC_STATUS.PROCESSANDO);
  sheet.getRange(rowNumber, FILA_SYNC_COL.INICIADO_EM).setValue(dataHoraPlanilha_());
  sheet.getRange(rowNumber, FILA_SYNC_COL.FINALIZADO_EM).setValue('');
  sheet.getRange(rowNumber, FILA_SYNC_COL.MENSAGEM_ERRO).setValue('');
  sheet.getRange(rowNumber, FILA_SYNC_COL.PROCESSADO_POR).setValue(processorEmail || '');
}

function marcarSolicitacaoSyncSucesso_(sheet, rowNumber, resultado, processorEmail) {
  const mapaJson = serializarResumoFila_(resultado && resultado.mapaCoresPastas ? resultado.mapaCoresPastas : {});
  const banidasJson = serializarResumoFila_(resultado && resultado.coresBanidasPastas ? resultado.coresBanidasPastas : []);

  sheet.getRange(rowNumber, FILA_SYNC_COL.STATUS).setValue(FILA_SYNC_STATUS.SUCESSO);
  sheet.getRange(rowNumber, FILA_SYNC_COL.FINALIZADO_EM).setValue(dataHoraPlanilha_());
  sheet.getRange(rowNumber, FILA_SYNC_COL.VERSAO_SINCRONIZADA).setValue(resultado.versaoSincronizada || resultado.versaoLocalidades || '');
  sheet.getRange(rowNumber, FILA_SYNC_COL.MENSAGEM_ERRO).setValue('');
  sheet.getRange(rowNumber, FILA_SYNC_COL.MAPA_CORES_JSON).setValue(mapaJson);
  sheet.getRange(rowNumber, FILA_SYNC_COL.CORES_BANIDAS_JSON).setValue(banidasJson);
  sheet.getRange(rowNumber, FILA_SYNC_COL.PROCESSADO_POR).setValue(processorEmail || '');
  sheet.getRange(rowNumber, FILA_SYNC_COL.NOTIFICADO_EM).setValue('');
}

function marcarSolicitacaoSyncErro_(sheet, rowNumber, erro, processorEmail) {
  const mensagem = (erro && erro.message) ? erro.message : String(erro || 'Erro desconhecido');

  sheet.getRange(rowNumber, FILA_SYNC_COL.STATUS).setValue(FILA_SYNC_STATUS.ERRO);
  sheet.getRange(rowNumber, FILA_SYNC_COL.FINALIZADO_EM).setValue(dataHoraPlanilha_());
  sheet.getRange(rowNumber, FILA_SYNC_COL.MENSAGEM_ERRO).setValue(mensagem);
  sheet.getRange(rowNumber, FILA_SYNC_COL.PROCESSADO_POR).setValue(processorEmail || '');
  sheet.getRange(rowNumber, FILA_SYNC_COL.NOTIFICADO_EM).setValue('');
}

function parseJsonSeguroFila_(texto, fallback) {
  const bruto = String(texto || '').trim();
  if (!bruto) return fallback;
  try {
    return JSON.parse(bruto);
  } catch (e) {
    return fallback;
  }
}

/* ============================================================
 * FILA DE CRIAÇÃO DE PASTA (CLIENTE -> ADMIN)
 * ============================================================ */
function obterOuCriarAbaFilaCriarPasta_(ssCliente) {
  let sheet = ssCliente.getSheetByName(FILA_CRIAR_PASTA_ABA);
  if (!sheet) {
    sheet = ssCliente.insertSheet(FILA_CRIAR_PASTA_ABA);
  }

  const precisaCabecalho =
    sheet.getLastRow() < 1 ||
    String(sheet.getRange(1, 1).getValue() || '').trim() !== FILA_CRIAR_PASTA_CABECALHO[0];

  if (precisaCabecalho) {
    sheet.clear();
    sheet.getRange(1, 1, 1, FILA_CRIAR_PASTA_CABECALHO.length).setValues([FILA_CRIAR_PASTA_CABECALHO]);
    sheet.getRange(1, 1, 1, FILA_CRIAR_PASTA_CABECALHO.length)
      .setFontFamily('Arial')
      .setFontSize(10)
      .setFontWeight('bold')
      .setBackground('#1f2937')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('left');

    sheet.setFrozenRows(1);
    sheet.setHiddenGridlines(true);
  }

  organizarOrdemAbasEstruturais_(ssCliente, { abaAtivaFinal: 'CAPA' });
  return sheet;
}

function enfileirarCriacaoPastaPorCliente_(contexto, nomePasta) {
  if (!contexto || contexto.tipo !== 'CLIENTE') {
    throw new Error('Fila de criação de pasta é exclusiva do CLIENTE.');
  }

  const planilhaClienteId = String(contexto.planilhaClienteId || SpreadsheetApp.getActiveSpreadsheet().getId() || '').trim();
  if (!planilhaClienteId) {
    throw new Error('Planilha CLIENTE não identificada para fila de criação.');
  }

  const ssCliente = SpreadsheetApp.openById(planilhaClienteId);
  const fila = obterOuCriarAbaFilaCriarPasta_(ssCliente);
  const emailsUsuario = obterEmailsUsuarioAtualFila_();
  const solicitanteEmail = emailsUsuario[0] || 'DESCONHECIDO';

  const requestId = gerarRequestIdFila_();
  const agoraIso = dataHoraPlanilha_();

  fila.appendRow([
    requestId,
    FILA_CRIAR_PASTA_STATUS.PENDENTE,
    agoraIso,
    '',
    '',
    solicitanteEmail,
    nomePasta,
    contexto.nome || '',
    contexto.planilhaAdminId || '',
    planilhaClienteId,
    contexto.pastaLocalidadesId || '',
    '',
    ''
  ]);

  return { requestId };
}

function processarUmaSolicitacaoCriarPastaPorContexto_(contextoAdmin) {
  if (!contextoAdmin || !contextoAdmin.planilhaClienteId || !contextoAdmin.pastaLocalidadesId) {
    return { criadas: 0, erros: 0 };
  }

  let ssCliente;
  try {
    ssCliente = SpreadsheetApp.openById(contextoAdmin.planilhaClienteId);
  } catch (e) {
    Logger.log('[FILA][CRIAR_PASTA] Falha ao abrir CLIENTE: ' + e.message);
    return { criadas: 0, erros: 1 };
  }

  const fila = ssCliente.getSheetByName(FILA_CRIAR_PASTA_ABA);
  if (!fila) return { criadas: 0, erros: 0 };

  const solicitacao = obterProximaSolicitacaoCriarPastaPendente_(fila);
  if (!solicitacao) return { criadas: 0, erros: 0 };

  const processorEmail = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase();
  marcarCriarPastaProcessando_(fila, solicitacao.rowNumber, processorEmail);

  try {
    const pastaRaiz = DriveApp.getFolderById(contextoAdmin.pastaLocalidadesId);
    const nova = pastaRaiz.createFolder(solicitacao.nomePasta);

    // Atualiza mapa de cores e valida cor oficial da pasta criada.
    const pastasComCor = obterPastasVivas_(contextoAdmin) || [];
    const pastaCriada = pastasComCor.find(p => p && p.id === nova.getId());
    const corCriada = normalizarCorHexLocalidades_(pastaCriada && pastaCriada.cor);
    if (!corCriada) {
      try {
        nova.setTrashed(true);
      } catch (eLixeira) {}
      throw new Error('Pasta criada sem cor oficial. Operação revertida.');
    }

    // Enfileira sincronização para CLIENTE refletir nova cor/mapa
    try {
      const filaSync = obterOuCriarAbaFilaSincronizacao_(ssCliente);
      const versao = calcularVersaoLocalidadesDoDrive_(contextoAdmin);
      const reqIdSync = gerarRequestIdFila_();
      const agoraIso = dataHoraPlanilha_();
      filaSync.appendRow([
        reqIdSync,
        FILA_SYNC_STATUS.PENDENTE,
        agoraIso,
        '',
        '',
        processorEmail || '',
        contextoAdmin.nome || '',
        contextoAdmin.planilhaAdminId || '',
        contextoAdmin.planilhaClienteId || '',
        contextoAdmin.pastaLocalidadesId || '',
        versao,
        '',
        '',
        '',
        '',
        '',
        ''
      ]);
    } catch (eSync) {
      Logger.log('[FILA][CRIAR_PASTA][SYNC][AVISO] ' + eSync.message);
    }

    marcarCriarPastaSucesso_(fila, solicitacao.rowNumber, nova.getId(), processorEmail);
    return { criadas: 1, erros: 0 };
  } catch (e) {
    marcarCriarPastaErro_(fila, solicitacao.rowNumber, e, processorEmail);
    return { criadas: 0, erros: 1 };
  }
}

function obterProximaSolicitacaoCriarPastaPendente_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return null;

  const dados = sheet.getRange(2, 1, sheet.getLastRow() - 1, FILA_CRIAR_PASTA_CABECALHO.length).getValues();
  for (let i = 0; i < dados.length; i++) {
    const req = mapearLinhaFilaCriarPasta_(dados[i], i + 2);
    if (req.status === FILA_CRIAR_PASTA_STATUS.PENDENTE) return req;
  }
  return null;
}

function mapearLinhaFilaCriarPasta_(row, rowNumber) {
  function col(idx) { return row[idx - 1]; }

  return {
    rowNumber,
    requestId: String(col(FILA_CRIAR_PASTA_COL.REQUEST_ID) || '').trim(),
    status: String(col(FILA_CRIAR_PASTA_COL.STATUS) || '').trim().toUpperCase(),
    criadoEm: String(col(FILA_CRIAR_PASTA_COL.CRIADO_EM) || '').trim(),
    iniciadoEm: String(col(FILA_CRIAR_PASTA_COL.INICIADO_EM) || '').trim(),
    finalizadoEm: String(col(FILA_CRIAR_PASTA_COL.FINALIZADO_EM) || '').trim(),
    solicitanteEmail: String(col(FILA_CRIAR_PASTA_COL.SOLICITANTE_EMAIL) || '').trim().toLowerCase(),
    nomePasta: String(col(FILA_CRIAR_PASTA_COL.NOME_PASTA) || '').trim(),
    contextoNome: String(col(FILA_CRIAR_PASTA_COL.CONTEXTO_NOME) || '').trim(),
    planilhaAdminId: String(col(FILA_CRIAR_PASTA_COL.PLANILHA_ADMIN_ID) || '').trim(),
    planilhaClienteId: String(col(FILA_CRIAR_PASTA_COL.PLANILHA_CLIENTE_ID) || '').trim(),
    pastaLocalidadesId: String(col(FILA_CRIAR_PASTA_COL.PASTA_LOCALIDADES_ID) || '').trim(),
    mensagemErro: String(col(FILA_CRIAR_PASTA_COL.MENSAGEM_ERRO) || '').trim(),
    pastaCriadaId: String(col(FILA_CRIAR_PASTA_COL.PASTA_ID_CRIADA) || '').trim()
  };
}

function marcarCriarPastaProcessando_(sheet, rowNumber, processorEmail) {
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.STATUS).setValue(FILA_CRIAR_PASTA_STATUS.PROCESSANDO);
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.INICIADO_EM).setValue(dataHoraPlanilha_());
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.FINALIZADO_EM).setValue('');
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.MENSAGEM_ERRO).setValue('');
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.PASTA_ID_CRIADA).setValue('');
}

function marcarCriarPastaSucesso_(sheet, rowNumber, pastaId, processorEmail) {
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.STATUS).setValue(FILA_CRIAR_PASTA_STATUS.SUCESSO);
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.FINALIZADO_EM).setValue(dataHoraPlanilha_());
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.MENSAGEM_ERRO).setValue('');
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.PASTA_ID_CRIADA).setValue(pastaId || '');
}

function marcarCriarPastaErro_(sheet, rowNumber, erro, processorEmail) {
  const mensagem = (erro && erro.message) ? erro.message : String(erro || 'Erro desconhecido');
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.STATUS).setValue(FILA_CRIAR_PASTA_STATUS.ERRO);
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.FINALIZADO_EM).setValue(dataHoraPlanilha_());
  sheet.getRange(rowNumber, FILA_CRIAR_PASTA_COL.MENSAGEM_ERRO).setValue(mensagem);
}
