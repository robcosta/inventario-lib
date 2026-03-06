/**
 * ============================================================
 * INSTALADOR - TEMPLATES EM OUTRO DRIVE (SEM CLASP)
 * ============================================================
 *
 * Copia os arquivos de template (ADMIN/CLIENTE/RELATORIO)
 * e toda a pasta _SISTEMA/_SISTEMAS para uma pasta de destino no Drive.
 *
 * Requisito: os templates de origem devem existir e conter
 * os scripts vinculados desejados.
 */
function instalarTemplatesOutroDrive_() {
  const ui = SpreadsheetApp.getUi();

  const respPasta = ui.prompt(
    'Instalar templates em outro Drive',
    'Informe o ID da pasta de destino no Drive:',
    ui.ButtonSet.OK_CANCEL
  );

  if (respPasta.getSelectedButton() !== ui.Button.OK) return;

  const pastaDestinoId = String(respPasta.getResponseText() || '').trim();
  if (!pastaDestinoId) {
    ui.alert('ID da pasta de destino nao informado.');
    return;
  }

  const respPrefixo = ui.prompt(
    'Prefixo opcional',
    'Informe um prefixo para os nomes (opcional):',
    ui.ButtonSet.OK_CANCEL
  );

  if (respPrefixo.getSelectedButton() !== ui.Button.OK) return;
  const prefixo = String(respPrefixo.getResponseText() || '').trim();

  let pastaDestino;
  try {
    pastaDestino = DriveApp.getFolderById(pastaDestinoId);
  } catch (e) {
    ui.alert('Nao foi possivel acessar a pasta de destino.\n\n' + e.message);
    return;
  }

  try {
    const raizOrigem = obterPastaRaizOrigemInstalador_();
    const origem = obterArquivosTemplateOrigem_(raizOrigem);

    const nomeAdmin = montarNomeTemplateDestino_('ADMIN: TEMPLATE', prefixo);
    const nomeCliente = montarNomeTemplateDestino_('CLIENTE: TEMPLATE', prefixo);
    const nomeRelatorio = montarNomeTemplateDestino_('RELATORIO: TEMPLATE', prefixo);

    const copiaAdmin = origem.admin.makeCopy(nomeAdmin, pastaDestino);
    const copiaCliente = origem.cliente.makeCopy(nomeCliente, pastaDestino);
    const copiaRelatorio = origem.relatorio.makeCopy(nomeRelatorio, pastaDestino);

    const pastaSistemasOrigem = obterPastaSistemasOrigem_(raizOrigem);
    const pastaSistemasDestino = copiarPastaRecursiva_(pastaSistemasOrigem, pastaDestino);
    const totalArquivosSistemas = contarArquivosRecursivos_(pastaSistemasDestino);

    if (totalArquivosSistemas === 0) {
      throw new Error(
        'A pasta de sistemas foi criada no destino, mas sem arquivos copiados. ' +
        'Verifique se a origem selecionada esta correta e se os arquivos de biblioteca estao dentro de _SISTEMA/_SISTEMAS.'
      );
    }

    const libsDetectadas = coletarBibliotecasAppsScript_(pastaSistemasDestino);

    const linhas = [
      'Instalacao concluida com sucesso.',
      '',
      'ADMIN: ' + copiaAdmin.getId(),
      'CLIENTE: ' + copiaCliente.getId(),
      'RELATORIO: ' + copiaRelatorio.getId(),
      '',
      'Pasta destino: ' + pastaDestino.getName(),
      '',
      '_SISTEMAS copiada:',
      '- Origem: ' + pastaSistemasOrigem.getId(),
      '- Destino: ' + pastaSistemasDestino.getId(),
      '- Arquivos copiados: ' + totalArquivosSistemas
    ];

    linhas.push('');
    linhas.push('Bibliotecas detectadas no destino:');
    linhas.push('- INVENTARIO: ' + (libsDetectadas.inventarioId || 'nao encontrado'));
    linhas.push('- VISION: ' + (libsDetectadas.visionId || 'nao encontrado'));
    linhas.push('');
    linhas.push('Importante: planilhas copiadas mantem IDs antigos de biblioteca.');
    linhas.push('No destino, abra cada TEMPLATE e atualize as bibliotecas em:');
    linhas.push('Apps Script > Libraries (Adicionar biblioteca).');

    ui.alert(linhas.join('\n'));
  } catch (e) {
    ui.alert('Falha na instalacao dos templates.\n\n' + e.message);
  }
}

function montarNomeTemplateDestino_(nomeBase, prefixo) {
  if (!prefixo) return nomeBase;
  return prefixo + ' ' + nomeBase;
}

function obterArquivosTemplateOrigem_(raizOrigem) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nomeAtual = String(ss.getName() || '').toUpperCase();

  const raiz = raizOrigem || obterPastaInventario_();
  if (!raiz) {
    throw new Error('Pasta raiz do Inventario nao encontrada.');
  }

  const pastaTemplates = obterOuCriarSubpasta_(raiz, 'TEMPLATES');

  let arquivoAdmin = null;
  if (nomeAtual.indexOf('ADMIN') !== -1 && nomeAtual.indexOf('TEMPLATE') !== -1) {
    arquivoAdmin = DriveApp.getFileById(ss.getId());
  } else {
    const itensAdmin = pastaTemplates.getFilesByName('ADMIN: TEMPLATE');
    if (itensAdmin.hasNext()) {
      arquivoAdmin = itensAdmin.next();
    }
  }

  if (!arquivoAdmin) {
    throw new Error('Template ADMIN de origem nao encontrado. Abra ADMIN: TEMPLATE ou coloque-o na pasta TEMPLATES.');
  }

  const arquivoCliente = obterArquivoTemplatePorNome_(pastaTemplates, [
    'CLIENTE: TEMPLATE'
  ]);

  const arquivoRelatorio = obterArquivoTemplatePorNome_(pastaTemplates, [
    'RELATORIO: TEMPLATE',
    'RELATORIOS: TEMPLATE',
    'RELATORIO: TEMPLATE',
    'RELATORIOS: TEMPLATE'
  ]);

  return {
    admin: arquivoAdmin,
    cliente: arquivoCliente,
    relatorio: arquivoRelatorio
  };
}

function obterPastaSistemasOrigem_(raizOrigem) {
  const raiz = raizOrigem || obterPastaInventario_();
  if (!raiz) {
    throw new Error('Pasta raiz do Inventario nao encontrada para localizar _SISTEMAS.');
  }

  const candidatas = ['_SISTEMAS', '_SISTEMA'];
  const encontradas = [];

  for (let i = 0; i < candidatas.length; i++) {
    const it = raiz.getFoldersByName(candidatas[i]);
    while (it.hasNext()) {
      encontradas.push(it.next());
    }
  }

  if (!encontradas.length) {
    throw new Error('Pasta _SISTEMAS de origem nao encontrada na raiz do Inventario.');
  }

  let melhor = encontradas[0];
  let melhorPontuacao = pontuacaoConteudoPasta_(melhor);

  for (let i = 1; i < encontradas.length; i++) {
    const atual = encontradas[i];
    const pontuacaoAtual = pontuacaoConteudoPasta_(atual);
    if (pontuacaoAtual > melhorPontuacao) {
      melhor = atual;
      melhorPontuacao = pontuacaoAtual;
    }
  }

  return melhor;
}

function obterPastaRaizOrigemInstalador_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) {
    try {
      const arquivoAtivo = DriveApp.getFileById(ss.getId());
      const pais = arquivoAtivo.getParents();

      while (pais.hasNext()) {
        const candidata = pais.next();
        if (raizPareceInventario_(candidata)) {
          return candidata;
        }
      }
    } catch (e) {
      Logger.log('[INSTALADOR][AVISO] Falha ao inferir raiz pela planilha ativa: ' + e.message);
    }
  }

  const raizConfigurada = obterPastaInventario_();
  if (raizConfigurada && raizPareceInventario_(raizConfigurada)) {
    return raizConfigurada;
  }

  if (raizConfigurada) return raizConfigurada;

  throw new Error('Nao foi possivel localizar a pasta raiz de origem do Inventario.');
}

function raizPareceInventario_(pasta) {
  if (!pasta) return false;
  try {
    const temTemplates = pasta.getFoldersByName('TEMPLATES').hasNext();
    const temSistemas = pasta.getFoldersByName('_SISTEMA').hasNext() || pasta.getFoldersByName('_SISTEMAS').hasNext();
    return temTemplates && temSistemas;
  } catch (e) {
    return false;
  }
}

function pontuacaoConteudoPasta_(pasta) {
  if (!pasta) return -1;

  let score = 0;
  try {
    const nome = String(pasta.getName() || '').toUpperCase();
    if (nome === '_SISTEMA') score += 50;
    if (nome === '_SISTEMAS') score += 45;
  } catch (e) {}

  try {
    const temDev = pasta.getFoldersByName('DEV').hasNext();
    if (temDev) score += 100;
  } catch (e) {}

  try {
    const arquivos = pasta.getFiles();
    while (arquivos.hasNext()) {
      arquivos.next();
      score += 5;
      if (score > 300) return score;
    }
  } catch (e) {}

  try {
    const subpastas = pasta.getFolders();
    while (subpastas.hasNext()) {
      subpastas.next();
      score += 3;
      if (score > 300) return score;
    }
  } catch (e) {}

  return score;
}

function copiarPastaRecursiva_(pastaOrigem, pastaPaiDestino) {
  const pastaDestino = pastaPaiDestino.createFolder(pastaOrigem.getName());

  const arquivos = pastaOrigem.getFiles();
  while (arquivos.hasNext()) {
    const file = arquivos.next();
    file.makeCopy(file.getName(), pastaDestino);
  }

  const subpastas = pastaOrigem.getFolders();
  while (subpastas.hasNext()) {
    const sub = subpastas.next();
    copiarPastaRecursiva_(sub, pastaDestino);
  }

  return pastaDestino;
}

function coletarBibliotecasAppsScript_(pastaSistemasDestino) {
  const resultado = {
    inventarioId: '',
    visionId: ''
  };

  if (!pastaSistemasDestino) return resultado;

  const arquivos = listarArquivosRecursivos_(pastaSistemasDestino);

  for (let i = 0; i < arquivos.length; i++) {
    const f = arquivos[i];
    const nome = String(f.getName() || '').toUpperCase();
    const mime = String(f.getMimeType() || '');

    if (mime !== MimeType.GOOGLE_APPS_SCRIPT) continue;

    if (!resultado.inventarioId && nome.indexOf('INVENTARIO') !== -1) {
      resultado.inventarioId = f.getId();
      continue;
    }

    if (!resultado.visionId && nome.indexOf('VISION') !== -1) {
      resultado.visionId = f.getId();
    }
  }

  return resultado;
}

function listarArquivosRecursivos_(pasta) {
  const out = [];

  try {
    const files = pasta.getFiles();
    while (files.hasNext()) {
      out.push(files.next());
    }
  } catch (e) {}

  try {
    const subs = pasta.getFolders();
    while (subs.hasNext()) {
      const sub = subs.next();
      const filhos = listarArquivosRecursivos_(sub);
      for (let i = 0; i < filhos.length; i++) {
        out.push(filhos[i]);
      }
    }
  } catch (e) {}

  return out;
}

function contarArquivosRecursivos_(pasta) {
  return listarArquivosRecursivos_(pasta).length;
}

function obterArquivoTemplatePorNome_(pasta, nomes) {
  for (let i = 0; i < nomes.length; i++) {
    const it = pasta.getFilesByName(nomes[i]);
    if (it.hasNext()) return it.next();
  }
  throw new Error('Template de origem nao encontrado: ' + nomes.join(' / '));
}
