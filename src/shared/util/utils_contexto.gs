/**
 * ============================================================
 * CONTEXTO — UTILITÁRIOS
 * ============================================================
 */

function planilhaTemContexto_() {
  return !!PropertiesService
    .getDocumentProperties()
    .getProperty('ADMIN_CONTEXTO_ATIVO');
}

function _admin_gravarContextoAdmin(nome) {
  PropertiesService.getDocumentProperties().setProperty(
    'ADMIN_CONTEXTO_ATIVO',
    JSON.stringify({ nome, criadoEm: new Date().toISOString() })
  );
}

function listarContextos_() {
  Logger.log('[CONTEXTO][ADMIN] listarContextoTrabalho - INÍCIO');
  const raiz = obterPastaInventario_();
  if (!raiz) return [];

  const planilhas = raiz.getFoldersByName('PLANILHAS');
  if (!planilhas.hasNext()) return [];

  const contextos = planilhas.next().getFoldersByName('CONTEXTOS');
  if (!contextos.hasNext()) return [];

  const it = contextos.next().getFolders();
  const lista = [];

  while (it.hasNext()) {
    const pasta = it.next();
    lista.push({
      nome: pasta.getName(),
      pastaId: pasta.getId()
    });
  }

  return lista;
}

function contextoComNomeExiste_(nomeContexto) {
  const raiz = obterPastaInventario_();
  if (!raiz) return false;

  const planilhas = raiz.getFoldersByName('PLANILHAS');
  if (!planilhas.hasNext()) return false;

  const contextos = planilhas.next().getFoldersByName('CONTEXTOS');
  if (!contextos.hasNext()) return false;

  return contextos.next().getFoldersByName(nomeContexto).hasNext();
}
