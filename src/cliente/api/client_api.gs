/**
 * ============================================================
 * API PÚBLICA — CLIENT (INVENTÁRIO)
 * ============================================================
 */

/** MENU */
function clientRenderMenu() {
  renderMenuClient();
}

function clientRenderMenuComContexto(contexto) {
  renderMenuClient(contexto);
}

/** INFORMAÇÕES */
function clientAtualizarInformacoes() {
  const contexto = _client_obterContexto();
  if (contexto) {
    cliente_montarInformacoes_(contexto);
  }
}

function clientAtualizarInformacoesComContexto(contexto) {
  if (contexto) {
    cliente_montarInformacoes_(contexto);
    return;
  }
  clientAtualizarInformacoes();
}

/** PASTA */
function clientAbrirPastaTrabalho() {
  abrirPastasTrabalho();
}

function clientEscolherPastaTrabalho() {
  escolherPastaTrabalho();
}

function clientCriarPastaTrabalho() {
  criarPastaTrabalho();
}

/** PROCESSAMENTO */
function clientProcessarImagens() {
  processarImagem();
}

/** PLANILHAS */
function clientAbrirPlanilhaGeral() {
  abrirPlanilhaGeral();
}

function clientAbrirPlanilhaContexto() {
  const contexto = _client_obterContexto();
  
  if (!contexto) {
    SpreadsheetApp.getUi().alert('❌ Contexto não encontrado.');
    return;
  }
  
  if (!contexto.planilhaAdminId) {
    SpreadsheetApp.getUi().alert('❌ Contexto incompleto. Não foi possível obter o ID da Planilha Contexto.');
    return;
  }
  
  try {
    // Abrir a planilha contexto
    const url = 'https://docs.google.com/spreadsheets/d/' + contexto.planilhaAdminId + '/edit';
    SpreadsheetApp.getUi().showModelessDialog(
      HtmlService.createHtmlOutput('<script>window.location.href="' + url + '";</script>'),
      'Abrindo...'
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Erro ao abrir Planilha Contexto: ' + e.message);
  }
}

