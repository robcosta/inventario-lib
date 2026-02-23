function persistirContextoAtual_(atualizacoes) {

  Logger.log('[CTX] Iniciando persistência unificada...');
  Logger.log('[CTX] Atualizações recebidas: ' + JSON.stringify(atualizacoes));

  if (!atualizacoes || typeof atualizacoes !== 'object') {
    throw new Error('persistirContextoAtual_: atualizações inválidas.');
  }

  // 🔵 ADMIN
  if (contextoAdminRegistrado_()) {
    Logger.log('[CTX] Detectado modo ADMIN.');
    atualizarContextoAdmin_(atualizacoes);
    Logger.log('[CTX] Atualização ADMIN concluída.');
    return;
  }

  // 🟢 CLIENTE
  const contextoCliente = obterContextoDominio_();
  if (contextoCliente && contextoClienteValido_(contextoCliente)) {
    Logger.log('[CTX] Detectado modo CLIENTE.');
    Logger.log('[CTX] Contexto atual CLIENTE antes do patch: ' + JSON.stringify(contextoCliente));

    const atualizado = atualizarContextoCliente_(atualizacoes);

    Logger.log('[CTX] Contexto CLIENTE após patch: ' + JSON.stringify(atualizado));
    Logger.log('[CTX] Atualização CLIENTE concluída.');
    return;
  }

  Logger.log('[CTX] Nenhum contexto válido detectado.');
  throw new Error('Nenhum contexto ativo para atualizar.');
}
