/**
 * ============================================================
 * ÁREA DE FOTOS — TROCAR PASTA ATIVA (VERSÃO DEFINITIVA)
 * ============================================================
 */

function trocarPastaFotos_() {
  const ui = SpreadsheetApp.getUi();
  let contexto = resolverContextoAtual_();
  contexto = sincronizarLocalidadeAtiva_(contexto);

  // 🔥 GARANTIA: Se a ativa foi removida, limpar nome também
  if (!contexto.localidadeAtivaId) {
    contexto.localidadeAtivaNome = null;
  }

  if (!contexto || !contexto.pastaLocalidadesId) {
    ui.alert("❌ Nenhum contexto válido encontrado.");
    return;
  }

  const pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);
  const it = pastaRaiz.getFolders();

  const pastas = [];

  while (it.hasNext()) {
    const p = it.next();
    pastas.push({
      id: p.getId(),
      nome: p.getName(),
    });
  }

  if (pastas.length === 0) {
    ui.alert(
      "⚠️ Nenhuma pasta de fotos foi criada ainda.\n\n" +
        'Use "Criar Nova Pasta" primeiro.',
    );
    return;
  }

  // Ordenação alfabética
  pastas.sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }),
  );

  const pastaAtivaId = contexto.localidadeAtivaId;

  // Remover pasta ativa da listagem
  const pastasDisponiveis = pastas.filter((p) => p.id !== pastaAtivaId);

  if (pastasDisponiveis.length === 0) {
    ui.alert("⚠️ Não há outra pasta disponível para troca.");
    return;
  }

  let mensagem = "";

  if (contexto.localidadeAtivaNome) {
    mensagem += `Pasta ativa: ${contexto.localidadeAtivaNome}\n\n`;
  }

  mensagem += "Escolha a nova pasta:\n\n";

  const mapa = {};
  pastasDisponiveis.forEach((p, i) => {
    const index = i + 1;
    mensagem += `${index} - ${p.nome}\n`;
    mapa[index] = p;
  });

  const resp = ui.prompt(
    "Trocar Pasta de Fotos",
    mensagem,
    ui.ButtonSet.OK_CANCEL,
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const numero = Number(resp.getResponseText());
  const escolhida = mapa[numero];

  if (!escolhida) {
    ui.alert("❌ Opção inválida.");
    return;
  }

  persistirContextoAtual_({
    localidadeAtivaId: escolhida.id,
    localidadeAtivaNome: escolhida.nome,
  });

  // ✨ NOVIDADE: Reconstrói a legenda após a criação do contexto
  if (contexto) {
    atualizarLegendasPlanilhaAdmin_(contexto);
  }

  const abrir = ui.alert(
    `✅ Pasta ativa definida:\n\n${escolhida.nome}\n\nDeseja abrir a pasta agora?`,
    ui.ButtonSet.YES_NO,
  );

  if (abrir === ui.Button.YES) {
    abrirPastaNoNavegador_(escolhida.id);
  }
}

/**
 * ============================================================
 * ÁREA DE FOTOS — SINCRONIZAR LOCALIDADES COM DRIVE
 * ============================================================
 *
 * - Garante que contexto.localidades reflete exatamente
 *   as pastas existentes em pastaLocalidadesId
 * - Remove localidades deletadas
 * - Adiciona novas localidades
 * - NÃO altera cores existentes
 * - Persiste via atualizarContextoAdmin_
 *
 * @param {Object} contexto
 * @return {Object} contexto atualizado
 */
function sincronizarLocalidadesContexto_(contexto) {
  if (!contexto || !contexto.pastaLocalidadesId) {
    return contexto || {};
  }

  const pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);
  const it = pastaRaiz.getFolders();

  const pastasDrive = [];
  const mapaDrive = {};

  while (it.hasNext()) {
    const pasta = it.next();
    const obj = {
      id: pasta.getId(),
      nome: pasta.getName(),
    };
    pastasDrive.push(obj);
    mapaDrive[obj.id] = obj;
  }

  const localidadesContexto = Array.isArray(contexto.localidades)
    ? contexto.localidades
    : [];

  const mapaContexto = {};
  localidadesContexto.forEach((loc) => {
    if (loc && loc.id) {
      mapaContexto[loc.id] = loc;
    }
  });

  const localidadesAtualizadas = [];

  // 1️⃣ Manter somente as que ainda existem no Drive
  localidadesContexto.forEach((loc) => {
    if (mapaDrive[loc.id]) {
      localidadesAtualizadas.push(loc);
    }
  });

  // 2️⃣ Adicionar novas que não existem no contexto
  pastasDrive.forEach((pasta) => {
    if (!mapaContexto[pasta.id]) {
      localidadesAtualizadas.push({
        id: pasta.id,
        nome: pasta.nome,
        criadaEm: new Date().toISOString(),
      });
    }
  });

  // 3️⃣ Se nada mudou, retorna direto
  const mudou =
    JSON.stringify(localidadesAtualizadas.map((l) => l.id).sort()) !==
    JSON.stringify(localidadesContexto.map((l) => l.id).sort());

  if (!mudou) {
    return contexto;
  }

  // 4️⃣ Persistir atualização
  atualizarContextoAdmin_({
    localidades: localidadesAtualizadas,
  });

  return obterContextoAtivo_();
}
