/**
 * ============================================================
 * PROCESSADOR DE IMAGENS v3.0 - REFATORADO
 * ============================================================
 * Orquestra o processamento de imagens da pasta de trabalho selecionada.
 * Com validação, retry automático, feedback e auditoria.
 * Integração total com inventario-vision-core v3.0.0
 */
function processarImagem() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();
  const docProps = PropertiesService.getDocumentProperties();

  // ===== PASSO 1: OBTER CONTEXTO =====
  let contextoAtivo = obterContextoAtivo_();

  // Fallback: tentar buscar propriedades individuais
  if (!contextoAtivo?.pastaTrabalhoId) {
    const idSalvo = props.getProperty('CONTEXTO_pastaTrabalhoId');
    const nomeSalvo = props.getProperty('CONTEXTO_pastaTrabalhoNome');

    if (idSalvo) {
      contextoAtivo = contextoAtivo || {};
      contextoAtivo.pastaTrabalhoId = idSalvo;
      contextoAtivo.pastaTrabalhoNome = nomeSalvo;
    }
  }

  // Validação básica
  if (!contextoAtivo || !contextoAtivo.pastaTrabalhoId) {
    ui.alert(
      '⚠️ Contexto Inválido',
      'Sistema sem pasta de trabalho ativa.\n\nExecute "Escolher Pasta de Trabalho" novamente.',
      ui.ButtonSet.OK
    );
    return;
  }

  // ===== PASSO 1B: COMPLETAR CONTEXTO COM DADOS DO ADMIN =====
  // Se não houver planilhaGeralId, tentar recuperar do contexto do ADMIN
  if (!contextoAtivo.planilhaGeralId) {
    try {
      const adminCtx = docProps.getProperty('ADMIN_CONTEXTO_ATIVO');
      if (adminCtx) {
        const adminContexto = JSON.parse(adminCtx);
        // Use a planilha operacional como a "geral" se não houver outra definida
        contextoAtivo.planilhaGeralId = adminContexto.planilhaOperacionalId;
        contextoAtivo.planilhaOperacionalId = adminContexto.planilhaOperacionalId;
      }
    } catch (e) {
      console.warn('⚠️ Não foi possível recuperar planilhaGeralId do contexto admin:', e.message);
    }
  }

  const nomePasta = contextoAtivo.pastaTrabalhoNome || 'Sem nome';

  // ===== PASSO 2: CONFIRMAÇÃO =====
  const confirmacao = ui.alert(
    '🚀 Processar Pasta',
    `Analisar imagens de:\n📂 "${nomePasta}"?\n\n` +
      '• Imagens já identificadas não gastarão cota.\n' +
      '• O destaque será feito com a cor oficial.',
    ui.ButtonSet.YES_NO
  );

  if (confirmacao !== ui.Button.YES) {
    ui.alert('❌ Cancelado', 'Processamento cancelado pelo usuário.');
    return;
  }

  // ===== PASSO 3: BUSCAR COR DO DESTAQUE =====
  // Prioridade:
  // 1. Cor armazenada no contexto (escolhida pelo usuário na planilha)
  // 2. Cor da identidade da pasta (paleta automática)
  // 3. Cor padrão azul
  if (!contextoAtivo.corDestaque) {
    const identidade = gerenciarIdentidadePasta_(contextoAtivo.pastaTrabalhoId);
    contextoAtivo.corDestaque = identidade?.cor || '#1557B0';
  }

  // ===== PASSO 4: MODAL DE PROGRESSO =====
  const html = HtmlService.createHtmlOutput(`
    <p style="font-family: sans-serif; font-size: 14px;">
      <strong>⏳ Processando...</strong><br/>
      Pasta: <strong>${nomePasta}</strong><br/>
      <br/>
      Esta janela será fechada automaticamente quando concluir.
    </p>
  `);
  html.setWidth(400).setHeight(150);
  ui.showModalDialog(html, 'Processamento em Andamento');

  // Flag para rastrear se o modal foi aberto
  let modalAberto = true;

  // ===== PASSO 5: CHAMAR VISION COM WRAPPER =====
  let resultado = null;
  try {
    resultado = processarPastaComVision_(contextoAtivo, {
      maxTentativas: 3,
      delayMs: 1500,
      callbacks: {
        onInicio: (info) => console.log('✨ Iniciado:', JSON.stringify(info)),
        onSucesso: (info) => console.log('✅ Sucesso:', JSON.stringify(info)),
        onErro: (erro) => console.error('❌ Erro:', erro.mensagem),
        onTentativa: (info) => console.log(`Retry ${info.tentativa}/${info.total}`)
      }
    });
  } catch (e) {
    console.error('❌ Exceção durante processamento:', e.message);
    modalAberto = false;
    
    // Fechar o modal se ainda estiver aberto
    try {
      ui.closeModalDialog();
    } catch (ex) {
      // Modal pode não estar disponível
    }
    
    ui.alert(
      '❌ Erro no Processamento',
      'Ocorreu um erro inesperado:\n\n' + e.message,
      ui.ButtonSet.OK
    );
    return;
  }

  // ===== PASSO 6: OBTER FEEDBACK COMPLETO =====
  let feedback = null;

  if (resultado.sucesso) {
    // Ler logs de auditoria
    feedback = obterFeedbackCompleto_(resultado, contextoAtivo.planilhaOperacionalId);
  } else {
    feedback = {
      sucesso: false,
      titulo: '❌ Processamento Falhou',
      mensagem: resultado.detalhes.mensagem || 'Erro desconhecido',
      tempo_ms: resultado.tempo_ms
    };
  }

  // ===== PASSO 7: EXIBIR RESULTADO =====
  // Fechar modal apenas se foi aberto com sucesso
  if (modalAberto) {
    try {
      ui.closeModalDialog();
    } catch (e) {
      console.warn('⚠️ Erro ao fechar modal:', e.message);
    }
  }

  // Construir mensagem detalhada
  let mensagemFinal = feedback.titulo + '\n\n';

  if (feedback.resumo) {
    mensagemFinal += `✅ Sucesso: ${feedback.resumo.sucesso}\n`;
    mensagemFinal += `❌ Erro: ${feedback.resumo.erro}\n`;
    mensagemFinal += `📊 Taxa: ${feedback.resumo.percentual}%\n\n`;

    if (feedback.erros_amostra && feedback.erros_amostra.length > 0) {
      mensagemFinal += 'Erros encontrados:\n';
      mensagemFinal += feedback.erros_amostra.join('\n') + '\n';
    }
  } else {
    mensagemFinal += feedback.mensagem + '\n';
  }

  mensagemFinal += `\n⏱️ Tempo: ${feedback.tempo_ms}ms`;

  ui.alert(feedback.titulo, mensagemFinal, ui.ButtonSet.OK);

  // Log de auditoria local
  console.log('=== PROCESSAMENTO COMPLETO ===');
  console.log('Resultado:', JSON.stringify(feedback, null, 2));
}