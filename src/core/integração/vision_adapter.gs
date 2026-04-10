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
 * @param {Object} contexto
 * @returns {Object} contextoVision
 */
function montarContextoVision_(contexto) {

  if (!contexto) {
    throw new Error('Contexto do Inventário ausente.');
  }

  const pastaId = contexto.localidadeAtivaId;
  const pastaNome = contexto.localidadeAtivaNome;

  if (!pastaId || !pastaNome) {
    throw new Error('Localidade ativa não definida.');
  }

  if (!contexto.planilhaAdminId) {
    throw new Error('Planilha Admin não configurada.');
  }

  // 🔥 FONTE ÚNICA — SISTEMA GLOBAL
  const planilhaGeralId = resolverPlanilhaGeralId_();

  if (!planilhaGeralId) {
    throw new Error('Planilha Geral ainda não foi criada.');
  }

  // 🔹 Resolver cor oficial da pasta
  const pastas = obterPastasVivas_(contexto);
  const pastaAtiva = pastas.find(p => p.id === pastaId);
  const corPastaAtiva = normalizarCorHexLocalidades_(pastaAtiva && pastaAtiva.cor);

  if (!pastaAtiva || !corPastaAtiva) {
    throw new Error('Não foi possível determinar a cor da pasta ativa.');
  }

  if (typeof corEhDaPaletaFixa_ === 'function' && !corEhDaPaletaFixa_(corPastaAtiva)) {
    throw new Error('A pasta ativa possui cor fora da paleta oficial de 8 cores.');
  }

  // 🔍 LOG DE VERIFICAÇÃO FINAL
  Logger.log('================ CONTEXTO VISION =================');
  Logger.log('planilhaContextoId: ' + contexto.planilhaAdminId);
  Logger.log('planilhaGeralId: ' + planilhaGeralId);
  Logger.log('pastaTrabalhoId: ' + pastaId);
  Logger.log('pastaTrabalhoNome: ' + pastaNome);
  Logger.log('corDestaque: ' + corPastaAtiva);
  Logger.log('===================================================');

  return {
    planilhaContextoId: contexto.planilhaAdminId,
    planilhaGeralId: planilhaGeralId,
    corDestaque: corPastaAtiva,
    ABA_CONTROLE: '__CONTROLE_PROCESSAMENTO__',

    // Adapter legado da Vision
    pastaTrabalhoId: pastaId,
    pastaTrabalhoNome: pastaNome
  };
}
