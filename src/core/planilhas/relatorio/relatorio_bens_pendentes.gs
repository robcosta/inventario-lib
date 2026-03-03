/**
 * ============================================================
 * RELATÓRIO — BENS PENDENTES
 * ============================================================
 * Regra:
 * - Lista bens da ADMIN sem destaque (fundo branco na coluna A).
 */

const RELATORIO_ABA_BENS_PENDENTES = 'Bens Pendentes';

function relatorioGerarBensPendentes_() {
  const contexto = obterContextoDominio_();
  if (!contexto) {
    throw new Error('Nenhum contexto ativo.');
  }

  const planilhaRelatorioId = resolverPlanilhaRelatorioId_(contexto);
  if (!contexto.planilhaAdminId) {
    throw new Error('Planilha ADMIN não configurada no contexto.');
  }

  const adminFormatada = validarPlanilhaFormatada_(contexto.planilhaAdminId);
  if (!adminFormatada) {
    throw new Error('Antes de gerar o relatório, formate a planilha: ADMIN.');
  }

  const ssRelatorio = SpreadsheetApp.openById(planilhaRelatorioId);
  const ssAdmin = SpreadsheetApp.openById(contexto.planilhaAdminId);
  const registros = extrairBensPendentesDaAdmin_(ssAdmin);

  const abaExistente = ssRelatorio.getSheetByName(RELATORIO_ABA_BENS_PENDENTES);
  const eventoTipo = abaExistente ? 'RECRIACAO_ABA' : 'CRIACAO_ABA';
  const sheet = abaExistente || ssRelatorio.insertSheet(RELATORIO_ABA_BENS_PENDENTES);

  montarAbaVisaoGeralRelatorio_(sheet, registros, RELATORIO_ABA_BENS_PENDENTES);
  ordenarAbasRelatorio_(ssRelatorio);
  atualizarLegendaRelatorio_(ssRelatorio, contexto);

  registrarEventoControleRelatorio_(ssRelatorio, {
    tipoEvento: eventoTipo,
    nomeAba: RELATORIO_ABA_BENS_PENDENTES,
    origem: 'MENU',
    observacao: `Linhas geradas: ${registros.length}`
  });

  try {
    ssRelatorio.setActiveSheet(sheet);
  } catch (e) {}
}

function extrairBensPendentesDaAdmin_(ssAdmin) {
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
      if (!ehCorSemDestaqueRelatorio_(corLinha)) return;

      let localizacao = sanitizarTextoLocalizacao_(obterValorSeguro_(row[idx.localizacao] || ''));
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

      const scoreAtual = contarCamposPreenchidos_(porTombamento[tombamento].dados);
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

function ehCorSemDestaqueRelatorio_(cor) {
  const val = String(cor || '').trim().toLowerCase();
  if (!val) return true;
  return val === '#ffffff' || val === 'white';
}

function detectarTermoNaLinhaRelatorio_(row) {
  for (let i = 0; i < row.length; i++) {
    const valor = String(row[i] || '').trim();
    if (ehFormatoTermo_(valor)) return valor;
  }
  return '';
}
