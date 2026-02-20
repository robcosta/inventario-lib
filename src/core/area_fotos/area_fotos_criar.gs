/**
 * ============================================================
 * ÁREA DE FOTOS — CRIAR NOVA PASTA (DOMÍNIO)
 * ============================================================
 *
 * ✔ Compatível com ADMIN e CLIENTE
 * ✔ Baseado em obterContextoDominio_()
 * ✔ Regra centralizada em aplicarLocalidadeAtiva_
 */
function criarNovaPastaFotos_() {

  const ui = SpreadsheetApp.getUi();
  let contexto = obterContextoDominio_();

  if (!contexto) {
    ui.alert("❌ Nenhum contexto ativo.");
    return;
  }

  if (!contexto.pastaLocalidadesId) {
    ui.alert("❌ Contexto inválido.");
    return;
  }

  const pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);

  // ============================================================
  // 1️⃣ Limite máximo
  // ============================================================

  let contador = 0;
  const itContador = pastaRaiz.getFolders();

  while (itContador.hasNext()) {
    itContador.next();
    contador++;
  }

  if (contador >= CORES_DESTAQUE_LISTA.length) {
    ui.alert(
      "⚠️ Limite de Pastas Atingido",
      "Este contexto já possui 8 pastas.\n\n" +
      "Cada contexto permite no máximo 8 localidades.",
      ui.ButtonSet.OK
    );
    return;
  }

  // ============================================================
  // 2️⃣ Listar existentes
  // ============================================================

  const it = pastaRaiz.getFolders();
  const nomesExistentes = [];

  while (it.hasNext()) {
    nomesExistentes.push(it.next().getName().toUpperCase());
  }

  nomesExistentes.sort();

  // ============================================================
  // 3️⃣ UI
  // ============================================================

  let mensagem = "";

  if (contexto.localidadeAtivaNome) {
    mensagem += `Pasta ativa: ${contexto.localidadeAtivaNome}\n\n`;
  }

  if (nomesExistentes.length > 0) {
    mensagem += "Pastas existentes:\n";
    mensagem += nomesExistentes.map(n => "• " + n).join("\n");
    mensagem += "\n\n";
  } else {
    mensagem += "Nenhuma pasta criada ainda.\n\n";
  }

  mensagem += "Digite o nome da nova pasta:";

  const resp = ui.prompt(
    "Criar Nova Pasta de Fotos",
    mensagem,
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const nome = (resp.getResponseText() || "").trim().toUpperCase();

  if (!nome) {
    ui.alert("❌ Nome inválido.");
    return;
  }

  if (nomesExistentes.includes(nome)) {
    ui.alert("❌ Já existe uma pasta com esse nome.");
    return;
  }

  // ============================================================
  // 4️⃣ Criar pasta
  // ============================================================

  const novaPasta = pastaRaiz.createFolder(nome);

  // 🔥 REGRA CENTRAL (AGORA DOMÍNIO)
  aplicarLocalidadeAtiva_(contexto, {
    id: novaPasta.getId(),
    nome: nome
  });

  // ============================================================
  // 5️⃣ Abrir?
  // ============================================================

  const abrir = ui.alert(
    `✅ Pasta criada e definida como ativa:\n\n${nome}\n\nDeseja abrir a pasta agora?`,
    ui.ButtonSet.YES_NO
  );

  if (abrir === ui.Button.YES) {
    abrirPastaNoNavegador_(novaPasta.getId());
  }
}