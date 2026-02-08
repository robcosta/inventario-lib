/**
 * ============================================================
<<<<<<< HEAD
 * GERENCIAR ACESSOS DO CONTEXTO (ADMIN)
 * ============================================================
 */

function gerenciarAcessosContexto_() {

=======
 * GERENCIAR ACESSOS — ADMIN
 * ============================================================
 * Concede acesso de ADMINISTRADOR
 * - Editor na pasta de localidades
 * - Editor na planilha admin
 * - Leitor na planilha geral
 * - Leitor nas bibliotecas
 */
function gerenciarAcessosAdmin_() {
>>>>>>> bugfix-contexto-persistencia
  const ui = SpreadsheetApp.getUi();

  const contexto = obterContextoAtivo_();
  if (!contexto) {
<<<<<<< HEAD
    ui.alert('Nenhum contexto ativo nesta planilha.');
    return;
  }

  if (!contexto.pastaUnidadeId) {
    ui.alert('Pasta da unidade não encontrada no contexto.');
=======
    Logger.log('[ACESSOS-ADMIN] Nenhum contexto ativo');
    return;
  }

  if (!contexto.pastaLocalidadesId) {
    Logger.log('[ACESSOS-ADMIN] Pasta de localidades não encontrada');
>>>>>>> bugfix-contexto-persistencia
    return;
  }

  const resp = ui.prompt(
<<<<<<< HEAD
    'Gerenciar Acessos do Contexto',
    'Contexto: ' + contexto.nome + '\n\n' +
    'Informe o e-mail do usuário que terá acesso ao inventário.\n\n' +
    '• Editor na pasta\n' +
    '• Editor na planilha do cliente\n' +
    '• Leitor na planilha administrativa',
=======
    'Gerenciar Acessos ADMIN',
    'Contexto: ' + contexto.nome + '\n\n' +
    'Informe o e-mail do usuário ADMIN.\n\n' +
    'Permissões:\n' +
    '• Editor na pasta de trabalho\n' +
    '• Editor na planilha admin\n' +
    '• Leitor na planilha geral\n' +
    '• Leitor nas bibliotecas',
>>>>>>> bugfix-contexto-persistencia
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const email = (resp.getResponseText() || '').trim();

  if (!email || !email.includes('@')) {
<<<<<<< HEAD
    ui.alert('E-mail inválido.');
=======
    Logger.log('[ACESSOS-ADMIN] E-mail inválido: ' + email);
>>>>>>> bugfix-contexto-persistencia
    return;
  }

  try {
<<<<<<< HEAD
    // ========================================================
    // 📁 PASTA — EDITOR
    // ========================================================
    const pasta = DriveApp.getFolderById(contexto.pastaUnidadeId);
    pasta.addEditor(email);

    // ========================================================
    // 📄 PLANILHA OPERACIONAL (ADMIN) — LEITOR
    // ========================================================
    if (contexto.planilhaOperacionalId) {
      DriveApp
        .getFileById(contexto.planilhaOperacionalId)
        .addViewer(email);
    }

    // ========================================================
    // 📄 PLANILHA CLIENTE — EDITOR
    // ========================================================
    if (contexto.planilhaClienteId) {
      DriveApp
        .getFileById(contexto.planilhaClienteId)
        .addEditor(email);
    }

    const mensagemCliente =
      '✅ Acesso liberado ao Inventário Patrimonial\n\n' +
      'Contexto: ' + contexto.nome + '\n\n' +
      'Você recebeu:\n' +
      '• Editor na pasta de trabalho\n' +
      '• Editor na planilha do cliente\n' +
      '• Leitura na planilha administrativa\n\n' +
      '📁 Pasta de trabalho:\n' +
      pasta.getUrl() + '\n\n' +
      'Utilize o menu da planilha para operar o inventário.';

    ui.alert(
      'Acesso concedido com sucesso.\n\n' +
      'Usuário: ' + email + '\n\n' +
      'Mensagem para o cliente (copie e envie):\n\n' +
      mensagemCliente
    );

  } catch (e) {
    Logger.log('[ACESSOS][ERRO]');
    Logger.log(e);

    ui.alert(
      'Erro ao conceder acesso:\n\n' +
      e.message
    );
=======
    const compartilharSemEmail = (fileId, role) => {
      try {
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
        Logger.log('[ACESSOS-ADMIN] Compartilhado ' + fileId + ' com ' + email + ' (' + role + ')');
      } catch (e) {
        Logger.log('[ACESSOS-ADMIN][ERRO] Falha ao compartilhar ' + fileId + ': ' + e.message);
        throw e;
      }
    };

    // 📁 PASTA DE LOCALIDADES — EDITOR
    compartilharSemEmail(contexto.pastaLocalidadesId, 'writer');

    // 📄 PLANILHA ADMIN — EDITOR
    if (contexto.planilhaAdminId) {
      compartilharSemEmail(contexto.planilhaAdminId, 'writer');
    }

    // 📄 PLANILHA GERAL — LEITOR
    const planilhaGeral = obterPlanilhaGeral_();
    if (planilhaGeral) {
      compartilharSemEmail(planilhaGeral.getId(), 'reader');
    }

    // 📚 BIBLIOTECAS — LEITOR
    const INVENTARIO_LIB_ID = '1YN4VjP1qoU9868tbfxU50IMejfkvyb5PWM8GphMFr5Wj6GqV3oOU4Vef';
    const VISION_CORE_ID = '1NFjE6RJzmeA1Fe2gvOgIacg1dBQJp3evKvPK9K3nztWKBMCUiZ6PH0QZ';
    
    try {
      compartilharSemEmail(INVENTARIO_LIB_ID, 'reader');
      compartilharSemEmail(VISION_CORE_ID, 'reader');
    } catch (e) {
      Logger.log('[ACESSOS-ADMIN][AVISO] Não foi possível compartilhar bibliotecas: ' + e.message);
    }

    // 📧 ENVIAR EMAIL
    const pasta = DriveApp.getFolderById(contexto.pastaLocalidadesId);
    const assunto = '✅ Acesso ADMIN liberado - ' + contexto.nome;
    const corpo = 
      'Você recebeu acesso de ADMINISTRADOR ao Inventário Patrimonial.\n\n' +
      'Contexto: ' + contexto.nome + '\n\n' +
      'Permissões:\n' +
      '• Editor na pasta de trabalho\n' +
      '• Editor na planilha admin\n' +
      '• Leitor na planilha geral\n' +
      '• Leitor nas bibliotecas\n\n' +
      'Pasta de trabalho: ' + pasta.getUrl();

    try {
      GmailApp.sendEmail(email, assunto, corpo);
      Logger.log('[ACESSOS-ADMIN] Email enviado para: ' + email);
    } catch (e) {
      Logger.log('[ACESSOS-ADMIN][AVISO] Não foi possível enviar email: ' + e.message);
    }

  } catch (e) {
    Logger.log('[ACESSOS-ADMIN][ERRO] ' + e.message);
  }
}

/**
 * ============================================================
 * GERENCIAR ACESSOS — CLIENTE
 * ============================================================
 * Concede acesso de CLIENTE
 * - Editor na pasta de localidades
 * - Editor na planilha do cliente
 * - Leitor na planilha admin
 * - Leitor na planilha geral
 * - Leitor nas bibliotecas
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

  if (!contexto.planilhaClienteId) {
    Logger.log('[ACESSOS-CLIENTE] Planilha de cliente não encontrada');
    return;
  }

  const resp = ui.prompt(
    'Gerenciar Acessos CLIENTE',
    'Contexto: ' + contexto.nome + '\n\n' +
    'Informe o e-mail do usuário CLIENTE.\n\n' +
    'Permissões:\n' +
    '• Editor na pasta de trabalho\n' +
    '• Editor na planilha do cliente\n' +
    '• Leitor na planilha admin\n' +
    '• Leitor na planilha geral\n' +
    '• Leitor nas bibliotecas',
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const email = (resp.getResponseText() || '').trim();

  if (!email || !email.includes('@')) {
    Logger.log('[ACESSOS-CLIENTE] E-mail inválido: ' + email);
    return;
  }

  try {
    const compartilharSemEmail = (fileId, role) => {
      try {
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
        Logger.log('[ACESSOS-CLIENTE] Compartilhado ' + fileId + ' com ' + email + ' (' + role + ')');
      } catch (e) {
        Logger.log('[ACESSOS-CLIENTE][ERRO] Falha ao compartilhar ' + fileId + ': ' + e.message);
        throw e;
      }
    };

    // 📁 PASTA DE LOCALIDADES — EDITOR
    compartilharSemEmail(contexto.pastaLocalidadesId, 'writer');

    // 📄 PLANILHA CLIENTE — EDITOR
    compartilharSemEmail(contexto.planilhaClienteId, 'writer');

    // 📄 PLANILHA ADMIN — LEITOR
    if (contexto.planilhaAdminId) {
      compartilharSemEmail(contexto.planilhaAdminId, 'reader');
    }

    // 📄 PLANILHA GERAL — LEITOR
    const planilhaGeral = obterPlanilhaGeral_();
    if (planilhaGeral) {
      compartilharSemEmail(planilhaGeral.getId(), 'reader');
    }

    // 📚 BIBLIOTECAS — LEITOR
    const INVENTARIO_LIB_ID = '1YN4VjP1qoU9868tbfxU50IMejfkvyb5PWM8GphMFr5Wj6GqV3oOU4Vef';
    const VISION_CORE_ID = '1NFjE6RJzmeA1Fe2gvOgIacg1dBQJp3evKvPK9K3nztWKBMCUiZ6PH0QZ';
    
    try {
      compartilharSemEmail(INVENTARIO_LIB_ID, 'reader');
      compartilharSemEmail(VISION_CORE_ID, 'reader');
    } catch (e) {
      Logger.log('[ACESSOS-CLIENTE][AVISO] Não foi possível compartilhar bibliotecas: ' + e.message);
    }

    // 📧 ENVIAR EMAIL
    const pasta = DriveApp.getFolderById(contexto.pastaLocalidadesId);
    const planilhaCliente = DriveApp.getFileById(contexto.planilhaClienteId);
    const assunto = '✅ Acesso CLIENTE liberado - ' + contexto.nome;
    const corpo = 
      'Você recebeu acesso de CLIENTE ao Inventário Patrimonial.\n\n' +
      'Contexto: ' + contexto.nome + '\n\n' +
      'Permissões:\n' +
      '• Editor na pasta de trabalho\n' +
      '• Editor na planilha do cliente\n' +
      '• Leitor na planilha admin\n' +
      '• Leitor na planilha geral\n' +
      '• Leitor nas bibliotecas\n\n' +
      'Pasta de trabalho: ' + pasta.getUrl() + '\n' +
      'Planilha do cliente: ' + planilhaCliente.getUrl();

    try {
      GmailApp.sendEmail(email, assunto, corpo);
      Logger.log('[ACESSOS-CLIENTE] Email enviado para: ' + email);
    } catch (e) {
      Logger.log('[ACESSOS-CLIENTE][AVISO] Não foi possível enviar email: ' + e.message);
    }

  } catch (e) {
    Logger.log('[ACESSOS-CLIENTE][ERRO] ' + e.message);
>>>>>>> bugfix-contexto-persistencia
  }
}
