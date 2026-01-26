/**
 * ============================================================
 * PASTAS DE TRABALHO — CRIAR (VERSÃO BARRA CUMULATIVA)
 * ============================================================
 */
function criarPastaTrabalho_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!contexto) {
    ui.alert('Nenhum contexto ativo.');
    return;
  }

  const pastaRaiz = obterPastaRaizTrabalho_(contexto);

  // 1️⃣ Lista pastas existentes para evitar duplicidade
  const existentes = [];
  const mapa = {};
  const it = pastaRaiz.getFolders();
  
  while (it.hasNext()) {
    const p = it.next();
    const nome = p.getName().toUpperCase();
    existentes.push(nome);
    mapa[nome] = true;
  }

  const textoExistentes = existentes.length > 0
      ? 'Pastas já existentes:\n\n' + existentes.map(p => '• ' + p).join('\n') + '\n\n'
      : 'Nenhuma pasta criada ainda.\n\n';

  // 2️⃣ Solicita nome ao usuário
  const resp = ui.prompt(
    'Criar pasta de trabalho',
    textoExistentes + 'Digite o nome da nova pasta:',
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const nomeDigitado = (resp.getResponseText() || '').trim();
  if (!nomeDigitado) {
    ui.alert('Nome inválido.');
    return;
  }

  const nomeFinal = nomeDigitado.toUpperCase();

  if (mapa[nomeFinal]) {
    ui.alert('Já existe uma pasta com este nome:\n\n' + nomeFinal);
    return;
  }

  // 3️⃣ Cria pasta física no Drive
  const novaPasta = pastaRaiz.createFolder(nomeFinal);
  const idPasta = novaPasta.getId();

  // 4️⃣ SALVA IDENTIDADE (ID + NOME + COR CLARA)
  gerenciarIdentidadePasta_(idPasta, nomeFinal);

  // 5️⃣ Define como pasta ATIVA
  definirPastaTrabalho_(idPasta, nomeFinal);

  // 6️⃣ Atualiza legendas (Lógica de busca total e fundo branco)
  atualizarLegendasPlanilhaContexto_(contexto);

  ui.alert('Pasta criada e definida como ativa:\n\n' + nomeFinal);
}