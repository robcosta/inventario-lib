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

  const { tipo, dados: contexto } = ctx;

  const atualizacoes = {
    localidadeAtivaId: novaLocalidade.id,
    localidadeAtivaNome: novaLocalidade.nome
  };

  if (tipo === 'ADMIN') {

    atualizarContextoAdmin_(atualizacoes);
    atualizarLegendasPlanilhaAdmin_(contexto);

  } else if (tipo === 'CLIENTE') {

    const contextoAtualizado = atualizarContextoCliente_(atualizacoes);
    clienteMontarInformacoes_(contextoAtualizado, true);

  } else {

    throw new Error("Tipo de contexto desconhecido.");
  }
}
