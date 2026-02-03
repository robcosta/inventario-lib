/**
 * ============================================================
 * PASTAS DE TRABALHO — CRIAR (LOCALIDADES)
 * ============================================================
 */
function criarPastaTrabalho_() {
  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!contexto || !contexto.id) {
    ui.alert('Nenhum contexto ativo.');
    return;
  }

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
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const nomeDigitado = (resp.getResponseText() || '').trim().toUpperCase();
  if (!nomeDigitado) {
    ui.alert('Nome inválido.');
    return;
  }

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
      ui.ButtonSet.OK
    );
    return;
  }

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
}