/**
 * ============================================================
 * ÁREA DE FOTOS — TROCAR PASTA ATIVA (DOMÍNIO)
 * ============================================================
 *
 * ✔ Compatível com ADMIN e CLIENTE
 * ✔ Baseado em obterContextoDominio_()
 * ✔ Persistência centralizada em aplicarLocalidadeAtiva_
 */
function trocarPastaFotos_() {

  const ui = SpreadsheetApp.getUi();
  let contexto = obterContextoDominio_();

  if (!contexto) {
    ui.alert("❌ Nenhum contexto ativo.");
    return;
  }

  contexto = sincronizarLocalidadeAtiva_(contexto);

  if (!contexto.pastaLocalidadesId) {
    ui.alert("❌ Contexto inválido.");
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

  // ============================================================
  // UI
  // ============================================================

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
  // 🔥 REGRA CENTRAL
  // ============================================================

  aplicarLocalidadeAtiva_(contexto, {
    id: escolhida.id,
    nome: escolhida.nome,
  });

  // ============================================================
  // Abrir?
  // ============================================================

  const abrir = ui.alert(
    `✅ Pasta ativa definida:\n\n${escolhida.nome}\n\nDeseja abrir a pasta agora?`,
    ui.ButtonSet.YES_NO
  );

  if (abrir === ui.Button.YES) {
    abrirPastaNoNavegador_(escolhida.id);
  }
}