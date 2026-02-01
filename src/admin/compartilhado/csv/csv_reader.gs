/**
 * ============================================================
 * CSV — LEITURA
 * ============================================================
 */

function lerCSV_(file) {
  const content = file.getBlob().getDataAsString('UTF-8');
  return Utilities.parseCsv(content);
}

function nomeAbaPorCSV_(nomeArquivo) {
  return nomeArquivo.replace(/\.csv$/i, '').substring(0, 99);
}

/**
 * Adiciona a coluna "Localização" na posição H (entre Situação e Termo)
 * para todas as linhas de cabeçalho que começam com "Tombamento"
 * @param {Array<Array>} dados - Dados do CSV
 * @returns {Array<Array>} Dados modificados
 */
function adicionarLocalizacaoNoCSV_(dados) {
  if (!dados || dados.length === 0) return dados;
  
  for (let i = 0; i < dados.length; i++) {
    const linha = dados[i];
    
    // Verifica se é linha de cabeçalho (começa com "Tombamento")
    if (linha[0] && String(linha[0]).trim().startsWith('Tombamento')) {
      // Insere "Localização" na posição 7 (coluna H, índice 7)
      linha.splice(7, 0, 'Localização');
    } else {
      // Para linhas normais, adiciona célula vazia na posição 7
      linha.splice(7, 0, '');
    }
  }
  
  return dados;
}
