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

  const limiteLocalidades = (typeof LIMITE_MAX_LOCALIDADES_CONTEXTO === 'number' && LIMITE_MAX_LOCALIDADES_CONTEXTO > 0)
    ? LIMITE_MAX_LOCALIDADES_CONTEXTO
    : 8;

  if (contador >= limiteLocalidades) {
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

  // ============================================================
  // 3.1️⃣ Unicidade global (todos os contextos)
  // ============================================================

  const conflitoGlobal = buscarConflitoNomeLocalidadeGlobal_(nome);
  if (conflitoGlobal) {
    ui.alert(
      "❌ Nome já utilizado",
      `A pasta "${nome}" já foi criada no contexto:\n\n` +
      `"${conflitoGlobal.nomeContexto}"\n\n` +
      "Escolha outro nome para manter a unicidade global das localidades.",
      ui.ButtonSet.OK
    );
    return;
  }

  if (nomesExistentes.includes(nome)) {
    ui.alert("❌ Já existe uma pasta com esse nome.");
    return;
  }

  // ============================================================
  // 4️⃣ Criar pasta
  // ============================================================

  // ADMIN cria direto; CLIENTE apenas enfileira para o ADMIN criar
  if (contexto.tipo === 'CLIENTE') {
    try {
      const req = enfileirarCriacaoPastaPorCliente_(contexto, nome);
      ui.alert(
        "📨 Pedido enviado ao ADMIN",
        `A criação da pasta "${nome}" foi solicitada.\n\n` +
        `Request: #${req.requestId}\n` +
        "Quando o ADMIN processar a fila, a pasta será criada por ele.\n\n" +
        "Após criada, sincronize as informações e prossiga normalmente.",
        ui.ButtonSet.OK
      );
      return;
    } catch (e) {
      ui.alert("❌ Não foi possível solicitar a criação ao ADMIN.\n\n" + e.message);
      return;
    }
  }

  const novaPasta = pastaRaiz.createFolder(nome);

  // 🔥 REGRA CENTRAL (AGORA DOMÍNIO)
  const contextoAtualizado = aplicarLocalidadeAtiva_(contexto, {
    id: novaPasta.getId(),
    nome: nome
  });

  // ============================================================
  // 5️⃣ Abrir?
  // ============================================================

  let mensagemFinal = `✅ Pasta criada e definida como ativa:\n\n${nome}`;

  mensagemFinal += '\n\nDeseja abrir a pasta agora?';

  const abrir = ui.alert(
    mensagemFinal,
    ui.ButtonSet.YES_NO
  );

  if (abrir === ui.Button.YES) {
    abrirPastaNoNavegador_(novaPasta.getId());
  }
}

function buscarConflitoNomeLocalidadeGlobal_(nomeLocalidade) {
  const alvo = normalizarNomeLocalidadeGlobal_(nomeLocalidade);
  if (!alvo) return null;

  const pastaContextos = obterPastaContextosGlobal_();
  if (!pastaContextos) return null;

  const itContextos = pastaContextos.getFolders();

  while (itContextos.hasNext()) {
    const pastaContexto = itContextos.next();
    const nomeContexto = pastaContexto.getName();

    let itLocalidades;
    try {
      itLocalidades = pastaContexto.getFoldersByName('LOCALIDADES');
    } catch (e) {
      continue;
    }

    while (itLocalidades.hasNext()) {
      const pastaLocalidades = itLocalidades.next();
      let itPastas;

      try {
        itPastas = pastaLocalidades.getFolders();
      } catch (e) {
        continue;
      }

      while (itPastas.hasNext()) {
        const pasta = itPastas.next();
        const nomePasta = normalizarNomeLocalidadeGlobal_(pasta.getName());
        if (nomePasta === alvo) {
          return {
            nomeContexto: nomeContexto,
            pastaId: pasta.getId()
          };
        }
      }
    }
  }

  return null;
}

function obterPastaContextosGlobal_() {
  // 1) Prioridade para o ID global da pasta CONTEXTOS.
  try {
    const sistemaGlobal = obterSistemaGlobal_();
    if (sistemaGlobal && sistemaGlobal.pastaContextoId) {
      return DriveApp.getFolderById(sistemaGlobal.pastaContextoId);
    }
  } catch (e) {}

  // 2) Fallback pela pasta raiz do inventário.
  try {
    const raiz = obterPastaInventario_();
    if (!raiz) return null;
    const it = raiz.getFoldersByName('CONTEXTOS');
    return it.hasNext() ? it.next() : null;
  } catch (e) {
    return null;
  }
}

function normalizarNomeLocalidadeGlobal_(nome) {
  return String(nome || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}
