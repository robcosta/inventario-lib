/**
 * ============================================================
 * CONTEXTO — ATUALIZAR CONTEXTO ATIVO
 * ============================================================
 *
 * Responsabilidade:
 * - Atualizar parcialmente o contexto ativo
 * - Persistir as alterações
 *
 * Regras:
 * - Mantém propriedades existentes
 * - Atualiza apenas os campos fornecidos
 * - Falha se não houver contexto ativo
 *
 * NÃO faz:
 * - Validação de negócio
 * - UI
 * - Criação de contexto
 *
 * @param {Object} patch
 *   Objeto com os campos a serem atualizados
 */
function atualizarContexto_(patch) {

  if (!patch || typeof patch !== 'object') {
    throw new Error('Patch de contexto inválido.');
  }

  const contexto = obterContextoAtivo_();

  if (!contexto) {
    throw new Error('Nenhum contexto ativo para atualizar.');
  }

  // Merge controlado
  Object.keys(patch).forEach(chave => {
    contexto[chave] = patch[chave];
  });

  salvarContextoAtivo_(contexto);
}
