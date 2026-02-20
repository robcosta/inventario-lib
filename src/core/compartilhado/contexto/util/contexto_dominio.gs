/**
 * ============================================================
 * CONTEXTO DOMÍNIO — MODELO NORMALIZADO DO SISTEMA
 * ============================================================
 *
 * Responsabilidade:
 * - Unificar ADMIN e CLIENTE em um único contrato
 * - Remover dependência de estrutura interna
 * - Fornecer formato estável para todo o sistema
 */

function obterContextoDominio_() {

  const wrapper = resolverContextoAtual_();

  if (!wrapper || !wrapper.dados) {
    return null;
  }

  const dados = wrapper.dados;

  return {
    tipo: wrapper.tipo,
    origem: wrapper.origem,

    // Identidade
    nome: dados.nome || null,

    // Planilhas
    planilhaAdminId: dados.planilhaAdminId || null,
    planilhaClienteId: dados.planilhaClienteId || null,
    planilhaGeralId: obterPlanilhaGeralId_(),

    // Estrutura
    pastaContextoId: dados.pastaContextoId || null,
    pastaLocalidadesId: dados.pastaLocalidadesId || null,

    // Localidade ativa
    localidadeAtivaId: dados.localidadeAtivaId || null,
    localidadeAtivaNome: dados.localidadeAtivaNome || null
  };
}