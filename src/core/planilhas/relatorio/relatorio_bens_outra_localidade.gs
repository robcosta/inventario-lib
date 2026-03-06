/**
 * ============================================================
 * RELATÓRIO — BENS DE OUTRA LOCALIDADE
 * ============================================================
 * Regra:
 * - Busca na GERAL bens cuja Localização pertence às localidades
 *   do contexto atual.
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

  const localidadesDoContexto = mapearLocalidadesDoContextoParaFiltro_(contexto);
  const tombamentosAdmin = mapearTombamentosAdminParaFiltro_(ssAdmin);
  const registros = extrairBensOutraLocalidadeDaGeral_(
    ssGeral,
    localidadesDoContexto,
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

function mapearLocalidadesDoContextoParaFiltro_(contexto) {
  const mapa = {};
  let pastas = [];

  try {
    pastas = obterPastasVivas_(contexto) || [];
  } catch (e) {
    return mapa;
  }

  pastas.forEach(p => {
    const chave = normalizarTextoComparacao_(p.nome || '');
    if (!chave) return;
    mapa[chave] = p.nome || '';
  });

  return mapa;
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

function extrairBensOutraLocalidadeDaGeral_(ssGeral, localidadesDoContexto, tombamentosAdmin) {
  const porTombamento = {};
  if (!ssGeral) return [];

  ssGeral.getSheets().forEach(sheet => {
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
      if (tombamentosAdmin[tombamento]) return;

      let localizacao = sanitizarTextoLocalizacao_(obterValorSeguro_(row[idx.localizacao]));
      if (!localizacao) return;

      if (idx.termo >= 0) {
        const termoColuna = obterValorSeguro_(row[idx.termo]);
        if (termoColuna && termoColuna === localizacao) return;
      }
      if (ehFormatoTermo_(localizacao)) return;

      const chaveLocalizacao = normalizarTextoComparacao_(localizacao);
      if (!localidadesDoContexto[chaveLocalizacao]) return;

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
      }
    });
  });

  const registros = Object.keys(porTombamento).map(k => porTombamento[k]);
  registros.sort((a, b) => String(a.dados[0]).localeCompare(String(b.dados[0])));
  return registros;
}
