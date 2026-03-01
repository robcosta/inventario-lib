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
 * Aplica estrutura/formatação inicial na template recem-criada.
 */
function formatarTemplatePorTipo_(tipo, ssTemplate) {
  if (tipo === 'CLIENTE') {
    renderizarPlanilhaCliente_(
      {
        nome: 'TEMPLATE',
        localidadeAtivaNome: '-',
        planilhaClienteId: ssTemplate.getId()
      },
      ssTemplate
    );
    return;
  }

  if (tipo === 'RELATORIO') {
    renderizarPlanilhaRelatorio_(
      { nome: 'TEMPLATE' },
      ssTemplate
    );
    return;
  }

  throw new Error('Tipo de planilha desconhecido: ' + tipo);
}

/**
 * Garante template e retorna status (existente/criada).
 */
function garantirTemplatePlanilhaComStatus_(tipo) {

  const raiz = obterPastaInventario_();
  if (!raiz) {
    throw new Error('Pasta raiz do Inventário não encontrada.');
  }

  const pastaTemplates = obterOuCriarSubpasta_(raiz, 'TEMPLATES');

  const nomeTemplate = obterNomeTemplatePorTipo_(tipo);
  const arquivos = pastaTemplates.getFilesByName(nomeTemplate);

  if (arquivos.hasNext()) {
    return {
      file: arquivos.next(),
      criada: false
    };
  }

  const ssNova = SpreadsheetApp.create(nomeTemplate);
  const fileNovo = DriveApp.getFileById(ssNova.getId());

  formatarTemplatePorTipo_(tipo, ssNova);
  fileNovo.moveTo(pastaTemplates);

  return {
    file: fileNovo,
    criada: true
  };
}

/**
 * Garante que o template exista.
 * Se não existir, cria automaticamente.
 */
function garantirTemplatePlanilha_(tipo) {
  return garantirTemplatePlanilhaComStatus_(tipo).file;
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