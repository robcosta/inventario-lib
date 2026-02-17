/**
 * ============================================================
 * VISION ADAPTER — INVENTÁRIO
 * ============================================================
 * Responsabilidade:
 * - Adaptar modelo interno do Inventário
 * - Para o contrato esperado pela Vision
 *
 * ❗ Vision não conhece localidadeAtiva
 * ❗ Vision espera pastaTrabalhoId / Nome
 * ============================================================
 */

/**
 * Monta o objeto de contexto no formato esperado pela Vision.
 * @param {Object} contextoInventario
 * @returns {Object} contextoVision
 */
function montarContextoVision_(contextoInventario) {

  if (!contextoInventario) {
    throw new Error('Contexto do Inventário ausente.');
  }

  const pastaId = contextoInventario.localidadeAtivaId;
  const pastaNome = contextoInventario.localidadeAtivaNome;

  if (!pastaId || !pastaNome) {
    throw new Error('Localidade ativa não definida.');
  }

  if (!contextoInventario.planilhaAdminId ||
      !contextoInventario.planilhaGeralId) {
    throw new Error('Planilhas obrigatórias não configuradas.');
  }

  // 🔹 Resolver cor oficial da pasta
  const pastas = obterPastasVivas_(contextoInventario);
  const pastaAtiva = pastas.find(p => p.id === pastaId);

  if (!pastaAtiva || !pastaAtiva.cor) {
    throw new Error('Não foi possível determinar a cor da pasta ativa.');
  }

  // 🔥 CONTRATO OFICIAL DA VISION
  return {
    planilhaContextoId: contextoInventario.planilhaAdminId,
    planilhaGeralId: contextoInventario.planilhaGeralId,
    corDestaque: pastaAtiva.cor,
    ABA_CONTROLE: '__CONTROLE_PROCESSAMENTO__',

    // Adapter (modelo legado da Vision)
    pastaTrabalhoId: pastaId,
    pastaTrabalhoNome: pastaNome
  };
}
