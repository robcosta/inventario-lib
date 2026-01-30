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
  }
}
