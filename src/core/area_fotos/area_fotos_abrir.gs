/**
 * ============================================================
 * ÁREA DE FOTOS — ABRIR PASTA ATUAL
 * ============================================================
 *
 * Abre a pasta ativa do contexto em nova aba.
 * Exibe o nome da pasta no modal.
 */

function abrirPastaFotosAtual_() {
  const ui = SpreadsheetApp.getUi();
  let contexto = resolverContextoAtual_();
  contexto = sincronizarLocalidadeAtiva_(contexto);

  if (!contexto || !contexto.pastaLocalidadesId) {
    ui.alert("❌ Nenhum contexto válido encontrado.");
    return;
  }

  if (!contexto.localidadeAtivaId) {
    ui.alert(
      "⚠️ Nenhuma pasta ativa.\n\n" +
        'Use "Trocar Pasta" ou "Criar Nova Pasta" primeiro.',
    );
    return;
  }

  try {
    // Apenas valida se existe
    DriveApp.getFolderById(contexto.localidadeAtivaId);
  } catch (e) {
    ui.alert(
      "❌ A pasta ativa não foi encontrada no Drive.\n\n" +
        "Selecione outra pasta.",
    );
    return;
  }

  // ✨ NOVIDADE: Reconstrói a legenda após a criação do contexto
  //if (contexto) {
  //  atualizarLegendasPlanilhaAdmin_(contexto);
  }
  // 🔥 Agora chama a versão nova que mostra o nome
  abrirPastaNoNavegador_(contexto.localidadeAtivaId);
}
