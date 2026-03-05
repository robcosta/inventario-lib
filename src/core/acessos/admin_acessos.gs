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

  const planilhaGeralId = resolverPlanilhaGeralId_();
  if (!planilhaGeralId) {
    ui.alert('Planilha Geral não encontrada.');
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
    '• Leitor na planilha GERAL\n' +
    '• Leitor na pasta _SISTEMA (bibliotecas)\n' +
    '• Pode conceder apenas acesso CLIENTE'
  );

  if (!email) return;

  try {
    aplicarPermissoes_(email, [
      { id: contexto.pastaContextoId, role: 'writer' },
      { id: planilhaGeralId, role: 'reader' },
      { id: pastaSistema.getId(), role: 'reader' }
    ], 'ACESSOS-OPERADOR');

    enviarEmailAcesso_(
      email,
      '✅ Acesso OPERADOR liberado - ' + contexto.nome,
      'Você recebeu acesso de OPERADOR ao Inventário Patrimonial.\n\n' +
      'Contexto: ' + contexto.nome + '\n\n' +
      'Permissões:\n' +
      '• Editor na pasta do CONTEXTO\n' +
      '• Leitor na planilha GERAL\n' +
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
 * - Leitor na Planilha GERAL
 * - Leitor na pasta _SISTEMA (bibliotecas)
 */
function gerenciarAcessosCliente_() {
  const ui = SpreadsheetApp.getUi();

  const contexto = obterContextoAtivo_();
  if (!contexto) {
    Logger.log('[ACESSOS-CLIENTE] Nenhum contexto ativo');
    return;
  }

  if (!contexto.pastaLocalidadesId) {
    Logger.log('[ACESSOS-CLIENTE] Pasta de localidades não encontrada');
    return;
  }

  const planilhaGeralId = resolverPlanilhaGeralId_();
  if (!planilhaGeralId) {
    ui.alert('Planilha Geral não encontrada.');
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
    '• Leitor na planilha GERAL\n' +
    '• Leitor na pasta _SISTEMA (bibliotecas)'
  );

  if (!email) return;

  try {
    aplicarPermissoes_(email, [
      { id: contexto.pastaLocalidadesId, role: 'writer' },
      { id: contexto.planilhaAdminId, role: 'reader' },
      { id: planilhaGeralId, role: 'reader' },
      { id: pastaSistema.getId(), role: 'reader' }
    ], 'ACESSOS-CLIENTE');

    const urlPlanilhaCliente = obterUrlArquivoSeguro_(contexto.planilhaClienteId);
    const urlPlanilhaAdmin = obterUrlArquivoSeguro_(contexto.planilhaAdminId);
    const urlPlanilhaGeral = obterUrlArquivoSeguro_(planilhaGeralId);
    const urlPastaLocalidades = obterUrlPastaSeguro_(contexto.pastaLocalidadesId);
    const urlPastaSistema = obterUrlPastaSeguro_(pastaSistema.getId());

    const blocoLinks = 'Links de acesso:\n' +
      '• Planilha CLIENTE: ' + (urlPlanilhaCliente || 'não encontrada no contexto') + '\n' +
      '• Planilha ADMIN: ' + (urlPlanilhaAdmin || '-') + '\n' +
      '• Planilha GERAL: ' + (urlPlanilhaGeral || '-') + '\n' +
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
      '• Leitor na planilha GERAL\n' +
      '• Leitor na pasta _SISTEMA (bibliotecas)\n\n' +
      blocoLinks,
      'ACESSOS-CLIENTE'
    );

    ui.alert('✅ Acesso CLIENTE concedido para: ' + email);
  } catch (e) {
    Logger.log('[ACESSOS-CLIENTE][ERRO] ' + e.message);
    ui.alert('❌ Falha ao conceder acesso CLIENTE: ' + e.message);
  }
}

/**
 * Compatibilidade retroativa
 */
function gerenciarAcessosAdmin_() {
  gerenciarAcessosAdministrador_();
}
