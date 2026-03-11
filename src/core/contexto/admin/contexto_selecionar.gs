/**
 * ============================================================
 * CONTEXTO — SELEÇÃO
 * ============================================================
 *
 * Responsabilidades:
 * - Exibir UI de seleção de contexto
 * - Validar escolha do usuário
 * - Delegar ativação ao contexto_admin_manager
 *
 * ❗ NÃO acessa ScriptProperties
 * ❗ NÃO salva contexto diretamente
 * ❗ NÃO contém lógica de persistência
 */
function selecionarContextoTrabalho_() {
  const ui = SpreadsheetApp.getUi();

  const contextoAtual = obterContextoAtivo_();
  const contextos = listarContextosParaSelecao_();

  if (!Array.isArray(contextos) || contextos.length === 0) {
    ui.alert('Não há contextos disponíveis para seleção.');
    return;
  }

  const selecao = montarMensagemSelecaoContexto_(contextoAtual, contextos);

  if (selecao.erro === 'sem_outros') {
    ui.alert('Não há outros contextos disponíveis além do atual.');
    return;
  }

  const resp = ui.prompt(
    'Selecionar Contexto de Trabalho',
    selecao.mensagem,
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const indice = Number((resp.getResponseText() || '').trim());

  if (!indice || indice < 1 || indice > selecao.outrosContextos.length) {
    ui.alert('Seleção inválida.');
    return;
  }

  const escolhido = selecao.outrosContextos[indice - 1];

  if (!escolhido.planilhaAdminId) {
    ui.alert(
      '❌ O contexto selecionado não possui planilha ADMIN válida.'
    );
    return;
  }

  try {
    DriveApp.getFileById(escolhido.planilhaAdminId);
  } catch (e) {
    ui.alert(
      '❌ Não é possível acessar a planilha ADMIN do contexto selecionado.\n\n' +
      'A planilha pode ter sido removida ou você não tem permissão.'
    );
    return;
  }

  // 🚀 MODELO CORRETO:
  // NÃO altera contexto da planilha atual
  // Apenas abre a planilha do outro contexto

  abrirPlanilhaNoNavegador_(escolhido.planilhaAdminId);
}

function listarContextosParaSelecao_() {
  const porAdminId = {};

  // 1) Contextos já persistidos nas ScriptProperties.
  const persistidos = listarContextos_();
  (persistidos || []).forEach(ctx => {
    if (!ctx || !ctx.planilhaAdminId) return;
    porAdminId[ctx.planilhaAdminId] = ctx;
  });

  // 2) Fallback: descobrir contextos diretamente no Drive.
  const descobertos = listarContextosViaDrive_();
  (descobertos || []).forEach(ctx => {
    if (!ctx || !ctx.planilhaAdminId) return;
    if (!porAdminId[ctx.planilhaAdminId]) {
      porAdminId[ctx.planilhaAdminId] = ctx;
    }
  });

  return Object.keys(porAdminId).map(id => porAdminId[id]);
}

function listarContextosViaDrive_() {
  const pastaContextos = resolverPastaContextosParaSelecao_();
  if (!pastaContextos) return [];

  const lista = [];
  const pastas = pastaContextos.getFolders();

  while (pastas.hasNext()) {
    const pastaContexto = pastas.next();
    const contexto = montarContextoBasicoDaPasta_(pastaContexto);
    if (contexto && contexto.planilhaAdminId) {
      lista.push(contexto);
    }
  }

  return lista;
}

function resolverPastaContextosParaSelecao_() {
  const sistema = obterSistemaGlobal_() || {};
  const contextoAtual = obterContextoAtivo_() || {};

  const pastaContextosId = String(sistema.pastaContextoId || '').trim();
  if (pastaContextosId) {
    try {
      return DriveApp.getFolderById(pastaContextosId);
    } catch (e) {
      Logger.log('[CONTEXTO][SELECIONAR] pastaContextoId global invalido: ' + e.message);
    }
  }

  // Fallback: usa a pasta do contexto atual -> pai deve ser CONTEXTOS.
  const pastaContextoAtualId = String(contextoAtual.pastaContextoId || '').trim();
  if (pastaContextoAtualId) {
    try {
      const pastaContextoAtual = DriveApp.getFolderById(pastaContextoAtualId);
      const pais = pastaContextoAtual.getParents();
      if (pais.hasNext()) {
        return pais.next();
      }
    } catch (e) {
      Logger.log('[CONTEXTO][SELECIONAR] falha ao resolver pasta CONTEXTOS por pastaContextoId atual.');
    }
  }

  // Último fallback: deduz pela planilha ativa ADMIN.
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return null;

    const fileAdmin = DriveApp.getFileById(ss.getId());
    const paisPlanilha = fileAdmin.getParents();
    if (!paisPlanilha.hasNext()) return null;

    const pastaPlanilhas = paisPlanilha.next();
    const paisContexto = pastaPlanilhas.getParents();
    if (!paisContexto.hasNext()) return null;

    const pastaContexto = paisContexto.next();
    const paisContextos = pastaContexto.getParents();
    if (!paisContextos.hasNext()) return null;

    return paisContextos.next();
  } catch (e) {
    Logger.log('[CONTEXTO][SELECIONAR] falha ao deduzir pasta CONTEXTOS pela planilha ativa.');
  }

  return null;
}

function montarContextoBasicoDaPasta_(pastaContexto) {
  if (!pastaContexto) return null;

  const pastaPlanilhas = localizarSubpastaPorNomeExato_(pastaContexto, 'PLANILHA') ||
    localizarSubpastaPorNomeExato_(pastaContexto, 'PLANILHAS');
  const pastaLocalidades = localizarSubpastaPorNomeExato_(pastaContexto, 'LOCALIDADES');
  const pastaCSVAdmin = pastaPlanilhas
    ? localizarSubpastaPorNomeExato_(pastaPlanilhas, 'CSV_ADMIN')
    : null;

  if (!pastaPlanilhas || !pastaLocalidades || !pastaCSVAdmin) {
    return null;
  }

  let planilhaAdminId = null;
  const filesAdmin = pastaPlanilhas.getFilesByType(MimeType.GOOGLE_SHEETS);
  while (filesAdmin.hasNext()) {
    const file = filesAdmin.next();
    const nome = String(file.getName() || '').toUpperCase();
    if (nome.startsWith('ADMIN:')) {
      planilhaAdminId = file.getId();
      break;
    }
  }

  if (!planilhaAdminId) {
    return null;
  }

  let planilhaClienteId = null;
  let planilhaRelatorioId = null;
  const filesLocalidades = pastaLocalidades.getFilesByType(MimeType.GOOGLE_SHEETS);

  while (filesLocalidades.hasNext()) {
    const file = filesLocalidades.next();
    const nome = String(file.getName() || '').toUpperCase();

    if (!planilhaClienteId && nome.startsWith('CLIENTE:')) {
      planilhaClienteId = file.getId();
      continue;
    }

    if (!planilhaRelatorioId && (
      nome.startsWith('RELATÓRIOS:') ||
      nome.startsWith('RELATÓRIOS:') ||
      nome.startsWith('RELATORIO:') ||
      nome.startsWith('RELATORIOS:')
    )) {
      planilhaRelatorioId = file.getId();
      continue;
    }
  }

  return {
    nome: pastaContexto.getName(),
    planilhaAdminId: planilhaAdminId,
    planilhaClienteId: planilhaClienteId,
    planilhaRelatorioId: planilhaRelatorioId,
    pastaContextoId: pastaContexto.getId(),
    pastaPlanilhasId: pastaPlanilhas.getId(),
    pastaCSVAdminId: pastaCSVAdmin.getId(),
    pastaLocalidadesId: pastaLocalidades.getId()
  };
}

function localizarSubpastaPorNomeExato_(pastaPai, nome) {
  if (!pastaPai || !nome) return null;
  const it = pastaPai.getFoldersByName(nome);
  return it.hasNext() ? it.next() : null;
}


/* ============================================================
 * FUNÇÕES AUXILIARES (PUROS)
 * ============================================================ */

/**
 * Monta a mensagem e separa os contextos selecionáveis.
 */
function montarMensagemSelecaoContexto_(contextoAtual, contextos) {
  const idAtual = contextoAtual && contextoAtual.planilhaAdminId
    ? contextoAtual.planilhaAdminId
    : null;

  const outrosContextos = contextos.filter(
    ctx => ctx.planilhaAdminId !== idAtual
  );

  if (outrosContextos.length === 0) {
    return { erro: 'sem_outros' };
  }

  outrosContextos.sort((a, b) => {
    const nomeA = (a.nome || '').toUpperCase();
    const nomeB = (b.nome || '').toUpperCase();
    return nomeA.localeCompare(nomeB);
  });

  let mensagem = 'Contexto atual: ' +
    (contextoAtual.nome || 'NENHUM') +
    '\n\nSelecione o contexto que deseja abrir:\n\n';

  outrosContextos.forEach((ctx, i) => {
    mensagem += `${i + 1} - ${ctx.nome}\n`;
  });

  return {
    mensagem,
    outrosContextos
  };
}

function obterPastasVivas_(contexto) {

  if (!contexto?.pastaLocalidadesId) {
    return [];
  }

  const pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);
  const it = pastaRaiz.getFolders();

  const lista = [];

  while (it.hasNext()) {
    const pasta = it.next();

    lista.push({
      id: pasta.getId(),
      nome: pasta.getName()
    });
  }

  if (!lista.length) {
    return [];
  }

  // 🔹 ÚNICO ponto onde a cor é definida
  const mapaCores = obterMapaCoresPorContexto_(lista);

  lista.forEach(p => {
    p.cor = mapaCores[p.id];
  });

  return lista;
}
