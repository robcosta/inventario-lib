/**
 * ============================================================
 * RESOLVE ID DA PLANILHA GERAL (DINÂMICO)
 * ============================================================
 * - Sempre busca no contexto ADMIN
 * - Cliente não armazena mais o ID
 * ============================================================
 */
function resolverPlanilhaGeralId_() {

  const sistemaGlobal = obterSistemaGlobal_();

  if (!sistemaGlobal.planilhaGeralId) {
    throw new Error('Planilha Geral ainda não foi criada.');
  }

  return sistemaGlobal.planilhaGeralId;
}


