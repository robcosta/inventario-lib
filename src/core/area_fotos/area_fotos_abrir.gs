/**
 * ============================================================
 * ÁREA DE FOTOS — ABRIR PASTA ATUAL (TIPADO)
 * ============================================================
 *
 * ✔ Compatível com ADMIN e CLIENTE
 * ✔ Baseado em resolverContextoAtual_() tipado
 * ✔ Não usa heurística por ID ativo
 * ✔ Apenas valida e delega abertura
 */

function abrirPastaFotosAtual_() {

  const ui = SpreadsheetApp.getUi();
  const ctx = resolverContextoAtual_();

  if (!ctx) {
    ui.alert("❌ Nenhum contexto válido encontrado.");
    return;
  }

  const { dados: contextoOriginal } = ctx;

  // 🔄 Sincroniza domínio
  const contexto = sincronizarLocalidadeAtiva_(contextoOriginal);

  if (!contexto.pastaLocalidadesId) {
    ui.alert("❌ Contexto inválido.");
    return;
  }

  if (!contexto.localidadeAtivaId) {
    ui.alert(
      "⚠️ Nenhuma pasta ativa.\n\n" +
      'Use "Trocar Pasta" ou "Criar Nova Pasta" primeiro.'
    );
    return;
  }

  try {
    // Apenas valida se existe
    DriveApp.getFolderById(contexto.localidadeAtivaId);
  } catch (e) {
    ui.alert(
      "❌ A pasta ativa não foi encontrada no Drive.\n\n" +
      "Selecione outra pasta."
    );
    return;
  }

  // 🚀 Delegação final
  abrirPastaNoNavegador_(contexto.localidadeAtivaId);
}
