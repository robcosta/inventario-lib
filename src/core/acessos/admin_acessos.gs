/**
 * ============================================================
 * GERENCIAR ACESSOS — MATRIZ DE PERFIS
 * ============================================================
 * Perfis:
 * - SUPERVISOR
 * - ADMINISTRADOR
 * - OPERADOR
 * - CLIENTE
 */
const PROPRIEDADE_SUPERVISORES_EMAILS = 'SUPERVISORES_EMAILS';

function normalizarEmail_(email) {
  return String(email || '').trim().toLowerCase();
}

function emailValido_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizarEmail_(email));
}

function obterListaSupervisores_() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty(PROPRIEDADE_SUPERVISORES_EMAILS) || '';

  return raw
    .split(/[;,\n]/)
    .map(normalizarEmail_)
    .filter(Boolean);
}

function salvarSupervisor_(email) {
  const props = PropertiesService.getScriptProperties();
  const atual = obterListaSupervisores_();
  const alvo = normalizarEmail_(email);

  if (!alvo) return;
  if (atual.indexOf(alvo) !== -1) return;

  atual.push(alvo);
  props.setProperty(PROPRIEDADE_SUPERVISORES_EMAILS, atual.join(','));
}

function obterEmailsExecutor_() {
  const ativo = normalizarEmail_(Session.getActiveUser().getEmail());
  const efetivo = normalizarEmail_(Session.getEffectiveUser().getEmail());

  return [ativo, efetivo]
    .filter(Boolean)
    .filter((email, idx, arr) => arr.indexOf(email) === idx);
}

function executorEhSupervisor_() {
  const lista = obterListaSupervisores_();
  const emailsExecutor = obterEmailsExecutor_();

  if (!lista.length || !emailsExecutor.length) {
    return false;
  }

  return emailsExecutor.some(email => lista.indexOf(email) !== -1);
}

function executorEhProprietarioAdmin_(contexto) {
  const planilhaAtiva = SpreadsheetApp.getActiveSpreadsheet();
  const adminId = (contexto && contexto.planilhaAdminId) ||
    (planilhaAtiva ? planilhaAtiva.getId() : '');

  if (!adminId) return false;

  try {
    const owner = DriveApp.getFileById(adminId).getOwner();
    const ownerEmail = normalizarEmail_(owner ? owner.getEmail() : '');
    if (!ownerEmail) return false;

    return obterEmailsExecutor_().indexOf(ownerEmail) !== -1;
  } catch (e) {
    Logger.log('[ACESSOS-SUPERVISOR][AVISO] Falha ao validar proprietario ADMIN: ' + e.message);
    return false;
  }
}

function executorPodeConcederSupervisor_(contexto) {
  return executorEhSupervisor_() || executorEhProprietarioAdmin_(contexto);
}

function pedirEmailAcesso_(ui, titulo, contextoNome, perfil, descricaoPermissoes) {
  const resp = ui.prompt(
    titulo,
    'Contexto: ' + (contextoNome || '-') + '\n\n' +
    'Informe o e-mail do usuário ' + perfil + '.\n\n' +
    'Permissões:\n' +
    descricaoPermissoes,
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return null;

  const email = normalizarEmail_(resp.getResponseText());
  if (!emailValido_(email)) {
    ui.alert('E-mail inválido: ' + (resp.getResponseText() || ''));
    return null;
  }

  return email;
}

function formatarNivelAcesso_(role) {
  const valor = String(role || '').toLowerCase();

  if (valor === 'owner') return 'PROPRIETARIO';
  if (valor === 'writer') return 'EDITOR';
  if (valor === 'reader') return 'LEITOR';
  if (valor === 'commenter') return 'COMENTARISTA';

  return valor ? valor.toUpperCase() : '-';
}

function mapearRecursosGerenciaveisAcessos_(contexto) {
  const recursos = [];
  const adicionados = {};

  function adicionar(id, nome, chave) {
    if (!id || adicionados[id]) return;
    adicionados[id] = true;
    recursos.push({ id: id, nome: nome, chave: chave || '' });
  }

  const raiz = obterPastaInventario_();
  const sistemaGlobal = obterSistemaGlobal_();
  const pastaSistema = obterPastaSistema_(raiz);
  const pastaTemplates = raiz ? obterOuCriarSubpasta_(raiz, 'TEMPLATES') : null;
  const planilhaGeralId = resolverPlanilhaGeralId_();

  adicionar(raiz ? raiz.getId() : '', 'Pasta raiz Inventario', 'PASTA_RAIZ');
  adicionar(contexto && contexto.pastaContextoId, 'Pasta CONTEXTO', 'PASTA_CONTEXTO');
  adicionar(contexto && contexto.pastaLocalidadesId, 'Pasta LOCALIDADES', 'PASTA_LOCALIDADES');
  adicionar(sistemaGlobal && sistemaGlobal.pastaGeralId, 'Pasta GERAL', 'PASTA_GERAL');
  adicionar(pastaTemplates ? pastaTemplates.getId() : '', 'Pasta TEMPLATES', 'PASTA_TEMPLATES');
  adicionar(pastaSistema ? pastaSistema.getId() : '', 'Pasta _SISTEMA', 'PASTA_SISTEMA');
  adicionar(contexto && contexto.planilhaAdminId, 'Planilha ADMIN', 'PLANILHA_ADMIN');
  adicionar(contexto && contexto.planilhaClienteId, 'Planilha CLIENTE', 'PLANILHA_CLIENTE');
  adicionar(contexto && contexto.planilhaRelatorioId, 'Planilha RELATORIO', 'PLANILHA_RELATORIO');
  adicionar(planilhaGeralId, 'Planilha GERAL', 'PLANILHA_GERAL');

  return recursos;
}

function inferirNivelAcessoConsolidado_(recursosPorChave) {
  function eh(chave, role) {
    return recursosPorChave[chave] === role;
  }

  const perfilSupervisor = eh('PASTA_RAIZ', 'writer');
  const perfilAdministrador =
    eh('PASTA_CONTEXTO', 'writer') &&
    eh('PASTA_GERAL', 'writer') &&
    eh('PASTA_TEMPLATES', 'writer') &&
    eh('PASTA_SISTEMA', 'reader');
  const perfilOperador =
    eh('PASTA_CONTEXTO', 'writer') &&
    eh('PASTA_GERAL', 'reader') &&
    eh('PASTA_SISTEMA', 'reader');
  const perfilCliente =
    eh('PASTA_LOCALIDADES', 'writer') &&
    eh('PLANILHA_ADMIN', 'reader') &&
    eh('PASTA_GERAL', 'reader') &&
    eh('PASTA_SISTEMA', 'reader');

  if (perfilSupervisor) return 'SUPERVISOR';
  if (perfilAdministrador) return 'ADMINISTRADOR';
  if (perfilOperador) return 'OPERADOR';
  if (perfilCliente) return 'CLIENTE';

  return 'PERSONALIZADO';
}

function listarAcessosConcedidos_(recursos) {
  const porEmail = {};

  recursos.forEach(r => {
    try {
      const resposta = Drive.Permissions.list(r.id);
      const itens = (resposta && resposta.items) || [];

      itens.forEach(item => {
        if (item.type !== 'user') return;

        const email = normalizarEmail_(item.emailAddress || item.name || '');
        if (!email) return;

        const role = String(item.role || '').toLowerCase();
        if (role === 'owner') return;

        if (!porEmail[email]) {
          porEmail[email] = {
            email: email,
            recursos: {}
          };
        }

        porEmail[email].recursos[r.chave || r.nome] = role;
      });
    } catch (e) {
      Logger.log('[ACESSOS-RETIRAR][AVISO] Falha ao listar permissoes de ' + r.nome + ': ' + e.message);
    }
  });

  const linhas = Object.keys(porEmail).map(email => {
    const recursosPorChave = porEmail[email].recursos;
    return {
      email: email,
      nivel: inferirNivelAcessoConsolidado_(recursosPorChave)
    };
  });

  linhas.sort((a, b) => a.email.localeCompare(b.email));
  return linhas;
}

function montarTextoListagemAcessos_(linhas) {
  if (!linhas.length) {
    return 'Nenhum acesso de usuario foi encontrado nos recursos gerenciaveis.';
  }

  const limite = 40;
  const cabecalho = 'Email | Nivel';
  const corpo = linhas.slice(0, limite).map(item => {
    return item.email + ' | ' + item.nivel;
  });

  if (linhas.length > limite) {
    corpo.push('... (' + (linhas.length - limite) + ' registro(s) adicional(is) omitido(s))');
  }

  return [cabecalho].concat(corpo).join('\n');
}

function pedirEmailRetiradaAcesso_(ui, contextoNome, linhasListagem) {
  const textoListagem = montarTextoListagemAcessos_(linhasListagem);
  const resp = ui.prompt(
    'Retirar Acessos por E-mail',
    'Contexto: ' + (contextoNome || '-') + '\n\n' +
    textoListagem + '\n\n' +
    'Digite o e-mail para remover todos os acessos listados desse usuario.',
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return null;

  const email = normalizarEmail_(resp.getResponseText());
  if (!emailValido_(email)) {
    ui.alert('E-mail invalido: ' + (resp.getResponseText() || ''));
    return null;
  }

  return email;
}

function removerTodosAcessosDoEmail_(email, recursos) {
  const alvo = normalizarEmail_(email);
  const removidos = [];
  const falhas = [];

  recursos.forEach(r => {
    try {
      const resposta = Drive.Permissions.list(r.id);
      const itens = (resposta && resposta.items) || [];

      itens.forEach(item => {
        if (item.type !== 'user') return;

        const emailPermissao = normalizarEmail_(item.emailAddress || item.name || '');
        if (emailPermissao !== alvo) return;
        if (String(item.role || '').toLowerCase() === 'owner') return;

        try {
          Drive.Permissions.remove(r.id, item.id);
          removidos.push(r.nome + ' (' + formatarNivelAcesso_(item.role) + ')');
        } catch (eRemover) {
          falhas.push(r.nome + ': ' + eRemover.message);
        }
      });
    } catch (eListar) {
      falhas.push(r.nome + ': ' + eListar.message);
    }
  });

  return {
    removidos: removidos,
    falhas: falhas
  };
}

function erroSemContaGoogle_(mensagem) {
  const texto = String(mensagem || '').toLowerCase();

  return texto.indexOf("doesn't have a google account") !== -1 ||
    texto.indexOf('does not have a google account') !== -1 ||
    texto.indexOf('nao tem uma conta do google') !== -1 ||
    texto.indexOf('não tem uma conta do google') !== -1;
}

function compartilharSemNotificacao_(fileId, email, role, tagLog) {
  if (!fileId) return;

  const permissao = {
    role: role,
    type: 'user',
    value: email
  };

  try {
    Drive.Permissions.insert(
      permissao,
      fileId,
      {
        sendNotificationEmails: false
      }
    );

    Logger.log('[' + tagLog + '] Compartilhado ' + fileId + ' com ' + email + ' (' + role + ')');
    return;
  } catch (e) {
    if (!erroSemContaGoogle_(e && e.message)) throw e;

    Logger.log(
      '[' + tagLog + '][AVISO] Falha sem notificacao para ' + email +
      '. Tentando com notificacao (modo visitante).'
    );
  }

  try {
    Drive.Permissions.insert(
      permissao,
      fileId,
      {
        sendNotificationEmails: true
      }
    );

    Logger.log('[' + tagLog + '] Compartilhado com notificacao: ' + fileId + ' -> ' + email + ' (' + role + ')');
  } catch (e2) {
    if (erroSemContaGoogle_(e2 && e2.message)) {
      throw new Error(
        'Nao foi possivel compartilhar com ' + email + '. ' +
        'Esse email nao tem conta Google ou o compartilhamento para visitante externo esta bloqueado no dominio.'
      );
    }
    throw e2;
  }
}

function aplicarPermissoes_(email, recursos, tagLog) {
  recursos.forEach(r => {
    compartilharSemNotificacao_(r.id, email, r.role, tagLog);
  });
}

function obterPastaSistema_(raiz) {
  if (!raiz) return null;
  try {
    return obterOuCriarSubpasta_(raiz, '_SISTEMA');
  } catch (e) {
    Logger.log('[ACESSOS][AVISO] Falha ao obter pasta _SISTEMA: ' + e.message);
    return null;
  }
}

function obterUrlArquivoSeguro_(fileId) {
  if (!fileId) return '';
  try {
    return DriveApp.getFileById(fileId).getUrl();
  } catch (e) {
    return '';
  }
}

function obterUrlPastaSeguro_(folderId) {
  if (!folderId) return '';
  try {
    return DriveApp.getFolderById(folderId).getUrl();
  } catch (e) {
    return '';
  }
}

function enviarEmailAcesso_(email, assunto, corpo, tagLog) {
  try {
    GmailApp.sendEmail(email, assunto, corpo);
    Logger.log('[' + tagLog + '] Email enviado para: ' + email);
  } catch (e) {
    Logger.log('[' + tagLog + '][AVISO] Não foi possível enviar email: ' + e.message);
  }
}

/**
 * ============================================================
 * SUPERVISOR
 * ============================================================
 * - Editor na pasta raiz do projeto (Inventário Patrimonial)
 * - Pode conceder acesso para todos os perfis
 */
function gerenciarAcessosSupervisor_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!executorPodeConcederSupervisor_(contexto)) {
    ui.alert('Apenas o proprietario da ADMIN ou um SUPERVISOR credenciado pode conceder acesso de SUPERVISOR.');
    return;
  }

  const raiz = obterPastaInventario_();
  if (!raiz) {
    ui.alert('Pasta raiz do Inventário não encontrada.');
    return;
  }

  const email = pedirEmailAcesso_(
    ui,
    'Gerenciar Acessos SUPERVISOR',
    contexto?.nome || '-',
    'SUPERVISOR',
    '• Editor na pasta raiz do projeto\n' +
    '• Acesso amplo à estrutura por herança do Drive'
  );

  if (!email) return;

  try {
    aplicarPermissoes_(email, [
      { id: raiz.getId(), role: 'writer' }
    ], 'ACESSOS-SUPERVISOR');

    salvarSupervisor_(email);

    enviarEmailAcesso_(
      email,
      '✅ Acesso SUPERVISOR liberado - Inventário Patrimonial',
      'Você recebeu acesso de SUPERVISOR ao Inventário Patrimonial.\n\n' +
      'Permissões:\n' +
      '• Editor na pasta raiz do projeto\n\n' +
      'Pasta raiz: ' + raiz.getUrl(),
      'ACESSOS-SUPERVISOR'
    );

    ui.alert('✅ Acesso SUPERVISOR concedido para: ' + email);
  } catch (e) {
    Logger.log('[ACESSOS-SUPERVISOR][ERRO] ' + e.message);
    ui.alert('❌ Falha ao conceder acesso SUPERVISOR: ' + e.message);
  }
}

/**
 * ============================================================
 * ADMINISTRADOR
 * ============================================================
 * - Editor na Pasta Contexto
 * - Editor na Pasta GERAL
 * - Editor na Pasta TEMPLATES
 * - Leitor na pasta _SISTEMA (bibliotecas)
 * - Não recebe acesso de SUPERVISOR / raiz
 */
function gerenciarAcessosAdministrador_() {
  const ui = SpreadsheetApp.getUi();

  const contexto = obterContextoAtivo_();
  if (!contexto) {
    Logger.log('[ACESSOS-ADMINISTRADOR] Nenhum contexto ativo');
    return;
  }

  if (!contexto.pastaContextoId) {
    Logger.log('[ACESSOS-ADMINISTRADOR] Pasta de contexto não encontrada');
    return;
  }

  const sistemaGlobal = obterSistemaGlobal_();
  const raiz = obterPastaInventario_();
  const pastaTemplates = raiz ? obterOuCriarSubpasta_(raiz, 'TEMPLATES') : null;
  const pastaSistema = obterPastaSistema_(raiz);

  if (!sistemaGlobal.pastaGeralId) {
    ui.alert('Pasta GERAL não configurada no sistema global.');
    return;
  }

  if (!pastaTemplates) {
    ui.alert('Pasta TEMPLATES não encontrada.');
    return;
  }

  if (!pastaSistema) {
    ui.alert('Pasta _SISTEMA não encontrada.');
    return;
  }

  const email = pedirEmailAcesso_(
    ui,
    'Gerenciar Acessos ADMINISTRADOR',
    contexto.nome,
    'ADMINISTRADOR',
    '• Editor na pasta CONTEXTO\n' +
    '• Editor na pasta GERAL\n' +
    '• Editor na pasta TEMPLATES\n' +
    '• Leitor na pasta _SISTEMA (bibliotecas)\n' +
    '• Sem acesso de SUPERVISOR (raiz)'
  );

  if (!email) return;

  try {
    aplicarPermissoes_(email, [
      { id: contexto.pastaContextoId, role: 'writer' },
      { id: sistemaGlobal.pastaGeralId, role: 'writer' },
      { id: pastaTemplates.getId(), role: 'writer' },
      { id: pastaSistema.getId(), role: 'reader' }
    ], 'ACESSOS-ADMINISTRADOR');

    enviarEmailAcesso_(
      email,
      '✅ Acesso ADMINISTRADOR liberado - ' + contexto.nome,
      'Você recebeu acesso de ADMINISTRADOR ao Inventário Patrimonial.\n\n' +
      'Contexto: ' + contexto.nome + '\n\n' +
      'Permissões:\n' +
      '• Editor na pasta CONTEXTO\n' +
      '• Editor na pasta GERAL\n' +
      '• Editor na pasta TEMPLATES\n' +
      '• Leitor na pasta _SISTEMA (bibliotecas)\n' +
      '• Sem acesso de SUPERVISOR (raiz)',
      'ACESSOS-ADMINISTRADOR'
    );

    ui.alert('✅ Acesso ADMINISTRADOR concedido para: ' + email);
  } catch (e) {
    Logger.log('[ACESSOS-ADMINISTRADOR][ERRO] ' + e.message);
    ui.alert('❌ Falha ao conceder acesso ADMINISTRADOR: ' + e.message);
  }
}

/**
 * ============================================================
 * OPERADOR
 * ============================================================
 * - Editor na Pasta <Nome do Contexto>
 * - Leitor na planilha geral
 * - Leitor na pasta _SISTEMA (bibliotecas)
 */
function gerenciarAcessosOperador_() {
  const ui = SpreadsheetApp.getUi();

  const contexto = obterContextoAtivo_();
  if (!contexto) {
    Logger.log('[ACESSOS-OPERADOR] Nenhum contexto ativo');
    return;
  }

  if (!contexto.pastaContextoId) {
    Logger.log('[ACESSOS-OPERADOR] Pasta de contexto não encontrada');
    return;
  }

  const sistemaGlobal = obterSistemaGlobal_();
  const pastaGeralId = contexto.pastaGeralId || (sistemaGlobal && sistemaGlobal.pastaGeralId);
  if (!pastaGeralId) {
    ui.alert('Pasta GERAL não encontrada.');
    return;
  }
  const raiz = obterPastaInventario_();
  const pastaSistema = obterPastaSistema_(raiz);
  if (!pastaSistema) {
    ui.alert('Pasta _SISTEMA não encontrada.');
    return;
  }

  const email = pedirEmailAcesso_(
    ui,
    'Gerenciar Acessos OPERADOR',
    contexto.nome,
    'OPERADOR',
    '• Editor na pasta do CONTEXTO\n' +
    '• Leitor na pasta GERAL\n' +
    '• Leitor na pasta _SISTEMA (bibliotecas)\n' +
    '• Pode conceder apenas acesso CLIENTE'
  );

  if (!email) return;

  try {
    aplicarPermissoes_(email, [
      { id: contexto.pastaContextoId, role: 'writer' },
      { id: pastaGeralId, role: 'reader' },
      { id: pastaSistema.getId(), role: 'reader' }
    ], 'ACESSOS-OPERADOR');

    enviarEmailAcesso_(
      email,
      '✅ Acesso OPERADOR liberado - ' + contexto.nome,
      'Você recebeu acesso de OPERADOR ao Inventário Patrimonial.\n\n' +
      'Contexto: ' + contexto.nome + '\n\n' +
      'Permissões:\n' +
      '• Editor na pasta do CONTEXTO\n' +
      '• Leitor na pasta GERAL\n' +
      '• Leitor na pasta _SISTEMA (bibliotecas)',
      'ACESSOS-OPERADOR'
    );

    ui.alert('✅ Acesso OPERADOR concedido para: ' + email);
  } catch (e) {
    Logger.log('[ACESSOS-OPERADOR][ERRO] ' + e.message);
    ui.alert('❌ Falha ao conceder acesso OPERADOR: ' + e.message);
  }
}

/**
 * ============================================================
 * CLIENTE
 * ============================================================
 * - Editor na Pasta LOCALIDADES
 * - Leitor na Planilha ADMIN
 * - Leitor na Pasta GERAL
 * - Leitor na pasta _SISTEMA (bibliotecas)
 */
function gerenciarAcessosCliente_() {
  const ui = SpreadsheetApp.getUi();

  try {
    const contexto = obterContextoAtivo_();
    if (!contexto || !contexto.planilhaAdminId) {
      Logger.log('[ACESSOS-CLIENTE] Nenhum contexto ativo');
      ui.alert('Nenhum contexto ativo para gerenciar acessos CLIENTE.');
      return;
    }

    if (!contexto.pastaLocalidadesId) {
      Logger.log('[ACESSOS-CLIENTE] Pasta de localidades não encontrada');
      ui.alert('Pasta LOCALIDADES não encontrada no contexto ativo.');
      return;
    }

    const sistemaGlobal = obterSistemaGlobal_() || {};
    const pastaGeralId = contexto.pastaGeralId || sistemaGlobal.pastaGeralId;
    if (!pastaGeralId) {
      ui.alert('Pasta GERAL não encontrada.');
      return;
    }

    const raiz = obterPastaInventario_();
    const pastaSistema = obterPastaSistema_(raiz);
    if (!pastaSistema) {
      ui.alert('Pasta _SISTEMA não encontrada.');
      return;
    }

    const email = pedirEmailAcesso_(
      ui,
      'Gerenciar Acessos CLIENTE',
      contexto.nome,
      'CLIENTE',
      '• Editor na pasta LOCALIDADES\n' +
      '• Leitor na planilha ADMIN\n' +
      '• Leitor na pasta GERAL\n' +
      '• Leitor na pasta _SISTEMA (bibliotecas)'
    );

    if (!email) return;

    aplicarPermissoes_(email, [
      { id: contexto.pastaLocalidadesId, role: 'writer' },
      { id: contexto.planilhaAdminId, role: 'reader' },
      { id: pastaGeralId, role: 'reader' },
      { id: pastaSistema.getId(), role: 'reader' }
    ], 'ACESSOS-CLIENTE');

    const urlPlanilhaCliente = obterUrlArquivoSeguro_(contexto.planilhaClienteId);
    const urlPlanilhaAdmin = obterUrlArquivoSeguro_(contexto.planilhaAdminId);
    const urlPastaGeral = obterUrlPastaSeguro_(pastaGeralId);
    const urlPastaLocalidades = obterUrlPastaSeguro_(contexto.pastaLocalidadesId);
    const urlPastaSistema = obterUrlPastaSeguro_(pastaSistema.getId());

    const blocoLinks = 'Links de acesso:\n' +
      '• Planilha CLIENTE: ' + (urlPlanilhaCliente || 'não encontrada no contexto') + '\n' +
      '• Planilha ADMIN: ' + (urlPlanilhaAdmin || '-') + '\n' +
      '• Pasta GERAL: ' + (urlPastaGeral || '-') + '\n' +
      '• Pasta LOCALIDADES: ' + (urlPastaLocalidades || '-') + '\n' +
      '• Pasta _SISTEMA: ' + (urlPastaSistema || '-');

    enviarEmailAcesso_(
      email,
      '✅ Acesso CLIENTE liberado - ' + contexto.nome,
      'Você recebeu acesso de CLIENTE ao Inventário Patrimonial.\n\n' +
      'Contexto: ' + contexto.nome + '\n\n' +
      'Permissões:\n' +
      '• Editor na pasta LOCALIDADES\n' +
      '• Leitor na planilha ADMIN\n' +
      '• Leitor na pasta GERAL\n' +
      '• Leitor na pasta _SISTEMA (bibliotecas)\n\n' +
      blocoLinks,
      'ACESSOS-CLIENTE'
    );

    ui.alert('✅ Acesso CLIENTE concedido para: ' + email);
  } catch (e) {
    const mensagem = (e && e.message) ? e.message : String(e);
    Logger.log('[ACESSOS-CLIENTE][ERRO] ' + mensagem);
    if (e && e.stack) {
      Logger.log('[ACESSOS-CLIENTE][STACK] ' + e.stack);
    }
    ui.alert('❌ Falha ao executar "Gerenciar Acessos CLIENTE": ' + mensagem);
  }
}

/**
 * ============================================================
 * RETIRAR ACESSOS
 * ============================================================
 * - Lista acessos concedidos (recurso, email, nivel)
 * - Recebe email alvo
 * - Remove todas as permissoes do email nos recursos gerenciaveis
 */
function gerenciarRetiradaAcessos_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!contexto) {
    ui.alert('Nenhum contexto ativo para gerenciar retirada de acessos.');
    return;
  }

  const recursos = mapearRecursosGerenciaveisAcessos_(contexto);
  if (!recursos.length) {
    ui.alert('Nenhum recurso disponivel para retirada de acessos.');
    return;
  }

  const linhas = listarAcessosConcedidos_(recursos);
  const email = pedirEmailRetiradaAcesso_(ui, contexto.nome, linhas);
  if (!email) return;

  const resultado = removerTodosAcessosDoEmail_(email, recursos);
  const totalRemovidos = resultado.removidos.length;

  if (!totalRemovidos && !resultado.falhas.length) {
    ui.alert('Nenhum acesso encontrado para o e-mail: ' + email);
    return;
  }

  let mensagem = 'Retirada de acessos concluida para: ' + email + '\n\n' +
    'Acessos removidos: ' + totalRemovidos;

  if (resultado.removidos.length) {
    const limiteDetalhe = 12;
    const detalhes = resultado.removidos.slice(0, limiteDetalhe);
    if (resultado.removidos.length > limiteDetalhe) {
      detalhes.push('... (' + (resultado.removidos.length - limiteDetalhe) + ' item(ns) adicional(is))');
    }
    mensagem += '\n\nItens removidos:\n- ' + detalhes.join('\n- ');
  }

  if (resultado.falhas.length) {
    const limiteFalhas = 6;
    const falhas = resultado.falhas.slice(0, limiteFalhas);
    if (resultado.falhas.length > limiteFalhas) {
      falhas.push('... (' + (resultado.falhas.length - limiteFalhas) + ' falha(s) adicional(is))');
    }
    mensagem += '\n\nFalhas:\n- ' + falhas.join('\n- ');
  }

  ui.alert(mensagem);
}

/**
 * Compatibilidade retroativa
 */
function gerenciarAcessosAdmin_() {
  gerenciarAcessosAdministrador_();
}
