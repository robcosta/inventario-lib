function clientAtualizarInformacoes_() {

  const ui = SpreadsheetApp.getUi();

  // 1️⃣ Revalidar contexto
  let contexto = obterContextoCliente_();

  if (!contexto || !contextoClienteValido_(contexto)) {

    contexto = descobrirContextoClienteAutomaticamente_();

    if (!contexto) {
      ui.alert('❌ Não foi possível reconstruir o contexto.');
      return;
    }

    salvarContextoCliente_(contexto);
  }

  // 2️⃣ Atualizar informações visuais
  clienteMontarInformacoes_(contexto);

  // 3️⃣ Re-renderizar menu
  renderMenuClient_(contexto);

  toast_('✅ Contexto atualizado.', 'Inventário Cliente', 3);
}
