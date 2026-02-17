/**
 * ============================================================
 * ÁREA DE FOTOS — CRIAR NOVA PASTA (UNIFICADO ADMIN + CLIENTE)
 * ============================================================
 *
 * ✔ Compatível com ADMIN e CLIENTE
 * ✔ ID-based
 * ✔ Limite máximo de 8 pastas (cores exclusivas)
 * ✔ Atualiza contexto correto automaticamente
 */

function criarNovaPastaFotos_() {

  const ui = SpreadsheetApp.getUi();
  const contexto = resolverContextoAtual_();

  if (!contexto || !contexto.pastaLocalidadesId) {
    ui.alert("❌ Nenhum contexto válido encontrado.");
    return;
  }

  const pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);

  // ============================================================
  // 1️⃣ Verificar limite de 8 pastas
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
      "Cada contexto permite no máximo 8 localidades, pois cada uma possui uma cor exclusiva.",
      ui.ButtonSet.OK
    );
    return;
  }

  // ============================================================
  // 2️⃣ Listar pastas existentes
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

  const planilhaAtualId = SpreadsheetApp.getActiveSpreadsheet().getId();

  // ============================================================
  // 5️⃣ Atualizar contexto correto
  // ============================================================

  if (planilhaAtualId === contexto.planilhaAdminId) {

    atualizarContextoAdmin_({
      localidadeAtivaId: novaPasta.getId(),
      localidadeAtivaNome: nome
    });

    atualizarLegendasPlanilhaAdmin_(contexto);

  } else if (planilhaAtualId === contexto.planilhaClienteId) {

    atualizarContextoCliente_({
      localidadeAtivaId: novaPasta.getId(),
      localidadeAtivaNome: nome
    });

  } else {

    ui.alert("⚠️ Não foi possível determinar o tipo da planilha atual.");
    return;
  }

  // ============================================================
  // 6️⃣ Abrir?
  // ============================================================

  const abrir = ui.alert(
    `✅ Pasta criada e definida como ativa:\n\n${nome}\n\nDeseja abrir a pasta agora?`,
    ui.ButtonSet.YES_NO
  );

  if (abrir === ui.Button.YES) {
    abrirPastaNoNavegador_(novaPasta.getId());
  }
}
