function cliente_formatarPlanilhaInterface_(spreadsheetId, contexto) {
  const ss = SpreadsheetApp.openById(spreadsheetId);

  // ======================================================
  // OBTÉM / RENOMEIA / CRIA A ABA "INFORMAÇÕES"
  // ======================================================
  let sheet = ss.getSheetByName('INFORMAÇÕES');

  if (!sheet) {
    // Caso padrão: planilha recém-criada
    const paginaPadrao = ss.getSheetByName('Página1');
    if (paginaPadrao) {
      paginaPadrao.setName('INFORMAÇÕES');
      sheet = paginaPadrao;
    } else {
      sheet = ss.insertSheet('INFORMAÇÕES');
    }
  }

  // ======================================================
  // LIMPEZA TOTAL DA ABA (a partir daqui tudo igual)
  // ======================================================
  sheet.clear();
  sheet.clearFormats();
  sheet.setHiddenGridlines(true);

  // ======================================================
  // DIMENSÕES (já definidas anteriormente)
  // ======================================================
  sheet.setRowHeight(4, 60);

  sheet.setColumnWidth(1, 300); // A
  sheet.setColumnWidth(2, 120); // B
  sheet.setColumnWidth(3, 300); // C
  sheet.setColumnWidth(4, 60);  // D
  sheet.setColumnWidth(5, 300); // E
  sheet.setColumnWidth(6, 120); // F

  // ======================================================
  // CABEÇALHO (linha 4)
  // ======================================================
  sheet.getRange('B4:F4').setBackground('#1b1464');

  sheet.getRange('B4')
    .setValue('PRF')
    .setFontFamily('Graduate')
    .setFontSize(36)
    .setFontColor('#f7d046')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.getRange('C4')
    .setValue('Inventário Patrimonial')
    .setFontFamily('Arial')
    .setFontSize(15)
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  // ======================================================
  // TÍTULO
  // ======================================================
  sheet.getRange('D6')
    .setValue('INVENTÁRIO PATRIMONIAL')
    .setFontFamily('Arial')
    .setFontSize(18)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // ======================================================
  // RÓTULOS DO CORPO
  // ======================================================
  const labels = [
    ['C8', 'CONTEXTO DE TRABALHO :'],
    ['C9', 'PASTA DE TRABALHO:'],
    ['C10', 'ACESSOS:'],
    ['C11', '        PROPRIETÁRIO:'],
    ['C12', '        EDITOR:'],
    ['C13', '        LEITOR:']
  ];

  labels.forEach(([cell, text]) => {
    sheet.getRange(cell)
      .setValue(text)
      .setFontFamily('Arial')
      .setFontSize(13)
      .setFontWeight('bold')
      .setHorizontalAlignment('left')
      .setVerticalAlignment('middle');
  });

  // ======================================================
  // RODAPÉ
  // ======================================================
  sheet.getRange('B16:F16')
    .setBackground('#f7d046');

  sheet.getRange('B16')
    .setValue('     Inventário')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontColor('#666666')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  // Merge E16:F16
  sheet.getRange('E16:F16').merge();

  // E16:F16 - Versão
  sheet.getRange('E16')
    .setValue('Versão 1.0 12/01/2025     ')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontColor('#999999')
    .setFontWeight('bold')
    .setHorizontalAlignment('right')
    .setVerticalAlignment('middle');


    //ABA MANUAL
    cliente_formatarAbaManual_(spreadsheetId);
}

function cliente_formatarAbaManual_(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);

  // ======================================================
  // OBTÉM OU CRIA A ABA "MANUAL"
  // ======================================================
  let sheet = ss.getSheetByName('MANUAL');
  if (!sheet) {
    sheet = ss.insertSheet('MANUAL');
  }

  // ======================================================
  // LIMPEZA TOTAL
  // ======================================================
  sheet.clear();
  sheet.clearFormats();
  sheet.setHiddenGridlines(true);

  // ======================================================
  // DIMENSÕES (PIXEL)
  // ======================================================
  sheet.setColumnWidth(1, 50);    // A
  sheet.setColumnWidth(2, 1150);  // B

  sheet.setRowHeight(1, 50);
  sheet.setRowHeight(2, 1780);

  // ======================================================
  // TEXTO DO MANUAL
  // ======================================================
  const texto =
`📘 Manual do Usuário – Planilha do Inventário Patrimonial

🎯 Objetivo desta planilha
Esta planilha é a interface de uso do cliente no sistema de Inventário Patrimonial.
Ela não deve ser editada manualmente. Todas as ações são feitas exclusivamente pelo menu superior.

📌 Onde está o menu?
Ao abrir a planilha, observe o menu na parte superior, próximo aos menus “Arquivo”, “Editar”, etc.
Você verá um menu chamado:
📦 Inventário Patrimonial
É por ele que todas as operações devem ser realizadas.

🧭 O que o menu faz?

▶️ Processamento de Imagens
Use este menu quando:
• você já enviou fotos para a pasta de trabalho indicada
• deseja que o sistema analise, identifique e registre as imagens

O sistema irá:
• ler as fotos da pasta
• identificar patrimônios automaticamente
• registrar o resultado no inventário

⚠️ Importante:
Envie fotos somente para a pasta de trabalho indicada na planilha.

📂 Abrir Pasta de Trabalho
Este item abre diretamente a pasta correta no Google Drive, onde você deve:
• enviar fotos
• organizar subpastas (ex.: UOPs, setores, etc.)
• revisar ou excluir imagens, se necessário

✔️ Você tem permissão total nesta pasta.

🔄 Atualizar Informações
Atualiza as informações exibidas na planilha, como:
• link da pasta de trabalho
• lista de usuários com acesso
• dados do contexto atual

🚫 O que NÃO fazer
• Não edite células manualmente
• Não altere cores ou textos da planilha
• Não mova esta planilha de pasta
• Não envie fotos fora da pasta indicada

ℹ️ Dicas importantes
A planilha é apenas uma interface.
Todo o processamento é feito automaticamente pelo sistema.
Em caso de dúvida, entre em contato com o administrador do inventário.

✅ Resumo rápido
• Use sempre o menu superior
• Envie fotos somente para a pasta indicada
• Execute o processamento pelo menu
• Não edite a planilha manualmente`;

  // ======================================================
  // RICH TEXT
  // ======================================================
  let rt = SpreadsheetApp.newRichTextValue().setText(texto);

  function boldIfExists(fragment, size) {
    const i = texto.indexOf(fragment);
    if (i === -1) return;

    rt = rt.setTextStyle(
      i,
      i + fragment.length,
      SpreadsheetApp.newTextStyle()
        .setBold(true)
        .setFontFamily('Arial')
        .setFontSize(size)
        .build()
    );
  }

  // Títulos e seções (apenas se existirem)
  boldIfExists('📘 Manual do Usuário', 16);
  boldIfExists('🎯 Objetivo desta planilha', 13);
  boldIfExists('📌 Onde está o menu?', 13);
  boldIfExists('🧭 O que o menu faz?', 13);
  boldIfExists('▶️ Processamento de Imagens', 13);
  boldIfExists('📂 Abrir Pasta de Trabalho', 13);
  boldIfExists('🔄 Atualizar Informações', 13);
  boldIfExists('🚫 O que NÃO fazer', 13);
  boldIfExists('ℹ️ Dicas importantes', 13);
  boldIfExists('✅ Resumo rápido', 13);

  // ======================================================
  // APLICA NA CÉLULA B2
  // ======================================================
  sheet.getRange('B2')
    .setRichTextValue(rt.build())
    .setWrap(true)
    .setVerticalAlignment('top')
    .setHorizontalAlignment('left');
}
