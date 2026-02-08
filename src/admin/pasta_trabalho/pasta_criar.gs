/**
 * ============================================================
<<<<<<< HEAD
 * PASTAS DE TRABALHO — CRIAR (VERSÃO BARRA CUMULATIVA)
=======
 * PASTAS DE TRABALHO — CRIAR (LOCALIDADES)
>>>>>>> bugfix-contexto-persistencia
 * ============================================================
 */
function criarPastaTrabalho_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

<<<<<<< HEAD
  if (!contexto) {
=======
  if (!contexto || !contexto.id) {
>>>>>>> bugfix-contexto-persistencia
    ui.alert('Nenhum contexto ativo.');
    return;
  }

<<<<<<< HEAD
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
=======
  if (!contexto.pastaLocalidadesId) {
    ui.alert('Pasta de localidades não configurada.');
    return;
  }

  const pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);

  // 1️⃣ Sincroniza localidades do Drive com o contexto
  const contextoAtualizado = sincronizarLocalidadesContexto_(contexto);
  const existentes = contextoAtualizado.localidades || [];
  const nomesMapeados = {};
  existentes.forEach(loc => {
    if (loc && loc.nome) nomesMapeados[loc.nome.toUpperCase()] = true;
  });

  const textoExistentes = existentes.length > 0
    ? 'Pastas de trabalho já existentes:\n\n' + existentes.map(p => '• ' + p.nome).join('\n') + '\n\n'
    : 'Nenhuma pasta de trabalho criada ainda.\n\n';

  // 2️⃣ Solicita nome ao usuário
  const resp = ui.prompt(
    'Criar Pasta de Trabalho',
    textoExistentes + 'Digite o nome da nova pasta de trabalho:',
>>>>>>> bugfix-contexto-persistencia
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

<<<<<<< HEAD
  const nomeDigitado = (resp.getResponseText() || '').trim();
=======
  const nomeDigitado = (resp.getResponseText() || '').trim().toUpperCase();
>>>>>>> bugfix-contexto-persistencia
  if (!nomeDigitado) {
    ui.alert('Nome inválido.');
    return;
  }

<<<<<<< HEAD
  const nomeFinal = nomeDigitado.toUpperCase();

  if (mapa[nomeFinal]) {
    ui.alert('Já existe uma pasta com este nome:\n\n' + nomeFinal);
    return;
  }

  // 2️⃣B Verificar limite máximo de pastas por contexto (8 cores disponíveis)
  // O limite é por contexto, não global
  const totalPastasContexto = existentes.length;
  if (totalPastasContexto >= CORES_DESTAQUE_LISTA.length) {
    ui.alert(
      '⚠️ Limite de Pastas Atingido',
      'Máximo de ' + CORES_DESTAQUE_LISTA.length + ' pastas de trabalho por contexto.\n\n' +
      'Contexto atual "' + contexto.nome + '" já possui: ' + totalPastasContexto + '\n\n' +
      'Remova uma pasta existente antes de criar uma nova.',
=======
  const nomeFinal = nomeDigitado;

  if (nomesMapeados[nomeFinal]) {
    ui.alert('Já existe uma localidade com este nome:\n\n' + nomeFinal);
    return;
  }

  // 3️⃣ Verificar limite máximo de localidades (8 cores disponíveis)
  if (existentes.length >= CORES_DESTAQUE_LISTA.length) {
    ui.alert(
      '⚠️ Limite de Localidades Atingido',
      'Máximo de ' + CORES_DESTAQUE_LISTA.length + ' localidades por contexto.\n\n' +
      'Contexto "' + contexto.nome + '" já possui: ' + existentes.length + '\n\n' +
      'Remova uma localidade existente antes de criar uma nova.',
>>>>>>> bugfix-contexto-persistencia
      ui.ButtonSet.OK
    );
    return;
  }

<<<<<<< HEAD
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
=======
  // 4️⃣ Cria pasta física no Drive
  const novaPasta = pastaRaiz.createFolder(nomeFinal);

  // 5️⃣ Encontra cor disponível
  const coresEmUso = existentes.map(loc => loc.cor).filter(Boolean);
  const corEscolhida = CORES_DESTAQUE_LISTA.find(cor => !coresEmUso.includes(cor)) || CORES_DESTAQUE_LISTA[0];

  // 6️⃣ Cria objeto localidade
  const novaLocalidade = {
    id: novaPasta.getId(),
    nome: nomeFinal,
    cor: corEscolhida,
    criadaEm: new Date().toISOString()
  };

  // 7️⃣ Adiciona localidade ao contexto
  adicionarLocalidade_(novaLocalidade);

  // 8️⃣ Define como localidade ATIVA
  setLocalidadeAtiva_(novaLocalidade.id);

  // 9️⃣ Atualiza legendas se possível
  try {
    const contextoNovo = obterContextoAtivo_();
    if (contextoNovo && contextoNovo.planilhaClienteId) {
      atualizarLegendasPlanilhaContexto_(contextoNovo);
    }
  } catch (e) {
    console.error('criarPastaTrabalho_: Erro ao atualizar legendas:', e.message);
    ui.alert(
      '✅ Localidade criada e ativada: ' + nomeFinal + '\n\n' +
      'Erro ao atualizar legendas (não crítico):\n' + e.message
    );
    return;
  }

  ui.alert('✅ Localidade criada e definida como ativa:\n\n' + nomeFinal);
>>>>>>> bugfix-contexto-persistencia
}