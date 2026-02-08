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

<<<<<<< HEAD
=======
  // ✅ VALIDAÇÃO: Verificar se a pasta ativa ainda existe
  if (!verificarSePastaExiste_(contextoAtivo.pastaTrabalhoId)) {
    ui.alert(
      '⚠️ Pasta de Trabalho Deletada',
      'A pasta de trabalho ativa foi deletada ou está na lixeira.\n\n' +
      'Escolha outra pasta ou crie uma nova no menu:\n' +
      '🗂️ Pastas de Trabalho'
    );
    return;
  }

  // ===== VALIDAÇÃO: VERIFICAR FORMATAÇÃO DAS PLANILHAS =====
  const contextoFormatado = validarPlanilhaContextoFormatada_();
  const geralFormatado = validarPlanilhaGeralFormatada_();
  
  // Se alguma planilha não estiver formatada
  if (!contextoFormatado || !geralFormatado) {
    let planilhasNaoFormatadas = [];
    if (!contextoFormatado) planilhasNaoFormatadas.push('📋 Contexto');
    if (!geralFormatado) planilhasNaoFormatadas.push('📋 Geral');
    
    const planilhaNaoFormatada = planilhasNaoFormatadas.join('\n');
    
    const resposta = ui.alert(
      '⚠️ Planilhas Não Formatadas',
      `Processamento de imagens requer que todas as planilhas estejam formatadas.\n\n` +
      `Planilha(s) que precisa(m) de formatação:\n${planilhaNaoFormatada}\n\n` +
      `Deseja formatar agora?`,
      ui.ButtonSet.YES_NO
    );
    
    // Se usuário clicou NÃO
    if (resposta !== ui.Button.YES) {
      ui.alert('❌ Cancelado', 'Processamento cancelado. Formate as planilhas e tente novamente.', ui.ButtonSet.OK);
      return;
    }
    
    // Formatar apenas as planilhas que precisam
    try {
      if (!contextoFormatado) {
        formatarPlanilhaContexto_();
      }
      if (!geralFormatado) {
        formatarPlanilhaGeral_();
      }
      
      ui.alert(
        '✅ Formatação Concluída',
        'Planilhas formatadas com sucesso!\n\n' +
        'É necessário reiniciar o processamento das imagens.\n\n' +
        'Acione "Processar Imagens" novamente.',
        ui.ButtonSet.OK
      );
    } catch (e) {
      console.error('Erro ao formatar planilhas:', e.message);
      ui.alert(
        '❌ Erro na Formatação',
        'Ocorreu um erro ao formatar as planilhas:\n\n' + e.message,
        ui.ButtonSet.OK
      );
    }
    return;
  }

>>>>>>> bugfix-contexto-persistencia
  // ===== PASSO 1B: COMPLETAR CONTEXTO COM DADOS DO ADMIN =====
  // Obter planilhaGeralId APENAS das ScriptProperties (seguro)
  if (!contextoAtivo.planilhaGeralId) {
    try {
      const planilhaGeralId = obterPlanilhaGeralId_();
      
      if (planilhaGeralId) {
        // Validar se a planilha existe e está acessível
        try {
          SpreadsheetApp.openById(planilhaGeralId);
          contextoAtivo.planilhaGeralId = planilhaGeralId;
        } catch (e) {
          ui.alert(
            '⚠️ Planilha Geral Inacessível',
            'A Planilha Geral registrada não está acessível.\n\n' +
            'Recrie a planilha pelo menu:\n' +
            '📘 Planilha Geral > 🧱 Criar / Recriar',
            ui.ButtonSet.OK
          );
          return;
        }
      } else {
        ui.alert(
          '⚠️ Planilha Geral Não Configurada',
          'O sistema requer uma Planilha Geral para processar imagens.\n\n' +
          '📋 Passos para configurar:\n' +
          '1. Coloque os CSVs em: Inventario Patrimonial/PLANILHAS/GERAL/CSV_GERAL\n' +
          '2. Menu: 📘 Planilha Geral > 🧱 Criar / Recriar',
          ui.ButtonSet.OK
        );
        return;
      }
      
<<<<<<< HEAD
      // Garantir que planilhaOperacionalId está definido
      if (!contextoAtivo.planilhaOperacionalId) {
        const adminCtx = docProps.getProperty('ADMIN_CONTEXTO_ATIVO');
        if (adminCtx) {
          const adminContexto = JSON.parse(adminCtx);
          contextoAtivo.planilhaOperacionalId = adminContexto.planilhaOperacionalId;
=======
      // Garantir que planilhaAdminId está definido
      if (!contextoAtivo.planilhaAdminId) {
        const adminCtx = docProps.getProperty('ADMIN_CONTEXTO_ATIVO');
        if (adminCtx) {
          const adminContexto = JSON.parse(adminCtx);
          contextoAtivo.planilhaAdminId = adminContexto.planilhaAdminId;
>>>>>>> bugfix-contexto-persistencia
        }
      }
    } catch (e) {
      console.error('❌ Erro crítico ao obter planilhaGeralId:', e.message);
      ui.alert(
        '❌ Erro',
        'Erro ao validar configuração do sistema.\n\n' + e.message,
        ui.ButtonSet.OK
      );
      return;
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
<<<<<<< HEAD
    ui.alert('❌ Cancelado', 'Processamento cancelado pelo usuário.');
=======
    ui.alert('❌ Cancelado', 'Processamento cancelado pelo usuário.', ui.ButtonSet.OK);
>>>>>>> bugfix-contexto-persistencia
    return;
  }

  // ===== PASSO 3: BUSCAR COR DO DESTAQUE =====
  // Prioridade:
<<<<<<< HEAD
  // 1. Cor armazenada no contexto (escolhida pelo usuário na planilha)
  // 2. Cor da identidade da pasta (paleta automática)
  // 3. Cor padrão azul
  if (!contextoAtivo.corDestaque) {
    const identidade = gerenciarIdentidadePasta_(contextoAtivo.pastaTrabalhoId);
    contextoAtivo.corDestaque = identidade?.cor || '#1557B0';
  }

=======
  // 1. Cor da identidade da pasta (paleta automática)
  // 2. Cor armazenada no contexto (caso ainda exista)
  // 3. Cor padrão azul
  let corDestaque = null;
  try {
    const identidade = gerenciarIdentidadePasta_(contextoAtivo.pastaTrabalhoId, null, contextoAtivo);
    corDestaque = identidade?.cor || null;
  } catch (e) {
    console.warn('processarImagem: falha ao obter cor da pasta:', e.message);
  }

  contextoAtivo.corDestaque = corDestaque || contextoAtivo.corDestaque || '#1557B0';

>>>>>>> bugfix-contexto-persistencia
  // ===== PASSO 4: CHAMAR VISION COM WRAPPER =====
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
    
    ui.alert(
      '❌ Erro no Processamento',
      'Ocorreu um erro inesperado:\n\n' + e.message,
      ui.ButtonSet.OK
    );
    return;
  }

  // ===== PASSO 5: OBTER FEEDBACK COMPLETO =====
  let feedback = null;

  if (resultado.sucesso) {
    // Ler logs de auditoria
<<<<<<< HEAD
    feedback = obterFeedbackCompleto_(resultado, contextoAtivo.planilhaOperacionalId);
=======
    feedback = obterFeedbackCompleto_(resultado, contextoAtivo.planilhaAdminId);
>>>>>>> bugfix-contexto-persistencia
  } else {
    feedback = {
      sucesso: false,
      titulo: '❌ Processamento Falhou',
      mensagem: resultado.detalhes.mensagem || 'Erro desconhecido',
      tempo_ms: resultado.tempo_ms
    };
  }

  // ===== PASSO 6: EXIBIR RESULTADO =====
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