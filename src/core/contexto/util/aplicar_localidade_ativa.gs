/**
 * ============================================================
 * APLICA LOCALIDADE ATIVA (DOMÍNIO CENTRAL)
 * ============================================================
 *
 * ✔ Atualiza contexto conforme tipo
 * ✔ Aplica efeitos colaterais corretos
 * ✔ Evita duplicação estrutural
 */
function aplicarLocalidadeAtiva_(ctx, novaLocalidade) {

  if (!ctx) {
    throw new Error("Contexto inválido.");
  }

  const tipo = ctx.tipo;
  const contexto = ctx;

  const atualizacoes = {
    localidadeAtivaId: novaLocalidade.id,
    localidadeAtivaNome: novaLocalidade.nome
  };

  if (tipo === 'ADMIN') {

    const contextoAtualizado = atualizarContextoAdmin_(atualizacoes);
    atualizarLegendasPlanilhaAdmin_(contextoAtualizado);
    return contextoAtualizado;

  } else if (tipo === 'CLIENTE') {

    const contextoAtualizado = atualizarContextoCliente_(atualizacoes);
    clienteMontarInformacoes_(contextoAtualizado, true);
    return contextoAtualizado;

  } else {

    throw new Error("Tipo de contexto desconhecido.");
  }
}
