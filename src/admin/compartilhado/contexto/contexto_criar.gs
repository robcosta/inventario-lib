/**
 * ============================================================
 * CONTEXTO — CRIAÇÃO
 * ============================================================
 *
 * Responsabilidades:
 * - Coletar dados do usuário
 * - Criar estrutura inicial do contexto
 * - Delegar persistência ao contexto_admin_manager
 *
 * ❗ NÃO acessa ScriptProperties
 * ❗ NÃO salva contexto diretamente
 * ❗ NÃO decide contexto ativo fora do manager
 */

function criarContextoTrabalho_() {
  const ui = SpreadsheetApp.getUi();

  // Impede criação duplicada
  if (planilhaTemContexto_()) {
    ui.alert(
      'Esta planilha já possui um contexto configurado.\n\n' +
      'Se desejar trocar, utilize a opção "Selecionar Contexto".'
    );
    return;
  }

  // Solicita nome do contexto
  const resp = ui.prompt(
    'Criar Contexto de Trabalho',
    'Informe o nome do novo contexto:',
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const nome = (resp.getResponseText() || '').trim();

  if (!nome) {
    ui.alert('Nome do contexto inválido.');
    return;
  }

  // Verifica duplicidade lógica (nome)
  const existentes = listarContextos_();
  const duplicado = existentes.some(
    ctx => (ctx.nome || '').toUpperCase() === nome.toUpperCase()
  );

  if (duplicado) {
    ui.alert(
      'Já existe um contexto com este nome.\n\n' +
      'Escolha um nome diferente.'
    );
    return;
  }

  // Monta objeto de contexto inicial
  const contexto = {
    nome: nome,
    criadoEm: new Date().toISOString(),
    ultimaAtualizacao: new Date().toISOString()
  };

  // Delegar criação e ativação ao manager
  try {
    criarContexto_(contexto);
  } catch (e) {
    ui.alert(
      'Erro ao criar contexto:\n\n' + e.message
    );
    return;
  }

  ui.alert(
    'Contexto criado com sucesso:\n\n' +
    nome
  );
}
