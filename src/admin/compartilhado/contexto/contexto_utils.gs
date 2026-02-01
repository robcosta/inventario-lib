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
  const docProps = PropertiesService.getDocumentProperties();
  const rawDoc = docProps.getProperty('ADMIN_CONTEXTO_ATIVO');

  try {
    if (rawDoc) {
      const contextoDoc = JSON.parse(rawDoc);
      const planilhaAtivaId = SpreadsheetApp.getActiveSpreadsheet().getId();

      if (
        contextoDoc &&
        (contextoDoc.planilhaOperacionalId === planilhaAtivaId ||
          contextoDoc.planilhaClienteId === planilhaAtivaId)
      ) {
        return contextoDoc;
      }

      // Contexto não pertence a esta planilha (ex.: template/copias)
      docProps.deleteProperty('ADMIN_CONTEXTO_ATIVO');
      return {};
    }

    // Compatibilidade: migra contexto antigo salvo em ScriptProperties
    const scriptProps = PropertiesService.getScriptProperties();
    const rawScript = scriptProps.getProperty('CONTEXTO_ATIVO');
    if (!rawScript) {
      // Fallback para planilha cliente
      const rawClient = docProps.getProperty('CONTEXTO_TRABALHO');
      if (!rawClient) return {};

      const clientContexto = JSON.parse(rawClient);
      if (!clientContexto || !clientContexto.nome) return {};

      const lista = listarContextos_();
      const alvo = lista.find(c =>
        (c.nome || '').toUpperCase() === (clientContexto.nome || '').toUpperCase()
      );

      if (!alvo || !alvo.planilhaOperacionalId) return {};

      const contextoDerivado = {
        nome: clientContexto.nome,
        pastaUnidadeId: clientContexto.pastaUnidadeId,
        planilhaOperacionalId: alvo.planilhaOperacionalId,
        pastaContextoId: alvo.pastaId,
        planilhaClienteId: clientContexto.planilhaClienteId,
        emailAdmin: clientContexto.emailAdmin
      };

      salvarContextoAtivo_(contextoDerivado);
      return contextoDerivado;
    }

    const contextoScript = JSON.parse(rawScript);
    const planilhaAtivaId = SpreadsheetApp.getActiveSpreadsheet().getId();

    // Migra somente se o contexto for desta planilha
    if (contextoScript && contextoScript.planilhaOperacionalId === planilhaAtivaId) {
      docProps.setProperty('ADMIN_CONTEXTO_ATIVO', JSON.stringify(contextoScript));
      scriptProps.deleteProperty('CONTEXTO_ATIVO');
      return contextoScript;
    }

    return {};
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

  PropertiesService.getDocumentProperties().setProperty(
    'ADMIN_CONTEXTO_ATIVO', 
    JSON.stringify(contexto)
  );

  // Garante que não fique contexto legado no ScriptProperties
  PropertiesService.getScriptProperties().deleteProperty('CONTEXTO_ATIVO');
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