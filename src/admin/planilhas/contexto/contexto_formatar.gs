/**
 * ============================================================
 * FORMATA PLANILHA DE CONTEXTO — PROCESSAMENTO EM BLOCO
 * ============================================================
 */
function formatarPlanilhaContexto_(spreadsheetId) {

  const ss = SpreadsheetApp.openById(
    spreadsheetId || SpreadsheetApp.getActive().getId()
  );

  const sheets = ss.getSheets();
  const ui = SpreadsheetApp.getUi();

  ss.toast('Iniciando formatação do contexto…', '⏳ Formatação', 5);

  sheets.forEach(sheet => {

    const nomeAba = sheet.getName();

    if (nomeAba === '__CONTROLE_PROCESSAMENTO__') return;

    ss.toast(`Processando aba: ${nomeAba}`, '🛠️ Formatação', 3);

    const range = sheet.getDataRange();
    const data = range.getValues();
    const totalRows = data.length;
    const totalCols = range.getNumColumns();

    if (totalRows < 1) return;

    // 🔒 Preparações estruturais (1 vez)
    sheet.setFrozenRows(1);
    sheet.setHiddenGridlines(true);

    // Remove linha 9 (se vazia)
    if (data[8] && !data[8][0]) {
      sheet.deleteRow(9);
    }

    aplicarCabecalhoPrincipal_(sheet);

    /* ======================================================
     * MAPAS DE FORMATAÇÃO
     * ====================================================== */
    const blocos = {
      branco: [],
      localidade: [],
      unidade: [],
      tombamentoHeader: [],
      pcasp: [],
      tombamento: [],
      totalGrupo: []
    };

    /* ======================================================
     * PROCESSAMENTO EM MEMÓRIA
     * ====================================================== */
    for (let i = 0; i < totalRows; i++) {

      const linha = i + 1;
      const valA = String(data[i][0] || '').trim();

      blocos.branco.push(linha);

      // (Bem de Terceiro)
      if (valA === '(Bem de Terceiro)' && i > 0) {
        data[i - 1][0] += ' (Bem de Terceiro)';
        data[i][0] = '';
        continue;
      }

      // Localidade
      if (obterLocalidade_(valA, linha)) {
        blocos.localidade.push(linha);
        continue;
      }

      // Unidade
      if (valA.startsWith('Unidade')) {
        blocos.unidade.push(linha);
        continue;
      }

      // Tombamento (header)
      if (valA.startsWith('Tombamento')) {

        if (data[i][7] !== '') {
          data[i][8] = data[i][7];
          data[i][7] = '';
        }

        blocos.tombamentoHeader.push(linha);
        continue;
      }

      // PCASP
      if (/^\d{4}$/.test(valA)) {

        // Concatena TODAS as células não vazias da linha
        const texto = data[i]
          .map(v => String(v).trim())
          .filter(v => v !== '')
          .join('  ');

        // Limpa a linha inteira
        data[i].fill('');

        // Escreve tudo na coluna A
        data[i][0] = texto;

        blocos.pcasp.push(linha);
        continue;
      }

      // Tombamento
      if (/^\d{10}/.test(valA)) {
        blocos.tombamento.push(linha);
        continue;
      }

      // Total do grupo
      if (valA.includes('Total de Bens do Grupo de Material')) {
        blocos.totalGrupo.push(linha);
      }
    }

    /* ======================================================
     * ESCREVE DADOS PROCESSADOS (1 VEZ)
     * ====================================================== */
    range.setValues(data);

    /* ======================================================
     * APLICA FORMATAÇÃO EM BLOCO
     * ====================================================== */
    aplicarEstiloBloco_(sheet, blocos.localidade, {
      background: '#b45f06',
      fontColor: '#ffffff',
      fontWeight: 'bold',
      fontSize: 11,
      borderTop: true
    });

    aplicarEstiloBloco_(sheet, blocos.unidade, {
      background: '#666666',
      fontColor: '#ffffff',
      fontWeight: 'bold',
      fontSize: 11,
      borderTop: true
    });

    aplicarEstiloBloco_(sheet, blocos.tombamentoHeader, {
      background: '#b7b7b7',
      fontWeight: 'bold',
      fontSize: 10,
      borderTop: true
    });

    aplicarEstiloBloco_(sheet, blocos.pcasp, {
      borderTop: true
    });

    aplicarEstiloBloco_(sheet, blocos.tombamento, {
      borderTop: true
    });

    aplicarEstiloBloco_(sheet, blocos.totalGrupo, {
      borderTop: true
    });

    sheet.getRange('J:L').clearFormat();
  });

  ss.toast('Formatação concluída com sucesso', '✅ Concluído', 6);
}
