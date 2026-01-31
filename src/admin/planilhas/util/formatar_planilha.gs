/**
 * ============================================================
 * FORMATA PLANILHA DE CONTEXTO — PROCESSAMENTO EM BLOCO
 * ============================================================
 */
function formatarPlanilha_(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);

  const sheets = ss.getSheets();
  const contexto = obterContextoAtivo_(); // Obtém contexto para a legenda

  ss.toast('Iniciando formatação do contexto…', '⏳ Formatação', 5);

  sheets.forEach(sheet => {
    const nomeAba = sheet.getName();
    if (nomeAba === '__CONTROLE_PROCESSAMENTO__') return;

    ss.toast(`Processando aba: ${nomeAba}`, '🛠️ Formatação', 3);

    const range = sheet.getDataRange();
    const data = range.getValues();
    const totalRows = data.length;

    if (totalRows < 1) return;

    // 🔒 Preparações estruturais
    sheet.setFrozenRows(1);
    sheet.setHiddenGridlines(true);
    aplicarCabecalhoPrincipal_(sheet);

    const blocos = {
      localidade: [],
      unidade: [],
      tombamentoHeader: [],
      pcasp: [],
      tombamento: [],
      totalGrupo: []
    };

    for (let i = 0; i < totalRows; i++) {
      const linha = i + 1;
      const valA = String(data[i][0] || '').trim();

      // (Bem de Terceiro)
      if (valA === '(Bem de Terceiro)' && i > 0) {
        data[i - 1][0] += ' (Bem de Terceiro)';
        data[i][0] = '';
        continue;
      }

      if (obterLocalidade_(valA, linha)) {
        blocos.localidade.push(linha);
        continue;
      }

      if (valA.startsWith('Unidade')) {
        blocos.unidade.push(linha);
        continue;
      }

      if (valA.startsWith('Tombamento')) {
        if (data[i][7] !== '') {
          data[i][8] = data[i][7];
          data[i][7] = '';
        }
        blocos.tombamentoHeader.push(linha);
        continue;
      }

      if (/^\d{4}$/.test(valA)) {
        const texto = data[i].map(v => String(v).trim()).filter(v => v !== '').join('  ');
        data[i].fill('');
        data[i][0] = texto;
        blocos.pcasp.push(linha);
        continue;
      }

      if (/^\d{10}/.test(valA)) {
        blocos.tombamento.push(linha);
        continue;
      }

      if (valA.includes('Total de Bens do Grupo de Material')) {
        blocos.totalGrupo.push(linha);
      }
    }

    range.setValues(data);

    // Aplica Estilos
    aplicarEstiloBloco_(sheet, blocos.localidade, { background: '#b45f06', fontColor: '#ffffff', fontWeight: 'bold', fontSize: 11, borderTop: true });
    aplicarEstiloBloco_(sheet, blocos.unidade, { background: '#666666', fontColor: '#ffffff', fontWeight: 'bold', fontSize: 11, borderTop: true });
    aplicarEstiloBloco_(sheet, blocos.tombamentoHeader, { background: '#b7b7b7', fontWeight: 'bold', fontSize: 10, borderTop: true });
    aplicarEstiloBloco_(sheet, blocos.pcasp, { borderTop: true });
    aplicarEstiloBloco_(sheet, blocos.tombamento, { borderTop: true });
    aplicarEstiloBloco_(sheet, blocos.totalGrupo, { borderTop: true });

    sheet.getRange('J:L').clearFormat();
  });

  // ✨ NOVIDADE: Reconstrói a legenda após toda a formatação pesada
  if (contexto) {
    atualizarLegendasPlanilhaContexto_(contexto);
  }

  ss.toast('Formatação concluída com sucesso', '✅ Concluído', 6);
}