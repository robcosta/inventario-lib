/**
 * ============================================================
 * PLANILHA GERAL — CRIAR OU RECRIAR (DOMÍNIO)
 * ============================================================
 *
 * Cria ou recria a Planilha Geral a partir dos CSVs
 * armazenados na pasta global CSV_GERAL.
 */
function criarOuRecriarPlanilhaGeral_() {
  const ui = SpreadsheetApp.getUi();
  const sistemaGlobal = obterSistemaGlobal_();
  const contexto = obterContextoDominio_();

  if (!contexto) {
    ui.alert("❌ Nenhum contexto ativo.");
    return;
  }

  if (!sistemaGlobal.pastaGeralId || !sistemaGlobal.pastaCSVGeralId) {
    ui.alert("❌ Pastas globais da Planilha Geral não configuradas.");
    return;
  }

  const pastaGeral = DriveApp.getFolderById(sistemaGlobal.pastaGeralId);
  const pastaCSV = DriveApp.getFolderById(sistemaGlobal.pastaCSVGeralId);

  const csvFiles = pastaCSV.getFilesByType(MimeType.CSV);

  if (!csvFiles.hasNext()) {
    ui.alert("Nenhum arquivo CSV encontrado em CSV_GERAL.");
    return;
  }

  // ============================================================
  // Confirma recriação
  // ============================================================

  if (contexto.planilhaGeralId) {
    const resp = ui.alert(
      "Planilha Geral",
      "Já existe uma Planilha Geral.\n\nDeseja RECRIAR a partir dos CSVs?\n\n⚠️ A planilha atual será removida.",
      ui.ButtonSet.YES_NO,
    );

    if (resp !== ui.Button.YES) {
      toast_("Operação cancelada.", "Planilha Geral");
      return;
    }

    try {
      DriveApp.getFileById(contexto.planilhaGeralId).setTrashed(true);
    } catch (e) {
      // silencioso — planilha pode já não existir
    }
  }

  toast_("Criando nova Planilha Geral...", "Planilha Geral");

  const ss = SpreadsheetApp.create("GERAL: EM CONSTRUÇÃO");
  DriveApp.getFileById(ss.getId()).moveTo(pastaGeral);

  let dataMaisRecenteCSV = null;
  let criouAlgumaAba = false;

  const files = pastaCSV.getFilesByType(MimeType.CSV);

  toast_("Importando CSVs...", "Planilha Geral");

  while (files.hasNext()) {
    const file = files.next();
    const dados = lerCSVComEdicao_(file);

    if (!dados || !dados.length) continue;

    const nomeAba = nomeAbaPorCSV_(file.getName());
    const sheet = ss.insertSheet(nomeAba);

    sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

    criouAlgumaAba = true;

    const dataArquivo = file.getLastUpdated();
    if (!dataMaisRecenteCSV || dataArquivo > dataMaisRecenteCSV) {
      dataMaisRecenteCSV = dataArquivo;
    }
  }

  if (criouAlgumaAba) {
    ss.deleteSheet(ss.getSheets()[0]);
  }

  // ============================================================
  // RENOMEAR PLANILHA (EMITIDO EM OU FALLBACK)
  // ============================================================

  let nomeFinal = null;

  // 🔍 1️⃣ Tentar extrair "EMITIDO EM"
  const dataEmitido = extrairDataEmitidoEm_(ss);

  if (dataEmitido) {
    nomeFinal = `GERAL: EMITIDO EM ${dataEmitido}`;
  } else if (dataMaisRecenteCSV) {
    // 🔁 Fallback padrão
    const dataFormatada = Utilities.formatDate(
      dataMaisRecenteCSV,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd HH:mm",
    );

    nomeFinal = `GERAL: Importado em ${dataFormatada}`;
  }

  // 🔹 Aplicar nome se definido
  if (nomeFinal) {
    ss.rename(nomeFinal);
  }

  // ============================================================
  // Atualizações de estado
  // ============================================================

  // 🔹 Atualiza SISTEMA GLOBAL (fonte única)
  atualizarSistemaGlobal_({
    planilhaGeralId: ss.getId(),
  });

  // 🔹 Atualiza contexto ativo (ADMIN ou CLIENTE)
  persistirContextoAtual_({
    planilhaGeralId: ss.getId(),
  });

  toast_("Planilha Geral criada com sucesso!", "Concluído", 6);
  ui.alert(`✅ Planilha Geral criada com sucesso!\n\nNome:\n${ss.getName()}`);
}

/**
 * ============================================================
 * GERAL — EXTRAIR DATA "EMITIDO EM" (até 10 primeiras linhas)
 * ============================================================
 */
function extrairDataEmitidoEm_(spreadsheet) {
  const sheets = spreadsheet.getSheets();
  if (!sheets.length) return null;

  const sheet = sheets[0]; // primeira aba criada

  const range = sheet.getRange(1, 1, 10, 30); // A1:AD10 (mais seguro)
  const valores = range.getValues();

  const regexData = /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/;

  for (let i = 0; i < valores.length; i++) {
    const linhaTexto = valores[i].join(" "); // junta toda a linha

    if (linhaTexto.toUpperCase().includes("EMITIDO EM")) {
      const match = linhaTexto.match(regexData);

      if (match) {
        return match[0];
      }
    }
  }

  return null;
}
