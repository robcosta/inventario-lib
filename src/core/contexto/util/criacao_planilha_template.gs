/**
 * ============================================================
 * CONTEXTO — FÁBRICA DE PLANILHAS (CLIENTE / RELATÓRIOS)
 * ============================================================
 *
 * Responsável por:
 * - Garantir existência de templates
 * - Criar planilhas de contexto a partir de template
 * - Manter padrão estrutural
 */

/**
 * Retorna nome padrão do template por tipo.
 */
function obterNomeTemplatePorTipo_(tipo) {
  if (tipo === 'CLIENTE') return 'CLIENTE: TEMPLATE';
  if (tipo === 'RELATORIO') return 'RELATÓRIOS: TEMPLATE';
  throw new Error('Tipo de planilha desconhecido: ' + tipo);
}

/**
 * Retorna nome padrão da planilha de contexto por tipo.
 */
function obterNomePlanilhaContexto_(tipo, nomeContexto) {
  if (tipo === 'CLIENTE') return 'CLIENTE: ' + nomeContexto;
  if (tipo === 'RELATORIO') return 'RELATÓRIOS: ' + nomeContexto;
  throw new Error('Tipo de planilha desconhecido: ' + tipo);
}

/**
 * Garante que o template exista.
 * Se não existir, cria automaticamente.
 */
function garantirTemplatePlanilha_(tipo) {

  const raiz = obterPastaInventario_();
  if (!raiz) {
    throw new Error('Pasta raiz do Inventário não encontrada.');
  }

  const pastaTemplates = obterOuCriarSubpasta_(raiz, 'TEMPLATES');

  const nomeTemplate = obterNomeTemplatePorTipo_(tipo);
  const arquivos = pastaTemplates.getFilesByName(nomeTemplate);

  if (arquivos.hasNext()) {
    return arquivos.next();
  }

  // Template não existe → criar automaticamente
  const ssNova = SpreadsheetApp.create(nomeTemplate);
  const fileNovo = DriveApp.getFileById(ssNova.getId());

  fileNovo.moveTo(pastaTemplates);

  return fileNovo;
}

/**
 * Cria planilha do contexto a partir do template.
 */
function criarPlanilhaContextoPorTemplate_(tipo, nomeContexto, pastaDestino) {

  const templateFile = garantirTemplatePlanilha_(tipo);

  const nomeFinal = obterNomePlanilhaContexto_(tipo, nomeContexto);

  const novaFile = templateFile.makeCopy(nomeFinal, pastaDestino);

  return novaFile;
}