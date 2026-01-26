/**
 * Orquestra o processamento de imagens da pasta de trabalho selecionada.
 */
function processarImagem() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();

  // 1. Tenta obter o contexto ativo
  let contextoAtivo = obterContextoAtivo_();
  
  // 2. FORÇA A BUSCA: Se o contexto não tem o ID da pasta, buscamos direto na fonte
  if (!contextoAtivo?.pastaTrabalhoId) {
    const idSalvo = props.getProperty('CONTEXTO_pastaTrabalhoId'); // Verifique se o nome da chave está correto no seu sistema
    const nomeSalvo = props.getProperty('CONTEXTO_pastaTrabalhoNome');
    
    if (idSalvo) {
      contextoAtivo = contextoAtivo || {};
      contextoAtivo.pastaTrabalhoId = idSalvo;
      contextoAtivo.pastaTrabalhoNome = nomeSalvo;
    }
  }

  // 3. Validação final
  if (!contextoAtivo || !contextoAtivo.pastaTrabalhoId) {
    ui.alert('⚠️ Atenção', 'O sistema não conseguiu identificar uma PASTA DE TRABALHO ativa.\n\nPor favor, execute "Escolher Pasta de Trabalho" novamente.', ui.ButtonSet.OK);
    return;
  }

  const nomePasta = contextoAtivo.pastaTrabalhoNome;

  // 4. Confirmação
  const confirmacao = ui.alert(
    '🚀 Iniciar Processamento',
    `Deseja analisar as imagens da pasta:\n📂 "${nomePasta}"?\n\n` +
    '• Imagens já identificadas não gastarão cota.\n' +
    '• O destaque será feito com a cor oficial da pasta.',
    ui.ButtonSet.YES_NO
  );

  if (confirmacao !== ui.Button.YES) return;

  // 5. Busca Identidade (Cor)
  const identidade = gerenciarIdentidadePasta_(contextoAtivo.pastaTrabalhoId);
  
  const contextoVision = {
    idPastaTrabalho: contextoAtivo.pastaTrabalhoId,
    nomePastaTrabalho: nomePasta,
    corDestaque: identidade ? identidade.cor : "#4285F4",
    corGeral: "#f3f3f3",
    planilhaContextoId: contextoAtivo.planilhaOperacionalId,
    planilhaGeralId: obterPlanilhaGeralId_(),
    ABA_CONTROLE: '__CONTROLE_PROCESSAMENTO__'
  };

  try {
    vision.batchProcessarPastaCompleta(contextoAtivo.pastaTrabalhoId, contextoVision);
    ui.alert('✅ Concluído', `Pasta "${nomePasta}" processada!`, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Erro', e.message, ui.ButtonSet.OK);
  }
}