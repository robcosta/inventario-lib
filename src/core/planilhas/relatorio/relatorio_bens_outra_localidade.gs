/**
 * ============================================================
 * RELATÓRIO — BENS DE OUTRA LOCALIDADE
 * ============================================================
 * Regra:
 * - Lê a aba __CONTROLE_PROCESSAMENTO__ da ADMIN.
 * - Filtra somente registros com Planilha (F) = GERAL.
 * - Resolve o bem na GERAL por Linha (G), validando por
 *   Valor Identificador (I), com fallback por Identificador.
 * - Exclui bens que já existem na ADMIN do contexto (por tombamento).
 */

const RELATORIO_ABA_BENS_OUTRA_LOCALIDADE = 'Bens de Outra Localidade';

function relatorioGerarBensOutraLocalidade_() {
  const contexto = obterContextoDominio_();
  if (!contexto) {
    throw new Error('Nenhum contexto ativo.');
  }

  const planilhaRelatorioId = resolverPlanilhaRelatorioId_(contexto);
  if (!contexto.planilhaAdminId) {
    throw new Error('Planilha ADMIN não configurada no contexto.');
  }

  const planilhaGeralId = contexto.planilhaGeralId || resolverPlanilhaGeralId_();
  if (!planilhaGeralId) {
    throw new Error('Planilha GERAL não configurada.');
  }

  const adminFormatada = validarPlanilhaFormatada_(contexto.planilhaAdminId);
  const geralPronta = validarPlanilhaGeralPronta_(planilhaGeralId);
  if (!adminFormatada || !geralPronta) {
    const faltantes = [];
    if (!adminFormatada) faltantes.push('ADMIN');
    if (!geralPronta) faltantes.push('GERAL (nome, dados e formatação)');
    throw new Error(
      'Antes de gerar o relatório, formate as planilhas: ' + faltantes.join(' e ') + '.'
    );
  }

  const ssRelatorio = SpreadsheetApp.openById(planilhaRelatorioId);
  const ssAdmin = SpreadsheetApp.openById(contexto.planilhaAdminId);
  const ssGeral = SpreadsheetApp.openById(planilhaGeralId);

  const tombamentosAdmin = mapearTombamentosAdminParaFiltro_(ssAdmin);
  const registros = extrairBensOutraLocalidadeDaGeral_(
    ssAdmin,
    ssGeral,
    tombamentosAdmin
  );

  const abaExistente = ssRelatorio.getSheetByName(RELATORIO_ABA_BENS_OUTRA_LOCALIDADE);
  const eventoTipo = abaExistente ? 'RECRIACAO_ABA' : 'CRIACAO_ABA';
  const sheet = abaExistente || ssRelatorio.insertSheet(RELATORIO_ABA_BENS_OUTRA_LOCALIDADE);

  montarAbaVisaoGeralRelatorio_(sheet, registros, RELATORIO_ABA_BENS_OUTRA_LOCALIDADE);
  ordenarAbasRelatorio_(ssRelatorio);
  atualizarLegendaRelatorio_(ssRelatorio, contexto);

  registrarEventoControleRelatorio_(ssRelatorio, {
    tipoEvento: eventoTipo,
    nomeAba: RELATORIO_ABA_BENS_OUTRA_LOCALIDADE,
    origem: 'MENU',
    observacao: `Linhas geradas: ${registros.length}`
  });

  try {
    ssRelatorio.setActiveSheet(sheet);
  } catch (e) {}
}

function mapearTombamentosAdminParaFiltro_(ssAdmin) {
  const mapa = {};
  if (!ssAdmin) return mapa;

  ssAdmin.getSheets().forEach(sheet => {
    const nome = sheet.getName();
    if (nome === 'CAPA' || nome === 'MANUAL' || nome === RELATORIO_ABA_CONTROLE) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 1 || lastCol < 1) return;

    const valores = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const idx = detectarIndiceColunasInventario_(valores);

    valores.forEach(row => {
      const tombamento = extrairTombamento_(row[idx.tombamento]);
      if (!tombamento) return;
      mapa[tombamento] = true;
    });
  });

  return mapa;
}

function extrairBensOutraLocalidadeDaGeral_(ssAdmin, ssGeral, tombamentosAdmin) {
  const porTombamento = {};
  if (!ssAdmin || !ssGeral) return [];

  const logs = obterLogsProcessamento_(ssAdmin.getId(), '__CONTROLE_PROCESSAMENTO__') || [];
  const logsGeral = logs.filter(log => {
    const planilha = normalizarTextoComparacao_(log && log.planilha);
    if (!planilha || planilha.indexOf('GERAL') === -1) return false;

    const status = normalizarTextoComparacao_(log && log.status);
    if (status === 'ERRO' || status === 'PENDENTE') return false;

    return true;
  });

  const indiceGeral = construirIndiceBuscaBensGeral_(ssGeral);

  logsGeral.forEach(log => {
    const ref = resolverLinhaBemNaGeralPorControle_(log, indiceGeral);
    if (!ref) return;

    const registro = montarRegistroOutraLocalidadePorRef_(ref);
    if (!registro) return;

    const tombamento = String(registro[0] || '').trim();
    if (!tombamento) return;
    if (tombamentosAdmin[tombamento]) return;

    if (!porTombamento[tombamento]) {
      porTombamento[tombamento] = { dados: registro, cor: '' };
      return;
    }

    const atual = porTombamento[tombamento].dados;
    const scoreAtual = contarCamposPreenchidos_(atual);
    const scoreNovo = contarCamposPreenchidos_(registro);
    if (scoreNovo > scoreAtual) {
      porTombamento[tombamento] = { dados: registro, cor: '' };
    }
  });

  const registros = Object.keys(porTombamento).map(k => porTombamento[k]);
  registros.sort((a, b) => String(a.dados[0]).localeCompare(String(b.dados[0])));
  return registros;
}

function construirIndiceBuscaBensGeral_(ssGeral) {
  const indice = {
    porLinha: {},
    porIdentificador: {}
  };

  ssGeral.getSheets().forEach(sheet => {
    const nome = sheet.getName();
    if (nome === 'CAPA' || nome === 'MANUAL' || nome === RELATORIO_ABA_CONTROLE) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 1 || lastCol < 1) return;

    const valores = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const idx = detectarIndiceColunasInventario_(valores);

    valores.forEach((row, rowIndex) => {
      if (idx.headerRow >= 0 && rowIndex <= idx.headerRow) return;

      const linhaPlanilha = rowIndex + 1;
      const ref = {
        sheetName: nome,
        linha: linhaPlanilha,
        row: row,
        idx: idx,
        chaves: {}
      };

      extrairChavesIdentificadorDaLinhaGeral_(row).forEach(ch => {
        ref.chaves[ch] = true;
        adicionarRefAoIndice_(indice.porIdentificador, ch, ref);
      });

      adicionarRefAoIndice_(indice.porLinha, String(linhaPlanilha), ref);
    });
  });

  return indice;
}

function adicionarRefAoIndice_(indice, chave, ref) {
  const key = String(chave || '').trim();
  if (!key) return;

  if (!indice[key]) indice[key] = [];

  const idRef = ref.sheetName + '#' + ref.linha;
  const jaExiste = indice[key].some(item => (item.sheetName + '#' + item.linha) === idRef);
  if (!jaExiste) indice[key].push(ref);
}

function extrairChavesIdentificadorDaLinhaGeral_(row) {
  const chaves = {};

  row.forEach(celula => {
    const texto = obterValorSeguro_(celula);
    const normalizado = normalizarTextoComparacao_(texto);
    if (normalizado) chaves[normalizado] = true;

    const tombamento = extrairTombamento_(texto);
    if (tombamento) chaves[tombamento] = true;
  });

  return Object.keys(chaves);
}

function extrairChavesIdentificadorDoControle_(log) {
  const chaves = {};
  const valor = obterValorSeguro_(log && log.valorIdentificador);
  if (!valor) return [];

  const normalizado = normalizarTextoComparacao_(valor);
  if (normalizado) chaves[normalizado] = true;

  const tombamento = extrairTombamento_(valor);
  if (tombamento) chaves[tombamento] = true;

  return Object.keys(chaves);
}

function resolverLinhaBemNaGeralPorControle_(log, indiceGeral) {
  if (!indiceGeral) return null;

  const chavesIdentificador = extrairChavesIdentificadorDoControle_(log);
  const linhaInformada = parseInt(String((log && log.linhaPlanilha) || '').trim(), 10);

  if (!isNaN(linhaInformada) && linhaInformada > 0) {
    const candidatosLinha = indiceGeral.porLinha[String(linhaInformada)] || [];

    if (candidatosLinha.length === 1 && !chavesIdentificador.length) {
      return candidatosLinha[0];
    }

    if (chavesIdentificador.length) {
      const validados = candidatosLinha.filter(ref => {
        return chavesIdentificador.some(ch => ref.chaves[ch]);
      });

      if (validados.length === 1) return validados[0];
      if (validados.length > 1) return escolherMelhorReferenciaGeral_(validados);
    }

    if (candidatosLinha.length === 1) return candidatosLinha[0];
  }

  if (chavesIdentificador.length) {
    const candidatosPorIdentificador = {};

    chavesIdentificador.forEach(ch => {
      const refs = indiceGeral.porIdentificador[ch] || [];
      refs.forEach(ref => {
        candidatosPorIdentificador[ref.sheetName + '#' + ref.linha] = ref;
      });
    });

    const lista = Object.keys(candidatosPorIdentificador).map(k => candidatosPorIdentificador[k]);
    if (lista.length === 1) return lista[0];
    if (lista.length > 1) return escolherMelhorReferenciaGeral_(lista);
  }

  return null;
}

function escolherMelhorReferenciaGeral_(refs) {
  if (!refs || !refs.length) return null;

  refs.sort((a, b) => {
    const scoreA = contarCamposPreenchidos_(a.row || []);
    const scoreB = contarCamposPreenchidos_(b.row || []);
    if (scoreA !== scoreB) return scoreB - scoreA;

    const sheetCmp = String(a.sheetName || '').localeCompare(String(b.sheetName || ''));
    if (sheetCmp !== 0) return sheetCmp;

    return a.linha - b.linha;
  });

  return refs[0];
}

function montarRegistroOutraLocalidadePorRef_(ref) {
  if (!ref || !ref.row || !ref.idx) return null;

  const row = ref.row;
  const idx = ref.idx;

  const tombamento = extrairTombamento_(row[idx.tombamento]);
  if (!tombamento) return null;

  let localizacao = sanitizarTextoLocalizacao_(obterValorSeguro_(row[idx.localizacao]));
  if (idx.termo >= 0) {
    const termoColuna = obterValorSeguro_(row[idx.termo]);
    if (termoColuna && termoColuna === localizacao) {
      localizacao = '';
    }
  }
  if (ehFormatoTermo_(localizacao)) {
    localizacao = '';
  }

  let termo = obterValorSeguro_(row[idx.termo]);
  if (!ehFormatoTermo_(termo)) {
    const termoDetectado = detectarTermoNaLinhaRelatorio_(row);
    if (termoDetectado) termo = termoDetectado;
  }

  let aquisicao = formatarDataAquisicao_(row[idx.aquisicao]);
  let marca = obterValorSeguro_(row[idx.marca]);
  const ajuste = ajustarAquisicaoMarca_(aquisicao, marca);
  aquisicao = ajuste.aquisicao;
  marca = ajuste.marca;

  return [
    tombamento,
    obterValorSeguro_(row[idx.denominacao]),
    aquisicao,
    marca,
    obterValorSeguro_(row[idx.situacao]),
    localizacao,
    ehFormatoTermo_(termo) ? termo : ''
  ];
}
