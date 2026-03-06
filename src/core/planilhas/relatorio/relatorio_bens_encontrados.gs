/**
 * ============================================================
 * RELATÓRIO — BENS ENCONTRADOS
 * ============================================================
 * Regra:
 * - Lista bens da ADMIN com destaque (fundo não branco na coluna A).
 * - Localização segue a lógica da Visão Geral:
 *   1) GERAL por tombamento
 *   2) Fallback por mapa cor -> localidade
 */

const RELATORIO_ABA_BENS_ENCONTRADOS = 'Bens Encontrados';

function relatorioGerarBensEncontrados_() {
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
  const geralFormatada = validarPlanilhaFormatada_(planilhaGeralId);
  if (!adminFormatada || !geralFormatada) {
    const faltantes = [];
    if (!adminFormatada) faltantes.push('ADMIN');
    if (!geralFormatada) faltantes.push('GERAL');
    throw new Error(
      'Antes de gerar o relatório, formate as planilhas: ' + faltantes.join(' e ') + '.'
    );
  }

  const ssRelatorio = SpreadsheetApp.openById(planilhaRelatorioId);
  const ssAdmin = SpreadsheetApp.openById(contexto.planilhaAdminId);
  const ssGeral = SpreadsheetApp.openById(planilhaGeralId);

  const localizacaoPorTombamento = mapearLocalizacaoPorTombamento_(ssGeral);
  const localizacaoPorCor = mapearLocalizacaoPorCor_(contexto);
  const registros = extrairBensEncontradosDaAdmin_(
    ssAdmin,
    localizacaoPorTombamento,
    localizacaoPorCor
  );

  const abaExistente = ssRelatorio.getSheetByName(RELATORIO_ABA_BENS_ENCONTRADOS);
  const eventoTipo = abaExistente ? 'RECRIACAO_ABA' : 'CRIACAO_ABA';
  const sheet = abaExistente || ssRelatorio.insertSheet(RELATORIO_ABA_BENS_ENCONTRADOS);

  montarAbaVisaoGeralRelatorio_(sheet, registros, RELATORIO_ABA_BENS_ENCONTRADOS);
  ordenarAbasRelatorio_(ssRelatorio);
  atualizarLegendaRelatorio_(ssRelatorio, contexto);

  registrarEventoControleRelatorio_(ssRelatorio, {
    tipoEvento: eventoTipo,
    nomeAba: RELATORIO_ABA_BENS_ENCONTRADOS,
    origem: 'MENU',
    observacao: `Linhas geradas: ${registros.length}`
  });

  try {
    ssRelatorio.setActiveSheet(sheet);
  } catch (e) {}
}

function extrairBensEncontradosDaAdmin_(ssAdmin, localizacaoPorTombamento, localizacaoPorCor) {
  const porTombamento = {};
  if (!ssAdmin) return [];

  ssAdmin.getSheets().forEach(sheet => {
    const nome = sheet.getName();
    if (nome === 'CAPA' || nome === 'MANUAL' || nome === RELATORIO_ABA_CONTROLE) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 1 || lastCol < 1) return;

    const valores = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const fundosColA = sheet.getRange(1, 1, lastRow, 1).getBackgrounds();
    const idx = detectarIndiceColunasInventario_(valores);

    valores.forEach((row, rowIndex) => {
      const tombamento = extrairTombamento_(row[idx.tombamento]);
      if (!tombamento) return;

      const corLinha = normalizarCorHex_(fundosColA[rowIndex][0]);
      if (ehCorSemDestaqueRelatorio_(corLinha)) return;

      const localizacaoDaGeral = sanitizarTextoLocalizacao_(localizacaoPorTombamento[tombamento] || '');
      const localizacaoDaCor = sanitizarTextoLocalizacao_(localizacaoPorCor[corLinha] || '');
      let localizacao = localizacaoDaGeral || localizacaoDaCor || '';
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

      const registro = [
        tombamento,
        obterValorSeguro_(row[idx.denominacao]),
        aquisicao,
        marca,
        obterValorSeguro_(row[idx.situacao]),
        localizacao,
        ehFormatoTermo_(termo) ? termo : ''
      ];

      if (!porTombamento[tombamento]) {
        porTombamento[tombamento] = { dados: registro, cor: '' };
        return;
      }

      const atual = porTombamento[tombamento].dados;
      const scoreAtual = contarCamposPreenchidos_(atual);
      const scoreNovo = contarCamposPreenchidos_(registro);
      if (scoreNovo > scoreAtual) {
        porTombamento[tombamento] = { dados: registro, cor: '' };
        return;
      }

      if (scoreNovo === scoreAtual) {
        const atualTemLocalizacao = !!String(atual[5] || '').trim();
        const novoTemLocalizacao = !!String(registro[5] || '').trim();
        if (!atualTemLocalizacao && novoTemLocalizacao) {
          porTombamento[tombamento] = { dados: registro, cor: '' };
        }
      }
    });
  });

  const registros = Object.keys(porTombamento).map(k => porTombamento[k]);
  registros.sort((a, b) => String(a.dados[0]).localeCompare(String(b.dados[0])));
  return registros;
}
