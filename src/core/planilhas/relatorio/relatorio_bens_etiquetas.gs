/**
 * ============================================================
 * RELATORIO — BENS PARA NOVA ETIQUETA
 * ============================================================
 * Regra:
 * - Le a aba __CONTROLE_PROCESSAMENTO__ da ADMIN.
 * - Considera apenas logs da coluna Planilha (F) com ADMIN/CONTEXTO.
 * - Nao elegivel: Tipo Identificador (H)=TOMBAMENTO E
 *   Origem Identificador=OCR.
 *
 * Observacao:
 * - A exclusao acima nao garante 100% de acuracia no mundo real,
 *   mas implementa a regra de negocio acordada para o relatorio.
 */

const RELATORIO_ABA_BENS_ETIQUETAS = 'Bens para Nova Etiqueta';

function relatorioGerarBensEtiquetas_() {
  const contexto = obterContextoDominio_();
  if (!contexto) {
    throw new Error('Nenhum contexto ativo.');
  }

  const planilhaRelatorioId = resolverPlanilhaRelatorioId_(contexto);
  if (!contexto.planilhaAdminId) {
    throw new Error('Planilha ADMIN nao configurada no contexto.');
  }

  const adminFormatada = validarPlanilhaFormatada_(contexto.planilhaAdminId);
  if (!adminFormatada) {
    throw new Error('Antes de gerar o relatorio, formate a planilha: ADMIN.');
  }

  const ssRelatorio = SpreadsheetApp.openById(planilhaRelatorioId);
  const ssAdmin = SpreadsheetApp.openById(contexto.planilhaAdminId);

  const registros = extrairBensParaNovaEtiquetaDaAdmin_(ssAdmin);

  const abaExistente = ssRelatorio.getSheetByName(RELATORIO_ABA_BENS_ETIQUETAS);
  const eventoTipo = abaExistente ? 'RECRIACAO_ABA' : 'CRIACAO_ABA';
  const sheet = abaExistente || ssRelatorio.insertSheet(RELATORIO_ABA_BENS_ETIQUETAS);

  montarAbaVisaoGeralRelatorio_(sheet, registros, RELATORIO_ABA_BENS_ETIQUETAS);
  ordenarAbasRelatorio_(ssRelatorio);
  atualizarLegendaRelatorio_(ssRelatorio, contexto);

  registrarEventoControleRelatorio_(ssRelatorio, {
    tipoEvento: eventoTipo,
    nomeAba: RELATORIO_ABA_BENS_ETIQUETAS,
    origem: 'MENU',
    observacao: `Linhas geradas: ${registros.length}`
  });

  try {
    ssRelatorio.setActiveSheet(sheet);
  } catch (e) {}
}

function extrairBensParaNovaEtiquetaDaAdmin_(ssAdmin) {
  const porBem = {};
  if (!ssAdmin) return [];

  const logs = obterLogsProcessamento_(ssAdmin.getId(), '__CONTROLE_PROCESSAMENTO__') || [];
  const logsElegiveis = logs.filter(ehLogElegivelParaNovaEtiqueta_);
  const indiceAdmin = construirIndiceBuscaBensAdminEtiquetas_(ssAdmin);

  logsElegiveis.forEach(log => {
    const ref = resolverLinhaBemNaAdminPorControleEtiquetas_(log, indiceAdmin);
    if (!ref) return;

    const registro = montarRegistroRelatorioEtiquetasPorRef_(ref);
    if (!registro) return;

    const tombamento = String(registro[0] || '').trim();
    const identificador = normalizarTextoComparacao_(obterValorSeguro_(log && log.valorIdentificador));
    const chave = tombamento || identificador || '';
    if (!chave) return;

    // Percurso cronologico do controle: o ultimo evento elegivel prevalece.
    porBem[chave] = { dados: registro, cor: '' };
  });

  const registros = Object.keys(porBem).map(k => porBem[k]);
  registros.sort((a, b) => String(a.dados[0]).localeCompare(String(b.dados[0])));
  return registros;
}

function ehLogElegivelParaNovaEtiqueta_(log) {
  const planilha = normalizarTextoComparacao_(log && log.planilha);
  const ehAdminOuContexto = planilha === 'ADMIN' || planilha === 'CONTEXTO';
  if (!ehAdminOuContexto) return false;

  const status = normalizarTextoComparacao_(log && log.status);
  if (status === 'ERRO' || status === 'PENDENTE') return false;

  const tipoIdentificador = normalizarTextoComparacao_(log && log.tipoIdentificador);
  const origemIdentificador = normalizarTextoComparacao_(log && log.origemIdentificador);
  const naoElegivel = tipoIdentificador === 'TOMBAMENTO' && origemIdentificador === 'OCR';

  return !naoElegivel;
}

function construirIndiceBuscaBensAdminEtiquetas_(ssAdmin) {
  const indice = {
    porLinha: {},
    porIdentificador: {}
  };

  ssAdmin.getSheets().forEach(sheet => {
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

      extrairChavesIdentificadorDaLinhaAdminEtiquetas_(row).forEach(ch => {
        ref.chaves[ch] = true;
        adicionarRefAoIndiceEtiquetas_(indice.porIdentificador, ch, ref);
      });

      adicionarRefAoIndiceEtiquetas_(indice.porLinha, String(linhaPlanilha), ref);
    });
  });

  return indice;
}

function extrairChavesIdentificadorDaLinhaAdminEtiquetas_(row) {
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

function adicionarRefAoIndiceEtiquetas_(indice, chave, ref) {
  const key = String(chave || '').trim();
  if (!key) return;

  if (!indice[key]) indice[key] = [];

  const idRef = ref.sheetName + '#' + ref.linha;
  const jaExiste = indice[key].some(item => (item.sheetName + '#' + item.linha) === idRef);
  if (!jaExiste) indice[key].push(ref);
}

function resolverLinhaBemNaAdminPorControleEtiquetas_(log, indiceAdmin) {
  if (!indiceAdmin) return null;

  const chavesIdentificador = extrairChavesIdentificadorDoControleEtiquetas_(log);
  const linhaInformada = parseInt(String((log && log.linhaPlanilha) || '').trim(), 10);

  if (!isNaN(linhaInformada) && linhaInformada > 0) {
    const candidatosLinha = indiceAdmin.porLinha[String(linhaInformada)] || [];

    if (candidatosLinha.length === 1 && !chavesIdentificador.length) {
      return candidatosLinha[0];
    }

    if (chavesIdentificador.length) {
      const validados = candidatosLinha.filter(ref => {
        return chavesIdentificador.some(ch => ref.chaves[ch]);
      });

      if (validados.length === 1) return validados[0];
      if (validados.length > 1) return escolherMelhorReferenciaAdminEtiquetas_(validados);
    }

    if (candidatosLinha.length === 1) return candidatosLinha[0];
  }

  if (chavesIdentificador.length) {
    const candidatosPorIdentificador = {};

    chavesIdentificador.forEach(ch => {
      const refs = indiceAdmin.porIdentificador[ch] || [];
      refs.forEach(ref => {
        candidatosPorIdentificador[ref.sheetName + '#' + ref.linha] = ref;
      });
    });

    const lista = Object.keys(candidatosPorIdentificador).map(k => candidatosPorIdentificador[k]);
    if (lista.length === 1) return lista[0];
    if (lista.length > 1) return escolherMelhorReferenciaAdminEtiquetas_(lista);
  }

  return null;
}

function extrairChavesIdentificadorDoControleEtiquetas_(log) {
  const chaves = {};
  const valor = obterValorSeguro_(log && log.valorIdentificador);
  if (!valor) return [];

  const normalizado = normalizarTextoComparacao_(valor);
  if (normalizado) chaves[normalizado] = true;

  const tombamento = extrairTombamento_(valor);
  if (tombamento) chaves[tombamento] = true;

  return Object.keys(chaves);
}

function escolherMelhorReferenciaAdminEtiquetas_(refs) {
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

function montarRegistroRelatorioEtiquetasPorRef_(ref) {
  if (!ref || !ref.row || !ref.idx) return null;

  const row = ref.row;
  const idx = ref.idx;

  const tombamento = extrairTombamento_(row[idx.tombamento]);
  if (!tombamento) return null;

  let localizacao = sanitizarTextoLocalizacao_(obterValorSeguro_(row[idx.localizacao]));
  let termo = obterValorSeguro_(row[idx.termo]);

  if (!ehFormatoTermo_(termo)) {
    const termoDetectado = detectarTermoNaLinhaRelatorio_(row);
    if (termoDetectado) termo = termoDetectado;
  }

  if (ehFormatoTermo_(localizacao)) {
    if (!termo) termo = localizacao;
    localizacao = '';
  }
  if (localizacao && termo && localizacao === termo) {
    localizacao = '';
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
