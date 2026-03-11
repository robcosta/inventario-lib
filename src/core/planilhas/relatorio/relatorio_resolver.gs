/**
 * ============================================================
 * RELATÓRIO — RESOLVER ID DA PLANILHA
 * ============================================================
 * Recupera automaticamente o ID da planilha RELATÓRIO quando
 * ausente no contexto e persiste o resultado quando possível.
 */

function resolverPlanilhaRelatorioId_(contexto) {
  const ctx = contexto || obterContextoDominio_();
  if (!ctx) {
    throw new Error('Nenhum contexto ativo.');
  }

  const idAtual = String(ctx.planilhaRelatorioId || '').trim();
  if (idAtual) {
    try {
      SpreadsheetApp.openById(idAtual);
      return idAtual;
    } catch (e) {
      // segue para auto-recuperação
    }
  }

  const idRecuperado = descobrirPlanilhaRelatorioNoDrive_(ctx);
  if (!idRecuperado) {
    throw new Error('Planilha RELATÓRIO não configurada no contexto.');
  }

  persistirPlanilhaRelatorioNoContexto_(ctx, idRecuperado);
  return idRecuperado;
}

function descobrirPlanilhaRelatorioNoDrive_(contexto) {
  if (!contexto || !contexto.pastaLocalidadesId) return null;

  let pastaLocalidades;
  try {
    pastaLocalidades = DriveApp.getFolderById(contexto.pastaLocalidadesId);
  } catch (e) {
    return null;
  }

  const candidatos = [];
  const arquivos = pastaLocalidades.getFilesByType(MimeType.GOOGLE_SHEETS);

  while (arquivos.hasNext()) {
    const file = arquivos.next();
    const nome = String(file.getName() || '').toUpperCase();
    if (
      nome.startsWith('RELATÓRIOS:') ||
      nome.startsWith('RELATÓRIOS:') ||
      nome.startsWith('RELATORIO:') ||
      nome.startsWith('RELATORIOS:')
    ) {
      candidatos.push(file);
    }
  }

  if (!candidatos.length) return null;

  candidatos.sort((a, b) => b.getLastUpdated() - a.getLastUpdated());
  return candidatos[0].getId();
}

function persistirPlanilhaRelatorioNoContexto_(contexto, planilhaRelatorioId) {
  if (!contexto || !planilhaRelatorioId) return;

  const patch = { planilhaRelatorioId: planilhaRelatorioId };

  try {
    if (contextoAdminRegistrado_()) {
      atualizarContextoAdmin_(patch);
      return;
    }
  } catch (e) {}

  try {
    if (contexto.tipo === 'CLIENTE' && typeof atualizarContextoCliente_ === 'function') {
      atualizarContextoCliente_(patch);
      return;
    }
  } catch (e) {}

  try {
    if (contexto.tipo === 'RELATORIO' && typeof salvarContextoRelatorio_ === 'function') {
      salvarContextoRelatorio_({ ...contexto, ...patch });
    }
  } catch (e) {}
}
