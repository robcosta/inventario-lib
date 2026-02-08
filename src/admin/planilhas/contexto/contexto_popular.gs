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
<<<<<<< HEAD
  if (!contexto || !contexto.planilhaOperacionalId) {
=======
  if (!contexto || !contexto.planilhaAdminId) {
>>>>>>> bugfix-contexto-persistencia
    ui.alert('Contexto ativo não encontrado.');
    return;
  }

  // planilha = Planilha de Destino (Cliente)
  const planilha = SpreadsheetApp.openById(
<<<<<<< HEAD
    contexto.planilhaOperacionalId
=======
    contexto.planilhaAdminId
>>>>>>> bugfix-contexto-persistencia
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

/**
 * ============================================================
 * REMOVER ABAS VAZIAS
 * ============================================================
 */

function removerAbasVazias_(planilhaAlvo) {

  // Usa a planilha passada por parâmetro
  const sheets = planilhaAlvo.getSheets();
  
  // Tenta ativar a primeira aba segura (Controle ou índice 0)
  // Isso evita erro ao deletar a aba que estava ativa
  try {
     const controle = planilhaAlvo.getSheetByName('__CONTROLE_PROCESSAMENTO__');
     if(controle) {
       planilhaAlvo.setActiveSheet(controle);
     } else {
       planilhaAlvo.setActiveSheet(sheets[0]);
     }
  } catch(e) {
    // Silencia erro se não conseguir focar (comum em openById)
  }

  const abasParaRemover = [];

  sheets.forEach(sheet => {

    const nome = sheet.getName();

    // ❌ Nunca remove aba técnica
    if (nome === '__CONTROLE_PROCESSAMENTO__') return;

    // Verifica se tem dados reais
    const range = sheet.getDataRange();
    
    // Otimização: Se for apenas A1 e estiver vazio, nem pega values
    if (range.getLastRow() === 1 && range.getLastColumn() === 1 && range.getValue() === "") {
        abasParaRemover.push(sheet);
        return;
    }

    const values = range.getValues();
    let temDadoReal = false;

    // Loop quebra assim que acha 1 dado, economizando processamento
    outerLoop:
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values[i].length; j++) {
        const v = values[i][j];
        if (v !== '' && v !== null && v !== undefined) {
          temDadoReal = true;
          break outerLoop;
        }
      }
    }

    if (!temDadoReal) {
      abasParaRemover.push(sheet);
    }
  });

  if (abasParaRemover.length === 0) return;

  // 🔒 Remove de trás para frente para evitar conflito de índice
  abasParaRemover.reverse().forEach(sheet => {
    try {
      planilhaAlvo.deleteSheet(sheet);
    } catch (e) {
      Logger.log(`Erro ao deletar aba ${sheet.getName()}: ${e.message}`);
    }
  });

  // Nota: Toast só aparece se for a planilha ativa do usuário
  try {
    SpreadsheetApp.getActive().toast(
      `🧹 ${abasParaRemover.length} aba(s) vazia(s) removida(s)`,
      'Limpeza concluída',
      5
    );
  } catch(e) {}
}