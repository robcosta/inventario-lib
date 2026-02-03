/**
 * ============================================================
 * CONTEXTO — UTILITÁRIOS (VERSÃO UNIFICADA E ROBUSTA)
 * ============================================================
 * * Centraliza a inteligência de memória do sistema.
 * Usa ScriptProperties para garantir que o Vision (Biblioteca)
 * e a Planilha (Admin) acessem os mesmos dados.
 */

/**
 * Retorna o objeto de contexto completo ou um objeto vazio se não existir.
 * Usa o novo gerenciador CONTEXTO_ADMIN
 */
function obterContextoAtivo_() {
  return obterContextoAdmin_() || {};
}

/**
 * Salva o objeto de contexto de forma centralizada.
 */
function salvarContextoAtivo_(contexto) {
  if (!contexto) return;
  salvarContextoAdmin_(contexto);
}

/**
 * Atualiza campos específicos do contexto sem apagar o que já existe.
 * Ex: salvarContextoAtivo_({ pastaTrabalhoId: '...' })
 */
function atualizarContexto__(novosDados) {
  const contextoAtual = obterContextoAtivo_();
  
  // Mescla os dados atuais com as novas informações (Spread Operator)
  const contextoMesclado = { ...contextoAtual, ...novosDados };
  
  salvarContextoAtivo_(contextoMesclado);
}

/**
 * Verifica se a planilha atual já possui um contexto configurado.
 */
function planilhaTemContexto_() {
  const contexto = obterContextoAtivo_();
  return !!(contexto && (contexto.id && contexto.nome && contexto.planilhaClienteId));
}

/**
 * Lista as pastas de contexto disponíveis no Drive para seleção.
 */
function listarContextos_() {
  const raiz = obterPastaInventario_();
  if (!raiz) return [];

  const pastasPlanilhas = raiz.getFoldersByName('PLANILHAS');
  if (!pastasPlanilhas.hasNext()) return [];

  const contextosFolder = pastasPlanilhas.next().getFoldersByName('CONTEXTOS');
  if (!contextosFolder.hasNext()) return [];

  const it = contextosFolder.next().getFolders();
  const lista = [];

  while (it.hasNext()) {
    const pastaContexto = it.next();
    const files = pastaContexto.getFilesByType(MimeType.GOOGLE_SHEETS);
    
    if (!files.hasNext()) continue;

    const planilha = files.next();
    lista.push({
      nome: pastaContexto.getName(),
      pastaId: pastaContexto.getId(),
      planilhaOperacionalId: planilha.getId()
    });
  }
  return lista;
}

/**
 * Verifica se um contexto com determinado nome já existe no Drive.
 */
function contextoComNomeExiste_(nomeContexto) {
  const raiz = obterPastaInventario_();
  if (!raiz) return false;

  const pastasPlanilhas = raiz.getFoldersByName('PLANILHAS');
  if (!pastasPlanilhas.hasNext()) return false;

  const contextosFolder = pastasPlanilhas.next().getFoldersByName('CONTEXTOS');
  if (!contextosFolder.hasNext()) return false;

  return contextosFolder.next().getFoldersByName(nomeContexto).hasNext();
}