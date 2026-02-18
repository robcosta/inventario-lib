/**
 * ============================================================
 * DIAGNÓSTICO — CLIENTE
 * ============================================================
 * - Não realiza mutações
 * - Não depende de ADMIN aberto
 * - Usa ID dinâmico da Planilha Geral
 * ============================================================
 */

function executarDiagnosticoCliente_() {
  const ui = SpreadsheetApp.getUi();
  const diagnostico = coletarDiagnosticoCliente_();
  ui.alert(renderDiagnosticoCliente_(diagnostico));
}

function coletarDiagnosticoCliente_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contexto = obterContextoCliente_();
  const sistemaGlobal = obterSistemaGlobal_();

  const resultado = {
    valido: false,
    nome: null,
    planilhas: {
      cliente: ss.getId(),
      admin: null,
      geral: null
    },
    formatacao: {
      admin: false,
      geral: false
    },
    localidades: []
  };

  if (!contexto) {
    return resultado;
  }

  resultado.nome = contexto.nome;
  resultado.planilhas.admin = contexto.planilhaAdminId;

  // 🔵 Resolver ID da geral dinamicamente
  try {
    resultado.planilhas.geral = obterPlanilhaGeralId_();
  } catch (e) {
    resultado.planilhas.geral = null;
  }

  // 🔹 Validações de formatação
  try {
    resultado.formatacao.admin =
      validarPlanilhaFormatada_(contexto.planilhaAdminId);
  } catch (e) {}

  try {
    if (resultado.planilhas.geral) {
      resultado.formatacao.geral =
        validarPlanilhaFormatada_(resultado.planilhas.geral);
    }
  } catch (e) {}

  // 🔹 Localidades (compacto)
  try {
    const pastaLocalidades = DriveApp.getFolderById(contexto.pastaLocalidadesId);
    const pastas = pastaLocalidades.getFolders();

    while (pastas.hasNext()) {
      const pasta = pastas.next();

      const ativa = pasta.getId() === contexto.localidadeAtivaId;

      let valida = true;

      try {
        if (pasta.isTrashed()) valida = false;
      } catch (e) {
        valida = false;
      }

      resultado.localidades.push({
        nome: pasta.getName(),
        ativa,
        valida
      });
    }

  } catch (e) {
    // Ignora erro estrutural
  }

  resultado.valido = contextoClienteValido_(contexto);

  return resultado;
}

function renderDiagnosticoCliente_(d) {

  const linhasLocalidades = d.localidades.length
    ? d.localidades.map(l => {
        const marcadorAtiva = l.ativa ? '*' : '';
        const status = l.valida ? '' : '(!)';
        return `${l.nome}${marcadorAtiva}${status}`;
      }).join(' | ')
    : 'nenhuma encontrada';

  return `
✅ DIAGNÓSTICO DO SISTEMA — CLIENTE

📋 CONTEXTO:
- Válido: ${d.valido ? 'SIM' : 'NÃO'}
- Nome: ${d.nome || 'não definido'}

🆔 PLANILHAS:
- Cliente: ${d.planilhas.cliente || 'não definido'}
- Admin: ${d.planilhas.admin || 'não definido'}
- Geral (global): ${d.planilhas.geral || 'não definido'}

🎨 FORMATAÇÃO:
- Admin formatada: ${d.formatacao.admin ? 'SIM' : 'NÃO'}
- Geral formatada: ${d.formatacao.geral ? 'SIM' : 'NÃO'}

📂 LOCALIDADES:
${linhasLocalidades}

Legenda:
* = ativa
(!) = inválida

📌 OBSERVAÇÕES:
- ID da Geral resolvido dinamicamente
- Diagnóstico não realiza mutações

✅ Diagnóstico concluído!
`;
}
