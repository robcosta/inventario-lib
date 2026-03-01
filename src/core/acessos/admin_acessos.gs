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

function executorEhSupervisor_() {
  const lista = obterListaSupervisores_();
  const ativo = normalizarEmail_(Session.getActiveUser().getEmail());
  const efetivo = normalizarEmail_(Session.getEffectiveUser().getEmail());

  if (!lista.length) {
    return !!efetivo;
  }

  return lista.indexOf(ativo) !== -1 || lista.indexOf(efetivo) !== -1;
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

function compartilharSemNotificacao_(fileId, email, role, tagLog) {
  if (!fileId) return;

  Drive.Permissions.insert(
    {
      role: role,
      type: 'user',
      value: email
    },
    fileId,
    {
      sendNotificationEmails: false
    }
  );

  Logger.log('[' + tagLog + '] Compartilhado ' + fileId + ' com ' + email + ' (' + role + ')');
}

function aplicarPermissoes_(email, recursos, tagLog) {
  recursos.forEach(r => {
    compartilharSemNotificacao_(r.id, email, r.role, tagLog);
  });
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

  if (!executorEhSupervisor_()) {
    ui.alert('Apenas SUPERVISOR pode conceder acesso de SUPERVISOR.');
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
 * - Não recebe acesso de SUPERVISOR / raiz / _SISTEMA
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

  if (!sistemaGlobal.pastaGeralId) {
    ui.alert('Pasta GERAL não configurada no sistema global.');
    return;
  }

  if (!pastaTemplates) {
    ui.alert('Pasta TEMPLATES não encontrada.');
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
    '• Sem acesso de SUPERVISOR (_SISTEMA)'
  );

  if (!email) return;

  try {
    aplicarPermissoes_(email, [
      { id: contexto.pastaContextoId, role: 'writer' },
      { id: sistemaGlobal.pastaGeralId, role: 'writer' },
      { id: pastaTemplates.getId(), role: 'writer' }
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
      '• Sem acesso de SUPERVISOR (_SISTEMA)',
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

  const planilhaGeral = obterPlanilhaGeral_();
  if (!planilhaGeral) {
    ui.alert('Planilha Geral não encontrada.');
    return;
  }

  const email = pedirEmailAcesso_(
    ui,
    'Gerenciar Acessos OPERADOR',
    contexto.nome,
    'OPERADOR',
    '• Editor na pasta do CONTEXTO\n' +
    '• Leitor na planilha GERAL\n' +
    '• Pode conceder apenas acesso CLIENTE'
  );

  if (!email) return;

  try {
    aplicarPermissoes_(email, [
      { id: contexto.pastaContextoId, role: 'writer' },
      { id: planilhaGeral.getId(), role: 'reader' }
    ], 'ACESSOS-OPERADOR');

    enviarEmailAcesso_(
      email,
      '✅ Acesso OPERADOR liberado - ' + contexto.nome,
      'Você recebeu acesso de OPERADOR ao Inventário Patrimonial.\n\n' +
      'Contexto: ' + contexto.nome + '\n\n' +
      'Permissões:\n' +
      '• Editor na pasta do CONTEXTO\n' +
      '• Leitor na planilha GERAL',
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

  const planilhaGeral = obterPlanilhaGeral_();
  if (!planilhaGeral) {
    ui.alert('Planilha Geral não encontrada.');
    return;
  }

  const email = pedirEmailAcesso_(
    ui,
    'Gerenciar Acessos CLIENTE',
    contexto.nome,
    'CLIENTE',
    '• Editor na pasta LOCALIDADES\n' +
    '• Leitor na planilha ADMIN\n' +
    '• Leitor na planilha GERAL'
  );

  if (!email) return;

  try {
    aplicarPermissoes_(email, [
      { id: contexto.pastaLocalidadesId, role: 'writer' },
      { id: contexto.planilhaAdminId, role: 'reader' },
      { id: planilhaGeral.getId(), role: 'reader' }
    ], 'ACESSOS-CLIENTE');

    enviarEmailAcesso_(
      email,
      '✅ Acesso CLIENTE liberado - ' + contexto.nome,
      'Você recebeu acesso de CLIENTE ao Inventário Patrimonial.\n\n' +
      'Contexto: ' + contexto.nome + '\n\n' +
      'Permissões:\n' +
      '• Editor na pasta LOCALIDADES\n' +
      '• Leitor na planilha ADMIN\n' +
      '• Leitor na planilha GERAL',
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
