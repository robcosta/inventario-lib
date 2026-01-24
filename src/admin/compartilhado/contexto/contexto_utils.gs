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

function gravarContextoAdmin_(nome) {
  PropertiesService.getDocumentProperties().setProperty(
    'ADMIN_CONTEXTO_ATIVO',
    JSON.stringify({ nome, criadoEm: new Date().toISOString() })
  );
}

function listarContextos_() {

  const raiz = obterPastaInventario_();
  if (!raiz) return [];

  const planilhas = raiz.getFoldersByName('PLANILHAS');
  if (!planilhas.hasNext()) return [];

  const contextos = planilhas.next().getFoldersByName('CONTEXTOS');
  if (!contextos.hasNext()) return [];

  const it = contextos.next().getFolders();
  const lista = [];

  while (it.hasNext()) {
    const pastaContexto = it.next();

    // 🔎 procura a planilha operacional dentro da pasta
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


function contextoComNomeExiste_(nomeContexto) {
  const raiz = obterPastaInventario_();
  if (!raiz) return false;

  const planilhas = raiz.getFoldersByName('PLANILHAS');
  if (!planilhas.hasNext()) return false;

  const contextos = planilhas.next().getFoldersByName('CONTEXTOS');
  if (!contextos.hasNext()) return false;

  return contextos.next().getFoldersByName(nomeContexto).hasNext();
}

function obterContextoAtivo_() {
  const raw = PropertiesService
    .getDocumentProperties()
    .getProperty('ADMIN_CONTEXTO_ATIVO');

  return raw ? JSON.parse(raw) : null;
}


