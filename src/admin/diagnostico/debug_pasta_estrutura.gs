/**
 * ============================================================
 * DEBUG - IDENTIFICAR ESTRUTURA DE PASTAS
 * ============================================================
 * Identifica a hierarquia completa de uma pasta no Drive
 */

function debugEstruturaPastaCSVGeral_() {
  // ID da pasta correta fornecida pelo usuário
  const pastaCSVGeralCorreta = '15bhiBSV4JAsbgYxCkwB2bTmEvSNVLwQz';
  
  Logger.log('========================================');
  Logger.log('DEBUG - ESTRUTURA DE PASTAS CSV_GERAL');
  Logger.log('========================================\n');
  
  try {
    const pasta = DriveApp.getFolderById(pastaCSVGeralCorreta);
    Logger.log('✅ Pasta encontrada: ' + pasta.getName());
    Logger.log('   ID: ' + pastaCSVGeralCorreta);
    Logger.log('   URL: https://drive.google.com/drive/folders/' + pastaCSVGeralCorreta);
    
    // Subir a hierarquia
    Logger.log('\n📁 HIERARQUIA (de baixo para cima):');
    let nivel = 0;
    let pastaAtual = pasta;
    
    while (true) {
      const indent = '   '.repeat(nivel);
      Logger.log(indent + '└─ ' + pastaAtual.getName() + ' (ID: ' + pastaAtual.getId() + ')');
      
      const pais = pastaAtual.getParents();
      if (!pais.hasNext()) {
        Logger.log('\n✅ Chegou na raiz do Drive (My Drive)');
        break;
      }
      
      pastaAtual = pais.next();
      nivel++;
      
      if (nivel > 10) {
        Logger.log('\n⚠️ Limite de 10 níveis atingido');
        break;
      }
    }
    
    // Mostrar estrutura invertida (de cima para baixo)
    Logger.log('\n📊 CAMINHO COMPLETO (de cima para baixo):');
    const caminho = [];
    pastaAtual = pasta;
    
    while (true) {
      caminho.unshift({
        nome: pastaAtual.getName(),
        id: pastaAtual.getId()
      });
      
      const pais = pastaAtual.getParents();
      if (!pais.hasNext()) break;
      pastaAtual = pais.next();
      
      if (caminho.length > 10) break;
    }
    
    caminho.forEach((p, i) => {
      const indent = '   '.repeat(i);
      Logger.log(indent + (i === 0 ? '📁 ' : '└─ ') + p.nome);
      Logger.log(indent + '   ID: ' + p.id);
    });
    
    // Comparar com o sistema atual
    Logger.log('\n========================================');
    Logger.log('COMPARAÇÃO COM SISTEMA ATUAL');
    Logger.log('========================================\n');
    
    const sistemaGlobal = obterSistemaGlobal_();
    const pastaAtualSistema = sistemaGlobal.pastaCSVGeralId;
    
    Logger.log('ID no sistema global: ' + (pastaAtualSistema || 'NULL'));
    Logger.log('ID correto:           ' + pastaCSVGeralCorreta);
    
    if (pastaAtualSistema === pastaCSVGeralCorreta) {
      Logger.log('✅ IDs COINCIDEM - Sistema está correto!');
    } else {
      Logger.log('❌ IDs DIFERENTES - Sistema precisa ser corrigido!');
      
      if (pastaAtualSistema) {
        try {
          const pastaErrada = DriveApp.getFolderById(pastaAtualSistema);
          Logger.log('\nPasta ERRADA no sistema: ' + pastaErrada.getName());
          Logger.log('URL: https://drive.google.com/drive/folders/' + pastaAtualSistema);
        } catch (e) {
          Logger.log('\n⚠️ ID salvo no sistema é inválido ou inacessível');
        }
      }
    }
    
    Logger.log('\n========================================');
    Logger.log('✅ Debug concluído!');
    Logger.log('========================================');
    
  } catch (e) {
    Logger.log('❌ ERRO: ' + e.message);
    Logger.log(e.stack);
  }
}

/**
 * Corrige o ID da pasta CSV_GERAL forçando o ID correto
 */
function corrigirPastaCSVGeral_() {
  const idCorreto = '15bhiBSV4JAsbgYxCkwB2bTmEvSNVLwQz';
  
  Logger.log('========================================');
  Logger.log('CORRIGIR PASTA CSV_GERAL');
  Logger.log('========================================\n');
  
  try {
    // Verifica se a pasta existe
    const pasta = DriveApp.getFolderById(idCorreto);
    Logger.log('✅ Pasta encontrada: ' + pasta.getName());
    
    // Atualiza o sistema global
    atualizarSistemaGlobal_({
      pastaCSVGeralId: idCorreto
    });
    
    Logger.log('✅ ID atualizado no sistema global!');
    Logger.log('   Novo ID: ' + idCorreto);
    
    // Verifica
    const sistema = obterSistemaGlobal_();
    Logger.log('\n📊 Verificação:');
    Logger.log('   ID salvo: ' + sistema.pastaCSVGeralId);
    
    if (sistema.pastaCSVGeralId === idCorreto) {
      Logger.log('\n✅ CORREÇÃO BEM-SUCEDIDA!');
    } else {
      Logger.log('\n❌ Erro ao salvar');
    }
    
  } catch (e) {
    Logger.log('❌ ERRO: ' + e.message);
  }
}
