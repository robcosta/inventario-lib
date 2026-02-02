/**
 * ============================================================
 * GERENCIAR ACESSOS DO CONTEXTO (ADMIN)
 * ============================================================
 */

function gerenciarAcessosContexto_() {

  const ui = SpreadsheetApp.getUi();

  const contexto = obterContextoAtivo_();
  if (!contexto) {
    ui.alert('Nenhum contexto ativo nesta planilha.');
    return;
  }

  if (!contexto.pastaUnidadeId) {
    ui.alert('Pasta da unidade não encontrada no contexto.');
    return;
  }

  const resp = ui.prompt(
    'Gerenciar Acessos do Contexto',
    'Contexto: ' + contexto.nome + '\n\n' +
    'Informe o e-mail do usuário que terá acesso ao inventário.\n\n' +
    '• Editor na pasta\n' +
    '• Editor na planilha do cliente\n' +
    '• Leitor na planilha administrativa',
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const email = (resp.getResponseText() || '').trim();

  if (!email || !email.includes('@')) {
    ui.alert('E-mail inválido.');
    return;
  }

  try {
    // Função helper para compartilhar sem enviar email
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
      } catch (e) {
        Logger.log('[ACESSOS][ERRO] Falha ao compartilhar ' + fileId + ': ' + e.message);
        throw e;
      }
    };

    // ========================================================
    // 📁 PASTA — EDITOR
    // ========================================================
    compartilharSemEmail(contexto.pastaUnidadeId, 'writer');

    // ========================================================
    // 📄 PLANILHA OPERACIONAL (ADMIN) — LEITOR
    // ========================================================
    if (contexto.planilhaOperacionalId) {
      compartilharSemEmail(contexto.planilhaOperacionalId, 'reader');
    }

    // ========================================================
    // 📄 PLANILHA CLIENTE — EDITOR
    // ========================================================
    if (contexto.planilhaClienteId) {
      compartilharSemEmail(contexto.planilhaClienteId, 'writer');
    }

    // ========================================================
    // 📄 PLANILHA GERAL — LEITOR
    // ========================================================
    const planilhaGeral = obterPlanilhaGeral_();
    if (planilhaGeral) {
      compartilharSemEmail(planilhaGeral.getId(), 'reader');
    }

    // ========================================================
    // 📚 BIBLIOTECAS — LEITOR
    // ========================================================
    const INVENTARIO_LIB_ID = '1YN4VjP1qoU9868tbfxU50IMejfkvyb5PWM8GphMFr5Wj6GqV3oOU4Vef';
    const VISION_CORE_ID = '1NFjE6RJzmeA1Fe2gvOgIacg1dBQJp3evKvPK9K3nztWKBMCUiZ6PH0QZ';
    
    try {
      compartilharSemEmail(INVENTARIO_LIB_ID, 'reader');
      compartilharSemEmail(VISION_CORE_ID, 'reader');
    } catch (e) {
      Logger.log('[ACESSOS][AVISO] Não foi possível compartilhar bibliotecas: ' + e.message);
    }

    // ========================================================
    // 📧 ENVIAR EMAIL ÚNICO
    // ========================================================
    const pasta = DriveApp.getFolderById(contexto.pastaUnidadeId);
    const planilhaCliente = DriveApp.getFileById(contexto.planilhaClienteId);

    const assunto = '✅ Acesso liberado ao Inventário Patrimonial - ' + contexto.nome;
    
    const corpo = 
      'Olá!\n\n' +
      'Você recebeu acesso ao sistema de Inventário Patrimonial.\n\n' +
      '📋 CONTEXTO: ' + contexto.nome + '\n\n' +
      '🔐 SEUS ACESSOS:\n' +
      '• Editor na pasta de trabalho\n' +
      '• Editor na planilha do cliente\n' +
      '• Leitura na planilha administrativa\n' +
      '• Leitura na planilha geral\n' +
      '• Leitura nas bibliotecas do sistema\n\n' +
      '📁 ACESSE A PASTA DE TRABALHO:\n' +
      pasta.getUrl() + '\n\n' +
      '📊 ACESSE A PLANILHA DO CLIENTE:\n' +
      planilhaCliente.getUrl() + '\n\n' +
      '💡 COMO USAR:\n' +
      'Abra a planilha do cliente e utilize o menu "📦 Inventário Patrimonial" para operar o sistema.\n\n' +
      'Atenciosamente,\n' +
      Session.getActiveUser().getEmail();

    try {
      GmailApp.sendEmail(email, assunto, corpo);
      Logger.log('[ACESSOS] Email enviado para: ' + email);
    } catch (e) {
      Logger.log('[ACESSOS][AVISO] Não foi possível enviar email: ' + e.message);
    }

    const mensagemCliente =
      '✅ Acesso liberado ao Inventário Patrimonial\n\n' +
      'Contexto: ' + contexto.nome + '\n\n' +
      'Você recebeu:\n' +
      '• Editor na pasta de trabalho\n' +
      '• Editor na planilha do cliente\n' +
      '• Leitura na planilha administrativa\n' +
      '• Leitura na planilha geral\n' +
      '• Leitura nas bibliotecas do sistema\n\n' +
      '📁 Pasta de trabalho:\n' +
      pasta.getUrl() + '\n\n' +
      '📧 Email de boas-vindas enviado para: ' + email;

    ui.alert(
      'Acesso concedido com sucesso.\n\n' +
      'Usuário: ' + email + '\n\n' +
      mensagemCliente
    );

  } catch (e) {
    Logger.log('[ACESSOS][ERRO]');
    Logger.log(e);

    ui.alert(
      'Erro ao conceder acesso:\n\n' +
      e.message
    );
  }
}
