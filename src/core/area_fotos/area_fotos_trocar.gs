/**
 * ============================================================
 * ÁREA DE FOTOS — TROCAR PASTA ATIVA (VERSÃO CLIENT SAFE)
 * ============================================================
 */

function trocarPastaFotos_() {

  const ui = SpreadsheetApp.getUi();
  const idAtual = SpreadsheetApp.getActiveSpreadsheet().getId();

  let contexto = resolverContextoAtual_();
  contexto = sincronizarLocalidadeAtiva_(contexto);

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
      '⚠️ Nenhuma pasta de fotos foi criada ainda.\n\nUse "Criar Nova Pasta" primeiro.'
    );
    return;
  }

  pastas.sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
  );

  const pastaAtivaId = contexto.localidadeAtivaId;
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
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const numero = Number(resp.getResponseText());
  const escolhida = mapa[numero];

  if (!escolhida) {
    ui.alert("❌ Opção inválida.");
    return;
  }

  // ============================================================
  // 🔥 PERSISTE NOVA PASTA
  // ============================================================

  persistirContextoAtual_({
    localidadeAtivaId: escolhida.id,
    localidadeAtivaNome: escolhida.nome,
  });

  // ============================================================
  // 🔄 Atualizar UI SOMENTE se estivermos na CLIENTE
  // ============================================================

  if (idAtual === contexto.planilhaClienteId) {
    try {
      const contextoAtualizado = resolverContextoAtual_();
      clienteMontarInformacoes_(contextoAtualizado, true);
    } catch (e) {
      Logger.log("[CLIENTE] Erro ao atualizar informações após troca de pasta.");
      Logger.log(e);
    }
  }

  const abrir = ui.alert(
    `✅ Pasta ativa definida:\n\n${escolhida.nome}\n\nDeseja abrir a pasta agora?`,
    ui.ButtonSet.YES_NO
  );

  if (abrir === ui.Button.YES) {
    abrirPastaNoNavegador_(escolhida.id);
  }
}
