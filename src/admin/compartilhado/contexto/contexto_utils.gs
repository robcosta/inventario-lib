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
 */
function obterContextoAtivo_() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('CONTEXTO_ATIVO');
  
  try {
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Erro ao ler JSON do contexto: " + e.message);
    return {};
  }
}

/**
 * Salva o objeto de contexto de forma centralizada.
 */
function salvarContextoAtivo_(contexto) {
  if (!contexto) return;
  
  PropertiesService.getScriptProperties().setProperty(
    'CONTEXTO_ATIVO', 
    JSON.stringify(contexto)
  );
}

/**
 * Atualiza campos específicos do contexto sem apagar o que já existe.
 * Ex: salvarContextoAtivo_({ pastaTrabalhoId: '...' })
 */
function atualizarContexto_(novosDados) {
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
  return !!(contexto && contexto.planilhaOperacionalId);
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