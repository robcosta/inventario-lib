/**
 * ============================================================
 * DIAGNÓSTICO
 * ============================================================
 */
/**
 * Executa diagnóstico do sistema
 */
function executarDiagnostico_() {
  const ui = SpreadsheetApp.getUi();
  const diagnostico = coletarDiagnosticoContexto_();
  ui.alert(renderDiagnosticoContexto_(diagnostico));
}

function renderDiagnosticoContexto_(d) {
  return `
✅ DIAGNÓSTICO DO SISTEMA — INVENTÁRIO

📋 CONTEXTO ADMIN

🧠 ESTADO DO CONTEXTO:
- Contexto válido: ${d.valido ? 'SIM' : 'NÃO'}
- Nome do contexto: ${d.nome}

🆔 IDS DAS PLANILHAS:
- Planilha ADMIN: ${d.planilhas.admin || 'não definido'}
- Planilha CLIENTE: ${d.planilhas.cliente || 'não definido'}
- Planilha RELATÓRIO: ${d.planilhas.relatorio || 'não definido'}
- Planilha GERAL (global): ${d.planilhas.geral || 'não definido'}

📁 ESTRUTURA DO CONTEXTO (Drive):
- Pasta CONTEXTOS (global): ${d.pastas.contextoGlobal || 'não configurado'}
- Pasta do CONTEXTO (${d.nome}): ${d.pastas.contexto || 'não definido'}
  ├── Pasta PLANILHA: ${d.pastas.planilha || 'não definido'}
  │   └── Pasta CSV_ADMIN: ${d.pastas.csvAdmin || 'não definido'}
  └── Pasta LOCALIDADES: ${d.pastas.localidades || 'não definido'}

🌍 SISTEMA GLOBAL:
- Pasta RAIZ: ${d.pastas.raiz || 'não configurado'}
- Pasta GERAL: ${d.pastas.geral || 'não configurado'}
- Pasta CSV_GERAL: ${d.pastas.csvGeral || 'não configurado'}

📌 OBSERVAÇÕES:
- Modelo: ID-based
- Diagnóstico não realiza mutações
- Fonte: ScriptProperties + Drive

✅ Diagnóstico concluído!
`;
}

function coletarDiagnosticoContexto_() {
  const sistemaGlobal = obterSistemaGlobal_();
  const contexto = obterContextoAtivo_();
  const valido = contextoAdminValido_();

  return {
    valido,
    nome: contexto?.nome || 'não definido',

    planilhas: {
      admin: contexto?.planilhaAdminId || null,
      cliente: contexto?.planilhaClienteId || null,
      relatorio: contexto?.planilhaRelatorioId || null,
      geral: sistemaGlobal.planilhaGeralId || null
    },

    pastas: {
      contextoGlobal: sistemaGlobal.pastaContextoId || null,
      contexto: contexto?.pastaContextoId || null,
      planilha: contexto?.pastaPlanilhasId || null,
      csvAdmin: contexto?.pastaCSVAdminId || null,
      localidades: contexto?.pastaLocalidadesId || null,
      raiz: sistemaGlobal.pastaRaizId || null,
      geral: sistemaGlobal.pastaGeralId || null,
      csvGeral: sistemaGlobal.pastaCSVGeralId || null
    }
  };
}

