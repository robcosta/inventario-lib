/**
 * ============================================================
 * PLANILHAS - ORDENACAO ESTRUTURAL DE ABAS
 * ============================================================
 *
 * Regra estrutural compartilhada:
 * 1) CAPA sempre na primeira posicao (se existir)
 * 2) MANUAL sempre na segunda posicao (se existir)
 * 3) Abas tecnicas sempre no fim:
 *    - __CONTROLE_PROCESSAMENTO__ (prioridade de ultima aba)
 *    - __FILA_PROCESSAMENTO__ (fica antes do controle, quando ambas existirem)
 *    - CONTROLE_PROCESSAMENTO (legado)
 */
function organizarOrdemAbasEstruturais_(ss, opcoes) {
  if (!ss) return;

  const cfg = opcoes || {};
  const abasPrioritarias = Array.isArray(cfg.abasPrioritarias) ? cfg.abasPrioritarias : [];
  const abaAtivaFinalPreferida = String(cfg.abaAtivaFinal || '').trim();

  function moverParaPosicao_(nomeAba, posicao) {
    if (!nomeAba) return false;
    try {
      const sheet = ss.getSheetByName(nomeAba);
      if (!sheet) return false;
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(posicao);
      return true;
    } catch (e) {
      Logger.log('[ABAS][ORDENACAO][AVISO] Falha ao mover "' + nomeAba + '": ' + e.message);
      return false;
    }
  }

  try {
    let posicao = 1;

    if (ss.getSheetByName('CAPA')) {
      moverParaPosicao_('CAPA', posicao);
      posicao++;
    }

    if (ss.getSheetByName('MANUAL')) {
      moverParaPosicao_('MANUAL', posicao);
      posicao++;
    }

    abasPrioritarias.forEach(nome => {
      const nomeAba = String(nome || '').trim();
      if (!nomeAba) return;
      if (nomeAba === 'CAPA' || nomeAba === 'MANUAL') return;
      if (
        nomeAba === '__CONTROLE_PROCESSAMENTO__' ||
        nomeAba === '__FILA_PROCESSAMENTO__' ||
        nomeAba === 'CONTROLE_PROCESSAMENTO'
      ) return;
      if (!ss.getSheetByName(nomeAba)) return;

      if (moverParaPosicao_(nomeAba, posicao)) {
        posicao++;
      }
    });

    // Tecnicas no fim, mantendo __CONTROLE_PROCESSAMENTO__ como ultima aba.
    ['__FILA_PROCESSAMENTO__', 'CONTROLE_PROCESSAMENTO', '__CONTROLE_PROCESSAMENTO__'].forEach(nomeAba => {
      if (ss.getSheetByName(nomeAba)) {
        moverParaPosicao_(nomeAba, ss.getSheets().length);
      }
    });

    const candidatasAtiva = [
      abaAtivaFinalPreferida,
      'CAPA',
      'MANUAL'
    ];

    for (let i = 0; i < candidatasAtiva.length; i++) {
      const nome = candidatasAtiva[i];
      if (!nome) continue;
      const sheet = ss.getSheetByName(nome);
      if (!sheet) continue;
      ss.setActiveSheet(sheet);
      break;
    }
  } catch (e) {
    Logger.log('[ABAS][ORDENACAO][ERRO] ' + e.message);
  }
}
