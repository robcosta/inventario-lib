/**
 * ============================================================
 * ÁREA DE FOTOS — CRIAR NOVA PASTA
 * ============================================================
 *
 * - Mostra pasta ativa
 * - Lista pastas existentes
 * - Cria nova pasta no Drive
 * - Atualiza contexto (ID-based)
 * - Pergunta se deseja abrir
 */

function criarNovaPastaFotos_() {

  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!contexto || !contexto.pastaLocalidadesId) {
    ui.alert('❌ Nenhum contexto válido encontrado.');
    return;
  }

  const pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);

  // Lista pastas existentes
  const it = pastaRaiz.getFolders();
  const nomesExistentes = [];

  while (it.hasNext()) {
    nomesExistentes.push(it.next().getName().toUpperCase());
  }

  nomesExistentes.sort();

  let mensagem = '';

  if (contexto.localidadeAtivaNome) {
    mensagem += `Pasta ativa: ${contexto.localidadeAtivaNome}\n\n`;
  }

  if (nomesExistentes.length > 0) {
    mensagem += 'Pastas existentes:\n';
    mensagem += nomesExistentes.map(n => '• ' + n).join('\n');
    mensagem += '\n\n';
  } else {
    mensagem += 'Nenhuma pasta criada ainda.\n\n';
  }

  mensagem += 'Digite o nome da nova pasta:';

  const resp = ui.prompt(
    'Criar Nova Pasta de Fotos',
    mensagem,
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const nome = (resp.getResponseText() || '').trim().toUpperCase();

  if (!nome) {
    ui.alert('❌ Nome inválido.');
    return;
  }

  if (nomesExistentes.includes(nome)) {
    ui.alert('❌ Já existe uma pasta com esse nome.');
    return;
  }

  const novaPasta = pastaRaiz.createFolder(nome);

  atualizarContextoAdmin_({
    localidadeAtivaId: novaPasta.getId(),
    localidadeAtivaNome: nome
  });

  const abrir = ui.alert(
    `✅ Pasta criada e definida como ativa:\n\n${nome}\n\nDeseja abrir a pasta agora?`,
    ui.ButtonSet.YES_NO
  );

  if (abrir === ui.Button.YES) {
    abrirPastaNoNavegador_(novaPasta.getId());
  }
}
