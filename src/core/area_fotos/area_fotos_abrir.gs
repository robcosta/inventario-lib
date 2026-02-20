/**
 * ============================================================
 * ÁREA DE FOTOS — ABRIR PASTA ATUAL (DOMÍNIO)
 * ============================================================
 *
 * ✔ Compatível com ADMIN e CLIENTE
 * ✔ Baseado em obterContextoDominio_()
 * ✔ Sem wrapper tipado
 * ✔ Apenas valida e delega abertura
 */
function abrirPastaFotosAtual_() {

  const ui = SpreadsheetApp.getUi();
  let contexto = obterContextoDominio_();

  if (!contexto) {
    ui.alert("❌ Nenhum contexto ativo.");
    return;
  }

  // 🔄 Sincroniza localidade ativa
  contexto = sincronizarLocalidadeAtiva_(contexto);

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
    // Apenas valida se a pasta existe
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