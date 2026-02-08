/**
 * ============================================================
 * TESTES — PLANILHA GERAL
 * ============================================================
 * Testes automatizados para o sistema de Planilha Geral
 */

function runTestsPlanilhaGeral_() {
  Logger.log('========================================');
  Logger.log('TESTES — PLANILHA GERAL (ID-Based)');
  Logger.log('========================================\n');
  
  const resultados = [];

  resultados.push(test_sistemaGlobalPossuiPropriedades_());
  resultados.push(test_obterPastaGeralComID_());
  resultados.push(test_obterPastaCSVGeralComID_());
  resultados.push(test_obterPlanilhaGeralComID_());

  const falhas = resultados.filter(r => !r.ok);
  const resumo =
    '\n========================================\n' +
    'RESUMO DOS TESTES\n' +
    '========================================\n' +
    'Total: ' + resultados.length + '\n' +
    '✅ Passou: ' + (resultados.length - falhas.length) + '\n' +
    '❌ Falhou: ' + falhas.length + '\n\n' +
    (falhas.length ? 'Falhas:\n' + falhas.map(f => '- ' + f.nome + ': ' + f.erro).join('\n') : '✅ Todos os testes passaram!');

  Logger.log(resumo);
}

/**
 * Teste 1: Verifica se sistema global possui propriedades de pastas
 */
function test_sistemaGlobalPossuiPropriedades_() {
  Logger.log('[TESTE 1] Verificando propriedades do sistema global...');
  
  try {
    const sistema = obterSistemaGlobal_();
    
    const temPastaPlanilhas = 'pastaPlanilhasId' in sistema;
    const temPastaGeral = 'pastaGeralId' in sistema;
    const temPastaCSVGeral = 'pastaCSVGeralId' in sistema;
    const temPlanilhaGeral = 'planilhaGeralId' in sistema;
    
    if (!temPastaPlanilhas || !temPastaGeral || !temPastaCSVGeral || !temPlanilhaGeral) {
      return {
        nome: 'Sistema Global - Propriedades',
        ok: false,
        erro: 'Faltam propriedades: ' + 
          (!temPastaPlanilhas ? 'pastaPlanilhasId ' : '') +
          (!temPastaGeral ? 'pastaGeralId ' : '') +
          (!temPastaCSVGeral ? 'pastaCSVGeralId ' : '') +
          (!temPlanilhaGeral ? 'planilhaGeralId' : '')
      };
    }
    
    Logger.log('✅ Todas as propriedades existem');
    Logger.log('   - pastaPlanilhasId: ' + (sistema.pastaPlanilhasId || 'null'));
    Logger.log('   - pastaGeralId: ' + (sistema.pastaGeralId || 'null'));
    Logger.log('   - pastaCSVGeralId: ' + (sistema.pastaCSVGeralId || 'null'));
    Logger.log('   - planilhaGeralId: ' + (sistema.planilhaGeralId || 'null'));
    
    return {
      nome: 'Sistema Global - Propriedades',
      ok: true,
      erro: ''
    };
    
  } catch (e) {
    return {
      nome: 'Sistema Global - Propriedades',
      ok: false,
      erro: e.message
    };
  }
}

/**
 * Teste 2: Verifica obtenção de pasta GERAL
 */
function test_obterPastaGeralComID_() {
  Logger.log('\n[TESTE 2] Testando obterPastaGeral_()...');
  
  try {
    const pasta = obterPastaGeral_();
    
    if (!pasta) {
      return {
        nome: 'obterPastaGeral_',
        ok: false,
        erro: 'Função retornou null'
      };
    }
    
    const id = pasta.getId();
    const nome = pasta.getName();
    
    Logger.log('✅ Pasta obtida com sucesso');
    Logger.log('   - ID: ' + id);
    Logger.log('   - Nome: ' + nome);
    
    // Verifica se ID foi salvo no sistema
    const sistema = obterSistemaGlobal_();
    const salvou = sistema.pastaGeralId === id;
    
    if (!salvou) {
      Logger.log('⚠️  ID não foi sincronizado no sistema global');
    } else {
      Logger.log('✅ ID sincronizado no sistema global');
    }
    
    return {
      nome: 'obterPastaGeral_',
      ok: true,
      erro: ''
    };
    
  } catch (e) {
    return {
      nome: 'obterPastaGeral_',
      ok: false,
      erro: e.message
    };
  }
}

/**
 * Teste 3: Verifica obtenção de pasta CSV_GERAL
 */
function test_obterPastaCSVGeralComID_() {
  Logger.log('\n[TESTE 3] Testando obterPastaCSVGeral_()...');
  
  try {
    const pasta = obterPastaCSVGeral_();
    
    if (!pasta) {
      return {
        nome: 'obterPastaCSVGeral_',
        ok: false,
        erro: 'Função retornou null'
      };
    }
    
    const id = pasta.getId();
    const nome = pasta.getName();
    
    Logger.log('✅ Pasta CSV_GERAL obtida com sucesso');
    Logger.log('   - ID: ' + id);
    Logger.log('   - Nome: ' + nome);
    
    // Verifica se ID foi salvo no sistema
    const sistema = obterSistemaGlobal_();
    const salvou = sistema.pastaCSVGeralId === id;
    
    if (!salvou) {
      Logger.log('⚠️  ID não foi sincronizado no sistema global');
    } else {
      Logger.log('✅ ID sincronizado no sistema global');
    }
    
    return {
      nome: 'obterPastaCSVGeral_',
      ok: true,
      erro: ''
    };
    
  } catch (e) {
    return {
      nome: 'obterPastaCSVGeral_',
      ok: false,
      erro: e.message
    };
  }
}

/**
 * Teste 4: Verifica obtenção de Planilha Geral
 */
function test_obterPlanilhaGeralComID_() {
  Logger.log('\n[TESTE 4] Testando obterPlanilhaGeral_()...');
  
  try {
    const planilha = obterPlanilhaGeral_();
    
    if (!planilha) {
      Logger.log('⚠️  Planilha Geral não existe ainda (use Criar/Recriar)');
      return {
        nome: 'obterPlanilhaGeral_',
        ok: true,
        erro: ''
      };
    }
    
    const id = planilha.getId();
    const nome = planilha.getName();
    
    Logger.log('✅ Planilha Geral obtida com sucesso');
    Logger.log('   - ID: ' + id);
    Logger.log('   - Nome: ' + nome);
    
    // Verifica se ID foi salvo no sistema
    const sistema = obterSistemaGlobal_();
    const salvou = sistema.planilhaGeralId === id;
    
    if (!salvou) {
      Logger.log('⚠️  ID não foi sincronizado no sistema global');
    } else {
      Logger.log('✅ ID sincronizado no sistema global');
    }
    
    return {
      nome: 'obterPlanilhaGeral_',
      ok: true,
      erro: ''
    };
    
  } catch (e) {
    return {
      nome: 'obterPlanilhaGeral_',
      ok: false,
      erro: e.message
    };
  }
}

/**
 * Teste Manual: Simula criação e verifica salvamento de IDs
 * ATENÇÃO: Este teste NÃO cria planilha real, apenas verifica a lógica
 */
function test_verificarFluxoCriacaoSimulado_() {
  Logger.log('\n[TESTE MANUAL] Verificando fluxo de salvamento de IDs...');
  
  try {
    // Obtém as pastas (força sincronização)
    const pastaGeral = obterPastaGeral_();
    const pastaCSV = obterPastaCSVGeral_();
    
    if (!pastaGeral || !pastaCSV) {
      Logger.log('❌ Erro: pastas não encontradas');
      return;
    }
    
    // Simula o que acontece no criarOuRecriarPlanilhaGeral_
    const idsParaSalvar = {
      pastaGeralId: pastaGeral.getId(),
      pastaCSVGeralId: pastaCSV.getId()
    };
    
    Logger.log('✅ IDs que seriam salvos na criação:');
    Logger.log('   - pastaGeralId: ' + idsParaSalvar.pastaGeralId);
    Logger.log('   - pastaCSVGeralId: ' + idsParaSalvar.pastaCSVGeralId);
    
    // Verifica se estão no sistema
    const sistema = obterSistemaGlobal_();
    Logger.log('\n📊 Estado atual no sistema global:');
    Logger.log('   - pastaPlanilhasId: ' + (sistema.pastaPlanilhasId || 'NULL'));
    Logger.log('   - pastaGeralId: ' + (sistema.pastaGeralId || 'NULL'));
    Logger.log('   - pastaCSVGeralId: ' + (sistema.pastaCSVGeralId || 'NULL'));
    Logger.log('   - planilhaGeralId: ' + (sistema.planilhaGeralId || 'NULL'));
    
  } catch (e) {
    Logger.log('❌ Erro: ' + e.message);
  }
}
