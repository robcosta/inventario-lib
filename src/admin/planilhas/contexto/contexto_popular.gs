/**
 * ============================================================
 * CONTEXTO — POPULAR PLANILHA A PARTIR DE CSV_CONTEXTO
 * (INCREMENTAL + LIMPEZA DA PÁGINA PADRÃO)
 * ============================================================
 */
function popularPlanilhaContexto_() {

  // ss = Planilha onde o script está rodando (Admin)
  const ss = SpreadsheetApp.getActiveSpreadsheet(); 
  const ui = SpreadsheetApp.getUi();

  const contexto = obterContextoAtivo_();
  if (!contexto || !contexto.planilhaOperacionalId) {
    ui.alert('Contexto ativo não encontrado.');
    return;
  }

  // planilha = Planilha de Destino (Cliente)
  const planilha = SpreadsheetApp.openById(
    contexto.planilhaOperacionalId
  );

  const pastaCSV = DriveApp.getFolderById(contexto.pastaCSVId);
  if (!pastaCSV) {
    ui.alert('Pasta CSV_CONTEXTO não encontrada.');
    return;
  }

  const arquivos = pastaCSV.getFilesByType(MimeType.CSV);
  if (!arquivos.hasNext()) {
    ui.alert('Nenhum CSV encontrado em CSV_CONTEXTO.');
    return;
  }

  // -------------------------------
  // Mapeia abas existentes na PLANILHA DE DESTINO
  // -------------------------------
  const abasExistentes = {};
  planilha.getSheets().forEach(sheet => {
    abasExistentes[sheet.getName()] = sheet;
  });

  let novos = 0;
  let atualizados = 0;

  toast_('Verificando CSVs do contexto...', 'Processando');

  while (arquivos.hasNext()) {
    const file = arquivos.next();
    const nomeAba = nomeAbaPorCSV_(file.getName());
    const dados = lerCSV_(file);

    if (!dados || dados.length === 0) continue;

    let sheet = abasExistentes[nomeAba];

    if (sheet) {
      sheet.clearContents();
      atualizados++;
    } else {
      // Cria a aba na planilha de DESTINO
      sheet = planilha.insertSheet(nomeAba);
      // Atualiza o mapa para evitar duplicidade no loop
      abasExistentes[nomeAba] = sheet; 
      novos++;
    }

    sheet
      .getRange(1, 1, dados.length, dados[0].length)
      .setValues(dados);
  }

  // 🔥 CORREÇÃO 1: Força o Google a salvar tudo antes de verificar vazias
  SpreadsheetApp.flush();

  // -------------------------------
  // Remove abas vazias se existir
  // 🔥 CORREÇÃO 2: Passa a 'planilha' (destino), não a 'ss' (origem)
  // -------------------------------
  removerAbasVazias_(planilha);  
    
  toast_(
    `Contexto atualizado: ${novos} novo(s), ${atualizados} atualizado(s).`,
    'Concluído',
    6
  );
}
